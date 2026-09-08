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
import { WarehousesService } from '../../services/warehouses-service';
import { CreateWarehouseDto } from '../../dto/create-warehouse-dto';
import { UpdateWarehouseDto } from '../../dto/update-warehouse-dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../../core/guards/roles-guard';
import { Roles } from '../../../../shared/decorators/roles-decorator';
import { UserRole } from '../../../../shared/enums/user-role-enum';
import { Warehouse } from '@prisma/client';

/**
 * Contrôleur REST pour la gestion des entrepôts.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Entrepôts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  /**
   * Récupère tous les entrepôts.
   *
   * @param {boolean} [includeInactive] - Inclure les entrepôts inactifs
   * @returns {Promise<Warehouse[]>} Liste des entrepôts
   */
  @Get()
  @ApiOperation({
    summary: 'Lister tous les entrepôts',
    description:
      'Retourne la liste complète des entrepôts et sites logistiques.',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Inclure les entrepôts désactivés',
  })
  @ApiResponse({ status: 200, description: 'Liste des entrepôts retournée' })
  async findAll(
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ): Promise<Warehouse[]> {
    return await this.warehousesService.findAll(includeInactive);
  }

  /**
   * Récupère un entrepôt par son UUID.
   *
   * @param {string} id - UUID de l'entrepôt
   * @returns {Promise<Warehouse>} L'entrepôt correspondant
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Consulter un entrepôt',
    description: "Retourne les informations détaillées d'un entrepôt.",
  })
  @ApiParam({ name: 'id', description: 'UUID de l’entrepôt', type: String })
  @ApiResponse({ status: 200, description: 'Entrepôt trouvé' })
  @ApiResponse({ status: 404, description: 'Entrepôt introuvable' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Warehouse> {
    return await this.warehousesService.findById(id);
  }

  /**
   * Crée un nouvel entrepôt.
   *
   * @param {CreateWarehouseDto} dto - Données de création
   * @returns {Promise<Warehouse>} L'entrepôt créé
   */
  @Post()
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Créer un entrepôt',
    description:
      'Crée un nouvel entrepôt (réservé aux rôles ADMIN et MANAGER).',
  })
  @ApiResponse({ status: 201, description: 'Entrepôt créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Code d’entrepôt déjà existant' })
  async create(@Body() dto: CreateWarehouseDto): Promise<Warehouse> {
    return await this.warehousesService.create(dto);
  }

  /**
   * Met à jour un entrepôt existant.
   *
   * @param {string} id - UUID de l'entrepôt
   * @param {UpdateWarehouseDto} dto - Données modifiées
   * @returns {Promise<Warehouse>} L'entrepôt mis à jour
   */
  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Modifier un entrepôt',
    description: 'Met à jour les paramètres d’un entrepôt existant.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’entrepôt', type: String })
  @ApiResponse({ status: 200, description: 'Entrepôt mis à jour' })
  @ApiResponse({ status: 404, description: 'Entrepôt introuvable' })
  @ApiResponse({ status: 409, description: 'Code déjà utilisé' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return await this.warehousesService.update(id, dto);
  }

  /**
   * Désactive logiquement un entrepôt.
   *
   * @param {string} id - UUID de l'entrepôt à désactiver
   * @returns {Promise<Warehouse>} L'entrepôt désactivé
   */
  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Désactiver un entrepôt',
    description:
      'Effectue une suppression logique en basculant isActive à false.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’entrepôt', type: String })
  @ApiResponse({ status: 200, description: 'Entrepôt désactivé avec succès' })
  @ApiResponse({ status: 404, description: 'Entrepôt introuvable' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<Warehouse> {
    return await this.warehousesService.delete(id);
  }
}
