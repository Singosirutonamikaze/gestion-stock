import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma-service';
import { ProductQueryDto } from '../../dto/product-query-dto';
import { Prisma } from '@prisma/client/index';
import { PrismaProductWithRelations } from '../../mappers/product-mapper';

/**
 * Repository d'accès aux données des produits du catalogue.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Construit la clause WHERE Prisma à partir du DTO de filtre.
   *
   * @private
   * @param {ProductQueryDto} query - Paramètres de recherche
   * @returns {Prisma.ProductWhereInput} Clause WHERE
   */
  private buildWhereClause(query: ProductQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return where;
  }

  /**
   * Récupère une liste paginée de produits avec filtres.
   *
   * @param {ProductQueryDto} query - Filtres et pagination
   * @returns {Promise<PrismaProductWithRelations[]>} Liste des produits
   */
  async findMany(
    query: ProductQueryDto,
  ): Promise<PrismaProductWithRelations[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhereClause(query);

    // Si belowAlert est demandé, récupérer avec stocks puis filtrer
    if (query.belowAlert) {
      const allProducts = await this.prisma.product.findMany({
        where,
        include: {
          category: true,
          supplier: true,
          stocks: true,
        },
        orderBy: { name: 'asc' },
      });

      const filtered = allProducts.filter((p) => {
        const totalStock = p.stocks
          ? p.stocks.reduce((acc, s) => acc + s.quantity, 0)
          : 0;
        return totalStock <= p.alertThreshold;
      });

      return filtered.slice((page - 1) * limit, page * limit);
    }

    return await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        stocks: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Compte le nombre de produits correspondant aux filtres.
   *
   * @param {ProductQueryDto} query - Filtres
   * @returns {Promise<number>} Total
   */
  async count(query: ProductQueryDto): Promise<number> {
    const where = this.buildWhereClause(query);

    if (query.belowAlert) {
      const allProducts = await this.prisma.product.findMany({
        where,
        include: {
          stocks: true,
        },
      });

      return allProducts.filter((p) => {
        const totalStock = p.stocks
          ? p.stocks.reduce((acc, s) => acc + s.quantity, 0)
          : 0;
        return totalStock <= p.alertThreshold;
      }).length;
    }

    return await this.prisma.product.count({ where });
  }

  /**
   * Recherche un produit par son UUID avec ses relations associées.
   *
   * @param {string} id - UUID du produit
   * @returns {Promise<PrismaProductWithRelations | null>} Le produit ou null
   */
  async findById(id: string): Promise<PrismaProductWithRelations | null> {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        stocks: true,
      },
    });
  }

  /**
   * Recherche un produit par son SKU.
   *
   * @param {string} sku - Code SKU
   * @returns {Promise<PrismaProductWithRelations | null>} Le produit ou null
   */
  async findBySku(sku: string): Promise<PrismaProductWithRelations | null> {
    return await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        supplier: true,
        stocks: true,
      },
    });
  }

  /**
   * Crée un nouveau produit en base.
   *
   * @param {Prisma.ProductCreateInput} data - Données de création
   * @returns {Promise<PrismaProductWithRelations>} Le produit créé
   */
  async create(
    data: Prisma.ProductCreateInput,
  ): Promise<PrismaProductWithRelations> {
    return await this.prisma.product.create({
      data,
      include: {
        category: true,
        supplier: true,
        stocks: true,
      },
    });
  }

  /**
   * Met à jour un produit existant.
   *
   * @param {string} id - UUID du produit
   * @param {Prisma.ProductUpdateInput} data - Données de mise à jour
   * @returns {Promise<PrismaProductWithRelations>} Le produit mis à jour
   */
  async update(
    id: string,
    data: Prisma.ProductUpdateInput,
  ): Promise<PrismaProductWithRelations> {
    return await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        supplier: true,
        stocks: true,
      },
    });
  }

  /**
   * Désactivation logique d’un produit (soft delete : isActive = false).
   *
   * @param {string} id - UUID du produit
   * @returns {Promise<PrismaProductWithRelations>} Le produit désactivé
   */
  async softDelete(id: string): Promise<PrismaProductWithRelations> {
    return await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: {
        category: true,
        supplier: true,
        stocks: true,
      },
    });
  }
}
