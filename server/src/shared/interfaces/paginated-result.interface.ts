/**
 * Interface générique décrivant le contrat d'une réponse paginée standardisée dans toute l'application.
 * Fournit à la fois la liste des éléments de la page courante et les métadonnées de pagination.
 *
 * @template T - Le type des éléments contenus dans le tableau de données retourné
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface PaginatedResult<T> {
  /**
   * Tableau des enregistrements ou entités retournés pour la page courante.
   */
  data: T[];

  /**
   * Nombre total d'enregistrements correspondant aux filtres donnés dans la base de données.
   */
  total: number;

  /**
   * Index de la page courante (1-indexed).
   */
  page: number;

  /**
   * Nombre maximal d'éléments retournés par page (taille du lot).
   */
  limit: number;

  /**
   * Nombre total de pages calculé (égal à Math.ceil(total / limit)).
   */
  totalPages: number;
}
