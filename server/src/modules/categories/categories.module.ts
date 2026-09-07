import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database-module';
import { CategoriesController } from './controllers/categories-controller';
import { CategoriesService } from './services/categories-service';
import { CategoriesRepository } from './repositories/categories-repository';

/**
 * Module de gestion des catégories du catalogue de produits.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
