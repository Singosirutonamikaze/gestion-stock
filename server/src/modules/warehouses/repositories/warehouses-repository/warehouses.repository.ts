import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma-service';
import { Warehouse, Prisma } from '@prisma/client';

/**
 * Repository d'accès aux données des entrepôts.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class WarehousesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère tous les entrepôts.
   *
   * @param {boolean} [includeInactive=false] - Inclure les entrepôts inactifs
   * @returns {Promise<Warehouse[]>} Liste des entrepôts
   */
  async findAll(includeInactive = false): Promise<Warehouse[]> {
    return this.prisma.warehouse.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        manager: true,
        address: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Recherche un entrepôt par son UUID.
   *
   * @param {string} id - UUID de l’entrepôt
   * @returns {Promise<Warehouse | null>} L’entrepôt trouvé ou null
   */
  async findById(id: string): Promise<Warehouse | null> {
    return this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        manager: true,
        address: true,
      },
    });
  }

  /**
   * Recherche un entrepôt par son code unique.
   *
   * @param {string} code - Code unique de l’entrepôt
   * @returns {Promise<Warehouse | null>} L’entrepôt trouvé ou null
   */
  async findByCode(code: string): Promise<Warehouse | null> {
    return this.prisma.warehouse.findUnique({
      where: { code },
    });
  }

  /**
   * Crée un nouvel entrepôt.
   *
   * @param {Prisma.WarehouseCreateInput} data - Données de création
   * @returns {Promise<Warehouse>} L’entrepôt créé
   */
  async create(data: Prisma.WarehouseCreateInput): Promise<Warehouse> {
    return this.prisma.warehouse.create({
      data,
      include: {
        manager: true,
        address: true,
      },
    });
  }

  /**
   * Met à jour un entrepôt existant.
   *
   * @param {string} id - UUID de l’entrepôt
   * @param {Prisma.WarehouseUpdateInput} data - Données de mise à jour
   * @returns {Promise<Warehouse>} L’entrepôt mis à jour
   */
  async update(
    id: string,
    data: Prisma.WarehouseUpdateInput,
  ): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data,
      include: {
        manager: true,
        address: true,
      },
    });
  }

  /**
   * Désactivation logique d’un entrepôt (soft delete : isActive = false).
   *
   * @param {string} id - UUID de l’entrepôt
   * @returns {Promise<Warehouse>} L’entrepôt désactivé
   */
  async softDelete(id: string): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: { isActive: false },
      include: {
        manager: true,
        address: true,
      },
    });
  }

  /**
   * Compte le nombre d’entrepôts.
   *
   * @param {boolean} [includeInactive=false] - Inclure les inactifs
   * @returns {Promise<number>} Nombre total
   */
  async count(includeInactive = false): Promise<number> {
    return this.prisma.warehouse.count({
      where: includeInactive ? {} : { isActive: true },
    });
  }
}
