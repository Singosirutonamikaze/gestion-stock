import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';

/**
 * DTO pour un élément de l'état global du stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class StockReportItemDto {
  @ApiProperty({
    example: {
      id: 'prod-uuid',
      sku: 'SKU-001',
      name: 'Disque Dur SSD 1To',
      unit: 'pièce',
    },
  })
  product!: {
    id: string;
    sku: string;
    name: string;
    unit: string;
  };

  @ApiProperty({
    example: {
      id: 'wh-uuid',
      code: 'WH-CENTRAL',
      name: 'Entrepôt Central',
    },
  })
  warehouse!: {
    id: string;
    code: string;
    name: string;
  };

  @ApiProperty({ example: 45, description: 'Quantité disponible en stock' })
  quantity!: number;

  @ApiProperty({ example: 5, description: 'Quantité réservée' })
  reservedQuantity!: number;

  @ApiProperty({ example: 50, description: 'Quantité physique totale' })
  totalQuantity!: number;

  @ApiProperty({ example: 10, description: 'Seuil d’alerte du produit' })
  alertThreshold!: number;

  @ApiProperty({
    example: false,
    description: 'True si le stock disponible est sous le seuil d’alerte',
  })
  isAlert!: boolean;
}

/**
 * DTO pour un élément en rupture ou sous seuil d'alerte.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class LowStockReportItemDto {
  @ApiProperty({
    example: {
      id: 'prod-uuid',
      sku: 'SKU-002',
      name: 'Écran 27 pouces 4K',
      unit: 'pièce',
    },
  })
  product!: {
    id: string;
    sku: string;
    name: string;
    unit: string;
  };

  @ApiProperty({
    example: 3,
    description: 'Quantité totale disponible sur tous les entrepôts',
  })
  totalQuantity!: number;

  @ApiProperty({ example: 10, description: 'Seuil d’alerte configuré' })
  alertThreshold!: number;

  @ApiProperty({
    example: 7,
    description: 'Déficit (alertThreshold - totalQuantity)',
  })
  deficit!: number;

  @ApiProperty({
    example: [
      {
        warehouseId: 'wh-1',
        warehouseCode: 'WH-01',
        warehouseName: 'Entrepôt Central',
        quantity: 3,
        availableQuantity: 3,
      },
    ],
  })
  warehouseDetails!: Array<{
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
    quantity: number;
    availableQuantity: number;
  }>;
}

/**
 * DTO pour le rapport des mouvements de stock sur une période.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class MovementsReportResponseDto {
  @ApiProperty()
  items!: Array<{
    id: string;
    productId: string;
    warehouseId: string;
    type: MovementType;
    quantity: number;
    reason: string | null;
    reference: string | null;
    createdAt: Date;
    product: {
      id: string;
      sku: string;
      name: string;
    };
    warehouse: {
      id: string;
      code: string;
      name: string;
    };
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }>;

  @ApiProperty({
    example: {
      totalIn: 150,
      totalOut: 80,
      totalAdjustment: 5,
      totalTransfer: 20,
      totalLoss: 2,
      totalReturn: 4,
      totalScrap: 1,
      totalCount: 35,
    },
  })
  summary!: {
    totalIn: number;
    totalOut: number;
    totalAdjustment: number;
    totalTransfer: number;
    totalLoss: number;
    totalReturn: number;
    totalScrap: number;
    totalCount: number;
  };
}

/**
 * DTO pour la valorisation du stock par produit.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class StockValuationItemDto {
  @ApiProperty()
  product!: {
    id: string;
    sku: string;
    name: string;
    unit: string;
  };

  @ApiProperty({ example: 100 })
  totalQuantity!: number;

  @ApiProperty({ example: 15000 })
  costPrice!: number;

  @ApiProperty({ example: 22000 })
  unitPrice!: number;

  @ApiProperty({ example: 1500000 })
  costValue!: number;

  @ApiProperty({ example: 2200000 })
  saleValue!: number;

  @ApiProperty({ example: 700000 })
  margin!: number;
}

/**
 * DTO de réponse complète pour la valorisation financière du stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class StockValuationResponseDto {
  @ApiProperty({ type: [StockValuationItemDto] })
  items!: StockValuationItemDto[];

  @ApiProperty({ example: 15000000 })
  grandTotalCostValue!: number;

  @ApiProperty({ example: 22000000 })
  grandTotalSaleValue!: number;

  @ApiProperty({ example: 7000000 })
  grandTotalMargin!: number;
}
