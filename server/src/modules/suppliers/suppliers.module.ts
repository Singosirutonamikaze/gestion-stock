import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database-module';
import { SuppliersController } from './controllers/suppliers-controller';
import { SuppliersService } from './services/suppliers-service';
import { SuppliersRepository } from './repositories/suppliers-repository';

/**
 * Module de gestion des fournisseurs du catalogue.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Module({
  imports: [DatabaseModule],
  controllers: [SuppliersController],
  providers: [SuppliersService, SuppliersRepository],
  exports: [SuppliersService, SuppliersRepository],
})
export class SuppliersModule {}
