/**
 * Interface générique définissant les opérations CRUD de base pour tous les repositories.
 * Permet de simuler un repository mock dans les tests unitaires.
 *
 * @template T - Type de l'entité
 * @template CreateData - Type des données de création
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface IBaseRepository<T, CreateData = Partial<T>> {
  findById(id: string): Promise<T | null>;
  create(data: CreateData): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  softDelete(id: string): Promise<void>;
}
