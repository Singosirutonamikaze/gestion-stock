import { SetMetadata } from '@nestjs/common';
import { UserRole, OperationType } from '../../enums/user-role-enum';
import { ResourceType, PermissionType } from '../../constants';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const RESOURCE_KEY = 'resource';
export const OPERATION_KEY = 'operation';

/**
 * Décorateur pour restreindre l'accès à un ou plusieurs rôles (`UserRole`).
 *
 * @param {...UserRole} roles - Liste des rôles autorisés à accéder à la méthode ou au contrôleur
 * @returns {CustomDecorator<string>} Métadonnées de rôles attachées à la route
 *
 * @example
 * @Roles(UserRole.ADMINISTRATOR, UserRole.MANAGER)
 * @Get('users')
 * findAll() {}
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Décorateur pour restreindre l'accès à une ou plusieurs permissions spécifiques.
 *
 * @param {...PermissionType} permissions - Liste des permissions explicites requises
 * @returns {CustomDecorator<string>} Métadonnées de permissions attachées à la route
 *
 * @example
 * @RequirePermissions(Permission.PRODUCTS_CREATE)
 * @Post('products')
 * create() {}
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export const RequirePermissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Décorateur déclaratif pour spécifier la ressource et l'opération associée à une route.
 *
 * @param {ResourceType} resource - Nom du module/ressource visé (ex: 'products', 'stock')
 * @param {OperationType} operation - Opération exécutée (ex: 'patch', 'restore', 'move')
 * @returns {CustomDecorator<string>} Métadonnées de ressource et d'opération attachées à la route
 *
 * @example
 * @AccessControl(RESOURCE.STOCK, OPERATION.MOVE)
 * @Post('stock/transfer')
 * transferStock() {}
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export const AccessControl = (
  resource: ResourceType,
  operation: OperationType,
) => SetMetadata(RESOURCE_KEY, { resource, operation });
