'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '../../../types/enums/enums';
import { useAuth } from '../../../features/auth/context/auth-context';
import { cn } from '../../../lib/utils/utils';

/**
 * Propriétés du composant ProtectedNavLink.
 * 
 * @interface ProtectedNavLinkProps
 * @property {string} href - URL de destination du lien
 * @property {readonly UserRole[]} [allowedRoles] - Rôles autorisés pour accéder au lien (optionnel)
 * @property {React.ReactNode} children - Contenu du lien (texte ou éléments JSX)
 * @property {React.ReactNode} [icon] - Icône à afficher à gauche du texte (optionnel)
 * @property {string} [className] - Classes CSS supplémentaires pour le lien (optionnel)
 * @property {string} [activeClassName] - Classes CSS appliquées lorsque le lien est actif (optionnel, par défaut: classes de style actif)
 * @property {() => void} [onClick] - Fonction de rappel lors du clic sur le lien (optionnel)
 */
export interface ProtectedNavLinkProps {
  readonly href: string;
  readonly allowedRoles?: readonly UserRole[];
  readonly children: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly className?: string;
  readonly activeClassName?: string;
  readonly onClick?: () => void;
}

/**
 * Lien de navigation interactif filtré selon le rôle de l'utilisateur avec indicateur visuel de la route active.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {Readonly<ProtectedNavLinkProps>} props - Propriétés du composant
 * @returns {React.JSX.Element | null} Élément Link ou null si non autorisé
 */
export function ProtectedNavLink({
  href,
  allowedRoles,
  children,
  icon,
  className,
  activeClassName = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold shadow-xs',
  onClick,
}: Readonly<ProtectedNavLinkProps>): React.JSX.Element | null {
  const pathname = usePathname();
  const { canAccess, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!canAccess(allowedRoles as UserRole[])) {
    return null;
  }

  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        isActive
          ? activeClassName
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center transition-colors',
            isActive
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300',
          )}
        >
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </Link>
  );
}
