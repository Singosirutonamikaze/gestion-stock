import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma-service';
import {
  StockMovementsRepository,
  StockMovementWithRelations,
  StockMovementsFilter,
} from '../../repositories/stock-movements-repository';
import { CreateStockMovementDto } from '../../dto/create-stock-movement-dto';
import { MovementType, Prisma } from '@prisma/client';
import { InsufficientStockException } from '../../../../shared/exceptions/insufficient-stock-exception';

/**
 * Service gérant la logique métier et transactionnelle des mouvements de stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class StockMovementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockMovementsRepository: StockMovementsRepository,
  ) {}

  /**
   * Récupère la liste des mouvements de stock selon les critères fournis.
   *
   * @param {StockMovementsFilter} [filter] - Filtres de recherche et pagination
   * @returns {Promise<{ items: StockMovementWithRelations[]; total: number; page: number; limit: number; totalPages: number }>}
   */
  async findAll(filter?: StockMovementsFilter) {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;

    const [items, total] = await Promise.all([
      this.stockMovementsRepository.findMany(filter),
      this.stockMovementsRepository.count(filter),
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
   * Récupère un mouvement de stock par son identifiant UUID unique.
   *
   * @param {string} id - UUID du mouvement
   * @returns {Promise<StockMovementWithRelations>} Le mouvement trouvé
   * @throws {NotFoundException} Si le mouvement n'existe pas
   */
  async findById(id: string): Promise<StockMovementWithRelations> {
    const movement = await this.stockMovementsRepository.findById(id);
    if (!movement) {
      throw new NotFoundException(`Mouvement de stock avec l'ID ${id} introuvable`);
    }
    return movement;
  }

  /**
   * Crée un nouveau mouvement de stock immuable et met à jour les quantités de stock de façon transactionnelle.
   *
   * @param {CreateStockMovementDto} dto - Données de création du mouvement
   * @param {string} userId - Identifiant de l'utilisateur initiateur
   * @returns {Promise<StockMovementWithRelations>} Le mouvement créé avec ses relations
   * @throws {NotFoundException} Si le produit ou l'entrepôt n'existe pas
   * @throws {BadRequestException} Si les paramètres de transfert sont invalides
   * @throws {InsufficientStockException} Si le stock disponible est insuffisant
   */
  async create(
    dto: CreateStockMovementDto,
    userId: string,
  ): Promise<StockMovementWithRelations> {
    // 1. Validation de l'existence du produit
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(
        `Produit avec l'ID ${dto.productId} introuvable`,
      );
    }

    // 2. Validation de l'existence de l'entrepôt source
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: dto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException(
        `Entrepôt avec l'ID ${dto.warehouseId} introuvable`,
      );
    }

    // 3. Validation spécifique pour le transfert
    if (dto.type === MovementType.TRANSFER) {
      if (!dto.relatedWarehouseId) {
        throw new BadRequestException(
          'L’entrepôt destination (relatedWarehouseId) est obligatoire pour un transfert',
        );
      }
      if (dto.relatedWarehouseId === dto.warehouseId) {
        throw new BadRequestException(
          'L’entrepôt destination doit être différent de l’entrepôt source',
        );
      }
      const destinationWarehouse = await this.prisma.warehouse.findUnique({
        where: { id: dto.relatedWarehouseId },
      });
      if (!destinationWarehouse) {
        throw new NotFoundException(
          `Entrepôt destination avec l'ID ${dto.relatedWarehouseId} introuvable`,
        );
      }
    }

    // 4. Exécution atomique dans une transaction Prisma
    return await this.prisma.$transaction(async (tx) => {
      // Vérification du stock disponible pour les sorties et transferts
      const requiresStockCheck =
        dto.type === MovementType.OUT ||
        dto.type === MovementType.TRANSFER ||
        dto.type === MovementType.LOSS ||
        dto.type === MovementType.SCRAP;

      const currentStock = await tx.stock.findFirst({
        where: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          locationId: null,
        },
      });

      const currentAvailable = currentStock
        ? currentStock.availableQuantity
        : 0;

      if (requiresStockCheck && currentAvailable < dto.quantity) {
        throw new InsufficientStockException(
          dto.productId,
          dto.warehouseId,
          currentAvailable,
          dto.quantity,
        );
      }

      // 4.1. Enregistrement du mouvement immuable
      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          warehouseId: dto.warehouseId,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
          reference: dto.reference,
          relatedWarehouseId:
            dto.type === MovementType.TRANSFER ? dto.relatedWarehouseId : null,
          userId,
        },
        include: {
          product: { select: { id: true, sku: true, name: true } },
          warehouse: { select: { id: true, code: true, name: true } },
          relatedWarehouse: { select: { id: true, code: true, name: true } },
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      });

      // 4.2. Mise à jour de la table stocks
      await this.applyStockMovement(tx, dto, currentStock);

      return movement;
    });
  }

  /**
   * Met à jour les enregistrements de stock en fonction du type de mouvement.
   */
  private async applyStockMovement(
    tx: Prisma.TransactionClient,
    dto: CreateStockMovementDto,
    currentStock: {
      id: string;
      quantity: number;
      reservedQuantity: number;
      availableQuantity: number;
    } | null,
  ): Promise<void> {
    const currentQty = currentStock?.quantity ?? 0;
    const reservedQty = currentStock?.reservedQuantity ?? 0;

    switch (dto.type) {
      case MovementType.IN:
      case MovementType.RETURN: {
        const newQty = currentQty + dto.quantity;
        const newAvailable = newQty - reservedQty;
        await this.upsertStockRecord(
          tx,
          dto.productId,
          dto.warehouseId,
          newQty,
          reservedQty,
          newAvailable,
          currentStock?.id,
        );
        break;
      }

      case MovementType.OUT:
      case MovementType.LOSS:
      case MovementType.SCRAP: {
        const newQty = currentQty - dto.quantity;
        const newAvailable = newQty - reservedQty;
        await this.upsertStockRecord(
          tx,
          dto.productId,
          dto.warehouseId,
          newQty,
          reservedQty,
          newAvailable,
          currentStock?.id,
        );
        break;
      }

      case MovementType.ADJUSTMENT: {
        const newQty = dto.quantity;
        const newAvailable = newQty - reservedQty;
        await this.upsertStockRecord(
          tx,
          dto.productId,
          dto.warehouseId,
          newQty,
          reservedQty,
          newAvailable,
          currentStock?.id,
        );
        break;
      }

      case MovementType.TRANSFER: {
        // Décrémenter la source
        const sourceNewQty = currentQty - dto.quantity;
        const sourceNewAvailable = sourceNewQty - reservedQty;
        await this.upsertStockRecord(
          tx,
          dto.productId,
          dto.warehouseId,
          sourceNewQty,
          reservedQty,
          sourceNewAvailable,
          currentStock?.id,
        );

        // Incrémenter la destination
        const destWarehouseId = dto.relatedWarehouseId!;
        const destStock = await tx.stock.findFirst({
          where: {
            productId: dto.productId,
            warehouseId: destWarehouseId,
            locationId: null,
          },
        });
        const destQty = destStock?.quantity ?? 0;
        const destReserved = destStock?.reservedQuantity ?? 0;
        const destNewQty = destQty + dto.quantity;
        const destNewAvailable = destNewQty - destReserved;

        await this.upsertStockRecord(
          tx,
          dto.productId,
          destWarehouseId,
          destNewQty,
          destReserved,
          destNewAvailable,
          destStock?.id,
        );
        break;
      }
    }
  }

  /**
   * Helper pour créer ou modifier un enregistrement Stock.
   */
  private async upsertStockRecord(
    tx: Prisma.TransactionClient,
    productId: string,
    warehouseId: string,
    quantity: number,
    reservedQuantity: number,
    availableQuantity: number,
    stockId?: string,
  ): Promise<void> {
    if (stockId) {
      await tx.stock.update({
        where: { id: stockId },
        data: {
          quantity,
          reservedQuantity,
          availableQuantity,
        },
      });
    } else {
      await tx.stock.create({
        data: {
          productId,
          warehouseId,
          locationId: null,
          quantity,
          reservedQuantity,
          availableQuantity,
        },
      });
    }
  }
}
