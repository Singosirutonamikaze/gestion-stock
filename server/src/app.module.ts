import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './core/config/config-module';
import { DatabaseModule } from './core/database/database-module';
import { HealthModule } from './core/health/health-module/health.module';
import { LoggerModule } from './core/logger/logger-module/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

/**
 * Module racine de l'application assemblant l'ensemble des modules core et fonctionnels.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // max 100 requêtes par IP par minute
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
