import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur de paramètre personnalisé permettant d'extraire l'utilisateur courant
 * (payload JWT décodé) depuis la requête HTTP NestJS.
 *
 * @param {string} [data] - Propriété spécifique de l'utilisateur à extraire (optionnel)
 * @param {ExecutionContext} ctx - Contexte d'exécution de la requête NestJS
 * @returns {any} L'objet utilisateur complet ou la valeur de la propriété demandée
 *
 * @example
 * // Dans un contrôleur :
 * getProfile(@CurrentUser() user: JwtPayload) { ... }
 * getEmail(@CurrentUser('email') email: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    const value = data ? user?.[data] : user;

    return value;
  },
);
