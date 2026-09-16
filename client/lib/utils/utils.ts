import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine et fusionne les classes CSS Tailwind sans conflits.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {...ClassValue[]} inputs - Liste de classes conditionnelles ou statiques
 * @returns {string} Chaîne de classes CSS optimisée
 */
export function cn(...inputs: readonly ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formate un montant numérique ou chaîne en devise locale formatée.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {number | string} amount - Montant brut à formater
 * @param {string} [currency='XOF'] - Code ISO de la devise
 * @returns {string} Montant formaté (ex: "12 500 XOF")
 */
export function formatCurrency(
  amount: number | string,
  currency = 'XOF',
): string {
  const numericAmount =
    typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(numericAmount)) {
    return `0 ${currency}`;
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency === 'XOF' ? 'XOF' : currency,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

/**
 * Formate une date ISO ou objet Date en chaîne lisible en français.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @param {string | Date | null} [dateStr] - Date source à formater
 * @param {boolean} [includeTime=false] - Indique s'il faut inclure l'heure
 * @returns {string} Date formatée ou tiret si absente
 */
export function formatDate(
  dateStr?: string | Date | null,
  includeTime = false,
): string {
  if (!dateStr) {
    return '-';
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  }).format(date);
}
