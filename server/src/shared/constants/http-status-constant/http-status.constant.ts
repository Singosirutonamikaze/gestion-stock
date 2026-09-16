/**
 * Constantes des codes de statut HTTP utilisés dans les réponses API.
 * Centralise tous les codes pour éviter les magic numbers dans les contrôleurs.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export const HTTP_STATUS = Object.freeze({
  // ─── 2xx Succès ────────────────────────────────────────────────────────────
  /** Requête traitée avec succès */
  OK: 200,
  /** Ressource créée avec succès */
  CREATED: 201,
  /** Requête acceptée, traitement en cours */
  ACCEPTED: 202,
  /** Succès sans contenu retourné */
  NO_CONTENT: 204,

  // ─── 3xx Redirections ──────────────────────────────────────────────────────
  /** Ressource déplacée définitivement */
  MOVED_PERMANENTLY: 301,
  /** Redirection temporaire */
  FOUND: 302,
  /** Voir autre ressource */
  SEE_OTHER: 303,
  /** Ressource non modifiée (cache) */
  NOT_MODIFIED: 304,

  // ─── 4xx Erreurs client ────────────────────────────────────────────────────
  /** Requête malformée ou invalide */
  BAD_REQUEST: 400,
  /** Authentification requise */
  UNAUTHORIZED: 401,
  /** Accès refusé malgré authentification */
  FORBIDDEN: 403,
  /** Ressource introuvable */
  NOT_FOUND: 404,
  /** Méthode HTTP non autorisée */
  METHOD_NOT_ALLOWED: 405,
  /** Ressource déjà existante (doublon) */
  CONFLICT: 409,
  /** Ressource supprimée définitivement */
  GONE: 410,
  /** Corps de requête trop grand */
  PAYLOAD_TOO_LARGE: 413,
  /** Type de média non supporté */
  UNSUPPORTED_MEDIA_TYPE: 415,
  /** Données sémantiquement invalides (validation) */
  UNPROCESSABLE_ENTITY: 422,
  /** Trop de requêtes (rate limiting) */
  TOO_MANY_REQUESTS: 429,

  // ─── 5xx Erreurs serveur ───────────────────────────────────────────────────
  /** Erreur interne du serveur */
  INTERNAL_SERVER_ERROR: 500,
  /** Fonctionnalité non implémentée */
  NOT_IMPLEMENTED: 501,
  /** Service temporairement indisponible */
  SERVICE_UNAVAILABLE: 503,
  /** Délai d'attente dépassé (gateway) */
  GATEWAY_TIMEOUT: 504,
} as const);

export type HttpStatusType = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/**
 * Messages de réponse API standardisés associés aux codes HTTP.
 *
 * @readonly
 */
export const HTTP_MESSAGE = Object.freeze({
  OK: 'Opération réalisée avec succès',
  CREATED: 'Ressource créée avec succès',
  NO_CONTENT: 'Suppression effectuée avec succès',
  BAD_REQUEST: 'Requête invalide — vérifiez les paramètres envoyés',
  UNAUTHORIZED: 'Authentification requise — jeton JWT manquant ou invalide',
  FORBIDDEN: 'Accès refusé — permissions insuffisantes',
  NOT_FOUND: 'Ressource introuvable',
  CONFLICT: 'Conflit — la ressource existe déjà',
  UNPROCESSABLE_ENTITY: 'Données invalides — échec de la validation',
  TOO_MANY_REQUESTS: 'Trop de requêtes — réessayez dans quelques instants',
  INTERNAL_SERVER_ERROR: 'Erreur interne du serveur',
} as const);
