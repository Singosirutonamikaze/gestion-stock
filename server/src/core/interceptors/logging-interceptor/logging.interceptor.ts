import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Intercepteur global de journalisation des requêtes HTTP (méthode, URL, code HTTP et durée en ms).
 * Journalise les requêtes entrantes réussies ainsi que les erreurs avec leur latence.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  /**
   * Intercepte la requête entrante et mesure le temps d'exécution jusqu'à l'émission de la réponse.
   *
   * @param {ExecutionContext} context - Contexte d'exécution de la requête NestJS
   * @param {CallHandler} next - Gestionnaire d'appel du pipeline
   * @returns {Observable<unknown>} Flux de réponse
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const { method, originalUrl, url } = request;
    const path = originalUrl || url;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const delay = Date.now() - start;
          const statusCode = response.statusCode;
          this.logger.log(`${method} ${path} ${statusCode} - ${delay}ms`);
        },
        error: (error: unknown) => {
          const delay = Date.now() - start;
          const status =
            error instanceof HttpException
              ? error.getStatus()
              : HttpStatus.INTERNAL_SERVER_ERROR;
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `${method} ${path} ${status} - ${delay}ms - ${message}`,
          );
        },
      }),
    );
  }
}
