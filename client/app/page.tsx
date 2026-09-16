'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../features/auth/context/auth-context';
import { getDefaultDashboardPath } from '../lib/auth/permissions';

/**
 * Page racine redirigeant l'utilisateur vers son tableau de bord dédié ou vers la page de connexion.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @returns {React.JSX.Element} Vue de redirection avec spinner
 */
export default function HomePage(): React.JSX.Element {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        router.replace(getDefaultDashboardPath(user.role));
      } else {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <span className="text-xs font-medium text-zinc-500">Redirection en cours...</span>
      </div>
    </div>
  );
}
