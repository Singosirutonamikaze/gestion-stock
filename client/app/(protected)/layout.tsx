'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components/layout/sidebar/sidebar';
import { Topbar } from '../../components/layout/topbar/topbar';
import { useAuth } from '../../features/auth/context/auth-context';

/**
 * Layout principal des routes protégées de l'application.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {Readonly<{ children: React.ReactNode }>} props - Propriétés du layout protégé
 * @returns {React.JSX.Element | null} Layout avec Sidebar et Topbar
 */
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element | null {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <span className="text-xs font-medium text-zinc-500">Chargement de la session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
