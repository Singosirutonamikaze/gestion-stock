import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { JwtPayload } from '../types/jwt-payload.type';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockTokenPair = {
    accessToken: 'access_token_mock',
    refreshToken: 'refresh_token_mock',
    expiresIn: 900,
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      logoutAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('doit appeler authService.login et retourner les tokens', async () => {
      service.login.mockResolvedValue(mockTokenPair);

      const loginDto = { email: 'test@example.com', password: 'Password123!' };
      const req = { ip: '127.0.0.1', headers: { 'user-agent': 'Jest' } } as unknown as Request;

      const result = await controller.login(loginDto, req);

      expect(result).toEqual(mockTokenPair);
      expect(service.login).toHaveBeenCalledWith(loginDto, {
        ipAddress: '127.0.0.1',
        userAgent: 'Jest',
      });
    });
  });

  describe('register', () => {
    it('doit appeler authService.register et retourner les tokens', async () => {
      service.register.mockResolvedValue(mockTokenPair);

      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Jean',
        lastName: 'Dupont',
      };

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockTokenPair);
      expect(service.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('refresh', () => {
    it('doit appeler authService.refresh avec le token fourni', async () => {
      service.refresh.mockResolvedValue(mockTokenPair);

      const dto = { refreshToken: 'refresh_token_mock' };
      const result = await controller.refresh(dto);

      expect(result).toEqual(mockTokenPair);
      expect(service.refresh).toHaveBeenCalledWith('refresh_token_mock');
    });
  });

  describe('logout', () => {
    it('doit appeler authService.logout avec sub et le refreshToken', async () => {
      service.logout.mockResolvedValue();

      const user: JwtPayload = { sub: 'usr-123', email: 'test@example.com', role: UserRole.ADMINISTRATOR };
      const dto = { refreshToken: 'refresh_token_mock' };
      const req = { headers: { authorization: 'Bearer access_token_mock' } } as unknown as Request;

      const result = await controller.logout(user, dto, req);

      expect(result).toEqual({ message: 'Déconnexion réussie' });
      expect(service.logout).toHaveBeenCalledWith('usr-123', 'refresh_token_mock', 'access_token_mock');
    });
  });

  describe('logoutAll', () => {
    it('doit appeler authService.logoutAll avec l\'id de l\'utilisateur', async () => {
      service.logoutAll.mockResolvedValue();

      const user: JwtPayload = { sub: 'usr-123', email: 'test@example.com', role: UserRole.ADMINISTRATOR };

      const result = await controller.logoutAll(user);

      expect(result).toEqual({ message: 'Toutes les sessions ont été révoquées' });
      expect(service.logoutAll).toHaveBeenCalledWith('usr-123');
    });
  });
});
