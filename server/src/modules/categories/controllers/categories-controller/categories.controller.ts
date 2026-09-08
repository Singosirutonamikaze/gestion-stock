import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from '../../services/categories-service';
import { CreateCategoryDto } from '../../dto/create-category-dto';
import { UpdateCategoryDto } from '../../dto/update-category-dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../../core/guards/roles-guard';
import { Roles } from '../../../../shared/decorators/roles-decorator';
import { UserRole } from '../../../../shared/enums/user-role-enum';
import { Category } from '@prisma/client';

/**
 * Contrôleur REST pour la gestion des catégories de produits.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Catégories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Récupère toutes les catégories de produits.
   *
   * @param {boolean} [includeInactive] - Inclure les catégories inactives
   * @returns {Promise<Category[]>} Liste des catégories
   */
  @Get()
  @ApiOperation({
    summary: 'Lister toutes les catégories',
    description:
      'Retourne la liste hiérarchique de toutes les catégories du catalogue.',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Inclure les catégories désactivées',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des catégories récupérée avec succès',
  })
  async findAll(
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ): Promise<Category[]> {
    return await this.categoriesService.findAll(includeInactive);
  }

  /**
   * Récupère les détails d'une catégorie par son identifiant.
   *
   * @param {string} id - UUID de la catégorie
   * @returns {Promise<Category>} La catégorie correspondante
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Consulter une catégorie',
    description:
      "Retourne les détails complets d'une catégorie et ses sous-catégories.",
  })
  @ApiParam({ name: 'id', description: 'UUID de la catégorie', type: String })
  @ApiResponse({ status: 200, description: 'Catégorie trouvée' })
  @ApiResponse({ status: 404, description: 'Catégorie non trouvée' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    return await this.categoriesService.findById(id);
  }

  /**
   * Crée une nouvelle catégorie de produits.
   *
   * @param {CreateCategoryDto} dto - Données de création
   * @returns {Promise<Category>} La catégorie créée
   */
  @Post()
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Créer une catégorie',
    description:
      'Crée une nouvelle catégorie (réservé aux rôles ADMIN et MANAGER).',
  })
  @ApiResponse({ status: 201, description: 'Catégorie créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Nom ou slug déjà existant' })
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return await this.categoriesService.create(dto);
  }

  /**
   * Met à jour une catégorie existante.
   *
   * @param {string} id - UUID de la catégorie
   * @param {UpdateCategoryDto} dto - Données de mise à jour
   * @returns {Promise<Category>} La catégorie mise à jour
   */
  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Modifier une catégorie',
    description: 'Met à jour les informations d’une catégorie existante.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la catégorie', type: String })
  @ApiResponse({
    status: 200,
    description: 'Catégorie mise à jour avec succès',
  })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  @ApiResponse({ status: 409, description: 'Conflit de nom ou slug' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoriesService.update(id, dto);
  }

  /**
   * Supprime une catégorie.
   *
   * @param {string} id - UUID de la catégorie à supprimer
   * @returns {Promise<Category>} La catégorie supprimée
   */
  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Supprimer une catégorie',
    description:
      'Supprime une catégorie si elle ne contient pas de sous-catégories ou de produits.',
  })
  @ApiParam({ name: 'id', description: 'UUID de la catégorie', type: String })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Catégorie introuvable' })
  @ApiResponse({
    status: 409,
    description: 'Catégorie contenant des enfants ou des produits',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    return await this.categoriesService.delete(id);
  }
}
