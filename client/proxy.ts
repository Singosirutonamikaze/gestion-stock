import { NextResponse } from 'next/server';

/**
 * Gestionnaire proxy de requêtes pour l'intégration de services backend.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 * @returns {NextResponse} Réponse HTTP Next.js suivante
 */
export function proxy(): NextResponse {
  return NextResponse.next();
}
