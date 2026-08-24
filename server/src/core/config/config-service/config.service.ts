import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

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
    if (url) return url;
    return `postgresql://${this.dbUser}:${this.dbPassword}@${this.dbHost}:${this.dbPort}/${this.dbName}?schema=${this.dbSchema}`;
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'secretKey');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '1d');
  }
}
