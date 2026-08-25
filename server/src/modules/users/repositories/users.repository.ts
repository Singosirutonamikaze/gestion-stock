import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma-service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { IUsersRepository } from '../interfaces/users-repository.interface';

/**
 * Repository d'accès aux données utilisateurs via Prisma.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère tous les utilisateurs avec pagination et filtres.
   *
   * @param {UserQueryDto} query - Les paramètres de pagination et filtres
   * @returns {Promise<User[]>} La liste des utilisateurs
   */
  async findAll(query: UserQueryDto): Promise<User[]> {
    const { page = 1, limit = 20, search, role, isActive } = query;
    const skip = (page - 1) * limit;

    return this.prisma.user.findMany({
      where: {
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(role && { role: role as any }),
        ...(isActive !== undefined && { isActive }),
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Compte le nombre d'utilisateurs correspondant aux filtres.
   *
   * @param {UserQueryDto} query - Les paramètres de filtres
   * @returns {Promise<number>} Le nombre d'utilisateurs
   */
  async count(query: UserQueryDto): Promise<number> {
    const { search, role, isActive } = query;
    return this.prisma.user.count({
      where: {
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(role && { role: role as any }),
        ...(isActive !== undefined && { isActive }),
      },
    });
  }

  /**
   * Récupère un utilisateur par son ID.
   *
   * @param {string} id - L'ID de l'utilisateur
   * @returns {Promise<User | null>} L'utilisateur ou null
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Récupère un utilisateur par son email.
   *
   * @param {string} email - L'email de l'utilisateur
   * @returns {Promise<User | null>} L'utilisateur ou null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Crée un nouvel utilisateur.
   *
   * @param {CreateUserDto & { password: string }} data - Les données de création
   * @returns {Promise<User>} L'utilisateur créé
   */
  async create(data: CreateUserDto & { password: string }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as any,
      },
    });
  }

  /**
   * Met à jour un utilisateur.
   *
   * @param {string} id - L'ID de l'utilisateur
   * @param {Partial<User>} data - Les données de mise à jour
   * @returns {Promise<User>} L'utilisateur mis à jour
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Désactive un utilisateur (soft delete — isActive = false).
   *
   * @param {string} id - L'ID de l'utilisateur
   * @returns {Promise<void>}
   */
  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
