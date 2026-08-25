import { Global, Module } from '@nestjs/common';
import { LoggerService } from '../logger-service/logger.service';

/**
 * Module global fournissant le service de journalisation (Winston logger).
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
