import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import boxen from 'boxen';
import gradient from 'gradient-string';
import helmet from 'helmet';
import pc from 'picocolors';
import { AppModule } from './app.module';
import { AppConfigService } from './core/config/config-service';
import { GlobalHttpExceptionFilter } from './core/filters/http-exception-filter/http-exception.filter';
import { PrismaExceptionFilter } from './core/filters/prisma-exception-filter/prisma-exception.filter';
import { LoggingInterceptor } from './core/interceptors/logging-interceptor/logging.interceptor';
import { ResponseTransformInterceptor } from './core/interceptors/transform-response-interceptor/transform-response.interceptor';
import { AppValidationPipe } from './core/pipes/validation-pipe/validation.pipe';
import { setupSwagger } from './core/swagger/swagger-config/swagger.config';
import { LoggerService } from './core/logger/logger-service/logger.service';

type EnvColorFn = (text: string) => string;

const ENV_COLORS: Record<string, EnvColorFn> = {
  PRODUCTION: pc.red,
  STAGING: pc.yellow,
};

/**
 * Affiche une bannière de démarrage stylée dans le terminal.
 */
function printStartupBanner(env: string, port: number, nodeVersion: string) {
  const title = gradient(['#fffff', '#fffff'])('GESTION DE STOCK API');
  const subtitle = pc.dim('v0.0.1');

  const envColor: EnvColorFn = ENV_COLORS[env] ?? pc.green;
  const url = `http://localhost:${port}`;

  const rows = [
    `${pc.bold(title)}  ${subtitle}`,
    '',
    `${pc.dim('Status'.padEnd(12))} ${pc.green('●')} ${pc.bold('Online')}`,
    `${pc.dim('Environment'.padEnd(12))} ${envColor(pc.bold(env))}`,
    `${pc.dim('URL'.padEnd(12))} ${pc.blue(url)}`,
    `${pc.dim('Database'.padEnd(12))} ${pc.cyan('PostgreSQL (Prisma 7)')}`,
    `${pc.dim('Node'.padEnd(12))} ${pc.cyan(nodeVersion)}`,
  ];

  const box = boxen(rows.join('\n'), {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    titleAlignment: 'center',
  });

  process.stdout.write('\n' + box + '\n');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Distribution des fichiers statiques téléversés (ex: /uploads/users/:id/profile/avatar.png)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const configService = app.get(AppConfigService);

  // Protections de sécurité HTTP avancées (Helmet HTTP Headers)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
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
  app.useGlobalPipes(new AppValidationPipe());

  // Documentation Swagger uniquement en mode développement
  if (configService.nodeEnv !== 'production') {
    setupSwagger(app, configService);
  }

  const port = configService.port;
  const env = configService.nodeEnv.toUpperCase();

  await app.listen(port);

  printStartupBanner(env, port, process.version);

  console.log(`\n✓ Server successfully started on port ${port}\n`);
}

void bootstrap();
