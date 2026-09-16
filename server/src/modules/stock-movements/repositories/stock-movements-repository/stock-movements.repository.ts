import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma-service';
import { Prisma, StockMovement, MovementType } from '@prisma/client';

export type StockMovementWithRelations = Prisma.StockMovementGetPayload<{
  include: {
    product: { select: { id: true; sku: true; name: true } };
    warehouse: { select: { id: true; code: true; name: true } };
    relatedWarehouse: { select: { id: true; code: true; name: true } };
    user: { select: { id: true; email: true; firstName: true; lastName: true } };
  };
}>;

export interface StockMovementsFilter {
  productId?: string;
  warehouseId?: string;
  type?: MovementType;
  page?: number;
  limit?: number;
}

/**
 * Repository d'accès aux données des mouvements de stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class StockMovementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(
    filter?: StockMovementsFilter,
  ): Prisma.StockMovementWhereInput {
    const where: Prisma.StockMovementWhereInput = {};

    if (filter?.productId) {
      where.productId = filter.productId;
    }

    if (filter?.warehouseId) {
      where.OR = [
        { warehouseId: filter.warehouseId },
        { relatedWarehouseId: filter.warehouseId },
      ];
    }

    if (filter?.type) {
      where.type = filter.type;
    }

    return where;
  }

  /**
   * Récupère la liste paginée des mouvements de stock avec relations.
   */
  async findMany(
    filter?: StockMovementsFilter,
  ): Promise<StockMovementWithRelations[]> {
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;
    const where = this.buildWhereClause(filter);

    return await this.prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { id: true, sku: true, name: true } },
        warehouse: { select: { id: true, code: true, name: true } },
        relatedWarehouse: { select: { id: true, code: true, name: true } },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Compte le nombre total de mouvements correspondant aux filtres.
   */
  async count(filter?: StockMovementsFilter): Promise<number> {
    const where = this.buildWhereClause(filter);
    return await this.prisma.stockMovement.count({ where });
  }

  /**
   * Recherche un mouvement par son identifiant unique avec ses relations.
   */
  async findById(id: string): Promise<StockMovementWithRelations | null> {
    return await this.prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, sku: true, name: true } },
        warehouse: { select: { id: true, code: true, name: true } },
        relatedWarehouse: { select: { id: true, code: true, name: true } },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  /**
   * Exécute des opérations au sein d'une transaction Prisma.
   */
  async transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return await this.prisma.$transaction(fn);
  }
}
