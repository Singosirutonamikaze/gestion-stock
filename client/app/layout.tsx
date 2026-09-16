import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '../features/auth/context/auth-context';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StockFlow — Gestion de Stock & Inventaire',
  description:
    'Solution complète de gestion des stocks, mouvements, entrepôts, commandes et rapports d’activité.',
};

/**
 * Layout racine de l'application Next.js.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {Readonly<{ children: React.ReactNode }>} props - Propriétés du layout
 * @returns {React.JSX.Element} Layout racine avec polices et fournisseur d'authentification
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
