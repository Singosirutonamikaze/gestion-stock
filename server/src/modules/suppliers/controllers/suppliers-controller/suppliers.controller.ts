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
import { SuppliersService } from '../../services/suppliers-service';
import { CreateSupplierDto } from '../../dto/create-supplier-dto';
import { UpdateSupplierDto } from '../../dto/update-supplier-dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../../core/guards/roles-guard';
import { Roles } from '../../../../shared/decorators/roles-decorator';
import { UserRole } from '../../../../shared/enums/user-role-enum';
import { Supplier } from '@prisma/client';

/**
 * Contrôleur REST pour la gestion des fournisseurs.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Fournisseurs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  /**
   * Récupère la liste des fournisseurs.
   *
   * @param {boolean} [includeInactive] - Inclure les fournisseurs inactifs
   * @returns {Promise<Supplier[]>} Liste des fournisseurs
   */
  @Get()
  @ApiOperation({
    summary: 'Lister tous les fournisseurs',
    description: 'Retourne la liste complète des fournisseurs de marchandises.',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Inclure les fournisseurs désactivés',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des fournisseurs récupérée avec succès',
  })
  async findAll(
    @Query('includeInactive', new ParseBoolPipe({ optional: true }))
    includeInactive?: boolean,
  ): Promise<Supplier[]> {
    return await this.suppliersService.findAll(includeInactive);
  }

  /**
   * Récupère un fournisseur par son identifiant.
   *
   * @param {string} id - UUID du fournisseur
   * @returns {Promise<Supplier>} Le fournisseur correspondant
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Consulter un fournisseur',
    description: "Retourne le profil détaillé d'un fournisseur.",
  })
  @ApiParam({ name: 'id', description: 'UUID du fournisseur', type: String })
  @ApiResponse({ status: 200, description: 'Fournisseur trouvé' })
  @ApiResponse({ status: 404, description: 'Fournisseur introuvable' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Supplier> {
    return await this.suppliersService.findById(id);
  }

  /**
   * Crée un nouveau fournisseur.
   *
   * @param {CreateSupplierDto} dto - Données de création
   * @returns {Promise<Supplier>} Le fournisseur créé
   */
  @Post()
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Créer un fournisseur',
    description: 'Enregistre un nouveau fournisseur (ADMIN et MANAGER).',
  })
  @ApiResponse({ status: 201, description: 'Fournisseur créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Nom de fournisseur déjà utilisé' })
  async create(@Body() dto: CreateSupplierDto): Promise<Supplier> {
    return await this.suppliersService.create(dto);
  }

  /**
   * Modifie un fournisseur existant.
   *
   * @param {string} id - UUID du fournisseur
   * @param {UpdateSupplierDto} dto - Données modifiées
   * @returns {Promise<Supplier>} Le fournisseur mis à jour
   */
  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Modifier un fournisseur',
    description: "Met à jour les coordonnées ou informations d'un fournisseur.",
  })
  @ApiParam({ name: 'id', description: 'UUID du fournisseur', type: String })
  @ApiResponse({ status: 200, description: 'Fournisseur mis à jour' })
  @ApiResponse({ status: 404, description: 'Fournisseur introuvable' })
  @ApiResponse({ status: 409, description: 'Nom déjà utilisé' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<Supplier> {
    return await this.suppliersService.update(id, dto);
  }

  /**
   * Supprime un fournisseur.
   *
   * @param {string} id - UUID du fournisseur
   * @returns {Promise<Supplier>} Le fournisseur supprimé
   */
  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Supprimer un fournisseur',
    description: 'Supprime un fournisseur s’il ne possède aucun produit lié.',
  })
  @ApiParam({ name: 'id', description: 'UUID du fournisseur', type: String })
  @ApiResponse({ status: 200, description: 'Fournisseur supprimé' })
  @ApiResponse({ status: 404, description: 'Fournisseur introuvable' })
  @ApiResponse({
    status: 409,
    description: 'Fournisseur associé à des produits',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<Supplier> {
    return await this.suppliersService.delete(id);
  }
}
