import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../core/guards/roles-guard';
import { Roles } from '../../../shared/decorators/roles-decorator';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { Paginated } from '../../../shared/types/paginated.type';

/**
 * Contrôleur de gestion des utilisateurs (CRUD, réservé aux Administrateurs/Managers).
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Utilisateurs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Récupère la liste paginée des utilisateurs.
   *
   * @param {UserQueryDto} query - Les paramètres de filtres et pagination
   * @returns {Promise<Paginated<UserResponseDto>>} La liste paginée
   */
  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Liste des utilisateurs (paginée)' })
  @ApiResponse({ status: 200, description: 'Liste récupérée avec succès' })
  async findAll(@Query() query: UserQueryDto): Promise<Paginated<UserResponseDto>> {
    return this.usersService.findAll(query);
  }

  /**
   * Récupère un utilisateur par son ID.
   *
   * @param {string} id - L'ID de l'utilisateur
   * @returns {Promise<UserResponseDto>} L'utilisateur
   */
  @Get(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({ summary: 'Détails d\'un utilisateur' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  /**
   * Crée un nouvel utilisateur.
   *
   * @param {CreateUserDto} dto - Les données de création
   * @returns {Promise<UserResponseDto>} L'utilisateur créé
   */
  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  /**
   * Met à jour un utilisateur.
   *
   * @param {string} id - L'ID de l'utilisateur
   * @param {UpdateUserDto} dto - Les données de mise à jour
   * @returns {Promise<UserResponseDto>} L'utilisateur mis à jour
   */
  @Put(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  /**
   * Désactive un utilisateur (soft delete).
   *
   * @param {string} id - L'ID de l'utilisateur
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Désactiver un utilisateur (soft delete)' })
  @ApiResponse({ status: 204, description: 'Utilisateur désactivé' })
  @ApiResponse({ status: 404, description: 'Utilisateur introuvable' })
  async softDelete(@Param('id') id: string): Promise<void> {
    return this.usersService.softDelete(id);
  }
}
