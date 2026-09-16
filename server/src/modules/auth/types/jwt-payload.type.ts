import { UserRole } from '../../../shared/enums/user-role-enum';

/**
 * Représente le payload décodé d'un JWT d'accès.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export type JwtPayload = {
  sub: string; // userId
  email: string;
  role: UserRole;
  sid?: string; // session id / token id (optionnel)
  iat?: number;
  exp?: number;
};
