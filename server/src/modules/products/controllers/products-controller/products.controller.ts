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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from '../../services/products-service';
import { CreateProductDto } from '../../dto/create-product-dto';
import { UpdateProductDto } from '../../dto/update-product-dto';
import { ProductQueryDto } from '../../dto/product-query-dto';
import {
  ProductResponseDto,
  PaginatedProductsResponseDto,
} from '../../dto/product-response-dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../../core/guards/roles-guard';
import { Roles } from '../../../../shared/decorators/roles-decorator';
import { UserRole } from '../../../../shared/enums/user-role-enum';

/**
 * Contrôleur REST pour la gestion des produits du catalogue.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Produits')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Liste les produits avec filtres de recherche et pagination.
   *
   * @param {ProductQueryDto} query - Filtres de recherche
   * @returns {Promise<PaginatedProductsResponseDto>} Résultats paginés
   */
  @Get()
  @ApiOperation({
    summary: 'Lister les produits',
    description:
      'Recherche et filtre les produits du catalogue avec pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits récupérée avec succès',
    type: PaginatedProductsResponseDto,
  })
  async findAll(
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProductsResponseDto> {
    const data = await this.productsService.findAll(query);
    return {
      success: true,
      data,
    };
  }

  /**
   * Récupère un produit par son identifiant unique.
   *
   * @param {string} id - UUID du produit
   * @returns {Promise<ProductResponseDto>} Le produit trouvé
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Consulter un produit',
    description: 'Retourne la fiche détaillée d’un produit avec ses relations.',
  })
  @ApiParam({ name: 'id', description: 'UUID du produit', type: String })
  @ApiResponse({
    status: 200,
    description: 'Produit trouvé',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return await this.productsService.findById(id);
  }

  /**
   * Crée un nouveau produit.
   *
   * @param {CreateProductDto} dto - Données de création
   * @returns {Promise<ProductResponseDto>} Le produit créé
   */
  @Post()
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Créer un produit',
    description:
      'Enregistre un nouveau produit dans le catalogue (ADMIN et MANAGER).',
  })
  @ApiResponse({
    status: 201,
    description: 'Produit créé avec succès',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'Code SKU déjà existant' })
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return await this.productsService.create(dto);
  }

  /**
   * Met à jour un produit existant.
   *
   * @param {string} id - UUID du produit
   * @param {UpdateProductDto} dto - Données modifiées
   * @returns {Promise<ProductResponseDto>} Le produit mis à jour
   */
  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Modifier un produit',
    description: 'Met à jour les informations d’un produit existant.',
  })
  @ApiParam({ name: 'id', description: 'UUID du produit', type: String })
  @ApiResponse({
    status: 200,
    description: 'Produit mis à jour',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  @ApiResponse({ status: 409, description: 'SKU déjà existant' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.update(id, dto);
  }

  /**
   * Désactive logiquement un produit.
   *
   * @param {string} id - UUID du produit
   * @returns {Promise<ProductResponseDto>} Le produit désactivé
   */
  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Désactiver un produit',
    description: 'Désactive logiquement un produit (isActive = false).',
  })
  @ApiParam({ name: 'id', description: 'UUID du produit', type: String })
  @ApiResponse({
    status: 200,
    description: 'Produit désactivé',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Produit non trouvé' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto> {
    return await this.productsService.delete(id);
  }
}
