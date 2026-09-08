import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config-module/config.module';
import { PrismaService } from '../prisma-service/prisma.service';
import { RedisService } from '../redis-service/redis.service';

/**
 * Module global fournissant la connexion Prisma PostgreSQL et le client Redis.
 *
 * @author SINGO Yao Dieu Donnée
 * @since 0.0.1
 * @public
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class DatabaseModule {}
