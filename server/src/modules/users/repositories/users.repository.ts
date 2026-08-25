import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma-service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { IUsersRepository } from '../interfaces/users-repository.interface';

/**
 * Implémentation du repository des utilisateurs (`UsersRepository`) reposant sur l'ORM Prisma.
 * Encapsule l'intégralité des requêtes SQL/Prisma sur la table `users`.
 *
 * @implements {IUsersRepository}
 * @see IUsersRepository
 * @see PrismaService
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class UsersRepository implements IUsersRepository {
  /**
   * Injection de dépendances du service Prisma centralisé.
   *
   * @param {PrismaService} prisma - Le service client Prisma pour PostgreSQL
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère la liste paginée et filtrée des utilisateurs depuis la table `users`.
   * Gère les filtres dynamiques par recherche textuelle (email/prénom/nom), rôle système et statut actif.
   *
   * @param {UserQueryDto} query - Paramètres de requête HTTP (page, limit, search, role, isActive)
   * @returns {Promise<User[]>} Tableau d'objets utilisateur Prisma
   * @async
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
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calcule le nombre total d'enregistrements correspondant aux filtres fournis.
   *
   * @param {UserQueryDto} query - Filtres appliqués à la requête
   * @returns {Promise<number>} Le nombre total de lignes correspondantes
   * @async
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
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
    });
  }

  /**
   * Recherche un utilisateur par son identifiant UUID unique.
   *
   * @param {string} id - L'identifiant unique (UUID v4) de l'utilisateur
   * @returns {Promise<User | null>} L'entité Prisma User trouvée ou null si inexistante
   * @async
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Recherche un utilisateur par son adresse email unique.
   *
   * @param {string} email - L'adresse email de l'utilisateur
   * @returns {Promise<User | null>} L'entité Prisma User trouvée ou null si inexistante
   * @async
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Insère un nouvel utilisateur dans la base de données.
   *
   * @param {CreateUserDto & { password: string }} data - Données de création avec le mot de passe pré-haché
   * @returns {Promise<User>} L'enregistrement utilisateur créé
   * @async
   */
  async create(data: CreateUserDto & { password: string }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
    });
  }

  /**
   * Met à jour partiellement un enregistrement utilisateur existant.
   *
   * @param {string} id - Identifiant unique de l'utilisateur
   * @param {Partial<User>} data - Dictionnaire des modifications
   * @returns {Promise<User>} L'enregistrement utilisateur mis à jour
   * @async
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Désactive logiquement un utilisateur en positionnant `isActive = false`.
   *
   * @param {string} id - Identifiant unique de l'utilisateur à désactiver
   * @returns {Promise<void>}
   * @async
   */
  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
