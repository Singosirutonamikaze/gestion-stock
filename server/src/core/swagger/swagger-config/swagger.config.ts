import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { AppConfigService } from '../../config/config-service/config.service';

export function setupSwagger(
  app: INestApplication,
  configService?: AppConfigService,
): void {
  const swaggerUser: string | undefined = configService?.swaggerUser;
  const swaggerPassword: string | undefined = configService?.swaggerPassword;
  const title: string = configService?.swaggerTitle ?? 'API Gestion de Stock';
  const description: string =
    configService?.swaggerDescription ??
    'Documentation officielle de API REST de Gestion de Stock';
  const version: string = configService?.swaggerVersion ?? '0.0.1';

  app.use(cookieParser());

  const httpAdapter = app.getHttpAdapter();

  // Servir les images statiques et le CSS du dossier public principal et du sous-module swagger
  const publicPath = path.join(process.cwd(), 'public');
  const swaggerPublicPath = path.join(__dirname, '../public');

  httpAdapter.use('/public', express.static(publicPath));
  httpAdapter.use('/public', express.static(swaggerPublicPath));

  if (swaggerUser && swaggerPassword) {
    // Middleware d'authentification pour sécuriser /api et /api-json
    httpAdapter.use(
      '/api',
      (req: Request, res: Response, next: NextFunction) => {
        const authCookie = req.cookies?.swagger_auth as string | undefined;
        const expectedToken = Buffer.from(
          `${swaggerUser}:${swaggerPassword}`,
        ).toString('base64');

        const authHeader = req.headers.authorization;
        const isBasicAuthOk = authHeader === `Basic ${expectedToken}`;
        const isCookieOk = authCookie === expectedToken;

        if (isBasicAuthOk || isCookieOk) {
          return next();
        }

        return res.redirect('/swagger-login');
      },
    );

    // Route GET pour afficher la page de connexion à partir de swagger/pages/swagger-login.html
    httpAdapter.get('/swagger-login', (req: Request, res: Response) => {
      const errorMsg = req.query.error ? 'Email ou mot de passe incorrect' : '';

      let htmlPath = path.join(__dirname, '../pages/swagger-login.html');
      if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(
          process.cwd(),
          'src/core/swagger/pages/swagger-login.html',
        );
      }

      let htmlContent = fs.readFileSync(htmlPath, 'utf8');

      const errorHtml = errorMsg
        ? `<div class="alert-error">${errorMsg}</div>`
        : '';
      htmlContent = htmlContent.replace('{{ERROR_ALERT}}', errorHtml);

      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    });

    // Route POST pour traiter la connexion
    httpAdapter.post('/swagger-login', (req: Request, res: Response) => {
      const { username, password } =
        (req.body as { username?: string; password?: string }) || {};

      if (username === swaggerUser && password === swaggerPassword) {
        const expectedToken = Buffer.from(
          `${swaggerUser}:${swaggerPassword}`,
        ).toString('base64');
        res.cookie('swagger_auth', expectedToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
          path: '/',
        });
        return res.redirect('/api');
      }

      return res.redirect('/swagger-login?error=1');
    });
  }

  // Redirection automatique de la racine / vers /api
  httpAdapter.get('/', (_req: Request, res: Response) => {
    res.redirect('/api');
  });

  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrer le jeton JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
