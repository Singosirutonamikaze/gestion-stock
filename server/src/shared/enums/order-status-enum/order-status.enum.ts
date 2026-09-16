/**
 * Constante énumérant les statuts possibles d'une commande.
 *
 * @readonly
 * @enum {string}
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export const OrderStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  RECEIVED: 'RECEIVED',
  PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
  CANCELLED: 'CANCELLED',
} as const;

/**
 * Type TypeScript représentant les statuts valides d'une commande.
 */
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
