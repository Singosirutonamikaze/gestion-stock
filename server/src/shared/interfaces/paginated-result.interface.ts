/**
 * Interface décrivant la structure d'une réponse paginée générique.
 *
 * @template T - Le type de chaque élément retourné dans la page
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
