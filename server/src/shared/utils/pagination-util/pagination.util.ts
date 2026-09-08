import { PaginatedResult } from '../../interfaces/paginated-result.interface';
import { PaginationQueryDto } from '../../dto/pagination-query-dto/pagination-query.dto';

/**
 * Paramètres de pagination résolus pour les requêtes de base de données (Prisma/SQL).
 */
export interface ResolvedPaginationParams {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

/**
 * Utilitaire de gestion et de calcul de la pagination.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export class PaginationUtil {
  /**
   * Calcule le nombre total de pages à partir du nombre total d'éléments et de la limite par page.
   *
   * @param {number} total - Nombre total d'éléments
   * @param {number} limit - Nombre d'éléments par page
   * @returns {number} Le nombre total de pages (au minimum 0)
   */
  static calculateTotalPages(total: number, limit: number): number {
    if (total <= 0 || limit <= 0) {
      return 0;
    }
    return Math.ceil(total / limit);
  }

  /**
   * Calcule les paramètres de pagination (skip, take, page, limit) à partir d'un DTO de requête.
   *
   * @param {Partial<PaginationQueryDto>} [query] - Paramètres de pagination
   * @param {number} [defaultPage=1] - Numéro de page par défaut
   * @param {number} [defaultLimit=20] - Limite par défaut
   * @returns {ResolvedPaginationParams} Les paramètres de pagination résolus
   */
  static getPaginationParams(
    query?: Partial<PaginationQueryDto>,
    defaultPage = 1,
    defaultLimit = 20,
  ): ResolvedPaginationParams {
    const page = Math.max(1, query?.page ?? defaultPage);
    const limit = Math.max(1, Math.min(100, query?.limit ?? defaultLimit));
    const skip = (page - 1) * limit;

    return {
      skip,
      take: limit,
      page,
      limit,
    };
  }

  /**
   * Construit une réponse paginée standardisée conforme au contrat PaginatedResult<T>.
   *
   * @template T - Type des éléments de la collection
   * @param {T[]} data - Éléments de la page courante
   * @param {number} total - Nombre total d'enregistrements
   * @param {number} page - Numéro de la page courante
   * @param {number} limit - Taille de la page
   * @returns {PaginatedResult<T>} L'objet de résultat paginé
   */
  static createPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    const safeTotal = Math.max(0, total);
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);

    return {
      data,
      total: safeTotal,
      page: safePage,
      limit: safeLimit,
      totalPages: PaginationUtil.calculateTotalPages(safeTotal, safeLimit),
    };
  }
}
