import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Décorateur Swagger personnalisé générant la documentation OpenAPI d'une réponse paginée.
 *
 * @template TModel - Classe du modèle ou DTO contenu dans la réponse
 * @param {TModel} model - Le constructeur de classe du modèle DTO
 * @returns {MethodDecorator} Décorateur composé Swagger
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Liste paginée récupérée avec succès',
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              total: { type: 'integer', example: 100 },
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              totalPages: { type: 'integer', example: 5 },
            },
          },
        },
      },
    }),
  );
};
