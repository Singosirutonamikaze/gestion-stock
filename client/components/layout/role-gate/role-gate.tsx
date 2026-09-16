'use client';

import React from 'react';
import { UserRole } from '../../../types/enums/enums';
import { useAuth } from '../../../features/auth/context/auth-context';

/**
 * Propriétés du composant RoleGate.
 * 
 * @interface RoleGateProps
 * @property {readonly UserRole[]} allowedRoles - Rôles autorisés pour accéder aux éléments enfants
 * @property {React.ReactNode} children - Éléments enfants à afficher si l'accès est autorisé
 * @property {React.ReactNode} [fallback] - Éléments à afficher si l'accès est refusé (optionnel)
 */
export interface RoleGateProps {
  readonly allowedRoles: readonly UserRole[];
  readonly children: React.ReactNode;
  readonly fallback?: React.ReactNode;
}

/**
 * Composant de contrôle d'accès conditionnel masquant ou affichant des éléments
 * de l'interface en fonction du rôle de l'utilisateur authentifié.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {Readonly<RoleGateProps>} props - Propriétés du composant
 * @returns {React.JSX.Element | null} Les éléments enfants autorisés ou le fallback
 */
export function RoleGate({
  allowedRoles,
  children,
  fallback = null,
}: Readonly<RoleGateProps>): React.JSX.Element | null {
  const { canAccess, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!canAccess(allowedRoles as UserRole[])) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
