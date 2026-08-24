import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Garde d'authentification s'appuyant sur la stratégie JWT de Passport.
 * Vérifie l'authenticité et l'échéance du jeton d'accès transmis via le header `Authorization: Bearer <token>`.
 *
 * @see RolesGuard
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Valide la requête HTTP entrante pour s'assurer que le jeton JWT est présent et valide.
   *
   * @param {ExecutionContext} context - Contexte d'exécution de la requête NestJS
   * @returns {boolean | Promise<boolean> | import('rxjs').Observable<boolean>} True si le jeton est valide
   * @throws {UnauthorizedException} Si le jeton est manquant, invalide ou expiré
   *
   * @async
   * @author SINGO Yao Dieu Donnée
   * @since 0.0.1
   */
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
