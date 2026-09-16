import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SuppliersRepository } from '../../repositories/suppliers-repository';
import { CreateSupplierDto } from '../../dto/create-supplier-dto';
import { UpdateSupplierDto } from '../../dto/update-supplier-dto';
import { Supplier, Prisma } from '@prisma/client';

/**
 * Service de gestion de la logique métier des fournisseurs.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class SuppliersService {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  /**
   * Récupère la liste de tous les fournisseurs.
   *
   * @param {boolean} [includeInactive=false] - Inclure les fournisseurs désactivés
   * @returns {Promise<Supplier[]>} Liste des fournisseurs
   */
  async findAll(includeInactive = false): Promise<Supplier[]> {
    return await this.suppliersRepository.findAll(includeInactive);
  }

  /**
   * Récupère un fournisseur par son identifiant unique.
   *
   * @param {string} id - UUID du fournisseur
   * @returns {Promise<Supplier>} Le fournisseur trouvé
   * @throws {NotFoundException} Si le fournisseur n'existe pas
   */
  async findById(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findById(id);
    if (!supplier) {
      throw new NotFoundException(`Fournisseur avec l'ID ${id} introuvable`);
    }
    return supplier;
  }

  /**
   * Crée un nouveau fournisseur.
   *
   * @param {CreateSupplierDto} dto - Données de création
   * @returns {Promise<Supplier>} Le fournisseur créé
   * @throws {ConflictException} Si un fournisseur avec le même nom existe déjà
   */
  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const existing = await this.suppliersRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        `Un fournisseur avec le nom "${dto.name}" existe déjà`,
      );
    }

    return await this.suppliersRepository.create({
      name: dto.name,
      logoUrl: dto.logoUrl,
      email: dto.email,
      phone: dto.phone,
      website: dto.website,
      taxId: dto.taxId,
      contactPerson: dto.contactPerson,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      paymentTerms: dto.paymentTerms,
      currency: dto.currency ?? 'XOF',
      rating: dto.rating !== undefined ? new Prisma.Decimal(dto.rating) : null,
      notes: dto.notes,
      isActive: dto.isActive ?? true,
    });
  }

  /**
   * Modifie les données d'un fournisseur.
   *
   * @param {string} id - UUID du fournisseur
   * @param {UpdateSupplierDto} dto - Données modifiées
   * @returns {Promise<Supplier>} Le fournisseur mis à jour
   * @throws {NotFoundException} Si le fournisseur n'existe pas
   * @throws {ConflictException} Si le nouveau nom est déjà attribué
   */
  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    await this.findById(id);
    await this.validateNameAvailability(id, dto.name);
    return await this.suppliersRepository.update(
      id,
      this.buildUpdatePayload(dto),
    );
  }

  private async validateNameAvailability(
    id: string,
    name?: string,
  ): Promise<void> {
    if (!name) return;
    const existing = await this.suppliersRepository.findByName(name);
    if (existing && existing.id !== id) {
      throw new ConflictException(
        `Un fournisseur avec le nom "${name}" existe déjà`,
      );
    }
  }

  private buildUpdatePayload(
    dto: UpdateSupplierDto,
  ): Prisma.SupplierUpdateInput {
    return {
      ...this.buildIdentityPayload(dto),
      ...this.buildContactPayload(dto),
      ...this.buildCommercialPayload(dto),
    };
  }

  private buildIdentityPayload(
    dto: UpdateSupplierDto,
  ): Prisma.SupplierUpdateInput {
    return {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.website !== undefined ? { website: dto.website } : {}),
      ...(dto.taxId !== undefined ? { taxId: dto.taxId } : {}),
    };
  }

  private buildContactPayload(
    dto: UpdateSupplierDto,
  ): Prisma.SupplierUpdateInput {
    return {
      ...(dto.contactPerson !== undefined
        ? { contactPerson: dto.contactPerson }
        : {}),
      ...(dto.contactEmail !== undefined
        ? { contactEmail: dto.contactEmail }
        : {}),
      ...(dto.contactPhone !== undefined
        ? { contactPhone: dto.contactPhone }
        : {}),
    };
  }

  private buildCommercialPayload(
    dto: UpdateSupplierDto,
  ): Prisma.SupplierUpdateInput {
    return {
      ...(dto.paymentTerms !== undefined
        ? { paymentTerms: dto.paymentTerms }
        : {}),
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.rating !== undefined
        ? {
            rating: dto.rating !== null ? new Prisma.Decimal(dto.rating) : null,
          }
        : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };
  }

  /**
   * Supprime un fournisseur s'il n'a pas de produits associés.
   *
   * @param {string} id - UUID du fournisseur
   * @returns {Promise<Supplier>} Le fournisseur supprimé
   * @throws {NotFoundException} Si le fournisseur n'existe pas
   * @throws {ConflictException} Si le fournisseur possède des produits associés
   */
  async delete(id: string): Promise<Supplier> {
    await this.findById(id);

    const productsCount = await this.suppliersRepository.countProducts(id);
    if (productsCount > 0) {
      throw new ConflictException(
        'Impossible de supprimer un fournisseur contenant des produits associés',
      );
    }

    return await this.suppliersRepository.delete(id);
  }
}
