import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database-module';
import { StockMovementsController } from './controllers/stock-movements-controller';
import { StockMovementsService } from './services/stock-movements-service';
import { StockMovementsRepository } from './repositories/stock-movements-repository';

/**
 * Module de gestion des mouvements de stock immuables.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  imports: [DatabaseModule],
  controllers: [StockMovementsController],
  providers: [StockMovementsService, StockMovementsRepository],
  exports: [StockMovementsService, StockMovementsRepository],
})
export class StockMovementsModule {}
