/**
 * Paire de jetons JWT retournée lors d'une authentification réussie.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
