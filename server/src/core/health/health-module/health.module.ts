import { Module } from '@nestjs/common';
import { HealthController } from '../health-controller/health.controller';

/**
 * Module dédié au contrôle de santé (health check) et à la surveillance du serveur.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
