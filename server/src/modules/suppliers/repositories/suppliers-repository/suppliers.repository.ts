import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma-service';
import { Supplier, Prisma } from '@prisma/client';

/**
 * Repository d'accès aux données pour les fournisseurs.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class SuppliersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère la liste de tous les fournisseurs.
   *
   * @param {boolean} [includeInactive=false] - Inclure les fournisseurs inactifs
   * @returns {Promise<Supplier[]>} Liste des fournisseurs
   */
  async findAll(includeInactive = false): Promise<Supplier[]> {
    return this.prisma.supplier.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        address: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Recherche un fournisseur par son identifiant unique.
   *
   * @param {string} id - Identifiant du fournisseur
   * @returns {Promise<Supplier | null>} Le fournisseur ou null
   */
  async findById(id: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({
      where: { id },
      include: {
        address: true,
      },
    });
  }

  /**
   * Recherche un fournisseur par son nom exact.
   *
   * @param {string} name - Nom du fournisseur
   * @returns {Promise<Supplier | null>} Le fournisseur ou null
   */
  async findByName(name: string): Promise<Supplier | null> {
    return this.prisma.supplier.findFirst({
      where: { name },
    });
  }

  /**
   * Crée un nouveau fournisseur.
   *
   * @param {Prisma.SupplierCreateInput} data - Données de création
   * @returns {Promise<Supplier>} Le fournisseur créé
   */
  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return this.prisma.supplier.create({
      data,
      include: {
        address: true,
      },
    });
  }

  /**
   * Met à jour un fournisseur existant.
   *
   * @param {string} id - Identifiant du fournisseur
   * @param {Prisma.SupplierUpdateInput} data - Données de mise à jour
   * @returns {Promise<Supplier>} Le fournisseur mis à jour
   */
  async update(
    id: string,
    data: Prisma.SupplierUpdateInput,
  ): Promise<Supplier> {
    return this.prisma.supplier.update({
      where: { id },
      data,
      include: {
        address: true,
      },
    });
  }

  /**
   * Supprime un fournisseur.
   *
   * @param {string} id - Identifiant du fournisseur
   * @returns {Promise<Supplier>} Le fournisseur supprimé
   */
  async delete(id: string): Promise<Supplier> {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }

  /**
   * Compte le nombre total de fournisseurs.
   *
   * @param {boolean} [includeInactive=false] - Inclure les inactifs
   * @returns {Promise<number>} Nombre total
   */
  async count(includeInactive = false): Promise<number> {
    return this.prisma.supplier.count({
      where: includeInactive ? {} : { isActive: true },
    });
  }

  /**
   * Compte les produits rattachés au fournisseur.
   *
   * @param {string} supplierId - Identifiant du fournisseur
   * @returns {Promise<number>} Nombre de produits
   */
  async countProducts(supplierId: string): Promise<number> {
    return this.prisma.product.count({
      where: { supplierId },
    });
  }
}
