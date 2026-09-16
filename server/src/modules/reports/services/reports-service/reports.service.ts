import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma-service';
import {
  StockReportQueryDto,
  MovementsReportQueryDto,
  StockValuationQueryDto,
  StockReportItemDto,
  LowStockReportItemDto,
  MovementsReportResponseDto,
  StockValuationResponseDto,
  StockValuationItemDto,
  ReportFormat,
} from '../../dto';
import { MovementType, Prisma } from '@prisma/client';

/**
 * Service pour la génération des rapports statistiques, valorisation et exports CSV.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Génère le rapport de l'état du stock par entrepôt.
   */
  async getStockReport(
    query?: StockReportQueryDto,
  ): Promise<{ data?: StockReportItemDto[]; csv?: string }> {
    const where: Prisma.StockWhereInput = {};
    if (query?.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    const stocks = await this.prisma.stock.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
            alertThreshold: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: [{ product: { name: 'asc' } }, { warehouse: { name: 'asc' } }],
    });

    const items: StockReportItemDto[] = stocks.map((s) => ({
      product: {
        id: s.product.id,
        sku: s.product.sku,
        name: s.product.name,
        unit: s.product.unit,
      },
      warehouse: {
        id: s.warehouse.id,
        code: s.warehouse.code,
        name: s.warehouse.name,
      },
      quantity: s.availableQuantity,
      reservedQuantity: s.reservedQuantity,
      totalQuantity: s.quantity,
      alertThreshold: s.product.alertThreshold,
      isAlert: s.availableQuantity < s.product.alertThreshold,
    }));

    if (query?.format === ReportFormat.CSV) {
      return { csv: this.convertStockReportToCsv(items) };
    }

    return { data: items };
  }

  /**
   * Génère le rapport des ruptures et produits sous seuil d'alerte global.
   */
  async getLowStockReport(): Promise<LowStockReportItemDto[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        stocks: {
          include: {
            warehouse: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const lowStockItems: LowStockReportItemDto[] = [];

    for (const product of products) {
      const totalQuantity = product.stocks.reduce(
        (sum, s) => sum + s.availableQuantity,
        0,
      );

      if (totalQuantity < product.alertThreshold) {
        lowStockItems.push({
          product: {
            id: product.id,
            sku: product.sku,
            name: product.name,
            unit: product.unit,
          },
          totalQuantity,
          alertThreshold: product.alertThreshold,
          deficit: product.alertThreshold - totalQuantity,
          warehouseDetails: product.stocks.map((s) => ({
            warehouseId: s.warehouse.id,
            warehouseCode: s.warehouse.code,
            warehouseName: s.warehouse.name,
            quantity: s.quantity,
            availableQuantity: s.availableQuantity,
          })),
        });
      }
    }

    return lowStockItems;
  }

  /**
   * Génère le rapport d'analyse des mouvements de stock sur une période.
   */
  async getMovementsReport(
    query: MovementsReportQueryDto,
  ): Promise<{ data?: MovementsReportResponseDto; csv?: string }> {
    const fromDate = new Date(query.from);
    const toDate = new Date(query.to);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException(
        'Les dates from et to doivent être valides',
      );
    }

    if (fromDate > toDate) {
      throw new BadRequestException(
        'La date de début (from) doit être antérieure à la date de fin (to)',
      );
    }

    const where: Prisma.StockMovementWhereInput = {
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    };

    if (query.productId) where.productId = query.productId;
    if (query.warehouseId) where.warehouseId = query.warehouseId;
    if (query.type) where.type = query.type;

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: { id: true, sku: true, name: true },
        },
        warehouse: {
          select: { id: true, code: true, name: true },
        },
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      totalIn: 0,
      totalOut: 0,
      totalAdjustment: 0,
      totalTransfer: 0,
      totalLoss: 0,
      totalReturn: 0,
      totalScrap: 0,
      totalCount: movements.length,
    };

    for (const m of movements) {
      switch (m.type) {
        case MovementType.IN:
          summary.totalIn += m.quantity;
          break;
        case MovementType.OUT:
          summary.totalOut += m.quantity;
          break;
        case MovementType.ADJUSTMENT:
          summary.totalAdjustment += m.quantity;
          break;
        case MovementType.TRANSFER:
          summary.totalTransfer += m.quantity;
          break;
        case MovementType.LOSS:
          summary.totalLoss += m.quantity;
          break;
        case MovementType.RETURN:
          summary.totalReturn += m.quantity;
          break;
        case MovementType.SCRAP:
          summary.totalScrap += m.quantity;
          break;
      }
    }

    const responseData: MovementsReportResponseDto = {
      items: movements,
      summary,
    };

    if (query.format === ReportFormat.CSV) {
      return { csv: this.convertMovementsReportToCsv(movements) };
    }

    return { data: responseData };
  }

  /**
   * Génère le rapport financier de valorisation du stock.
   */
  async getStockValuation(
    query?: StockValuationQueryDto,
  ): Promise<{ data?: StockValuationResponseDto; csv?: string }> {
    const where: Prisma.ProductWhereInput = { isActive: true };

    const products = await this.prisma.product.findMany({
      where,
      include: {
        stocks: query?.warehouseId
          ? { where: { warehouseId: query.warehouseId } }
          : true,
      },
      orderBy: { name: 'asc' },
    });

    let grandTotalCostValue = 0;
    let grandTotalSaleValue = 0;

    const items: StockValuationItemDto[] = products.map((p) => {
      const totalQuantity = p.stocks.reduce(
        (sum, s) => sum + s.availableQuantity,
        0,
      );
      const costPrice = Number(p.costPrice);
      const unitPrice = Number(p.unitPrice);
      const costValue = totalQuantity * costPrice;
      const saleValue = totalQuantity * unitPrice;
      const margin = saleValue - costValue;

      grandTotalCostValue += costValue;
      grandTotalSaleValue += saleValue;

      return {
        product: {
          id: p.id,
          sku: p.sku,
          name: p.name,
          unit: p.unit,
        },
        totalQuantity,
        costPrice,
        unitPrice,
        costValue,
        saleValue,
        margin,
      };
    });

    const grandTotalMargin = grandTotalSaleValue - grandTotalCostValue;

    const valuationResult: StockValuationResponseDto = {
      items,
      grandTotalCostValue,
      grandTotalSaleValue,
      grandTotalMargin,
    };

    if (query?.format === ReportFormat.CSV) {
      return { csv: this.convertStockValuationToCsv(items, valuationResult) };
    }

    return { data: valuationResult };
  }

  /**
   * Convertit le rapport d'état du stock en format CSV.
   */
  private convertStockReportToCsv(items: StockReportItemDto[]): string {
    const headers = [
      'SKU',
      'Nom Produit',
      'Unite',
      'Code Entrepot',
      'Nom Entrepot',
      'Quantite Disponible',
      'Quantite Reservee',
      'Quantite Totale',
      'Seuil Alerte',
      'Alerte',
    ];

    const rows = items.map((i) => [
      `"${i.product.sku}"`,
      `"${i.product.name.replaceAll('"', '""')}"`,
      `"${i.product.unit}"`,
      `"${i.warehouse.code}"`,
      `"${i.warehouse.name.replaceAll('"', '""')}"`,
      i.quantity,
      i.reservedQuantity,
      i.totalQuantity,
      i.alertThreshold,
      i.isAlert ? 'OUI' : 'NON',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Convertit le rapport des mouvements en format CSV.
   */
  private convertMovementsReportToCsv(
    movements: Array<{
      createdAt: Date;
      reference: string | null;
      type: MovementType;
      quantity: number;
      reason: string | null;
      product: { sku: string; name: string };
      warehouse: { code: string; name: string };
      user: { email: string; firstName: string; lastName: string };
    }>,
  ): string {
    const headers = [
      'Date',
      'Reference',
      'Type',
      'SKU',
      'Produit',
      'Code Entrepot',
      'Nom Entrepot',
      'Quantite',
      'Motif',
      'Utilisateur',
    ];

    const rows = movements.map((m) => [
      `"${m.createdAt.toISOString()}"`,
      `"${(m.reference || '').replaceAll('"', '""')}"`,
      `"${m.type}"`,
      `"${m.product.sku}"`,
      `"${m.product.name.replaceAll('"', '""')}"`,
      `"${m.warehouse.code}"`,
      `"${m.warehouse.name.replaceAll('"', '""')}"`,
      m.quantity,
      `"${(m.reason || '').replaceAll('"', '""')}"`,
      `"${m.user.firstName} ${m.user.lastName} (${m.user.email})"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Convertit le rapport de valorisation du stock en format CSV.
   */
  private convertStockValuationToCsv(
    items: StockValuationItemDto[],
    summary: StockValuationResponseDto,
  ): string {
    const headers = [
      'SKU',
      'Nom Produit',
      'Unite',
      'Quantite Totale',
      'Prix Achat',
      'Prix Vente',
      'Valeur Cout',
      'Valeur Vente',
      'Marge',
    ];

    const rows = items.map((i) => [
      `"${i.product.sku}"`,
      `"${i.product.name.replaceAll('"', '""')}"`,
      `"${i.product.unit}"`,
      i.totalQuantity,
      i.costPrice,
      i.unitPrice,
      i.costValue,
      i.saleValue,
      i.margin,
    ]);

    const summaryRow = [
      '"TOTAL GENERAL"',
      '""',
      '""',
      '""',
      '""',
      '""',
      summary.grandTotalCostValue,
      summary.grandTotalSaleValue,
      summary.grandTotalMargin,
    ];

    return [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
      summaryRow.join(','),
    ].join('\n');
  }
}
