import {
  Order as PrismaOrder,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from '@prisma/client';

/**
 * Entité métier représentant une commande d'achat ou de vente.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class OrderEntity implements PrismaOrder {
  id!: string;
  orderNumber!: string;
  type!: OrderType;
  status!: OrderStatus;
  supplierId!: string | null;
  customerId!: string | null;
  customerName!: string | null;
  warehouseId!: string;
  shippingAddressId!: string | null;
  subtotal!: Prisma.Decimal;
  taxAmount!: Prisma.Decimal;
  discountAmount!: Prisma.Decimal;
  shippingCost!: Prisma.Decimal;
  totalAmount!: Prisma.Decimal;
  paymentStatus!: PaymentStatus;
  paymentMethod!: PaymentMethod | null;
  expectedDeliveryDate!: Date | null;
  shippedAt!: Date | null;
  receivedAt!: Date | null;
  notes!: string | null;
  createdById!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
