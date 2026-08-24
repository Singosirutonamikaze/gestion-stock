/**
 * Énumération des rôles système disponibles pour les utilisateurs.
 */
export enum UserRole {
  ADMINISTRATOR = 'ADMINISTRATOR',
  MANAGER = 'MANAGER',
  STOCK_KEEPER = 'STOCK_KEEPER',
  SALES = 'SALES',
}

/**
 * Constante regroupant les opérations CRUD et avancées du système.
 *
 * @readonly
 * @enum {string}
 */
export const OPERATION = Object.freeze({
  // Opérations CRUD de base
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',

  // Opérations étendues
  LIST: 'list',
  PATCH: 'patch',       // mise à jour partielle
  RESTORE: 'restore',   // restaurer un élément supprimé
  ARCHIVE: 'archive',   // archiver sans supprimer
  RENAME: 'rename',
  MOVE: 'move',
  COPY: 'copy',
} as const);

/**
 * Type d'union TypeScript dérivé des valeurs de l'objet OPERATION.
 * @typedef {'create'|'read'|'update'|'delete'|'list'|'patch'|'restore'|'archive'|'rename'|'move'|'copy'} OperationType
 */
export type OperationType = (typeof OPERATION)[keyof typeof OPERATION];

/**
 * Constante décrivant les états d'une opération système ou transactionnelle.
 *
 * @readonly
 * @enum {string}
 */
export const STATUS = Object.freeze({
  PENDING: 'pending',         // opération en attente
  IN_PROGRESS: 'in_progress', // en cours d'exécution
  COMMITTED: 'committed',     // terminée avec succès
  FAILED: 'failed',           // échec
  ROLLED_BACK: 'rolled_back', // annulée / restaurée à l'état précédent
} as const);

/**
 * Type d'union TypeScript dérivé des valeurs de l'objet STATUS.
 * @typedef {'pending'|'in_progress'|'committed'|'failed'|'rolled_back'} StatusType
 */
export type StatusType = (typeof STATUS)[keyof typeof STATUS];
