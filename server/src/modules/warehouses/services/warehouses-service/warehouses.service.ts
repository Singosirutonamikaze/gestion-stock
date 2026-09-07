import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { WarehousesRepository } from '../../repositories/warehouses-repository';
import { CreateWarehouseDto } from '../../dto/create-warehouse-dto';
import { UpdateWarehouseDto } from '../../dto/update-warehouse-dto';
import { Warehouse, Prisma } from '@prisma/client';

/**
 * Service gérant la logique métier des entrepôts de stockage.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class WarehousesService {
  constructor(private readonly warehousesRepository: WarehousesRepository) {}

  /**
   * Récupère la liste de tous les entrepôts.
   *
   * @param {boolean} [includeInactive=false] - Inclure les entrepôts inactifs
   * @returns {Promise<Warehouse[]>} Liste des entrepôts
   */
  async findAll(includeInactive = false): Promise<Warehouse[]> {
    return await this.warehousesRepository.findAll(includeInactive);
  }

  /**
   * Récupère un entrepôt par son UUID.
   *
   * @param {string} id - UUID de l'entrepôt
   * @returns {Promise<Warehouse>} L'entrepôt trouvé
   * @throws {NotFoundException} Si l'entrepôt n'existe pas
   */
  async findById(id: string): Promise<Warehouse> {
    const warehouse = await this.warehousesRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException(`Entrepôt avec l'ID ${id} introuvable`);
    }
    return warehouse;
  }

  /**
   * Crée un nouvel entrepôt.
   *
   * @param {CreateWarehouseDto} dto - Données de création
   * @returns {Promise<Warehouse>} L'entrepôt créé
   * @throws {ConflictException} Si le code d'entrepôt est déjà utilisé
   */
  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    const existing = await this.warehousesRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(
        `Un entrepôt avec le code "${dto.code}" existe déjà`,
      );
    }

    return await this.warehousesRepository.create({
      name: dto.name,
      code: dto.code.toUpperCase().trim(),
      type: dto.type,
      phone: dto.phone,
      email: dto.email,
      capacity: dto.capacity,
      surfaceM2:
        dto.surfaceM2 !== undefined ? new Prisma.Decimal(dto.surfaceM2) : null,
      isActive: dto.isActive ?? true,
      ...(dto.managerId ? { manager: { connect: { id: dto.managerId } } } : {}),
    });
  }

  /**
   * Met à jour un entrepôt existant.
   *
   * @param {string} id - UUID de l'entrepôt
   * @param {UpdateWarehouseDto} dto - Données modifiées
   * @returns {Promise<Warehouse>} L'entrepôt mis à jour
   * @throws {NotFoundException} Si l'entrepôt n'existe pas
   * @throws {ConflictException} Si le code est déjà utilisé par un autre entrepôt
   */
  async update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    await this.findById(id);
    await this.validateCodeAvailability(id, dto.code);
    return await this.warehousesRepository.update(
      id,
      this.buildUpdatePayload(dto),
    );
  }

  private async validateCodeAvailability(
    id: string,
    code?: string,
  ): Promise<void> {
    if (!code) return;
    const formattedCode = code.toUpperCase().trim();
    const existing = await this.warehousesRepository.findByCode(formattedCode);
    if (existing && existing.id !== id) {
      throw new ConflictException(
        `Un entrepôt avec le code "${code}" existe déjà`,
      );
    }
  }

  private buildUpdatePayload(
    dto: UpdateWarehouseDto,
  ): Prisma.WarehouseUpdateInput {
    let managerRelation: Prisma.WarehouseUpdateInput = {};
    if (dto.managerId !== undefined) {
      if (dto.managerId) {
        managerRelation = { manager: { connect: { id: dto.managerId } } };
      } else {
        managerRelation = { manager: { disconnect: true } };
      }
    }

    return {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.code !== undefined
        ? { code: dto.code.toUpperCase().trim() }
        : {}),
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.capacity !== undefined ? { capacity: dto.capacity } : {}),
      ...(dto.surfaceM2 !== undefined
        ? {
            surfaceM2:
              dto.surfaceM2 !== null ? new Prisma.Decimal(dto.surfaceM2) : null,
          }
        : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...managerRelation,
    };
  }

  /**
   * Désactive logiquement un entrepôt (soft delete).
   *
   * @param {string} id - UUID de l'entrepôt
   * @returns {Promise<Warehouse>} L'entrepôt désactivé
   * @throws {NotFoundException} Si l'entrepôt n'existe pas
   */
  async delete(id: string): Promise<Warehouse> {
    await this.findById(id);
    return await this.warehousesRepository.softDelete(id);
  }
}
