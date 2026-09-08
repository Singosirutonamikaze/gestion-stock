import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database-module';
import { ProductsController } from './controllers/products-controller';
import { ProductsService } from './services/products-service';
import { ProductsRepository } from './repositories/products-repository';

/**
 * Module de gestion du catalogue de produits.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
