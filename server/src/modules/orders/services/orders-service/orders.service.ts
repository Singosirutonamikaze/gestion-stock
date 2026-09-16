import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma-service';
import {
  OrdersRepository,
  OrderWithRelations,
} from '../../repositories/orders-repository';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from '../../dto';
import { MovementType, OrderStatus, OrderType, Prisma } from '@prisma/client';
import { InsufficientStockException } from '../../../../shared/exceptions/insufficient-stock-exception';

/**
 * Service gérant la logique métier, les calculs et le cycle de vie des commandes.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  /**
   * Transitions autorisées dans le cycle de vie d'une commande.
   */
  private static readonly ALLOWED_TRANSITIONS: Record<
    OrderStatus,
    OrderStatus[]
  > = {
    [OrderStatus.DRAFT]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.RECEIVED],
    [OrderStatus.RECEIVED]: [],
    [OrderStatus.PARTIALLY_RECEIVED]: [
      OrderStatus.RECEIVED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.CANCELLED]: [],
  };

  /**
   * Génère un identifiant / numéro de commande unique et séquentiel.
   * Format : ORD-YYYYMMDD-XXXXX
   */
  private generateOrderNumber(type: OrderType): string {
    const prefix = type === OrderType.PURCHASE ? 'PO' : 'SO';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();
    return `${prefix}-${dateStr}-${randomSuffix}`;
  }

  /**
   * Valide si une transition d'état de commande est légale.
   */
  public isValidStatusTransition(
    currentStatus: OrderStatus,
    targetStatus: OrderStatus,
  ): boolean {
    if (currentStatus === targetStatus) {
      return true;
    }
    const allowed = OrdersService.ALLOWED_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }

  /**
   * Récupère la liste paginée des commandes selon les filtres.
   */
  async findAll(query?: OrderQueryDto) {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;

    const [items, total] = await Promise.all([
      this.ordersRepository.findMany(query),
      this.ordersRepository.count(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Récupère une commande par son identifiant unique.
   */
  async findById(id: string): Promise<OrderWithRelations> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${id} introuvable`);
    }
    return order;
  }

  /**
   * Crée une nouvelle commande avec calcul automatique des montants.
   */
  async create(
    dto: CreateOrderDto,
    userId: string,
  ): Promise<OrderWithRelations> {
    // 1. Validation de l'entrepôt
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException(
        `Entrepôt avec l'ID ${dto.warehouseId} introuvable`,
      );
    }

    // 2. Validation du fournisseur (si commande d'achat)
    if (dto.type === OrderType.PURCHASE) {
      if (!dto.supplierId) {
        throw new BadRequestException(
          'Le fournisseur (supplierId) est obligatoire pour un achat',
        );
      }
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: dto.supplierId },
      });
      if (!supplier) {
        throw new NotFoundException(
          `Fournisseur avec l'ID ${dto.supplierId} introuvable`,
        );
      }
    }

    // 3. Validation du client (si client enregistré fourni)
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(
          `Client avec l'ID ${dto.customerId} introuvable`,
        );
      }
    }

    // 4. Validation des produits et calculs des lignes
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'La commande doit comporter au moins un article',
      );
    }

    const productIds = dto.items.map((i) => i.productId);
    const existingProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const foundIds = new Set(existingProducts.map((p) => p.id));
    const missing = productIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(
        `Produit(s) introuvable(s) : ${missing.join(', ')}`,
      );
    }

    // 5. Calculs des sous-totaux et totalAmount
    let calculatedSubtotal = 0;
    let calculatedTaxAmount = 0;
    let calculatedDiscountAmount = 0;

    const itemsData = dto.items.map((item) => {
      const discount = item.discountRate ?? 0;
      const tax = item.taxRate ?? 0;
      const lineSubtotal =
        item.quantity * item.unitPrice * (1 - discount / 100);
      const lineTax = lineSubtotal * (tax / 100);

      calculatedSubtotal += lineSubtotal;
      calculatedTaxAmount += lineTax;
      if (discount > 0) {
        calculatedDiscountAmount +=
          item.quantity * item.unitPrice * (discount / 100);
      }

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        discountRate: new Prisma.Decimal(discount),
        taxRate: new Prisma.Decimal(tax),
        subtotal: new Prisma.Decimal(lineSubtotal),
      };
    });

    const totalAmount = calculatedSubtotal + calculatedTaxAmount;
    const orderNumber = this.generateOrderNumber(dto.type);

    // 6. Enregistrement transactionnel de la commande et des articles
    return await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          type: dto.type,
          status: OrderStatus.DRAFT,
          supplierId: dto.type === OrderType.PURCHASE ? dto.supplierId : null,
          customerId: dto.customerId || null,
          customerName: dto.customerName || null,
          warehouseId: dto.warehouseId,
          shippingAddressId: dto.shippingAddressId || null,
          subtotal: new Prisma.Decimal(calculatedSubtotal),
          taxAmount: new Prisma.Decimal(calculatedTaxAmount),
          discountAmount: new Prisma.Decimal(calculatedDiscountAmount),
          shippingCost: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(totalAmount),
          expectedDeliveryDate: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : null,
          notes: dto.notes || null,
          createdById: userId,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
          warehouse: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return createdOrder;
    });
  }

  /**
   * Met à jour une commande, gère les transitions de statut et applique les mouvements de stock automatiques.
   */
  async update(
    id: string,
    dto: UpdateOrderDto,
    userId: string,
  ): Promise<OrderWithRelations> {
    const order = await this.findById(id);

    // 1. Gestion des transitions de statut
    if (dto.status && dto.status !== order.status) {
      if (!this.isValidStatusTransition(order.status, dto.status)) {
        throw new BadRequestException(
          `Transition de statut non autorisée de ${order.status} vers ${dto.status}`,
        );
      }

      // Exécution de la transition avec gestion des mouvements de stock
      return await this.handleStatusTransition(order, dto.status, userId, dto);
    }

    // 2. Mise à jour standard sans changement de statut
    const updateData: Prisma.OrderUpdateInput = {};

    if (dto.paymentStatus) updateData.paymentStatus = dto.paymentStatus;
    if (dto.paymentMethod) updateData.paymentMethod = dto.paymentMethod;
    if (dto.customerName !== undefined)
      updateData.customerName = dto.customerName;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.shippingAddressId !== undefined) {
      updateData.shippingAddress = dto.shippingAddressId
        ? { connect: { id: dto.shippingAddressId } }
        : { disconnect: true };
    }
    if (dto.expectedDeliveryDate !== undefined) {
      updateData.expectedDeliveryDate = dto.expectedDeliveryDate
        ? new Date(dto.expectedDeliveryDate)
        : null;
    }

    // Si modification des articles en statut DRAFT
    if (dto.items && dto.items.length > 0) {
      if (order.status !== OrderStatus.DRAFT) {
        throw new BadRequestException(
          'Les articles d’une commande ne peuvent être modifiés que lorsque la commande est en statut DRAFT',
        );
      }

      return await this.prisma.$transaction(async (tx) => {
        // Supprimer les anciens articles
        await tx.orderItem.deleteMany({ where: { orderId: id } });

        // Calculer les nouveaux totaux
        let calculatedSubtotal = 0;
        let calculatedTaxAmount = 0;
        let calculatedDiscountAmount = 0;

        const itemsData = dto.items!.map((item) => {
          const discount = item.discountRate ?? 0;
          const tax = item.taxRate ?? 0;
          const lineSubtotal =
            item.quantity * item.unitPrice * (1 - discount / 100);
          const lineTax = lineSubtotal * (tax / 100);

          calculatedSubtotal += lineSubtotal;
          calculatedTaxAmount += lineTax;
          if (discount > 0) {
            calculatedDiscountAmount +=
              item.quantity * item.unitPrice * (discount / 100);
          }

          return {
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            discountRate: new Prisma.Decimal(discount),
            taxRate: new Prisma.Decimal(tax),
            subtotal: new Prisma.Decimal(lineSubtotal),
          };
        });

        const totalAmount = calculatedSubtotal + calculatedTaxAmount;

        return await tx.order.update({
          where: { id },
          data: {
            ...updateData,
            subtotal: new Prisma.Decimal(calculatedSubtotal),
            taxAmount: new Prisma.Decimal(calculatedTaxAmount),
            discountAmount: new Prisma.Decimal(calculatedDiscountAmount),
            totalAmount: new Prisma.Decimal(totalAmount),
            items: {
              create: itemsData,
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, sku: true, name: true, unit: true },
                },
              },
            },
            supplier: {
              select: { id: true, name: true, email: true, phone: true },
            },
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
              },
            },
            warehouse: {
              select: { id: true, code: true, name: true },
            },
            createdBy: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
      });
    }

    return await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, sku: true, name: true, unit: true },
            },
          },
        },
        supplier: {
          select: { id: true, name: true, email: true, phone: true },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        warehouse: {
          select: { id: true, code: true, name: true },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Exécute une transition de statut en appliquant de manière transactionnelle les mouvements de stock.
   */
  private async handleStatusTransition(
    order: OrderWithRelations,
    targetStatus: OrderStatus,
    userId: string,
    dto: UpdateOrderDto,
  ): Promise<OrderWithRelations> {
    return await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.OrderUpdateInput = {
        status: targetStatus,
      };

      if (dto.paymentStatus) updateData.paymentStatus = dto.paymentStatus;
      if (dto.paymentMethod) updateData.paymentMethod = dto.paymentMethod;
      if (dto.notes !== undefined) updateData.notes = dto.notes;

      // 1. Commande d'achat passant à RECEIVED : Génération des mouvements IN
      if (
        order.type === OrderType.PURCHASE &&
        targetStatus === OrderStatus.RECEIVED
      ) {
        updateData.receivedAt = new Date();

        for (const item of order.items) {
          // Création du mouvement de stock IN
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              warehouseId: order.warehouseId,
              type: MovementType.IN,
              quantity: item.quantity,
              reference: order.orderNumber,
              reason: `Réception commande achat #${order.orderNumber}`,
              userId,
            },
          });

          // Mise à jour de la table de stock
          const stock = await tx.stock.findFirst({
            where: {
              productId: item.productId,
              warehouseId: order.warehouseId,
              locationId: null,
            },
          });

          const currentQty = stock?.quantity ?? 0;
          const currentReserved = stock?.reservedQuantity ?? 0;
          const newQty = currentQty + item.quantity;
          const newAvailable = newQty - currentReserved;

          if (stock) {
            await tx.stock.update({
              where: { id: stock.id },
              data: {
                quantity: newQty,
                availableQuantity: newAvailable,
              },
            });
          } else {
            await tx.stock.create({
              data: {
                productId: item.productId,
                warehouseId: order.warehouseId,
                locationId: null,
                quantity: newQty,
                reservedQuantity: currentReserved,
                availableQuantity: newAvailable,
              },
            });
          }
        }
      }

      // 2. Commande de vente passant à SHIPPED : Vérification du stock dispo et génération des mouvements OUT
      if (
        order.type === OrderType.SALE &&
        targetStatus === OrderStatus.SHIPPED
      ) {
        updateData.shippedAt = new Date();

        // 2.1 Vérification préliminaire du stock disponible pour chaque ligne
        for (const item of order.items) {
          const stock = await tx.stock.findFirst({
            where: {
              productId: item.productId,
              warehouseId: order.warehouseId,
              locationId: null,
            },
          });

          const available = stock ? stock.availableQuantity : 0;
          if (available < item.quantity) {
            throw new InsufficientStockException(
              item.productId,
              order.warehouseId,
              available,
              item.quantity,
            );
          }
        }

        // 2.2 Génération des mouvements OUT et décrémentation du stock
        for (const item of order.items) {
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              warehouseId: order.warehouseId,
              type: MovementType.OUT,
              quantity: item.quantity,
              reference: order.orderNumber,
              reason: `Expédition commande vente #${order.orderNumber}`,
              userId,
            },
          });

          const stock = await tx.stock.findFirst({
            where: {
              productId: item.productId,
              warehouseId: order.warehouseId,
              locationId: null,
            },
          });

          const currentQty = stock?.quantity ?? 0;
          const currentReserved = stock?.reservedQuantity ?? 0;
          const newQty = currentQty - item.quantity;
          const newAvailable = newQty - currentReserved;

          if (stock) {
            await tx.stock.update({
              where: { id: stock.id },
              data: {
                quantity: newQty,
                availableQuantity: newAvailable,
              },
            });
          }
        }
      }

      // 3. Mise à jour de la commande
      return await tx.order.update({
        where: { id: order.id },
        data: updateData,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, sku: true, name: true, unit: true },
              },
            },
          },
          supplier: {
            select: { id: true, name: true, email: true, phone: true },
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
          warehouse: {
            select: { id: true, code: true, name: true },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    });
  }

  /**
   * Annule une commande existante.
   */
  async cancel(id: string, userId: string): Promise<OrderWithRelations> {
    return await this.update(id, { status: OrderStatus.CANCELLED }, userId);
  }
}
