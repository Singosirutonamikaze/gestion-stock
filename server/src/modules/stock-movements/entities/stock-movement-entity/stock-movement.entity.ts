import {
  StockMovement as PrismaStockMovement,
  MovementType,
} from '@prisma/client';

/**
 * Entité métier représentant un mouvement de stock immuable.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class StockMovementEntity implements PrismaStockMovement {
  id!: string;
  productId!: string;
  warehouseId!: string;
  type!: MovementType;
  quantity!: number;
  reason!: string | null;
  reference!: string | null;
  relatedWarehouseId!: string | null;
  userId!: string;
  createdAt!: Date;
}
