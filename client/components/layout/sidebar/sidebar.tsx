'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Warehouse,
  ArrowLeftRight,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  FolderTree,
  Building2,
  X,
  Layers,
} from 'lucide-react';
import { ProtectedNavLink } from '../protected-nav-link/protected-nav-link';
import { UserRole } from '../../../types/enums/enums';
import { useAuth } from '../../../features/auth/context/auth-context';
import { getDefaultDashboardPath } from '../../../lib/auth/permissions';

/**
 * Propriétés du composant Sidebar.
 * 
 * @interface SidebarProps
 * @property {boolean} [isOpen] - Indique si la barre latérale est ouverte (optionnel, par défaut: false)
 * @property {() => void} [onClose] - Fonction de rappel pour fermer la barre latérale (optionnel)
 */
export interface SidebarProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
}

/**
 * Barre latérale de navigation principale adaptative selon le rôle de l'utilisateur.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {Readonly<SidebarProps>} props - Propriétés du composant
 * @returns {React.JSX.Element} Composant de barre latérale
 */
export function Sidebar({
  isOpen = false,
  onClose,
}: Readonly<SidebarProps>): React.JSX.Element {
  const { user } = useAuth();
  const dashboardPath = getDefaultDashboardPath(user?.role);

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Fermer le menu latéral"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden cursor-default w-full h-full border-0 p-0"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
          <Link
            href={dashboardPath}
            className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base tracking-tight">StockFlow</span>
              <span className="text-[10px] font-medium text-zinc-400">
                GESTION DE STOCK
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
              aria-label="Fermer la barre latérale"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Vue générale
              </p>
              <nav className="mt-2 space-y-1">
                <ProtectedNavLink
                  href="/admin/dashboard"
                  allowedRoles={[UserRole.ADMINISTRATOR]}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Tableau de bord Admin
                </ProtectedNavLink>
                <ProtectedNavLink
                  href="/manager/dashboard"
                  allowedRoles={[UserRole.MANAGER]}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Tableau de bord Manager
                </ProtectedNavLink>
                <ProtectedNavLink
                  href="/stock-keeper/dashboard"
                  allowedRoles={[UserRole.STOCK_KEEPER]}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Tableau de bord Stock
                </ProtectedNavLink>
                <ProtectedNavLink
                  href="/sales/dashboard"
                  allowedRoles={[UserRole.SALES]}
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Tableau de bord Ventes
                </ProtectedNavLink>
              </nav>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Catalogue
              </p>
              <nav className="mt-2 space-y-1">
                <ProtectedNavLink
                  href="/admin/products"
                  allowedRoles={[
                    UserRole.ADMINISTRATOR,
                    UserRole.MANAGER,
                    UserRole.SALES,
                    UserRole.STOCK_KEEPER,
                  ]}
                  icon={<Package className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Produits
                </ProtectedNavLink>
                <ProtectedNavLink
                  href="/admin/categories"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.MANAGER]}
                  icon={<FolderTree className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Catégories
                </ProtectedNavLink>
                <ProtectedNavLink
                  href="/admin/suppliers"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.MANAGER]}
                  icon={<Building2 className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Fournisseurs
                </ProtectedNavLink>
              </nav>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Inventaire
              </p>
              <nav className="mt-2 space-y-1">
                <ProtectedNavLink
                  href="/admin/stock"
                  allowedRoles={[
                    UserRole.ADMINISTRATOR,
                    UserRole.MANAGER,
                    UserRole.STOCK_KEEPER,
                  ]}
                  icon={<Boxes className="h-4 w-4" />}
                  onClick={onClose}
                >
                  État des Stocks
                </ProtectedNavLink>
                <ProtectedNavLink
                  href="/admin/stock-movements"
                  allowedRoles={[
                    UserRole.ADMINISTRATOR,
                    UserRole.MANAGER,
                    UserRole.STOCK_KEEPER,
                  ]}
                  icon={<ArrowLeftRight className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Mouvements
                </ProtectedNavLink>
                <ProtectedNavLink
                  href="/admin/warehouses"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.MANAGER]}
                  icon={<Warehouse className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Entrepôts
                </ProtectedNavLink>
              </nav>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Gestion
              </p>
              <nav className="mt-2 space-y-1">
                <ProtectedNavLink
                  href="/admin/orders"
                  allowedRoles={[
                    UserRole.ADMINISTRATOR,
                    UserRole.MANAGER,
                    UserRole.SALES,
                    UserRole.STOCK_KEEPER,
                  ]}
                  icon={<ShoppingCart className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Commandes
                </ProtectedNavLink>
                <ProtectedNavLink
                  href="/admin/reports"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.MANAGER]}
                  icon={<BarChart3 className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Rapports & Statistiques
                </ProtectedNavLink>
              </nav>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Système
              </p>
              <nav className="mt-2 space-y-1">
                <ProtectedNavLink
                  href="/admin/users"
                  allowedRoles={[UserRole.ADMINISTRATOR]}
                  icon={<Users className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Utilisateurs
                </ProtectedNavLink>
                <ProtectedNavLink
                  href="/admin/settings"
                  allowedRoles={[UserRole.ADMINISTRATOR, UserRole.MANAGER]}
                  icon={<Settings className="h-4 w-4" />}
                  onClick={onClose}
                >
                  Paramètres
                </ProtectedNavLink>
              </nav>
            </div>
          </div>
        </div>

        {user && (
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {user.firstName} {user.lastName}
                </span>
                <span className="truncate text-[10px] text-zinc-400">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
