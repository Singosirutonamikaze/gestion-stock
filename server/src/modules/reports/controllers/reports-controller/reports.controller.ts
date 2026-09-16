import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth-guard';
import { RolesGuard } from '../../../../core/guards/roles-guard';
import { Roles } from '../../../../shared/decorators/roles-decorator';
import { UserRole } from '../../../../shared/enums/user-role-enum';
import {
  LowStockReportItemDto,
  MovementsReportQueryDto,
  MovementsReportResponseDto,
  ReportFormat,
  StockReportItemDto,
  StockReportQueryDto,
  StockValuationQueryDto,
  StockValuationResponseDto,
} from '../../dto';
import { ReportsService } from '../../services/reports-service';

/**
 * Contrôleur REST pour la génération et l'export des rapports décisionnels et financiers.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@ApiTags('Rapports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Export et consultation de l'état global du stock par entrepôt.
   */
  @Get('stock')
  @ApiOperation({
    summary: 'Rapport d’état du stock',
    description:
      'Retourne la liste complète des niveaux de stock avec indicateur d’alerte (support format JSON et CSV).',
  })
  @ApiResponse({
    status: 200,
    description: 'Rapport d’état du stock généré avec succès',
    type: [StockReportItemDto],
  })
  async getStockReport(
    @Query() query: StockReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.reportsService.getStockReport(query);

    if (query.format === ReportFormat.CSV && result.csv) {
      const dateStr = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="stock-report-${dateStr}.csv"`,
      );
      return result.csv;
    }

    return {
      success: true,
      data: result.data,
    };
  }

  /**
   * Rapport des produits en rupture ou sous leur seuil d'alerte.
   */
  @Get('stock/low')
  @ApiOperation({
    summary: 'Rapport des ruptures et alertes de stock',
    description:
      'Retourne les produits dont la quantité totale est inférieure au seuil d’alerte avec calcul du déficit.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rapport des ruptures généré avec succès',
    type: [LowStockReportItemDto],
  })
  async getLowStockReport() {
    const data = await this.reportsService.getLowStockReport();
    return {
      success: true,
      data,
    };
  }

  /**
   * Rapport d'analyse des mouvements de stock sur une période donnée.
   */
  @Get('movements')
  @ApiOperation({
    summary: 'Rapport des mouvements sur une période',
    description:
      'Génère le récapitulatif détaillé des mouvements avec totaux agrégés par type (support JSON et CSV).',
  })
  @ApiResponse({
    status: 200,
    description: 'Rapport des mouvements généré avec succès',
    type: MovementsReportResponseDto,
  })
  async getMovementsReport(
    @Query() query: MovementsReportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.reportsService.getMovementsReport(query);

    if (query.format === ReportFormat.CSV && result.csv) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="movements-report-${query.from}-${query.to}.csv"`,
      );
      return result.csv;
    }

    return {
      success: true,
      data: result.data,
    };
  }

  /**
   * Rapport de valorisation financière du stock (coût, vente, marge).
   */
  @Get('stock/valuation')
  @ApiOperation({
    summary: 'Rapport de valorisation financière du stock',
    description:
      'Calcule la valeur marchande, la valeur au coût et la marge brute du stock (support JSON et CSV).',
  })
  @ApiResponse({
    status: 200,
    description: 'Valorisation du stock générée avec succès',
    type: StockValuationResponseDto,
  })
  async getStockValuation(
    @Query() query: StockValuationQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.reportsService.getStockValuation(query);

    if (query.format === ReportFormat.CSV && result.csv) {
      const dateStr = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="stock-valuation-${dateStr}.csv"`,
      );
      return result.csv;
    }

    return {
      success: true,
      data: result.data,
    };
  }
}
