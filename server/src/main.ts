import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import pc from 'picocolors';
import { AppModule } from './app.module';
import { AppConfigService } from './core/config/config-service';
import { LoggerService } from './core/logger/logger-service/logger.service';

async function bootstrap() {
  const logger = new Logger('Server');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const customLogger = app.get(LoggerService);
  app.useLogger(customLogger);

  const configService = app.get(AppConfigService);

  // Protections de Securite HTTP
  app.use(helmet());
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const port = configService.port;
  const env = configService.nodeEnv.toUpperCase();

  await app.listen(port);

  const border = pc.cyan(
    '┌──────────────────────────────────────────────────────────┐',
  );
  const bottomBorder = pc.cyan(
    '└──────────────────────────────────────────────────────────┘',
  );

  console.log('');
  console.log(border);
  console.log(
    pc.cyan('│') +
      pc.bold(pc.white('  GESTION DE STOCK API ')) +
      pc.dim(`v0.0.1`) +
      ' '.repeat(30) +
      pc.cyan('│'),
  );
  console.log(
    pc.cyan('├──────────────────────────────────────────────────────────┤'),
  );
  console.log(
    pc.cyan('│') +
      `  Status      : ` +
      pc.green(pc.bold('ONLINE')) +
      ' '.repeat(39) +
      pc.cyan('│'),
  );
  console.log(
    pc.cyan('│') +
      `  Environment : ` +
      pc.yellow(pc.bold(env)) +
      ' '.repeat(45 - env.length) +
      pc.cyan('│'),
  );
  console.log(
    pc.cyan('│') +
      `  URL         : ` +
      pc.blue(`http://localhost:${port}`) +
      ' '.repeat(33 - String(port).length) +
      pc.cyan('│'),
  );
  console.log(
    pc.cyan('│') +
      `  Database    : ` +
      pc.magenta('PostgreSQL (Prisma 7)') +
      ' '.repeat(24) +
      pc.cyan('│'),
  );
  console.log(bottomBorder);
  console.log('');

  logger.log(`Server successfully started on port ${port}`);
}

void bootstrap();
