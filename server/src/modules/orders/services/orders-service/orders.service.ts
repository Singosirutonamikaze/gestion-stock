import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../../../core/database/prisma-service';
import {
  OrdersRepository,
  OrderWithRelations,
} from '../../repositories/orders-repository';
import {
  CreateOrderDto,
  CreateOrderItemDto,
  UpdateOrderDto,
  OrderQueryDto,
} from '../../dto';
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
    const dateStr = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const randomSuffix = randomBytes(3).toString('hex').toUpperCase();
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
   * Retourne l'objet standard de sélection et jointures pour les commandes.
   */
  private getOrderIncludeRelations() {
    return {
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
    };
  }

  /**
   * Calcule les sous-totaux, taxes, remises et totaux des articles de commande.
   */
  private calculateOrderItems(items: CreateOrderItemDto[]) {
    let calculatedSubtotal = 0;
    let calculatedTaxAmount = 0;
    let calculatedDiscountAmount = 0;

    const itemsData = items.map((item) => {
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

    return {
      itemsData,
      subtotal: calculatedSubtotal,
      taxAmount: calculatedTaxAmount,
      discountAmount: calculatedDiscountAmount,
      totalAmount,
    };
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
   * Valide les entités associées (entrepôt, fournisseur, client, produits) avant création.
   */
  private async validateOrderCreationRelations(
    dto: CreateOrderDto,
  ): Promise<void> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException(
        `Entrepôt avec l'ID ${dto.warehouseId} introuvable`,
      );
    }

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
  }

  /**
   * Crée une nouvelle commande avec calcul automatique des montants.
   */
  async create(
    dto: CreateOrderDto,
    userId: string,
  ): Promise<OrderWithRelations> {
    await this.validateOrderCreationRelations(dto);

    const { itemsData, subtotal, taxAmount, discountAmount, totalAmount } =
      this.calculateOrderItems(dto.items);
    const orderNumber = this.generateOrderNumber(dto.type);

    return await this.prisma.$transaction(async (tx) => {
      return await tx.order.create({
        data: {
          orderNumber,
          type: dto.type,
          status: OrderStatus.DRAFT,
          supplierId: dto.type === OrderType.PURCHASE ? dto.supplierId : null,
          customerId: dto.customerId || null,
          customerName: dto.customerName || null,
          warehouseId: dto.warehouseId,
          shippingAddressId: dto.shippingAddressId || null,
          subtotal: new Prisma.Decimal(subtotal),
          taxAmount: new Prisma.Decimal(taxAmount),
          discountAmount: new Prisma.Decimal(discountAmount),
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
        include: this.getOrderIncludeRelations(),
      });
    });
  }

  /**
   * Met à jour les lignes d'articles lorsque la commande est en statut DRAFT.
   */
  private async updateDraftItems(
    tx: Prisma.TransactionClient,
    orderId: string,
    items: CreateOrderItemDto[],
    updateData: Prisma.OrderUpdateInput,
  ): Promise<OrderWithRelations> {
    await tx.orderItem.deleteMany({ where: { orderId } });

    const { itemsData, subtotal, taxAmount, discountAmount, totalAmount } =
      this.calculateOrderItems(items);

    return await tx.order.update({
      where: { id: orderId },
      data: {
        ...updateData,
        subtotal: new Prisma.Decimal(subtotal),
        taxAmount: new Prisma.Decimal(taxAmount),
        discountAmount: new Prisma.Decimal(discountAmount),
        totalAmount: new Prisma.Decimal(totalAmount),
        items: {
          create: itemsData,
        },
      },
      include: this.getOrderIncludeRelations(),
    });
  }

  /**
   * Construit le payload de mise à jour scalaire.
   */
  private buildScalarUpdateData(dto: UpdateOrderDto): Prisma.OrderUpdateInput {
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

    return updateData;
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

    // 1. Transition de statut
    if (dto.status && dto.status !== order.status) {
      if (!this.isValidStatusTransition(order.status, dto.status)) {
        throw new BadRequestException(
          `Transition de statut non autorisée de ${order.status} vers ${dto.status}`,
        );
      }
      return await this.handleStatusTransition(order, dto.status, userId, dto);
    }

    // 2. Mise à jour standard
    const updateData = this.buildScalarUpdateData(dto);

    if (dto.items && dto.items.length > 0) {
      if (order.status !== OrderStatus.DRAFT) {
        throw new BadRequestException(
          'Les articles d’une commande ne peuvent être modifiés que lorsque la commande est en statut DRAFT',
        );
      }
      return await this.prisma.$transaction(async (tx) => {
        return await this.updateDraftItems(tx, id, dto.items!, updateData);
      });
    }

    return await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: this.getOrderIncludeRelations(),
    });
  }

  /**
   * Traite la réception d'une commande d'achat : création des mouvements IN et incrémentation du stock.
   */
  private async processPurchaseReceipt(
    tx: Prisma.TransactionClient,
    order: OrderWithRelations,
    userId: string,
  ): Promise<void> {
    for (const item of order.items) {
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

  /**
   * Traite l'expédition d'une commande de vente : vérification des disponibilités, création des mouvements OUT et décrémentation.
   */
  private async processSaleShipment(
    tx: Prisma.TransactionClient,
    order: OrderWithRelations,
    userId: string,
  ): Promise<void> {
    // Vérification préliminaire du stock disponible
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

    // Création des mouvements OUT et décrémentation
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

      if (
        order.type === OrderType.PURCHASE &&
        targetStatus === OrderStatus.RECEIVED
      ) {
        updateData.receivedAt = new Date();
        await this.processPurchaseReceipt(tx, order, userId);
      } else if (
        order.type === OrderType.SALE &&
        targetStatus === OrderStatus.SHIPPED
      ) {
        updateData.shippedAt = new Date();
        await this.processSaleShipment(tx, order, userId);
      }

      return await tx.order.update({
        where: { id: order.id },
        data: updateData,
        include: this.getOrderIncludeRelations(),
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
