import { UserResponseDto } from '../dto/user-response.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { Paginated } from '../../../shared/types/paginated.type';

/**
 * Contrat d'interface du service métier de gestion des utilisateurs (`UsersService`).
 * Définit les règles métier et les cas d'utilisation pour le CRUD administrateur.
 *
 * @see UsersService
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface IUsersService {
  /**
   * Récupère la liste paginée et filtrée des utilisateurs sous forme de DTOs sécurisés.
   *
   * @param {UserQueryDto} query - Critères de filtrage et paramètres de pagination
   * @returns {Promise<Paginated<UserResponseDto>>} Structure contenant la liste de `UserResponseDto` et les métadonnées de pagination
   * @async
   */
  findAll(query: UserQueryDto): Promise<Paginated<UserResponseDto>>;

  /**
   * Récupère un utilisateur par son identifiant unique et le transforme en DTO d'exposition.
   *
   * @param {string} id - Identifiant unique (UUID v4) de l'utilisateur
   * @returns {Promise<UserResponseDto>} Le DTO sécurisé sans mot de passe
   * @throws {NotFoundException} Si aucun utilisateur n'est associé à cet ID
   * @async
   */
  findById(id: string): Promise<UserResponseDto>;

  /**
   * Valide l'unicité de l'email, hache le mot de passe puis crée le nouvel utilisateur.
   *
   * @param {CreateUserDto} dto - Les informations du compte à créer
   * @returns {Promise<UserResponseDto>} Le DTO du compte créé
   * @throws {ConflictException} Si l'adresse email est déjà enregistrée
   * @async
   */
  create(dto: CreateUserDto): Promise<UserResponseDto>;

  /**
   * Met à jour partiellement un utilisateur existant (nom, prénom, rôle, statut actif, mot de passe).
   * Hache le mot de passe s'il est transmis dans le DTO.
   *
   * @param {string} id - Identifiant unique de l'utilisateur visé
   * @param {UpdateUserDto} dto - Les champs à mettre à jour
   * @returns {Promise<UserResponseDto>} Le DTO de l'utilisateur mis à jour
   * @throws {NotFoundException} Si l'utilisateur n'existe pas
   * @async
   */
  update(id: string, dto: UpdateUserDto): Promise<UserResponseDto>;

  /**
   * Désactive logiquement un utilisateur (`isActive = false`).
   *
   * @param {string} id - Identifiant unique de l'utilisateur à désactiver
   * @returns {Promise<void>}
   * @throws {NotFoundException} Si l'utilisateur n'existe pas
   * @async
   */
  softDelete(id: string): Promise<void>;

  /**
   * Récupère les statistiques et agrégations des utilisateurs du système.
   *
   * @param {import('../dto/user-statistics.dto').UserStatsQueryDto} [query] - Filtres temporels optionnels
   * @returns {Promise<import('../dto/user-statistics.dto').UserStatisticsDto>} Métriques consolidées
   * @async
   */
  getStatistics(
    query?: import('../dto/user-statistics.dto').UserStatsQueryDto,
  ): Promise<import('../dto/user-statistics.dto').UserStatisticsDto>;

  /**
   * Met à jour la photo de profil (avatar) d'un utilisateur et nettoie l'ancien fichier le cas échéant.
   *
   * @param {string} id - Identifiant unique de l'utilisateur
   * @param {Express.Multer.File} file - Fichier image téléversé
   * @returns {Promise<UserResponseDto>} L'utilisateur mis à jour avec son nouvel URL d'avatar
   * @throws {NotFoundException} Si l'utilisateur n'existe pas
   * @throws {BadRequestException} Si aucun fichier valide n'a été fourni
   * @async
   */
  uploadAvatar(id: string, file: Express.Multer.File): Promise<UserResponseDto>;

  /**
   * Supprime l'avatar actuel de l'utilisateur du disque et réinitialise son champ avatarUrl.
   *
   * @param {string} id - Identifiant unique de l'utilisateur
   * @returns {Promise<UserResponseDto>} L'utilisateur mis à jour
   * @throws {NotFoundException} Si l'utilisateur n'existe pas
   * @async
   */
  removeAvatar(id: string): Promise<UserResponseDto>;
}
