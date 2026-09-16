import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports-controller';
import { ReportsService } from './services/reports-service';

/**
 * Module NestJS pour la génération et l'export des rapports décisionnels.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
