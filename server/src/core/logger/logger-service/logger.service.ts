import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Service de journalisation centralisé utilisant Winston.
 * Fournit des logs formatés en console et rotation horaire en fichiers JSON.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  /**
   * Normalise une valeur brute (contexte ou trace) en chaîne de caractères sûre.
   * Les chaînes sont retournées telles quelles. Les objets sont sérialisés en JSON
   * plutôt que stringifiés nativement, pour éviter le rendu générique "[object Object]".
   *
   * @param value - Valeur brute à normaliser (peut être `null`, `undefined`, string, objet, etc.)
   * @returns Chaîne vide si `null`/`undefined`, sinon la représentation string.
   */
  private static normalizeValue(value: unknown): string {
    const handlers: Record<string, (v: unknown) => string> = {
      string: (v) => v as string,
      object: (v) => (v == null ? '' : JSON.stringify(v)),
    };
    return (handlers[typeof value] ?? String)(value);
  }

  /**
   * Normalise une valeur de contexte en chaîne de caractères sûre.
   *
   * @param context - Valeur brute du contexte (peut être `null`, `undefined`, objet, etc.)
   * @returns Chaîne vide si `null`/`undefined`, sinon la représentation string.
   */
  private static normalizeContext(context: unknown): string {
    return LoggerService.normalizeValue(context);
  }

  /**
   * Normalise une valeur de trace en chaîne de caractères sûre.
   *
   * @param trace - Valeur brute de la trace (peut être `null`, `undefined`, objet, etc.)
   * @returns Chaîne vide si `null`/`undefined`, sinon la représentation string.
   */
  private static normalizeTrace(trace: unknown): string {
    return LoggerService.normalizeValue(trace);
  }

  /**
   * Formate un objet de métadonnées pour l'affichage dans les logs.
   *
   * @param meta - Métadonnées additionnelles du log.
   * @returns Chaîne vide si aucune métadonnée, sinon JSON préfixé d'un espace.
   */
  private static formatMeta(meta: Record<string, unknown>): string {
    if (Object.keys(meta).length > 0) {
      return ` ${JSON.stringify(meta)}`;
    }
    return '';
  }

  /**
   * Formate la chaîne de contexte pour l'affichage dans les logs.
   *
   * @param ctxStr - Contexte déjà normalisé.
   * @returns Contexte entouré de crochets, ou chaîne vide si absent.
   */
  private static formatContext(ctxStr: string): string {
    if (ctxStr.length > 0) {
      return `[${ctxStr}]`;
    }
    return '';
  }

  /**
   * Construit le format d'affichage "pretty" utilisé pour la console.
   *
   * @returns Format Winston combinant timestamp, colorisation et mise en page personnalisée.
   */
  private static buildPrettyFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.simple(),
    );
  }

  /**
   * Construit le format JSON structuré utilisé pour l'écriture en fichier.
   *
   * @returns Format Winston combinant timestamp et sérialisation JSON.
   */
  private static buildFileFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.json(),
    );
  }

  /**
   * Crée le transport de rotation horaire pour les logs applicatifs généraux.
   *
   * Arborescence générée : `logs/YYYY-WW/day-DD/app-YYYY-MM-DD-HH.log`
   * Conservation : 14 jours.
   *
   * @param fileFormat - Format de sérialisation appliqué au fichier.
   * @returns Instance de transport `DailyRotateFile`.
   */
  private static buildHourlyRotateTransport(
    fileFormat: winston.Logform.Format,
  ): DailyRotateFile {
    return new DailyRotateFile({
      filename: 'logs/%YYYY%-%GG%/day-%DD%/app-%YYYY%-%MM%-%DD%-%HH%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    });
  }

  /**
   * Crée le transport de rotation horaire dédié aux logs d'erreur.
   *
   * Arborescence générée : `logs/YYYY-WW/day-DD/error-YYYY-MM-DD-HH.log`
   * Conservation : 30 jours.
   *
   * @param fileFormat - Format de sérialisation appliqué au fichier.
   * @returns Instance de transport `DailyRotateFile` filtré sur le niveau `error`.
   */
  private static buildHourlyErrorRotateTransport(
    fileFormat: winston.Logform.Format,
  ): DailyRotateFile {
    return new DailyRotateFile({
      level: 'error',
      filename: 'logs/%YYYY%-%GG%/day-%DD%/error-%YYYY%-%MM%-%DD%-%HH%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
    });
  }

  constructor() {
    const prettyFormat = LoggerService.buildPrettyFormat();
    const fileFormat = LoggerService.buildFileFormat();

    this.logger = winston.createLogger({
      transports: [
        new winston.transports.Console({ format: prettyFormat }),
        LoggerService.buildHourlyRotateTransport(fileFormat),
        LoggerService.buildHourlyErrorRotateTransport(fileFormat),
      ],
    });
  }

  /**
   * Journalise un message de niveau `info`.
   *
   * @param message - Message à journaliser.
   * @param context - Contexte optionnel (ex. nom du service/module).
   */
  log(message: string, context?: string): void {
    this.logger.info(message, { context: context ?? '' });
  }

  /**
   * Journalise un message de niveau `error`.
   *
   * @param message - Message d'erreur à journaliser.
   * @param trace - Stack trace optionnelle associée à l'erreur.
   * @param context - Contexte optionnel (ex. nom du service/module).
   */
  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context: context ?? '' });
  }

  /**
   * Journalise un message de niveau `warn`.
   *
   * @param message - Message d'avertissement à journaliser.
   * @param context - Contexte optionnel (ex. nom du service/module).
   */
  warn(message: string, context?: string): void {
    this.logger.warn(message, { context: context ?? '' });
  }

  /**
   * Journalise un message de niveau `debug`.
   *
   * @param message - Message de débogage à journaliser.
   * @param context - Contexte optionnel (ex. nom du service/module).
   */
  debug(message: string, context?: string): void {
    this.logger.debug(message, { context: context ?? '' });
  }

  /**
   * Journalise un message de niveau `verbose`.
   *
   * @param message - Message détaillé à journaliser.
   * @param context - Contexte optionnel (ex. nom du service/module).
   */
  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context: context ?? '' });
  }
}
