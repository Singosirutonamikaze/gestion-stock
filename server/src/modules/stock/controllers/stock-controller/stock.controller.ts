import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StockService } from '../../services/stock-service';
import { StockQueryDto } from '../../dto/stock-query-dto';
import {
  StockLevelResponseDto,
  LowStockResponseDto,
} from '../../dto/stock-level-response-dto';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../../core/guards/roles-guard';

/**
 * Contrôleur REST pour la consultation des niveaux de stock et alertes.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Stock')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  /**
   * Récupère la liste des produits dont le stock disponible est sous le seuil d'alerte.
   *
   * @returns {Promise<LowStockResponseDto[]>} Liste des produits sous le seuil d'alerte
   */
  @Get('low')
  @ApiOperation({
    summary: 'Consulter les produits en alerte de stock bas',
    description:
      'Retourne les produits dont la quantité totale disponible est inférieure au seuil d’alerte défini.',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des produits sous le seuil d’alerte récupérée avec succès',
    type: [LowStockResponseDto],
  })
  async getLowStock(): Promise<LowStockResponseDto[]> {
    return await this.stockService.getLowStock();
  }

  /**
   * Liste les niveaux de stock avec filtres de recherche et pagination.
   *
   * @param {StockQueryDto} query - Filtres de recherche (productId, warehouseId, pagination)
   * @returns {Promise<{ items: StockLevelResponseDto[]; total: number; page: number; limit: number; totalPages: number }>}
   */
  @Get()
  @ApiOperation({
    summary: 'Lister les niveaux de stock',
    description:
      'Récupère les niveaux de stock agrégés avec possibilité de filtrer par produit ou entrepôt.',
  })
  @ApiResponse({
    status: 200,
    description: 'Niveaux de stock récupérés avec succès',
  })
  async findAll(@Query() query: StockQueryDto) {
    return await this.stockService.findAll(query);
  }
}
