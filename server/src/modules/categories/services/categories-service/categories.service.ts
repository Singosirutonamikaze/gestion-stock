import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesRepository } from '../../repositories/categories-repository';
import { CreateCategoryDto } from '../../dto/create-category-dto';
import { UpdateCategoryDto } from '../../dto/update-category-dto';
import { Category } from '@prisma/client/index';

/**
 * Service gérant la logique métier des catégories de produits.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  /**
   * Génère un slug normalisé à partir d'un nom.
   *
   * @private
   * @param {string} text - Texte source
   * @returns {string} Le slug formaté
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Récupère toutes les catégories de produits.
   *
   * @param {boolean} [includeInactive=false] - Inclure les catégories inactives
   * @returns {Promise<Category[]>} Liste des catégories
   */
  async findAll(includeInactive = false): Promise<Category[]> {
    return await this.categoriesRepository.findAll(includeInactive);
  }

  /**
   * Récupère une catégorie par son identifiant unique.
   *
   * @param {string} id - Identifiant de la catégorie
   * @returns {Promise<Category>} La catégorie trouvée
   * @throws {NotFoundException} Si la catégorie n'existe pas
   */
  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${id} introuvable`);
    }
    return category;
  }

  /**
   * Crée une nouvelle catégorie de produits.
   *
   * @param {CreateCategoryDto} dto - Données de création
   * @returns {Promise<Category>} La catégorie créée
   * @throws {ConflictException} Si une catégorie avec le même nom ou slug existe déjà
   * @throws {NotFoundException} Si le parentId spécifié n'existe pas
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    const existingByName = await this.categoriesRepository.findByName(dto.name);
    if (existingByName) {
      throw new ConflictException(
        `Une catégorie avec le nom "${dto.name}" existe déjà`,
      );
    }

    const slug = dto.slug
      ? this.generateSlug(dto.slug)
      : this.generateSlug(dto.name);
    const existingBySlug = await this.categoriesRepository.findBySlug(slug);
    if (existingBySlug) {
      throw new ConflictException(
        `Une catégorie avec le slug "${slug}" existe déjà`,
      );
    }

    if (dto.parentId) {
      const parent = await this.categoriesRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(
          `La catégorie parente avec l'ID ${dto.parentId} n'existe pas`,
        );
      }
    }

    return await this.categoriesRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      imageUrl: dto.imageUrl,
      icon: dto.icon,
      displayOrder: dto.displayOrder ?? 0,
      isActive: dto.isActive ?? true,
      ...(dto.parentId ? { parent: { connect: { id: dto.parentId } } } : {}),
    });
  }

  /**
   * Valide les conflits d'unicité lors d'une mise à jour de catégorie.
   *
   * @private
   * @param {string} id - ID de la catégorie en cours de modification
   * @param {Category} current - Catégorie actuelle
   * @param {UpdateCategoryDto} dto - DTO de mise à jour
   * @returns {Promise<string | undefined>} Le nouveau slug calculé si applicable
   */
  private async validateUniqueConstraints(
    id: string,
    current: Category,
    dto: UpdateCategoryDto,
  ): Promise<string | undefined> {
    if (dto.name && dto.name !== current.name) {
      const existingByName = await this.categoriesRepository.findByName(
        dto.name,
      );
      if (existingByName && existingByName.id !== id) {
        throw new ConflictException(
          `Une catégorie avec le nom "${dto.name}" existe déjà`,
        );
      }
    }

    let slug: string | undefined;
    if (dto.slug) {
      slug = this.generateSlug(dto.slug);
    } else if (dto.name && dto.name !== current.name) {
      slug = this.generateSlug(dto.name);
    }

    if (slug) {
      const existingBySlug = await this.categoriesRepository.findBySlug(slug);
      if (existingBySlug && existingBySlug.id !== id) {
        throw new ConflictException(
          `Une catégorie avec le slug "${slug}" existe déjà`,
        );
      }
    }

    return slug;
  }

  /**
   * Valide la hiérarchie parentId lors d'une mise à jour.
   *
   * @private
   * @param {string} id - ID de la catégorie
   * @param {string | null | undefined} parentId - Nouveau parentId
   */
  private async validateParentId(
    id: string,
    parentId?: string | null,
  ): Promise<void> {
    if (parentId === undefined) return;
    if (parentId === id) {
      throw new BadRequestException(
        'Une catégorie ne peut pas être sa propre catégorie parente',
      );
    }
    if (parentId !== null) {
      const parent = await this.categoriesRepository.findById(parentId);
      if (!parent) {
        throw new NotFoundException(
          `La catégorie parente avec l'ID ${parentId} n'existe pas`,
        );
      }
    }
  }

  /**
   * Met à jour une catégorie existante.
   *
   * @param {string} id - Identifiant de la catégorie
   * @param {UpdateCategoryDto} dto - Données de modification
   * @returns {Promise<Category>} La catégorie mise à jour
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);
    const slug = await this.validateUniqueConstraints(id, category, dto);
    await this.validateParentId(id, dto.parentId);

    let parentRelation: object = {};
    if (dto.parentId !== undefined) {
      parentRelation = dto.parentId
        ? { parent: { connect: { id: dto.parentId } } }
        : { parent: { disconnect: true } };
    }

    return await this.categoriesRepository.update(id, {
      ...(dto.name ? { name: dto.name } : {}),
      ...(slug ? { slug } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
      ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
      ...(dto.displayOrder !== undefined
        ? { displayOrder: dto.displayOrder }
        : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...parentRelation,
    });
  }

  /**
   * Supprime une catégorie si elle ne contient ni sous-catégories ni produits.
   *
   * @param {string} id - Identifiant de la catégorie
   * @returns {Promise<Category>} La catégorie supprimée
   * @throws {NotFoundException} Si la catégorie n'existe pas
   * @throws {ConflictException} Si la catégorie possède des sous-catégories ou des produits associés
   */
  async delete(id: string): Promise<Category> {
    await this.findById(id);

    const childrenCount = await this.categoriesRepository.countChildren(id);
    if (childrenCount > 0) {
      throw new ConflictException(
        'Impossible de supprimer une catégorie parente contenant des sous-catégories',
      );
    }

    const productsCount = await this.categoriesRepository.countProducts(id);
    if (productsCount > 0) {
      throw new ConflictException(
        'Impossible de supprimer une catégorie contenant des produits associés',
      );
    }

    return await this.categoriesRepository.delete(id);
  }
}
