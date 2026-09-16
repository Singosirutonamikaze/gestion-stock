import { UserRole } from '../../types/enums/enums';

/**
 * Hiérarchie et permissions par rôle.
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMINISTRATOR]: ['*'],
  [UserRole.MANAGER]: [
    'products:read',
    'products:write',
    'categories:read',
    'categories:write',
    'suppliers:read',
    'suppliers:write',
    'warehouses:read',
    'warehouses:write',
    'stock:read',
    'stock:write',
    'stock-movements:read',
    'stock-movements:write',
    'orders:read',
    'orders:write',
    'reports:read',
  ],
  [UserRole.STOCK_KEEPER]: [
    'products:read',
    'categories:read',
    'warehouses:read',
    'stock:read',
    'stock:write',
    'stock-movements:read',
    'stock-movements:write',
    'orders:read',
  ],
  [UserRole.SALES]: [
    'products:read',
    'categories:read',
    'stock:read',
    'orders:read',
    'orders:write',
  ],
  [UserRole.VIEWER]: [
    'products:read',
    'categories:read',
    'stock:read',
    'orders:read',
  ],
};

export function hasRole(currentRole?: UserRole | null, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!currentRole) return false;
  if (currentRole === UserRole.ADMINISTRATOR) return true;
  return allowedRoles.includes(currentRole);
}

export function getDefaultDashboardPath(role?: UserRole | null): string {
  switch (role) {
    case UserRole.ADMINISTRATOR:
      return '/admin/dashboard';
    case UserRole.MANAGER:
      return '/manager/dashboard';
    case UserRole.STOCK_KEEPER:
      return '/stock-keeper/dashboard';
    case UserRole.SALES:
      return '/sales/dashboard';
    default:
      return '/login';
  }
}
