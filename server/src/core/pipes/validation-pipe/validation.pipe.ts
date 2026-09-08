import {
  ArgumentMetadata,
  Injectable,
  ValidationPipe as NestValidationPipe,
  type ValidationPipeOptions,
} from '@nestjs/common';

/**
 * Pipe global de validation et de transformation des données d'entrée (DTOs).
 *
 * Configure par défaut :
 * - `whitelist: true` : élimine automatiquement les propriétés non déclarées dans le DTO (anti-pollution de payload)
 * - `forbidNonWhitelisted: true` : rejette la requête si des propriétés non autorisées sont envoyées
 * - `transform: true` : convertit automatiquement les payloads en instances de classes DTO
 * - `transformOptions.enableImplicitConversion: false` : empêche les conversions implicites non sécurisées
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class AppValidationPipe extends NestValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
      ...options,
    });
  }

  override async transform<T = Record<string, unknown>>(
    value: T,
    metadata: ArgumentMetadata,
  ): Promise<T> {
    return (await super.transform(value, metadata)) as T;
  }
}
