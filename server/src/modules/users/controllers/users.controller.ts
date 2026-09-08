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
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import {
  UserStatisticsDto,
  UserStatsQueryDto,
} from '../dto/user-statistics.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../core/guards/roles-guard';
import { Roles } from '../../../shared/decorators/roles-decorator';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { Paginated } from '../../../shared/types/paginated.type';
import { HTTP_STATUS } from '../../../shared/constants';
import { ApiPaginatedResponse } from '../../../shared/decorators/api-paginated-response-decorator';
import {
  createUserAvatarStorage,
  imageFileFilter,
  MAX_AVATAR_SIZE_BYTES,
} from '../../../shared/utils/file-upload-util/file-upload.util';

/**
 * Contrôleur de gestion des utilisateurs (CRUD sécurisé réservé aux Administrateurs et Managers).
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
   * Récupère la liste paginée et filtrée des utilisateurs.
   *
   * @param {UserQueryDto} query - Paramètres de pagination, filtres par rôle, recherche textuelle et statut
   * @returns {Promise<Paginated<UserResponseDto>>} Liste paginée des utilisateurs
   */
  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Lister les utilisateurs (Paginé & Filtré)',
    description:
      'Retourne la liste paginée des utilisateurs du système avec support de filtres dynamiques (recherche par nom/prénom/email, rôle, statut actif). Accès strictement restreint aux Administrateurs.',
  })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numéro de la page demandée (par défaut: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: "Nombre d'enregistrements par page (par défaut: 20, max: 100)",
    example: 20,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      'Recherche textuelle insensible à la casse sur prénom, nom ou email',
    example: 'dupont',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: 'Filtrer par rôle système attribué',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description:
      'Filtrer par statut actif (true) ou inactif / désactivé (false)',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Liste paginée des utilisateurs récupérée avec succès',
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Non authentifié - Jeton JWT manquant, invalide ou expiré',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Accès interdit - Nécessite le rôle ADMINISTRATOR',
  })
  async findAll(
    @Query() query: UserQueryDto,
  ): Promise<Paginated<UserResponseDto>> {
    return this.usersService.findAll(query);
  }

  /**
   * Récupère les métriques et statistiques globales des utilisateurs (totaux, statuts, répartition par rôle, inscriptions).
   *
   * @param {UserStatsQueryDto} [query] - Plage de dates optionnelle pour filtrer les inscriptions
   * @returns {Promise<UserStatisticsDto>} Métriques et agrégations des utilisateurs
   */
  @Get('statistics')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Statistiques et métriques des utilisateurs',
    description:
      'Retourne les métriques globales : nombre total, actifs, inactifs, répartition par rôle (Prisma groupBy), et volume d’inscriptions récentes.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Date de début optionnelle au format ISO (ex: 2026-01-01)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Date de fin optionnelle au format ISO (ex: 2026-12-31)',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Statistiques consolidées récupérées avec succès',
    type: UserStatisticsDto,
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Non authentifié - Jeton JWT manquant ou expiré',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Accès interdit - Nécessite le rôle ADMINISTRATOR ou MANAGER',
  })
  async getStatistics(
    @Query() query?: UserStatsQueryDto,
  ): Promise<UserStatisticsDto> {
    return this.usersService.getStatistics(query);
  }

  /**
   * Récupère les détails complets d'un utilisateur par son identifiant unique UUID.
   *
   * @param {string} id - Identifiant UUID v4 de l'utilisateur
   * @returns {Promise<UserResponseDto>} Informations détaillées de l'utilisateur
   */
  @Get(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: "Détails d'un utilisateur par ID",
    description:
      "Retourne le profil complet d'un compte utilisateur à partir de son identifiant unique UUID. Accessible aux Administrateurs et Managers.",
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant UUID v4 de l'utilisateur recherché",
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Détails de l’utilisateur trouvés et retournés avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: "Format d'identifiant UUID invalide",
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Aucun utilisateur trouvé avec cet identifiant',
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Non authentifié - Jeton JWT manquant ou expiré',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Accès interdit - Nécessite le rôle ADMINISTRATOR ou MANAGER',
  })
  async findById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  /**
   * Crée un nouvel utilisateur dans le système.
   *
   * @param {CreateUserDto} dto - Données de création de l'utilisateur
   * @returns {Promise<UserResponseDto>} Compte utilisateur créé
   */
  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  @HttpCode(HTTP_STATUS.CREATED)
  @ApiOperation({
    summary: 'Créer un nouvel utilisateur',
    description:
      'Enregistre un nouvel utilisateur avec hachage sécurisé du mot de passe (Bcrypt salt 10) et contrôle d’unicité de l’email. Réservé aux Administrateurs.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Payload complet pour la création du compte utilisateur',
  })
  @ApiResponse({
    status: HTTP_STATUS.CREATED,
    description: 'Utilisateur créé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'Erreur de validation des données transmises',
  })
  @ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: 'Conflit - Une adresse email identique est déjà attribuée',
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Non authentifié - Jeton JWT manquant ou expiré',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Accès interdit - Nécessite le rôle ADMINISTRATOR',
  })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  /**
   * Met à jour les informations d'un utilisateur existant.
   *
   * @param {string} id - Identifiant UUID v4 de l'utilisateur à modifier
   * @param {UpdateUserDto} dto - Informations partielles ou complètes à mettre à jour
   * @returns {Promise<UserResponseDto>} Compte utilisateur mis à jour
   */
  @Put(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Modifier un utilisateur',
    description:
      "Met à jour les informations d'un compte (nom, prénom, email, rôle, mot de passe). Si un nouveau mot de passe est précisé, il sera automatiquement haché.",
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant UUID v4 de l'utilisateur à modifier",
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Champs optionnels à mettre à jour sur l’utilisateur',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Utilisateur mis à jour avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'Données de mise à jour invalides ou format UUID incorrect',
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Utilisateur introuvable pour cet identifiant',
  })
  @ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: 'Conflit - La nouvelle adresse email demandée est déjà prise',
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Non authentifié - Jeton JWT manquant ou expiré',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Accès interdit - Nécessite le rôle ADMINISTRATOR',
  })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  /**
   * Désactive un compte utilisateur (Soft Delete).
   *
   * @param {string} id - Identifiant UUID v4 de l'utilisateur à désactiver
   * @returns {Promise<void>}
   */
  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @HttpCode(HTTP_STATUS.NO_CONTENT)
  @ApiOperation({
    summary: 'Désactiver un utilisateur (Soft Delete)',
    description:
      'Désactive logiquement le compte utilisateur en basculant son attribut `isActive` à `false`. Aucune suppression physique n’est opérée en base pour préserver l’historique des audits.',
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant UUID v4 de l'utilisateur à désactiver",
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: HTTP_STATUS.NO_CONTENT,
    description: 'Compte utilisateur désactivé avec succès',
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: "Format d'identifiant UUID invalide",
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Utilisateur introuvable pour cet identifiant',
  })
  @ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: 'Non authentifié - Jeton JWT manquant ou expiré',
  })
  @ApiResponse({
    status: HTTP_STATUS.FORBIDDEN,
    description: 'Accès interdit - Nécessite le rôle ADMINISTRATOR',
  })
  async softDelete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.usersService.softDelete(id);
  }

  /**
   * Téléverse et met à jour la photo de profil (avatar) d'un utilisateur.
   *
   * @param {string} id - Identifiant UUID v4 de l'utilisateur
   * @param {Express.Multer.File} file - Fichier image transmis
   * @returns {Promise<UserResponseDto>} Profil utilisateur mis à jour avec son nouvel URL d'avatar
   */
  @Post(':id/avatar')
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.MANAGER,
    UserRole.SALES,
    UserRole.STOCK_KEEPER,
    UserRole.VIEWER,
  )
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: createUserAvatarStorage(),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: "Téléverser la photo de profil (Avatar d'un utilisateur)",
    description:
      'Téléverse une image de profil stockée dans `uploads/users/:id/profile/avatar-{timestamp}-{uuid}.{ext}` et met à jour `avatarUrl`. Formats acceptés : JPEG, PNG, WEBP, GIF (max 5 Mo).',
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant UUID v4 de l'utilisateur",
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    description: 'Fichier image pour la photo de profil',
    schema: {
      type: 'object',
      required: ['avatar'],
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Image au format JPEG, PNG, WEBP ou GIF (max 5Mo)',
        },
      },
    },
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Avatar téléversé et profil mis à jour avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: 'Format de fichier non autorisé ou fichier absent',
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Utilisateur introuvable',
  })
  async uploadAvatar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    return this.usersService.uploadAvatar(id, file);
  }

  /**
   * Supprime l'avatar d'un utilisateur et réinitialise avatarUrl.
   *
   * @param {string} id - Identifiant UUID v4 de l'utilisateur
   * @returns {Promise<UserResponseDto>} Profil utilisateur mis à jour
   */
  @Delete(':id/avatar')
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.MANAGER,
    UserRole.SALES,
    UserRole.STOCK_KEEPER,
    UserRole.VIEWER,
  )
  @ApiOperation({
    summary: "Supprimer la photo de profil (Avatar d'un utilisateur)",
    description:
      'Supprime le fichier physique du disque et remet le champ `avatarUrl` à `null`.',
  })
  @ApiParam({
    name: 'id',
    description: "Identifiant UUID v4 de l'utilisateur",
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: HTTP_STATUS.OK,
    description: 'Avatar supprimé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: 'Utilisateur introuvable',
  })
  async removeAvatar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.removeAvatar(id);
  }
}
