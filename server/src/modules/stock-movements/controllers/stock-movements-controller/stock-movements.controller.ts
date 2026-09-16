import {
  Controller,
  Get,
  Post,
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
  ApiQuery,
} from '@nestjs/swagger';
import { StockMovementsService } from '../../services/stock-movements-service';
import { CreateStockMovementDto } from '../../dto/create-stock-movement-dto';
import { StockMovementResponseDto } from '../../dto/stock-movement-response-dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../../core/guards/roles-guard';
import { Roles } from '../../../../shared/decorators/roles-decorator';
import { CurrentUser } from '../../../../shared/decorators/current-user-decorator';
import { UserRole } from '../../../../shared/enums/user-role-enum';
import { MovementType } from '@prisma/client';
import type { JwtPayload } from '../../../auth/types/jwt-payload.type';

/**
 * Contrôleur REST pour la gestion des mouvements de stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Mouvements de stock')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  /**
   * Liste les mouvements de stock avec filtres optionnels et pagination.
   *
   * @param {string} [productId] - UUID du produit
   * @param {string} [warehouseId] - UUID de l'entrepôt
   * @param {MovementType} [type] - Type de mouvement
   * @param {string} [page] - Numéro de page
   * @param {string} [limit] - Nombre d'éléments par page
   * @returns {Promise<{ items: StockMovementResponseDto[]; total: number; page: number; limit: number; totalPages: number }>}
   */
  @Get()
  @ApiOperation({
    summary: 'Lister les mouvements de stock',
    description:
      'Récupère l’historique des mouvements de stock avec pagination et filtres.',
  })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: MovementType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Historique des mouvements récupéré avec succès',
  })
  async findAll(
    @Query('productId') productId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('type') type?: MovementType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Number.parseInt(page, 10) : 1;
    const limitNum = limit ? Number.parseInt(limit, 10) : 20;

    return await this.stockMovementsService.findAll({
      productId,
      warehouseId,
      type,
      page: Number.isNaN(pageNum) ? 1 : pageNum,
      limit: Number.isNaN(limitNum) ? 20 : limitNum,
    });
  }

  /**
   * Récupère un mouvement de stock par son identifiant unique UUID.
   *
   * @param {string} id - UUID du mouvement
   * @returns {Promise<StockMovementResponseDto>} Le mouvement trouvé
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Consulter un mouvement de stock',
    description:
      'Retourne les informations détaillées d’un mouvement spécifique.',
  })
  @ApiParam({ name: 'id', description: 'UUID du mouvement', type: String })
  @ApiResponse({
    status: 200,
    description: 'Mouvement trouvé avec succès',
    type: StockMovementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Mouvement non trouvé' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StockMovementResponseDto> {
    return await this.stockMovementsService.findById(id);
  }

  /**
   * Enregistre un nouveau mouvement de stock immuable.
   *
   * @param {CreateStockMovementDto} dto - Données de création
   * @param {JwtPayload} user - Utilisateur authentifié initiateur
   * @returns {Promise<StockMovementResponseDto>} Le mouvement créé
   */
  @Post()
  @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER, UserRole.STOCK_KEEPER)
  @ApiOperation({
    summary: 'Créer un mouvement de stock',
    description:
      'Crée un mouvement de stock immuable et met à jour les quantités disponibles en temps réel.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mouvement de stock créé avec succès',
    type: StockMovementResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Stock insuffisant ou données invalides',
  })
  @ApiResponse({
    status: 404,
    description: 'Produit ou entrepôt introuvable',
  })
  async create(
    @Body() dto: CreateStockMovementDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<StockMovementResponseDto> {
    const userId = user?.sub || (user as unknown as { id?: string })?.id || '';
    return await this.stockMovementsService.create(dto, userId);
  }
}
