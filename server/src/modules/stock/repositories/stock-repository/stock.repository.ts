import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma-service';
import { Prisma } from '@prisma/client/index';
import { StockQueryDto } from '../../dto/stock-query-dto';

export type StockWithRelations = Prisma.StockGetPayload<{
  include: {
    product: {
      select: { id: true; sku: true; name: true; alertThreshold: true };
    };
    warehouse: { select: { id: true; code: true; name: true } };
  };
}>;

export interface ProductWithStocks {
  id: string;
  sku: string;
  name: string;
  alertThreshold: number;
  stocks: {
    warehouseId: string;
    quantity: number;
    availableQuantity: number;
    warehouse: {
      id: string;
      code: string;
      name: string;
    };
  }[];
}

/**
 * Repository d'accès aux données de la table Stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Construit la clause WHERE Prisma à partir du DTO de filtre de stock.
   *
   * @param {StockQueryDto} [query] - Paramètres de recherche
   * @returns {Prisma.StockWhereInput} Clause WHERE Prisma
   */
  private buildWhereClause(query?: StockQueryDto): Prisma.StockWhereInput {
    const where: Prisma.StockWhereInput = {};

    if (query?.productId) {
      where.productId = query.productId;
    }

    if (query?.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    return where;
  }

  /**
   * Récupère la liste paginée des niveaux de stock avec les relations produit et entrepôt.
   *
   * @param {StockQueryDto} [query] - Filtres et pagination
   * @returns {Promise<StockWithRelations[]>} Liste des stocks trouvés
   */
  async findMany(query?: StockQueryDto): Promise<StockWithRelations[]> {
    const page: number = query?.page !== undefined ? Number(query.page) : 1;
    const limit: number = query?.limit !== undefined ? Number(query.limit) : 20;
    const where: Prisma.StockWhereInput = this.buildWhereClause(query);

    return await this.prisma.stock.findMany({
      where,
      include: {
        product: {
          select: { id: true, sku: true, name: true, alertThreshold: true },
        },
        warehouse: { select: { id: true, code: true, name: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ product: { name: 'asc' } }, { warehouse: { name: 'asc' } }],
    });
  }

  /**
   * Compte le nombre d'enregistrements de stock correspondant aux filtres.
   *
   * @param {StockQueryDto} [query] - Filtres de recherche
   * @returns {Promise<number>} Total d'enregistrements
   */
  async count(query?: StockQueryDto): Promise<number> {
    const where: Prisma.StockWhereInput = this.buildWhereClause(query);
    return await this.prisma.stock.count({ where });
  }

  /**
   * Récupère le stock d'un produit dans un entrepôt spécifique.
   *
   * @param {string} productId - UUID du produit
   * @param {string} warehouseId - UUID de l'entrepôt
   * @returns {Promise<StockWithRelations | null>} L'enregistrement de stock ou null
   */
  async findByProductAndWarehouse(
    productId: string,
    warehouseId: string,
  ): Promise<StockWithRelations | null> {
    return await this.prisma.stock.findFirst({
      where: { productId, warehouseId, locationId: null },
      include: {
        product: {
          select: { id: true, sku: true, name: true, alertThreshold: true },
        },
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });
  }

  /**
   * Récupère la liste des produits actifs avec leurs stocks par entrepôt.
   *
   * @returns {Promise<ProductWithStocks[]>} Liste des produits et leurs stocks
   */
  async findProductsWithStocks(): Promise<ProductWithStocks[]> {
    return await this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sku: true,
        name: true,
        alertThreshold: true,
        stocks: {
          include: {
            warehouse: { select: { id: true, code: true, name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
