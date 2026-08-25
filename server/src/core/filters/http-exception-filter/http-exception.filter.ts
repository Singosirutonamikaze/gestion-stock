import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtre global d'exception HTTP.
 * Normalise les réponses d'erreur et neutralise les attaques XSS sur les URLs/messages.
 */
@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  /**
   * Échappe les caractères HTML dangereux pour prévenir les attaques XSS réfléchies.
   *
   * @param {string} str - La chaîne de caractères à assainir
   * @returns {string} La chaîne assainie
   */
  private sanitizeString(str: string): string {
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#x27;')
      .replaceAll('/', '&#x2F;');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const httpException = isHttp ? exception : null;

    const status =
      httpException?.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = httpException?.getResponse() ?? null;

    const resObj =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)
        : {};

    const rawMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((resObj.message as string | string[]) ??
          'Une erreur interne est survenue');

    const message = Array.isArray(rawMessage)
      ? rawMessage.map((m) => this.sanitizeString(String(m)))
      : this.sanitizeString(String(rawMessage));

    const error = this.sanitizeString(
      (resObj.error as string) ?? 'Internal Server Error',
    );
    const sanitizedPath = this.sanitizeString(request.url);

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: sanitizedPath,
    });
  }
}
