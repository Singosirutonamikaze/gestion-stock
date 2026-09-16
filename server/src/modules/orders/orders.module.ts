import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders-controller';
import { OrdersService } from './services/orders-service';
import { OrdersRepository } from './repositories/orders-repository';

/**
 * Module NestJS pour la gestion des commandes d'achat et de vente.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
