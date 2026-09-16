import { Stock as PrismaStock } from '@prisma/client';

/**
 * Entité métier représentant le niveau de stock d'un produit dans un entrepôt.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class StockEntity implements PrismaStock {
  id!: string;
  productId!: string;
  warehouseId!: string;
  locationId!: string | null;
  quantity!: number;
  reservedQuantity!: number;
  availableQuantity!: number;
  updatedAt!: Date;
}
