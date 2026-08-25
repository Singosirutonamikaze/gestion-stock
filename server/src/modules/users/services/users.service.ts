import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../repositories/users.repository';
import { UserMapper } from '../mappers/user.mapper';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { Paginated } from '../../../shared/types/paginated.type';

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
   * Récupère la liste paginée des utilisateurs.
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

    return {
      data: users.map(UserMapper.toResponseDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersRepository.create({
      ...dto,
      password: passwordHash,
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

    const updateData: Record<string, any> = { ...dto };

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
}
