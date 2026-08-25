import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../../modules/auth/types/jwt-payload.type';

/**
 * Décorateur de paramètre personnalisé permettant d'extraire l'utilisateur courant
 * (payload JWT décodé) depuis la requête HTTP NestJS.
 *
 * @param {keyof JwtPayload} [data] - Propriété spécifique du payload à extraire (optionnel)
 * @param {ExecutionContext} ctx - Contexte d'exécution de la requête NestJS
 * @returns {JwtPayload | JwtPayload[keyof JwtPayload] | undefined} L'objet utilisateur complet ou la valeur demandée
 *
 * @example
 * // Dans un contrôleur :
 * getProfile(@CurrentUser() user: JwtPayload) { ... }
 * getEmail(@CurrentUser('email') email: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayload | undefined,
    ctx: ExecutionContext,
  ): JwtPayload | JwtPayload[keyof JwtPayload] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request?.user;

    if (!user) {
      return undefined;
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
