import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';

/**
 * DTO de réponse pour un article individuel de commande.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class OrderItemResponseDto {
  @ApiProperty({ example: 'c1d2e3f4-a5b6-7890-cdef-123456789012' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  productId!: string;

  @ApiPropertyOptional({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  variantId?: string | null;

  @ApiProperty({ example: 5 })
  quantity!: number;

  @ApiProperty({ example: 2500.5 })
  unitPrice!: number;

  @ApiProperty({ example: 0 })
  discountRate!: number;

  @ApiProperty({ example: 18 })
  taxRate!: number;

  @ApiProperty({ example: 12502.5 })
  subtotal!: number;

  @ApiPropertyOptional({
    description: 'Informations résumées sur le produit',
  })
  product?: {
    id: string;
    sku: string;
    name: string;
    unit?: string;
  };
}

/**
 * DTO de réponse pour une commande complète avec ses relations.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class OrderResponseDto {
  @ApiProperty({ example: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210' })
  id!: string;

  @ApiProperty({ example: 'ORD-20260916-ABCD' })
  orderNumber!: string;

  @ApiProperty({ enum: OrderType, example: OrderType.PURCHASE })
  type!: OrderType;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.DRAFT })
  status!: OrderStatus;

  @ApiPropertyOptional({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  supplierId?: string | null;

  @ApiPropertyOptional({ example: 'd4e5f6a7-b8c9-0123-defa-234567890123' })
  customerId?: string | null;

  @ApiPropertyOptional({ example: 'Société Générale de Distribution SARL' })
  customerName?: string | null;

  @ApiProperty({ example: 'e5f6a7b8-c9d0-1234-efab-345678901234' })
  warehouseId!: string;

  @ApiPropertyOptional({ example: 'f6a7b8c9-d0e1-2345-fabc-456789012345' })
  shippingAddressId?: string | null;

  @ApiProperty({ example: 50000 })
  subtotal!: number;

  @ApiProperty({ example: 9000 })
  taxAmount!: number;

  @ApiProperty({ example: 0 })
  discountAmount!: number;

  @ApiProperty({ example: 0 })
  shippingCost!: number;

  @ApiProperty({ example: 59000 })
  totalAmount!: number;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.UNPAID })
  paymentStatus!: PaymentStatus;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.BANK_TRANSFER,
  })
  paymentMethod?: PaymentMethod | null;

  @ApiPropertyOptional({ example: '2026-10-15T10:00:00.000Z' })
  expectedDeliveryDate?: Date | null;

  @ApiPropertyOptional({ example: '2026-10-16T14:30:00.000Z' })
  shippedAt?: Date | null;

  @ApiPropertyOptional({ example: '2026-10-17T09:15:00.000Z' })
  receivedAt?: Date | null;

  @ApiPropertyOptional({ example: 'Livraison prioritaire' })
  notes?: string | null;

  @ApiProperty({ example: 'user-uuid-1234' })
  createdById!: string;

  @ApiProperty({ example: '2026-09-16T13:40:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-16T13:40:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: [OrderItemResponseDto] })
  items?: OrderItemResponseDto[];

  @ApiPropertyOptional()
  supplier?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  } | null;

  @ApiPropertyOptional()
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string | null;
  } | null;

  @ApiPropertyOptional()
  warehouse?: {
    id: string;
    code: string;
    name: string;
  };

  @ApiPropertyOptional()
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * DTO de réponse paginée pour la liste des commandes.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class PaginatedOrdersResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty()
  data!: {
    items: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
