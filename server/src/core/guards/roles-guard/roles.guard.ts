import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, OperationType } from '../../../shared/enums/user-role-enum';
import {
  ResourceType,
  PermissionType,
  ROLE_PERMISSIONS,
  buildPermission,
} from '../../../shared/constants';
import {
  ROLES_KEY,
  PERMISSIONS_KEY,
  RESOURCE_KEY,
} from '../../../shared/decorators/roles-decorator';

export interface RequestUserPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Garde de contrôle d'accès basé sur les rôles (RBAC) et permissions granulaires.
 *
 * @see JwtAuthGuard
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Évalue si la requête dispose des rôles, permissions explicites ou du couple Ressource/Opération requis.
   *
   * @param {ExecutionContext} context - Contexte d'exécution de la requête NestJS
   * @returns {boolean} True si l'accès est autorisé
   *
   * @author SINGO Yao Dieu Donnée
   * @since 0.0.1
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionType[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    const resourceMetadata = this.reflector.getAllAndOverride<{
      resource: ResourceType;
      operation: OperationType;
    }>(RESOURCE_KEY, [context.getHandler(), context.getClass()]);

    const hasRolesRestriction = Boolean(requiredRoles?.length);
    const hasPermissionsRestriction = Boolean(requiredPermissions?.length);
    const hasResourceRestriction = Boolean(resourceMetadata);

    // Si aucune restriction n'est posée, la route est considérée comme accessible/publique
    const isPublic =
      !hasRolesRestriction &&
      !hasPermissionsRestriction &&
      !hasResourceRestriction;

    const request = context.switchToHttp().getRequest<{ user?: RequestUserPayload }>();
    const user = request.user;
    const hasUser = Boolean(user?.role);

    const userRole = user?.role as UserRole;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    // Vérification 1 : Rôle
    const isRoleAllowed = hasRolesRestriction
      ? requiredRoles.includes(userRole)
      : true;

    // Vérification 2 : Permissions explicites
    const isPermissionAllowed = hasPermissionsRestriction
      ? requiredPermissions.every((perm) => userPermissions.includes(perm))
      : true;

    // Vérification 3 : Accès par Ressource + Opération (ex: list, patch, restore, etc.)
    const computedPermission = hasResourceRestriction
      ? buildPermission(resourceMetadata.resource, resourceMetadata.operation)
      : '';
    const isResourceOperationAllowed = hasResourceRestriction
      ? userPermissions.includes(computedPermission)
      : true;

    const isAuthorized =
      isPublic ||
      (hasUser &&
        isRoleAllowed &&
        isPermissionAllowed &&
        isResourceOperationAllowed);

    return isAuthorized;
  }
}
