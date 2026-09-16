import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../../../src/modules/auth/controllers/auth.controller';
import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { JwtAuthGuard } from '../../../src/core/guards/jwt-auth-guard';
import { UserRole } from '../../../src/shared/enums/user-role-enum';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let authService: {
    login: jest.Mock;
    register: jest.Mock;
    refresh: jest.Mock;
    logout: jest.Mock;
    logoutAll: jest.Mock;
  };

  const mockUser = {
    id: 'a1b2c3d4-e5f6-4890-abcd-ef1234564890',
    email: 'admin@gestion-stock.ci',
    firstName: 'Admin',
    lastName: 'System',
    role: UserRole.ADMINISTRATOR,
    isActive: true,
  };

  const mockAuthResponse = {
    accessToken: 'mock-access-token-jwt',
    refreshToken: 'mock-refresh-token-uuid',
    expiresIn: 900,
    user: mockUser,
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      logoutAll: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => {
            getRequest: () => {
              headers: Record<string, string>;
              user?: unknown;
            };
          };
        }) => {
          const req = context.switchToHttp().getRequest();
          const authHeader = req.headers['authorization'];
          if (!authHeader?.startsWith('Bearer valid-token')) {
            throw new UnauthorizedException('Jeton JWT manquant ou invalide');
          }
          req.user = {
            sub: mockUser.id,
            email: mockUser.email,
            role: mockUser.role,
          };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('doit retourner 200 et les tokens si les identifiants sont valides', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@gestion-stock.ci',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'admin@gestion-stock.ci',
        password: 'Password123!',
      });
    });

    it('doit retourner 401 si les identifiants sont incorrects', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Identifiants incorrects'),
      );

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@gestion-stock.ci',
          password: 'WrongPassword!',
        })
        .expect(401);
    });

    it('doit retourner 400 si les données de formulaire sont invalides', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email-format',
          password: '',
        })
        .expect(400);
    });
  });

  describe('POST /auth/register', () => {
    it('doit retourner 201 lors de la création d’un compte', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newuser@gestion-stock.ci',
          password: 'Password123!',
          firstName: 'Jean',
          lastName: 'Kouassi',
        })
        .expect(201);

      expect(response.body).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalled();
    });

    it('doit retourner 409 si l’adresse email existe déjà', async () => {
      authService.register.mockRejectedValue(
        new ConflictException('Un utilisateur avec cet email existe déjà'),
      );

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@gestion-stock.ci',
          password: 'Password123!',
          firstName: 'Jean',
          lastName: 'Kouassi',
        })
        .expect(409);
    });
  });

  describe('POST /auth/refresh', () => {
    it('doit retourner 200 avec nouveaux tokens si le refresh token est valide', async () => {
      authService.refresh.mockResolvedValue(mockAuthResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'mock-refresh-token-uuid' })
        .expect(200);

      expect(response.body).toEqual(mockAuthResponse);
      expect(authService.refresh).toHaveBeenCalledWith(
        'mock-refresh-token-uuid',
      );
    });

    it('doit retourner 401 si le refresh token est révoqué ou expiré', async () => {
      authService.refresh.mockRejectedValue(
        new UnauthorizedException('Session expirée ou révoquée'),
      );

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('doit retourner 200 lors de la déconnexion avec token valide', async () => {
      authService.logout.mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .send({ refreshToken: 'mock-refresh-token-uuid' })
        .expect(200);

      expect(response.body).toEqual({ message: 'Déconnexion réussie' });
    });

    it('doit retourner 401 si la requête n’est pas authentifiée', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken: 'mock-refresh-token-uuid' })
        .expect(401);
    });
  });
});
