import React from 'react';

/**
 * Layout dédié aux routes publiques d'authentification (connexion, mot de passe oublié).
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {Readonly<{ children: React.ReactNode }>} props - Propriétés du layout auth
 * @returns {React.JSX.Element} Layout centré
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
