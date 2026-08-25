import { UserRole, OPERATION, OperationType } from '../../enums/user-role-enum';

/**
 * Constante recensant l'ensemble des modules/ressources du système.
 * @readonly
 */
export const RESOURCE = Object.freeze({
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SUPPLIERS: 'suppliers',
  WAREHOUSES: 'warehouses',
  STOCK: 'stock',
  STOCK_MOVEMENTS: 'stock_movements',
  ORDERS: 'orders',
  REPORTS: 'reports',
} as const);

export type ResourceType = (typeof RESOURCE)[keyof typeof RESOURCE];

/**
 * Construit un identifiant de permission standardisé sous la forme `ressource:opération`.
 *
 * @param {ResourceType} resource - La ressource visée (ex: 'users', 'products')
 * @param {OperationType} operation - L'opération exécutée (ex: 'create', 'patch')
 * @returns {string} L'identifiant normalisé de la permission (ex: 'users:create')
 *
 * @example
 * buildPermission('products', 'create');
 * // => "products:create"
 */
export const buildPermission = (
  resource: ResourceType,
  operation: OperationType,
): string => `${resource}:${operation}`;

/**
 * Registre des permissions applicatives générées pour chaque ressource et opération.
 * @readonly
 */
export const Permission = Object.freeze({
  // Utilisateurs
  USERS_CREATE: buildPermission(RESOURCE.USERS, OPERATION.CREATE),
  USERS_READ: buildPermission(RESOURCE.USERS, OPERATION.READ),
  USERS_LIST: buildPermission(RESOURCE.USERS, OPERATION.LIST),
  USERS_UPDATE: buildPermission(RESOURCE.USERS, OPERATION.UPDATE),
  USERS_PATCH: buildPermission(RESOURCE.USERS, OPERATION.PATCH),
  USERS_DELETE: buildPermission(RESOURCE.USERS, OPERATION.DELETE),
  USERS_RESTORE: buildPermission(RESOURCE.USERS, OPERATION.RESTORE),
  USERS_ARCHIVE: buildPermission(RESOURCE.USERS, OPERATION.ARCHIVE),

  // Produits & Catalogue
  PRODUCTS_CREATE: buildPermission(RESOURCE.PRODUCTS, OPERATION.CREATE),
  PRODUCTS_READ: buildPermission(RESOURCE.PRODUCTS, OPERATION.READ),
  PRODUCTS_LIST: buildPermission(RESOURCE.PRODUCTS, OPERATION.LIST),
  PRODUCTS_UPDATE: buildPermission(RESOURCE.PRODUCTS, OPERATION.UPDATE),
  PRODUCTS_PATCH: buildPermission(RESOURCE.PRODUCTS, OPERATION.PATCH),
  PRODUCTS_DELETE: buildPermission(RESOURCE.PRODUCTS, OPERATION.DELETE),
  PRODUCTS_RESTORE: buildPermission(RESOURCE.PRODUCTS, OPERATION.RESTORE),

  // Catégories
  CATEGORIES_CREATE: buildPermission(RESOURCE.CATEGORIES, OPERATION.CREATE),
  CATEGORIES_READ: buildPermission(RESOURCE.CATEGORIES, OPERATION.READ),
  CATEGORIES_LIST: buildPermission(RESOURCE.CATEGORIES, OPERATION.LIST),
  CATEGORIES_UPDATE: buildPermission(RESOURCE.CATEGORIES, OPERATION.UPDATE),
  CATEGORIES_PATCH: buildPermission(RESOURCE.CATEGORIES, OPERATION.PATCH),
  CATEGORIES_DELETE: buildPermission(RESOURCE.CATEGORIES, OPERATION.DELETE),

  // Fournisseurs
  SUPPLIERS_CREATE: buildPermission(RESOURCE.SUPPLIERS, OPERATION.CREATE),
  SUPPLIERS_READ: buildPermission(RESOURCE.SUPPLIERS, OPERATION.READ),
  SUPPLIERS_LIST: buildPermission(RESOURCE.SUPPLIERS, OPERATION.LIST),
  SUPPLIERS_UPDATE: buildPermission(RESOURCE.SUPPLIERS, OPERATION.UPDATE),
  SUPPLIERS_PATCH: buildPermission(RESOURCE.SUPPLIERS, OPERATION.PATCH),
  SUPPLIERS_DELETE: buildPermission(RESOURCE.SUPPLIERS, OPERATION.DELETE),

  // Entrepôts
  WAREHOUSES_CREATE: buildPermission(RESOURCE.WAREHOUSES, OPERATION.CREATE),
  WAREHOUSES_READ: buildPermission(RESOURCE.WAREHOUSES, OPERATION.READ),
  WAREHOUSES_LIST: buildPermission(RESOURCE.WAREHOUSES, OPERATION.LIST),
  WAREHOUSES_UPDATE: buildPermission(RESOURCE.WAREHOUSES, OPERATION.UPDATE),
  WAREHOUSES_PATCH: buildPermission(RESOURCE.WAREHOUSES, OPERATION.PATCH),
  WAREHOUSES_DELETE: buildPermission(RESOURCE.WAREHOUSES, OPERATION.DELETE),

  // Stock & Mouvements
  STOCK_READ: buildPermission(RESOURCE.STOCK, OPERATION.READ),
  STOCK_LIST: buildPermission(RESOURCE.STOCK, OPERATION.LIST),
  STOCK_MOVE: buildPermission(RESOURCE.STOCK, OPERATION.MOVE),

  STOCK_MOVEMENTS_CREATE: buildPermission(
    RESOURCE.STOCK_MOVEMENTS,
    OPERATION.CREATE,
  ),
  STOCK_MOVEMENTS_READ: buildPermission(
    RESOURCE.STOCK_MOVEMENTS,
    OPERATION.READ,
  ),
  STOCK_MOVEMENTS_LIST: buildPermission(
    RESOURCE.STOCK_MOVEMENTS,
    OPERATION.LIST,
  ),

  // Commandes
  ORDERS_CREATE: buildPermission(RESOURCE.ORDERS, OPERATION.CREATE),
  ORDERS_READ: buildPermission(RESOURCE.ORDERS, OPERATION.READ),
  ORDERS_LIST: buildPermission(RESOURCE.ORDERS, OPERATION.LIST),
  ORDERS_UPDATE: buildPermission(RESOURCE.ORDERS, OPERATION.UPDATE),
  ORDERS_PATCH: buildPermission(RESOURCE.ORDERS, OPERATION.PATCH),
  ORDERS_DELETE: buildPermission(RESOURCE.ORDERS, OPERATION.DELETE),

  // Rapports
  REPORTS_READ: buildPermission(RESOURCE.REPORTS, OPERATION.READ),
  REPORTS_LIST: buildPermission(RESOURCE.REPORTS, OPERATION.LIST),
} as const);

export type PermissionType = (typeof Permission)[keyof typeof Permission];

/**
 * Matrice de contrôle d'accès associant à chaque rôle système (`UserRole`)
 * son sous-ensemble complet de permissions autorisées.
 *
 * @readonly
 * @type {Record<UserRole, readonly string[]>}
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> =
  Object.freeze({
    [UserRole.ADMINISTRATOR]: Object.freeze(Object.values(Permission)),

    [UserRole.MANAGER]: Object.freeze([
      Permission.PRODUCTS_CREATE,
      Permission.PRODUCTS_READ,
      Permission.PRODUCTS_LIST,
      Permission.PRODUCTS_UPDATE,
      Permission.PRODUCTS_PATCH,
      Permission.PRODUCTS_DELETE,
      Permission.PRODUCTS_RESTORE,

      Permission.CATEGORIES_CREATE,
      Permission.CATEGORIES_READ,
      Permission.CATEGORIES_LIST,
      Permission.CATEGORIES_UPDATE,
      Permission.CATEGORIES_PATCH,
      Permission.CATEGORIES_DELETE,

      Permission.SUPPLIERS_CREATE,
      Permission.SUPPLIERS_READ,
      Permission.SUPPLIERS_LIST,
      Permission.SUPPLIERS_UPDATE,
      Permission.SUPPLIERS_PATCH,
      Permission.SUPPLIERS_DELETE,

      Permission.WAREHOUSES_CREATE,
      Permission.WAREHOUSES_READ,
      Permission.WAREHOUSES_LIST,
      Permission.WAREHOUSES_UPDATE,
      Permission.WAREHOUSES_PATCH,
      Permission.WAREHOUSES_DELETE,

      Permission.STOCK_READ,
      Permission.STOCK_LIST,
      Permission.STOCK_MOVE,
      Permission.STOCK_MOVEMENTS_CREATE,
      Permission.STOCK_MOVEMENTS_READ,
      Permission.STOCK_MOVEMENTS_LIST,

      Permission.ORDERS_CREATE,
      Permission.ORDERS_READ,
      Permission.ORDERS_LIST,
      Permission.ORDERS_UPDATE,
      Permission.ORDERS_PATCH,
      Permission.ORDERS_DELETE,

      Permission.REPORTS_READ,
      Permission.REPORTS_LIST,
    ]),

    [UserRole.STOCK_KEEPER]: Object.freeze([
      Permission.PRODUCTS_READ,
      Permission.PRODUCTS_LIST,
      Permission.CATEGORIES_READ,
      Permission.CATEGORIES_LIST,
      Permission.WAREHOUSES_READ,
      Permission.WAREHOUSES_LIST,

      Permission.STOCK_READ,
      Permission.STOCK_LIST,
      Permission.STOCK_MOVE,
      Permission.STOCK_MOVEMENTS_CREATE,
      Permission.STOCK_MOVEMENTS_READ,
      Permission.STOCK_MOVEMENTS_LIST,

      Permission.ORDERS_READ,
      Permission.ORDERS_LIST,
    ]),

    [UserRole.SALES]: Object.freeze([
      Permission.PRODUCTS_READ,
      Permission.PRODUCTS_LIST,
      Permission.CATEGORIES_READ,
      Permission.CATEGORIES_LIST,

      Permission.STOCK_READ,
      Permission.STOCK_LIST,

      Permission.ORDERS_CREATE,
      Permission.ORDERS_READ,
      Permission.ORDERS_LIST,
      Permission.ORDERS_UPDATE,
      Permission.ORDERS_PATCH,
    ]),
  });
