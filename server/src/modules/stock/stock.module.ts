import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database-module';
import { StockController } from './controllers/stock-controller';
import { StockService } from './services/stock-service';
import { StockRepository } from './repositories/stock-repository';

/**
 * Module de gestion et consultation des niveaux de stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  imports: [DatabaseModule],
  controllers: [StockController],
  providers: [StockService, StockRepository],
  exports: [StockService, StockRepository],
})
export class StockModule {}
