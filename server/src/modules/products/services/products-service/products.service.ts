import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProductsRepository } from '../../repositories/products-repository';
import { CreateProductDto } from '../../dto/create-product-dto';
import { UpdateProductDto } from '../../dto/update-product-dto';
import { ProductQueryDto } from '../../dto/product-query-dto';
import {
  ProductResponseDto,
  PaginatedProductsDataDto,
} from '../../dto/product-response-dto';
import { ProductMapper } from '../../mappers/product-mapper';
import { Prisma } from '@prisma/client/index';
import { Decimal } from '@prisma/client-runtime-utils';

/**
 * Service gérant la logique métier des produits du catalogue.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  /**
   * Génère un slug normalisé à partir d'un nom de produit.
   *
   * @private
   * @param {string} text - Libellé source
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
   * Recherche et liste les produits avec pagination et filtres.
   *
   * @param {ProductQueryDto} query - Paramètres de requête et filtres
   * @returns {Promise<PaginatedProductsDataDto>} Liste paginée et métadonnées
   */
  async findAll(query: ProductQueryDto): Promise<PaginatedProductsDataDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [products, total] = await Promise.all([
      this.productsRepository.findMany(query),
      this.productsRepository.count(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: products.map((p) => ProductMapper.toResponseDto(p)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Récupère un produit unique par son identifiant.
   *
   * @param {string} id - UUID du produit
   * @returns {Promise<ProductResponseDto>} Le produit trouvé
   * @throws {NotFoundException} Si le produit n'existe pas
   */
  async findById(id: string): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} introuvable`);
    }
    return ProductMapper.toResponseDto(product);
  }

  /**
   * Construit l'objet Prisma.ProductCreateInput à partir du DTO.
   *
   * @private
   * @param {CreateProductDto} dto - Données de création
   * @param {string} slug - Slug calculé
   * @returns {Prisma.ProductCreateInput} Payload Prisma
   */
  private buildCreatePayload(
    dto: CreateProductDto,
    slug: string,
  ): Prisma.ProductCreateInput {
    return {
      sku: dto.sku.trim(),
      barcode: dto.barcode?.trim(),
      name: dto.name.trim(),
      slug,
      description: dto.description,
      shortDescription: dto.shortDescription,
      unitPrice: new Decimal(dto.unitPrice),
      costPrice: new Decimal(dto.costPrice),
      currency: dto.currency ?? 'XOF',
      taxRate:
        dto.taxRate !== undefined ? new Decimal(dto.taxRate) : new Decimal(0),
      discountRate:
        dto.discountRate !== undefined
          ? new Decimal(dto.discountRate)
          : new Decimal(0),
      unit: dto.unit ?? 'pièce',
      weight:
        dto.weight !== undefined && dto.weight !== null
          ? new Decimal(dto.weight)
          : null,
      weightUnit: dto.weightUnit,
      length:
        dto.length !== undefined && dto.length !== null
          ? new Decimal(dto.length)
          : null,
      width:
        dto.width !== undefined && dto.width !== null
          ? new Decimal(dto.width)
          : null,
      height:
        dto.height !== undefined && dto.height !== null
          ? new Decimal(dto.height)
          : null,
      dimensionUnit: dto.dimensionUnit,
      color: dto.color,
      material: dto.material,
      status: dto.status,
      isActive: dto.isActive ?? true,
      isPerishable: dto.isPerishable ?? false,
      isSerialized: dto.isSerialized ?? false,
      requiresBatch: dto.requiresBatch ?? false,
      warrantyMonths: dto.warrantyMonths,
      alertThreshold: dto.alertThreshold ?? 0,
      minStockLevel: dto.minStockLevel ?? 0,
      maxStockLevel: dto.maxStockLevel,
      reorderPoint: dto.reorderPoint,
      reorderQty: dto.reorderQty,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      notes: dto.notes,
      category: { connect: { id: dto.categoryId } },
      ...(dto.brandId ? { brand: { connect: { id: dto.brandId } } } : {}),
      ...(dto.supplierId
        ? { supplier: { connect: { id: dto.supplierId } } }
        : {}),
    };
  }

  /**
   * Crée un nouveau produit.
   *
   * @param {CreateProductDto} dto - Données de création
   * @returns {Promise<ProductResponseDto>} Le produit créé
   * @throws {ConflictException} Si le SKU est déjà utilisé
   */
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const existingSku = await this.productsRepository.findBySku(dto.sku);
    if (existingSku) {
      throw new ConflictException(
        `Un produit avec le code SKU "${dto.sku}" existe déjà`,
      );
    }

    const slug = dto.slug
      ? this.generateSlug(dto.slug)
      : this.generateSlug(dto.name);

    const payload = this.buildCreatePayload(dto, slug);
    const created = await this.productsRepository.create(payload);

    return ProductMapper.toResponseDto(created);
  }

  /**
   * Construit l'objet Prisma.ProductUpdateInput à partir du DTO.
   *
   * @private
   * @param {UpdateProductDto} dto - Données modifiées
   * @param {string | undefined} slug - Slug calculé
   * @returns {Prisma.ProductUpdateInput} Payload Prisma
   */
  private buildUpdatePayload(
    dto: UpdateProductDto,
    slug?: string,
  ): Prisma.ProductUpdateInput {
    return {
      ...this.buildIdentityUpdatePayload(dto, slug),
      ...this.buildPricingUpdatePayload(dto),
      ...this.buildPhysicalUpdatePayload(dto),
      ...this.buildMetadataUpdatePayload(dto),
      ...this.buildStockUpdatePayload(dto),
      ...this.buildRelationUpdatePayload(dto),
    };
  }

  private buildIdentityUpdatePayload(
    dto: UpdateProductDto,
    slug?: string,
  ): Prisma.ProductUpdateInput {
    return {
      ...(dto.sku !== undefined ? { sku: dto.sku.trim() } : {}),
      ...(dto.barcode !== undefined ? { barcode: dto.barcode?.trim() } : {}),
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description }
        : {}),
      ...(dto.shortDescription !== undefined
        ? { shortDescription: dto.shortDescription }
        : {}),
    };
  }

  private buildPricingUpdatePayload(
    dto: UpdateProductDto,
  ): Prisma.ProductUpdateInput {
    return {
      ...(dto.unitPrice !== undefined
        ? { unitPrice: new Decimal(dto.unitPrice) }
        : {}),
      ...(dto.costPrice !== undefined
        ? { costPrice: new Decimal(dto.costPrice) }
        : {}),
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.taxRate !== undefined
        ? { taxRate: new Decimal(dto.taxRate) }
        : {}),
      ...(dto.discountRate !== undefined
        ? { discountRate: new Decimal(dto.discountRate) }
        : {}),
      ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
    };
  }

  private buildPhysicalUpdatePayload(
    dto: UpdateProductDto,
  ): Prisma.ProductUpdateInput {
    return {
      ...(dto.weight !== undefined
        ? {
            weight: dto.weight !== null ? new Decimal(dto.weight) : null,
          }
        : {}),
      ...(dto.weightUnit !== undefined ? { weightUnit: dto.weightUnit } : {}),
      ...(dto.length !== undefined
        ? {
            length: dto.length !== null ? new Decimal(dto.length) : null,
          }
        : {}),
      ...(dto.width !== undefined
        ? { width: dto.width !== null ? new Decimal(dto.width) : null }
        : {}),
      ...(dto.height !== undefined
        ? {
            height: dto.height !== null ? new Decimal(dto.height) : null,
          }
        : {}),
      ...(dto.dimensionUnit !== undefined
        ? { dimensionUnit: dto.dimensionUnit }
        : {}),
    };
  }

  private buildMetadataUpdatePayload(
    dto: UpdateProductDto,
  ): Prisma.ProductUpdateInput {
    return {
      ...(dto.color !== undefined ? { color: dto.color } : {}),
      ...(dto.material !== undefined ? { material: dto.material } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.isPerishable !== undefined
        ? { isPerishable: dto.isPerishable }
        : {}),
      ...(dto.isSerialized !== undefined
        ? { isSerialized: dto.isSerialized }
        : {}),
      ...(dto.requiresBatch !== undefined
        ? { requiresBatch: dto.requiresBatch }
        : {}),
    };
  }

  private buildStockUpdatePayload(
    dto: UpdateProductDto,
  ): Prisma.ProductUpdateInput {
    return {
      ...(dto.warrantyMonths !== undefined
        ? { warrantyMonths: dto.warrantyMonths }
        : {}),
      ...(dto.alertThreshold !== undefined
        ? { alertThreshold: dto.alertThreshold }
        : {}),
      ...(dto.minStockLevel !== undefined
        ? { minStockLevel: dto.minStockLevel }
        : {}),
      ...(dto.maxStockLevel !== undefined
        ? { maxStockLevel: dto.maxStockLevel }
        : {}),
      ...(dto.reorderPoint !== undefined
        ? { reorderPoint: dto.reorderPoint }
        : {}),
      ...(dto.reorderQty !== undefined ? { reorderQty: dto.reorderQty } : {}),
      ...(dto.metaTitle !== undefined ? { metaTitle: dto.metaTitle } : {}),
      ...(dto.metaDescription !== undefined
        ? { metaDescription: dto.metaDescription }
        : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    };
  }

  private buildRelationUpdatePayload(
    dto: UpdateProductDto,
  ): Prisma.ProductUpdateInput {
    const relations: Prisma.ProductUpdateInput = {};
    if (dto.categoryId !== undefined) {
      relations.category = { connect: { id: dto.categoryId } };
    }
    if (dto.brandId !== undefined) {
      relations.brand = dto.brandId
        ? { connect: { id: dto.brandId } }
        : { disconnect: true };
    }
    if (dto.supplierId !== undefined) {
      relations.supplier = dto.supplierId
        ? { connect: { id: dto.supplierId } }
        : { disconnect: true };
    }

    return relations;
  }

  /**
   * Met à jour un produit existant.
   *
   * @param {string} id - UUID du produit
   * @param {UpdateProductDto} dto - Données de modification
   * @returns {Promise<ProductResponseDto>} Le produit mis à jour
   * @throws {NotFoundException} Si le produit n'existe pas
   * @throws {ConflictException} Si le SKU modifié existe déjà
   */
  async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    await this.findById(id);

    if (dto.sku) {
      const existingSku = await this.productsRepository.findBySku(dto.sku);
      if (existingSku && existingSku.id !== id) {
        throw new ConflictException(
          `Un produit avec le code SKU "${dto.sku}" existe déjà`,
        );
      }
    }

    let slug: string | undefined;
    if (dto.slug) {
      slug = this.generateSlug(dto.slug);
    } else if (dto.name) {
      slug = this.generateSlug(dto.name);
    }

    const payload = this.buildUpdatePayload(dto, slug);
    const updated = await this.productsRepository.update(id, payload);

    return ProductMapper.toResponseDto(updated);
  }

  /**
   * Désactive logiquement un produit (soft delete).
   *
   * @param {string} id - UUID du produit
   * @returns {Promise<ProductResponseDto>} Le produit désactivé
   * @throws {NotFoundException} Si le produit n'existe pas
   */
  async delete(id: string): Promise<ProductResponseDto> {
    await this.findById(id);
    const deactivated = await this.productsRepository.softDelete(id);
    return ProductMapper.toResponseDto(deactivated);
  }
}
