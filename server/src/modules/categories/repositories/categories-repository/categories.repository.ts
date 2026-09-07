import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma-service';
import { Category, Prisma } from '@prisma/client/index';

/**
 * Repository d'accès aux données de la table Category.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère toutes les catégories avec leurs relations parentes et sous-catégories directes.
   *
   * @param {boolean} [includeInactive=false] - Inclure ou non les catégories inactives
   * @returns {Promise<Category[]>} La liste des catégories
   */
  async findAll(includeInactive = false): Promise<Category[]> {
    return await this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        parent: true,
        children: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Recherche une catégorie par son identifiant UUID unique.
   *
   * @param {string} id - Identifiant de la catégorie
   * @returns {Promise<Category | null>} La catégorie trouvée ou null
   */
  async findById(id: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  /**
   * Recherche une catégorie par son nom exact.
   *
   * @param {string} name - Nom de la catégorie
   * @returns {Promise<Category | null>} La catégorie trouvée ou null
   */
  async findByName(name: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { name },
    });
  }

  /**
   * Recherche une catégorie par son slug URL unique.
   *
   * @param {string} slug - Slug de la catégorie
   * @returns {Promise<Category | null>} La catégorie trouvée ou null
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return await this.prisma.category.findUnique({
      where: { slug },
    });
  }

  /**
   * Crée une nouvelle catégorie en base.
   *
   * @param {Prisma.CategoryCreateInput} data - Données de création
   * @returns {Promise<Category>} La catégorie créée
   */
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return await this.prisma.category.create({
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  /**
   * Met à jour une catégorie existante.
   *
   * @param {string} id - Identifiant de la catégorie
   * @param {Prisma.CategoryUpdateInput} data - Données de mise à jour
   * @returns {Promise<Category>} La catégorie mise à jour
   */
  async update(
    id: string,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category> {
    return await this.prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  /**
   * Supprime définitivement une catégorie.
   *
   * @param {string} id - Identifiant de la catégorie
   * @returns {Promise<Category>} La catégorie supprimée
   */
  async delete(id: string): Promise<Category> {
    return await this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Compte le nombre de sous-catégories enfants directes.
   *
   * @param {string} parentId - Identifiant de la catégorie parente
   * @returns {Promise<number>} Le nombre de sous-catégories
   */
  async countChildren(parentId: string): Promise<number> {
    return await this.prisma.category.count({
      where: { parentId },
    });
  }

  /**
   * Compte le nombre de produits rattachés à la catégorie.
   *
   * @param {string} categoryId - Identifiant de la catégorie
   * @returns {Promise<number>} Le nombre de produits
   */
  async countProducts(categoryId: string): Promise<number> {
    return await this.prisma.product.count({
      where: { categoryId },
    });
  }
}
