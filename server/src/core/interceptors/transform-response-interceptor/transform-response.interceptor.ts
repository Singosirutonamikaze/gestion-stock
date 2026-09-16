import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Format standard de réponse encapsulée.
 */
export interface ResponseFormat<T> {
  success: boolean;
  data: T;
}

/**
 * Intercepteur global normalisant les réponses d'API au format `{ success: true, data: T }`.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  /**
   * Enveloppe la charge utile de réponse avec la structure standardisée `{ success: true, data }`.
   *
   * @param {ExecutionContext} context - Contexte d'exécution de la requête NestJS
   * @param {CallHandler} next - Gestionnaire d'appel du pipeline
   * @returns {Observable<ResponseFormat<T>>} Flux de réponse encapsulé
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        data,
      })),
    );
  }
}
