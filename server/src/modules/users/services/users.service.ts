import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../repositories/users.repository';
import { UserMapper } from '../mappers/user.mapper';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import {
  UserStatisticsDto,
  UserStatsQueryDto,
} from '../dto/user-statistics.dto';
import { Paginated } from '../../../shared/types/paginated.type';
import { PaginationUtil } from '../../../shared/utils/pagination-util/pagination.util';
import { deleteUploadedFile } from '../../../shared/utils/file-upload-util/file-upload.util';

/**
 * Service métier pour la gestion des utilisateurs.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Récupère la liste paginée des utilisateurs selon les critères de recherche.
   *
   * @param {UserQueryDto} query - Les paramètres de pagination et filtres
   * @returns {Promise<Paginated<UserResponseDto>>} La liste paginée
   */
  async findAll(query: UserQueryDto): Promise<Paginated<UserResponseDto>> {
    const [users, total] = await Promise.all([
      this.usersRepository.findAll(query),
      this.usersRepository.count(query),
    ]);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return PaginationUtil.createPaginatedResult(
      users.map(UserMapper.toResponseDto),
      total,
      page,
      limit,
    );
  }

  /**
   * Récupère un utilisateur par son ID.
   *
   * @param {string} id - L'ID de l'utilisateur
   * @returns {Promise<UserResponseDto>} L'utilisateur
   * @throws {NotFoundException} Si l'utilisateur n'existe pas
   */
  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }
    return UserMapper.toResponseDto(user);
  }

  /**
   * Crée un nouvel utilisateur.
   *
   * @param {CreateUserDto} dto - Les données de création
   * @returns {Promise<UserResponseDto>} L'utilisateur créé
   * @throws {ConflictException} Si l'email est déjà utilisé
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        `Un utilisateur avec l'email ${dto.email} existe déjà`,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return UserMapper.toResponseDto(user);
  }

  /**
   * Met à jour un utilisateur existant.
   *
   * @param {string} id - L'ID de l'utilisateur
   * @param {UpdateUserDto} dto - Les données de mise à jour
   * @returns {Promise<UserResponseDto>} L'utilisateur mis à jour
   * @throws {NotFoundException} Si l'utilisateur n'existe pas
   */
  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }

    const updateData: Partial<User> = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 12);
    }

    const user = await this.usersRepository.update(id, updateData);
    return UserMapper.toResponseDto(user);
  }

  /**
   * Désactive un utilisateur (soft delete).
   *
   * @param {string} id - L'ID de l'utilisateur
   * @returns {Promise<void>}
   * @throws {NotFoundException} Si l'utilisateur n'existe pas
   */
  async softDelete(id: string): Promise<void> {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }
    await this.usersRepository.softDelete(id);
  }

  /**
   * Récupère les métriques et agrégations des utilisateurs.
   *
   * @param {UserStatsQueryDto} [query] - Filtres temporels optionnels
   * @returns {Promise<UserStatisticsDto>} Métriques consolidées
   * @async
   */
  async getStatistics(query?: UserStatsQueryDto): Promise<UserStatisticsDto> {
    const startDate = query?.startDate ? new Date(query.startDate) : undefined;
    const endDate = query?.endDate ? new Date(query.endDate) : undefined;

    return this.usersRepository.getStatistics(startDate, endDate);
  }

  /**
   * Enregistre la nouvelle photo de profil de l'utilisateur et nettoie l'ancien fichier.
   *
   * @param {string} id - Identifiant unique de l'utilisateur
   * @param {Express.Multer.File} file - Fichier image téléversé
   * @returns {Promise<UserResponseDto>} L'utilisateur mis à jour
   * @throws {BadRequestException} Si aucun fichier image n'est transmis
   * @throws {NotFoundException} Si l'utilisateur n'existe pas
   * @async
   */
  async uploadAvatar(
    id: string,
    file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    if (!file) {
      throw new BadRequestException('Aucun fichier image fourni');
    }

    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      deleteUploadedFile(file.path);
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }

    if (existing.avatarUrl) {
      deleteUploadedFile(existing.avatarUrl);
    }

    const relativeAvatarUrl = `/uploads/users/${id}/profile/${file.filename}`;
    const updatedUser = await this.usersRepository.update(id, {
      avatarUrl: relativeAvatarUrl,
    });

    return UserMapper.toResponseDto(updatedUser);
  }

  /**
   * Supprime la photo de profil de l'utilisateur et réinitialise avatarUrl à null.
   *
   * @param {string} id - Identifiant de l'utilisateur
   * @returns {Promise<UserResponseDto>} L'utilisateur mis à jour
   * @throws {NotFoundException} Si l'utilisateur n'existe pas
   * @async
   */
  async removeAvatar(id: string): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }

    if (existing.avatarUrl) {
      deleteUploadedFile(existing.avatarUrl);
    }

    const updatedUser = await this.usersRepository.update(id, {
      avatarUrl: null,
    });

    return UserMapper.toResponseDto(updatedUser);
  }
}
