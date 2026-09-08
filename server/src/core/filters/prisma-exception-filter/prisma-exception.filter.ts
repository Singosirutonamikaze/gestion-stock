import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

type PrismaErrorMapping = {
  status: number;
  error: string;
  getMessage: (meta?: Record<string, unknown>) => string;
};

const DEFAULT_ERROR_MAPPING: PrismaErrorMapping = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  error: 'Database Error',
  getMessage: () => 'Erreur de base de donnees',
};

const PRISMA_ERROR_MAP: Record<string, PrismaErrorMapping> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    error: 'Conflict',
    getMessage: (meta) => {
      const target = (meta?.target as string[]) ?? [];
      return `Une ressource existe deja avec cette valeur unique (${target.join(', ')})`;
    },
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    error: 'Not Found',
    getMessage: () => 'La ressource demandee est introuvable',
  },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mapping = PRISMA_ERROR_MAP[exception.code] ?? DEFAULT_ERROR_MAPPING;
    const status = mapping.status;
    const message = mapping.getMessage(exception.meta);
    const error = mapping.error;

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
