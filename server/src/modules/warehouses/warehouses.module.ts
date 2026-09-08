import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database-module';
import { WarehousesController } from './controllers/warehouses-controller';
import { WarehousesService } from './services/warehouses-service';
import { WarehousesRepository } from './repositories/warehouses-repository';

/**
 * Module de gestion des entrepôts du système de gestion de stock.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  imports: [DatabaseModule],
  controllers: [WarehousesController],
  providers: [WarehousesService, WarehousesRepository],
  exports: [WarehousesService, WarehousesRepository],
})
export class WarehousesModule {}
