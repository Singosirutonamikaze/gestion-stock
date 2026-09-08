/**
 * Interface générique définissant le contrat d'accès aux données de base pour l'ensemble des repositories du système.
 * Permet d'uniformiser les opérations CRUD fondamentales et d'isoler la couche métier de l'implémentation de persistance.
 *
 * @template T - Type de l'entité métier ou du modèle de données manipulé (ex: User, Product, Category)
 * @template CreateData - Type des données nécessaires à la création de l'entité (par défaut Partial<T>)
 * @template UpdateData - Type des données de mise à jour partielle (par défaut Partial<T>)
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface IBaseRepository<
  T,
  CreateData = Partial<T>,
  UpdateData = Partial<T>,
> {
  /**
   * Recherche et extrait une entité unique à partir de son identifiant unique UUID.
   *
   * @param {string} id - L'identifiant unique (UUID v4) de l'entité recherchée
   * @returns {Promise<T | null>} L'entité trouvée ou null si aucune entité ne correspond à cet ID
   * @async
   */
  findById(id: string): Promise<T | null>;

  /**
   * Persiste une nouvelle entité dans le support de stockage (PostgreSQL via Prisma).
   *
   * @param {CreateData} data - Les données requises pour créer l'entité
   * @returns {Promise<T>} L'entité nouvellement créée et alimentée de ses métadonnées générées (ID, dates)
   * @async
   */
  create(data: CreateData): Promise<T>;

  /**
   * Met à jour partiellement une entité existante identifiée par son UUID.
   *
   * @param {string} id - L'identifiant unique (UUID) de l'entité à mettre à jour
   * @param {UpdateData} data - L'ensemble des champs modifiés à appliquer sur l'entité
   * @returns {Promise<T>} L'entité dans son état mis à jour
   * @async
   */
  update(id: string, data: UpdateData): Promise<T>;

  /**
   * Réalise une suppression douce (soft delete) d'une entité en basculant son état ou son fanion d'activité.
   * Ne supprime pas physiquement la ligne de la base de données.
   *
   * @param {string} id - L'identifiant unique (UUID) de l'entité à désactiver/supprimer temporairement
   * @returns {Promise<void>}
   * @async
   */
  softDelete(id: string): Promise<void>;
}
