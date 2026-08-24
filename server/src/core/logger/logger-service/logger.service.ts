import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.json(),
    );

    // Transport par heure : format d'arborescence logs/YYYY-WW/YYYY-MM-DD/app-YYYY-MM-DD-HH.log
    const hourlyRotateTransport = new DailyRotateFile({
      filename: 'logs/%YYYY%-%GG%/day-%DD%/app-%YYYY%-%MM%-%DD%-%HH%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d', // Conserver 14 jours
    });

    // Transport d'erreurs separe par heure
    const hourlyErrorRotateTransport = new DailyRotateFile({
      level: 'error',
      filename: 'logs/%YYYY%-%GG%/day-%DD%/error-%YYYY%-%MM%-%DD%-%HH%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    });

    this.logger = winston.createLogger({
      format: logFormat,
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        hourlyRotateTransport,
        hourlyErrorRotateTransport,
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
