/**
 * Constante énumérant les types de commande (achat ou vente).
 *
 * @readonly
 * @enum {string}
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export const OrderType = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
} as const;

/**
 * Type TypeScript représentant les types de commande valides.
 */
export type OrderType = (typeof OrderType)[keyof typeof OrderType];
