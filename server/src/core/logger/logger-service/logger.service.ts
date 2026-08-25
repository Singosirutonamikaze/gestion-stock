import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Service de journalisation centralisé haute performance basé sur Winston.
 * Fournit une sortie console lisible et colorée en développement,
 * et une rotation de fichiers journaliers structurés JSON en production.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  /**
   * Convertit de manière sécurisée une valeur inconnue en chaîne de caractères
   * sans provoquer d'erreur ESLint `no-base-to-string` ou SonarQube `S6551`.
   *
   * @param {unknown} value - Valeur brute à convertir
   * @returns {string} Chaîne sécurisée
   */
  private static safeString(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }
    if (value !== null && typeof value === 'object') {
      return JSON.stringify(value);
    }
    return '';
  }

  /**
   * Construit le format d'affichage pour la console (colorisé, horodaté et formaté).
   *
   * @returns {winston.Logform.Format} Format Winston pour la console
   */
  private static buildConsoleFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize({ all: true }),
      winston.format.printf((info) => {
        const timestamp = LoggerService.safeString(info.timestamp);
        const level = LoggerService.safeString(info.level);
        const message = LoggerService.safeString(info.message);
        const contextStr = LoggerService.safeString(info.context);
        const traceStr = LoggerService.safeString(info.trace);

        const context = contextStr ? ` [${contextStr}]` : '';
        const trace = traceStr ? `\n${traceStr}` : '';

        const metaKeys = Object.keys(info).filter(
          (k) =>
            !['timestamp', 'level', 'message', 'context', 'trace'].includes(k),
        );

        let metaStr = '';
        if (metaKeys.length > 0) {
          const metaObj: Record<string, unknown> = {};
          for (const key of metaKeys) {
            metaObj[key] = info[key];
          }
          metaStr = ` ${JSON.stringify(metaObj)}`;
        }

        return `[Nest] ${timestamp} ${level}${context}: ${message}${metaStr}${trace}`;
      }),
    );
  }

  /**
   * Construit le format JSON structuré pour les fichiers de logs.
   *
   * @returns {winston.Logform.Format} Format Winston JSON
   */
  private static buildFileFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.json(),
    );
  }

  /**
   * Crée le transport de rotation pour tous les logs applicatifs.
   * Arborescence hiérarchique générée : `logs/YYYY-Www/day-DD/app.log`
   * Exemple : `logs/2026-W35/day-25/app.log`
   *
   * @param {winston.Logform.Format} format - Format appliqué au fichier
   * @returns {DailyRotateFile} Transport Winston DailyRotateFile
   */
  private static buildDailyRotateTransport(
    format: winston.Logform.Format,
  ): DailyRotateFile {
    return new DailyRotateFile({
      filename: 'logs/%DATE%/app.log',
      datePattern: 'YYYY-[W]WW/[day-]DD',
      auditFile: 'logs/.audit/app-audit.json',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format,
    });
  }

  /**
   * Crée le transport de rotation dédié aux erreurs.
   * Arborescence hiérarchique générée : `logs/YYYY-Www/day-DD/error.log`
   * Exemple : `logs/2026-W35/day-25/error.log`
   *
   * @param {winston.Logform.Format} format - Format appliqué au fichier
   * @returns {DailyRotateFile} Transport Winston DailyRotateFile pour les erreurs
   */
  private static buildErrorRotateTransport(
    format: winston.Logform.Format,
  ): DailyRotateFile {
    return new DailyRotateFile({
      level: 'error',
      filename: 'logs/%DATE%/error.log',
      datePattern: 'YYYY-[W]WW/[day-]DD',
      auditFile: 'logs/.audit/error-audit.json',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format,
    });
  }

  constructor() {
    const consoleFormat = LoggerService.buildConsoleFormat();
    const fileFormat = LoggerService.buildFileFormat();

    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transports: [
        new winston.transports.Console({ format: consoleFormat }),
        LoggerService.buildDailyRotateTransport(fileFormat),
        LoggerService.buildErrorRotateTransport(fileFormat),
      ],
    });
  }

  /**
   * Journalise un message informatif standard (INFO).
   *
   * @param {string} message - Message à consigner
   * @param {string} [context] - Contexte d'exécution optionnel
   */
  log(message: string, context?: string): void {
    this.logger.info(message, { context: context ?? '' });
  }

  /**
   * Journalise une erreur applicative critique (ERROR).
   *
   * @param {string} message - Message d'erreur
   * @param {string} [trace] - Stack trace de l'erreur
   * @param {string} [context] - Contexte d'exécution
   */
  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context: context ?? '' });
  }

  /**
   * Journalise un avertissement applicatif (WARN).
   *
   * @param {string} message - Message d'avertissement
   * @param {string} [context] - Contexte d'exécution
   */
  warn(message: string, context?: string): void {
    this.logger.warn(message, { context: context ?? '' });
  }

  /**
   * Journalise un message de débogage (DEBUG).
   *
   * @param {string} message - Message de diagnostic
   * @param {string} [context] - Contexte d'exécution
   */
  debug(message: string, context?: string): void {
    this.logger.debug(message, { context: context ?? '' });
  }

  /**
   * Journalise un message verbeux de bas niveau (VERBOSE).
   *
   * @param {string} message - Message détaillé
   * @param {string} [context] - Contexte d'exécution
   */
  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context: context ?? '' });
  }

  /**
   * Journalise une erreur fatale entraînant l'arrêt de l'application (FATAL).
   *
   * @param {string} message - Message fatal
   * @param {string} [trace] - Trace de l'erreur
   * @param {string} [context] - Contexte
   */
  fatal(message: string, trace?: string, context?: string): void {
    this.logger.error(`[FATAL] ${message}`, { trace, context: context ?? '' });
  }
}
