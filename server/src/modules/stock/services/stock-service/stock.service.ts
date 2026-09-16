import { Injectable } from '@nestjs/common';
import {
  StockRepository,
  StockWithRelations,
  ProductWithStocks,
} from '../../repositories/stock-repository';
import { StockQueryDto } from '../../dto/stock-query-dto';
import {
  LowStockResponseDto,
  LowStockWarehouseDetailDto,
} from '../../dto/stock-level-response-dto';

/**
 * Service gérant la logique métier de consultation du stock et des alertes.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class StockService {
  constructor(private readonly stockRepository: StockRepository) {}

  /**
   * Récupère la liste paginée des niveaux de stock selon les filtres fournis.
   *
   * @param {StockQueryDto} [query] - Filtres de recherche et options de pagination
   * @returns {Promise<{ items: StockWithRelations[]; total: number; page: number; limit: number; totalPages: number }>}
   */
  async findAll(query?: StockQueryDto): Promise<{
    items: StockWithRelations[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page: number = query?.page !== undefined ? Number(query.page) : 1;
    const limit: number = query?.limit !== undefined ? Number(query.limit) : 20;

    const [items, total]: [StockWithRelations[], number] = await Promise.all([
      this.stockRepository.findMany(query),
      this.stockRepository.count(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Récupère la liste des produits dont le stock total disponible est inférieur au seuil d'alerte (alertThreshold).
   *
   * @returns {Promise<LowStockResponseDto[]>} Liste des produits sous le seuil d'alerte avec détail par entrepôt
   */
  async getLowStock(): Promise<LowStockResponseDto[]> {
    const products: ProductWithStocks[] =
      await this.stockRepository.findProductsWithStocks();

    const lowStockProducts: LowStockResponseDto[] = [];

    for (const product of products) {
      const warehousesDetail: LowStockWarehouseDetailDto[] = (
        product.stocks || []
      ).map(
        (
          s: ProductWithStocks['stocks'][number],
        ): LowStockWarehouseDetailDto => ({
          warehouseId: s.warehouseId,
          warehouseCode: s.warehouse?.code ?? '',
          warehouseName: s.warehouse?.name ?? '',
          quantity: s.quantity,
          availableQuantity: s.availableQuantity,
        }),
      );

      const totalQuantity: number = warehousesDetail.reduce(
        (sum: number, w: LowStockWarehouseDetailDto): number =>
          sum + w.quantity,
        0,
      );
      const totalAvailableQuantity: number = warehousesDetail.reduce(
        (sum: number, w: LowStockWarehouseDetailDto): number =>
          sum + w.availableQuantity,
        0,
      );

      // Le produit est en alerte si la quantité totale disponible est inférieure à alertThreshold
      if (totalAvailableQuantity < product.alertThreshold) {
        lowStockProducts.push({
          id: product.id,
          sku: product.sku,
          name: product.name,
          totalQuantity,
          totalAvailableQuantity,
          alertThreshold: product.alertThreshold,
          warehouses: warehousesDetail,
        });
      }
    }

    return lowStockProducts;
  }
}
