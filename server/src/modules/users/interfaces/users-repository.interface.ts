import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { IBaseRepository } from '../../../shared/interfaces/base-repository.interface';

/**
 * Contrat d'interface du repository des utilisateurs (`UsersRepository`).
 * Étend `IBaseRepository` et définit l'ensemble des requêtes d'accès aux données utilisateurs (CRUD, filtres, comptage).
 *
 * @see UsersRepository
 * @see IBaseRepository
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface IUsersRepository extends IBaseRepository<
  User,
  CreateUserDto & { password: string },
  Partial<User>
> {
  /**
   * Extrait la liste paginée et filtrée des utilisateurs enregistrés dans la base de données.
   *
   * @param {UserQueryDto} query - Filtres de recherche (nom/email, rôle, statut actif) et paramètres de pagination (page, limit)
   * @returns {Promise<User[]>} Tableau d'entités Prisma User correspondant aux critères spécifiés
   * @async
   */
  findAll(query: UserQueryDto): Promise<User[]>;

  /**
   * Calcule le nombre total d'utilisateurs correspondant aux filtres fournis (nécessaire pour le calcul des métadonnées de pagination).
   *
   * @param {UserQueryDto} query - Critères de filtrage applicables
   * @returns {Promise<number>} Le nombre exact d'utilisateurs satisfaisant les critères
   * @async
   */
  count(query: UserQueryDto): Promise<number>;

  /**
   * Recherche un utilisateur par son identifiant unique UUID.
   *
   * @param {string} id - Identifiant unique UUID v4 de l'utilisateur recherché
   * @returns {Promise<User | null>} L'entité Prisma User trouvée ou null si inexistante
   * @async
   */
  findById(id: string): Promise<User | null>;

  /**
   * Recherche un utilisateur à partir de son adresse email unique.
   *
   * @param {string} email - Adresse email normalisée de l'utilisateur
   * @returns {Promise<User | null>} L'entité Prisma User trouvée ou null si aucun compte n'utilise cet email
   * @async
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Crée un nouvel utilisateur dans la base de données PostgreSQL via Prisma.
   *
   * @param {CreateUserDto & { password: string }} data - Les informations de création incluant le mot de passe haché
   * @returns {Promise<User>} L'entité Prisma User enregistrée
   * @async
   */
  create(data: CreateUserDto & { password: string }): Promise<User>;

  /**
   * Met à jour les propriétés d'un utilisateur existant.
   *
   * @param {string} id - Identifiant unique de l'utilisateur à modifier
   * @param {Partial<User>} data - Dictionnaire des propriétés modifiées
   * @returns {Promise<User>} L'entité Prisma User mise à jour
   * @async
   */
  update(id: string, data: Partial<User>): Promise<User>;

  /**
   * Effectue la désactivation logique d'un utilisateur (soft delete) en fixant `isActive` à `false`.
   *
   * @param {string} id - Identifiant unique de l'utilisateur à désactiver
   * @returns {Promise<void>}
   * @async
   */
  softDelete(id: string): Promise<void>;

  /**
   * Calcule les métriques et agrégations sur les utilisateurs (total, actifs, groupBy rôle, créations récentes).
   *
   * @param {Date} [startDate] - Date de début optionnelle
   * @param {Date} [endDate] - Date de fin optionnelle
   * @returns {Promise<import('../dto/user-statistics.dto').UserStatisticsDto>} Métriques consolidées
   * @async
   */
  getStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<import('../dto/user-statistics.dto').UserStatisticsDto>;
}
