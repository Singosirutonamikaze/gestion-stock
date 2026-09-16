import { OrderItem as PrismaOrderItem, Prisma } from '@prisma/client';

/**
 * Entité métier représentant une ligne de commande.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class OrderItemEntity implements PrismaOrderItem {
  id!: string;
  orderId!: string;
  productId!: string;
  variantId!: string | null;
  quantity!: number;
  unitPrice!: Prisma.Decimal;
  discountRate!: Prisma.Decimal;
  taxRate!: Prisma.Decimal;
  subtotal!: Prisma.Decimal;
}
