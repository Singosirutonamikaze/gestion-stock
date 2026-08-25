import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenPair } from '../types/token-pair.type';
import { RequestMeta } from '../../../shared/types/request-meta.type';

/**
 * Contrat d'interface du service d'authentification (`AuthService`).
 * Définit l'ensemble des cas d'utilisation liés à l'identification, l'enregistrement,
 * le rafraîchissement de jetons JWT et la déconnexion d'un utilisateur.
 *
 * @see AuthService
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export interface IAuthService {
  /**
   * Authentifie un utilisateur au moyen de son adresse email et de son mot de passe.
   * Génère et enregistre une session dans le magasin Redis.
   *
   * @param {LoginDto} dto - Les identifiants de connexion (email, mot de passe)
   * @param {RequestMeta} meta - Les métadonnées de la requête HTTP (IP, User-Agent)
   * @returns {Promise<TokenPair>} Une promesse résolue avec la paire de jetons JWT (access & refresh)
   * @throws {UnauthorizedException} Si l'email est inconnu, le mot de passe invalide ou le compte inactif
   * @async
   */
  login(dto: LoginDto, meta: RequestMeta): Promise<TokenPair>;

  /**
   * Enregistre un premier compte administrateur ou un nouvel utilisateur dans le système.
   * Hache le mot de passe de manière sécurisée et initialise la session.
   *
   * @param {RegisterDto} dto - Les données du formulaire d'inscription (email, password, firstName, lastName, role)
   * @returns {Promise<TokenPair>} La paire de jetons JWT immédiatement utilisable
   * @throws {ConflictException} Si l'adresse email renseignée est déjà attribuée à un compte actif
   * @async
   */
  register(dto: RegisterDto): Promise<TokenPair>;

  /**
   * Renouvelle la paire de jetons JWT à partir d'un jeton de rafraîchissement valide et non expiré.
   * Contrôle la validité du jeton transmis auprès du serveur Redis.
   *
   * @param {string} refreshToken - Le jeton de rafraîchissement JWT transmis par le client
   * @returns {Promise<TokenPair>} Une nouvelle paire de jetons d'accès et de rafraîchissement
   * @throws {UnauthorizedException} Si le jeton est altéré, expiré ou révoqué dans Redis
   * @async
   */
  refresh(refreshToken: string): Promise<TokenPair>;

  /**
   * Procède à la déconnexion de la session courante de l'utilisateur.
   * Supprime le jeton de rafraîchissement de Redis et inscrit le jeton d'accès courant dans la liste noire (blacklist).
   *
   * @param {string} userId - L'identifiant unique (UUID) de l'utilisateur qui se déconnecte
   * @param {string} [refreshToken] - Le jeton de rafraîchissement à supprimer
   * @param {string} [accessToken] - Le jeton d'accès à blacklister jusqu'à sa date naturelle d'expiration
   * @returns {Promise<void>}
   * @async
   */
  logout(userId: string, refreshToken?: string, accessToken?: string): Promise<void>;

  /**
   * Invalide l'intégralité des sessions actives de l'utilisateur sur tous ses appareils.
   * Utile en cas de réinitialisation de mot de passe ou de compromission de compte.
   *
   * @param {string} userId - L'identifiant unique (UUID) de l'utilisateur visé
   * @returns {Promise<void>}
   * @async
   */
  logoutAll(userId: string): Promise<void>;
}
