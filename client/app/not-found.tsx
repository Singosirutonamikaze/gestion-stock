import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

/**
 * Page d'erreur 404 personnalisée.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @returns {React.JSX.Element} Page 404
 */
export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-zinc-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
        <FileQuestion className="h-8 w-8" />
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Page introuvable (404)
      </h1>

      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
        La ressource ou la page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>
      </div>
    </div>
  );
}
