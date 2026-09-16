'use client';

import React from 'react';
import { Menu, LogOut, Bell, Shield } from 'lucide-react';
import { useAuth } from '../../../features/auth/context/auth-context';

/**
 * Propriétés du composant Topbar.
 * 
 * @interface TopbarProps
 * @property {() => void} [onMenuToggle] - Fonction de rappel pour basculer l'état du menu (optionnel)
 */
export interface TopbarProps {
  readonly onMenuToggle?: () => void;
}

/**
 * Barre supérieure affichant les informations utilisateur, le rôle et le bouton de déconnexion.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {Readonly<TopbarProps>} props - Propriétés du composant
 * @returns {React.JSX.Element} Barre supérieure
 */
export function Topbar({
  onMenuToggle,
}: Readonly<TopbarProps>): React.JSX.Element {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/95 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden"
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Système opérationnel</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user?.role && (
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Shield className="h-3.5 w-3.5" />
            <span>{user.role}</span>
          </div>
        )}

        <button
          type="button"
          className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          aria-label="Notifications système"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-[10px] text-zinc-400">{user.email}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60"
              title="Se déconnecter"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
