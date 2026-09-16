/**
 * Constante énumérant les types de mouvements de stock supportés par le système.
 *
 * @readonly
 * @enum {string}
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export const MovementType = {
  IN: 'IN',
  OUT: 'OUT',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER: 'TRANSFER',
  RETURN: 'RETURN',
  LOSS: 'LOSS',
  SCRAP: 'SCRAP',
} as const;

/**
 * Type TypeScript représentant les types de mouvements de stock valides.
 */
export type MovementType = (typeof MovementType)[keyof typeof MovementType];
