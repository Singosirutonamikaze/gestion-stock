import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * Service centralisé pour le chargement et le typage strict des variables d'environnement.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get dbUser(): string {
    return this.configService.get<string>('DB_USER', 'postgres');
  }

  get dbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD', 'postgres');
  }

  get dbHost(): string {
    return this.configService.get<string>('DB_HOST', 'localhost');
  }

  get dbPort(): number {
    return this.configService.get<number>('DB_PORT', 5432);
  }

  get dbName(): string {
    return this.configService.get<string>('DB_NAME', 'gestion_stock');
  }

  get dbSchema(): string {
    return this.configService.get<string>('DB_SCHEMA', 'public');
  }

  get databaseUrl(): string {
    const url = this.configService.get<string>('DATABASE_URL');
    return url ?? `postgresql://${this.dbUser}:${this.dbPassword}@${this.dbHost}:${this.dbPort}/${this.dbName}?schema=${this.dbSchema}`;
  }

  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  get redisPassword(): string | undefined {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'secretKey');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '1d');
  }

  get jwtAccessExpiresIn(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', this.jwtExpiresIn || '15m');
  }

  get jwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET', 'refreshSecretKey');
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  get clientUrl(): string {
    return this.configService.get<string>('CLIENT_URL', 'http://localhost:3001');
  }

  get swaggerUser(): string | undefined {
    return this.configService.get<string>('SWAGGER_EMAIL') || this.configService.get<string>('SWAGGER_USER');
  }

  get swaggerPassword(): string | undefined {
    return this.configService.get<string>('SWAGGER_PASSWORD');
  }

  get swaggerTitle(): string {
    return this.configService.get<string>('SWAGGER_TITLE', 'API Gestion de Stock');
  }

  get swaggerDescription(): string {
    return this.configService.get<string>('SWAGGER_DESCRIPTION', 'Documentation officielle de API REST de Gestion de Stock');
  }

  get swaggerVersion(): string {
    return this.configService.get<string>('SWAGGER_VERSION', '1.0.0');
  }
}
