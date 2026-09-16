/**
 * Structure de données représentant une session utilisateur active.
 */
export type SessionData = {
  id: string;
  userId: string;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
};

/**
 * Payload nécessaire à la création d'une nouvelle session dans le magasin de stockage.
 */
export type CreateSessionInput = {
  userId: string;
  tokenHash: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
};

/**
 * Contrat d'interface décrivant les opérations sur les sessions d'authentification.
 * Permet d'isoler la logique de persistance des sessions (Redis, BDD ou mémoire) du service d'authentification.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface ISessionRepository {
  /**
   * Enregistre une nouvelle session d'authentification pour un utilisateur donné.
   *
   * @param {CreateSessionInput} data - Les métadonnées et paramètres de la session à créer
   * @returns {Promise<SessionData>} La session enregistrée
   * @async
   */
  create(data: CreateSessionInput): Promise<SessionData>;

  /**
   * Recherche une session active à partir du hash de son jeton de rafraîchissement.
   *
   * @param {string} hash - Le empreinte (hash bcrypt) du jeton de rafraîchissement
   * @returns {Promise<SessionData | null>} La session trouvée ou null si aucune correspondance
   * @async
   */
  findByHash(hash: string): Promise<SessionData | null>;

  /**
   * Marque une session spécifique comme révoquée (déconnexion de la session courante).
   *
   * @param {string} sessionId - Identifiant unique de la session
   * @returns {Promise<void>}
   * @async
   */
  revoke(sessionId: string): Promise<void>;

  /**
   * Révoque simultanément toutes les sessions enregistrées pour un utilisateur.
   *
   * @param {string} userId - Identifiant unique de l'utilisateur
   * @returns {Promise<void>}
   * @async
   */
  revokeAllForUser(userId: string): Promise<void>;

  /**
   * Liste l'ensemble des sessions non révoquées et non expirées associées à un utilisateur.
   *
   * @param {string} userId - Identifiant unique de l'utilisateur
   * @returns {Promise<SessionData[]>} La liste des sessions actuellement actives
   * @async
   */
  listActiveForUser(userId: string): Promise<SessionData[]>;
}
