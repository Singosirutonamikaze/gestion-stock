import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import pc from 'picocolors';
import { AppModule } from './app.module';
import { AppConfigService } from './core/config/config-service';
import { GlobalHttpExceptionFilter } from './core/filters/http-exception-filter/http-exception.filter';
import { PrismaExceptionFilter } from './core/filters/prisma-exception-filter/prisma-exception.filter';
import { LoggingInterceptor } from './core/interceptors/logging-interceptor/logging.interceptor';
import { ResponseTransformInterceptor } from './core/interceptors/transform-response-interceptor/transform-response.interceptor';
import { LoggerService } from './core/logger/logger-service/logger.service';
import { setupSwagger } from './core/swagger/swagger-config/swagger.config';

async function bootstrap() {
  const logger = new Logger('Server');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const customLogger = app.get(LoggerService);
  app.useLogger(customLogger);

  const configService = app.get(AppConfigService);

  // Protections de Sécurité HTTP avancées (Helmet HTTP Headers)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Enregistrement des filtres d'exception globaux
  app.useGlobalFilters(
    new GlobalHttpExceptionFilter(),
    new PrismaExceptionFilter(),
  );

  // Enregistrement des intercepteurs globaux
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(),
  );

  // Pipe de validation global anti-pollution de prototype & nettoyage HTML/XSS
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // Documentation Swagger uniquement en mode developpement
  if (configService.nodeEnv !== 'production') {
    setupSwagger(app);
  }

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
