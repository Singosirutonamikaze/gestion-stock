import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../../core/database/prisma-service';
import { RedisService } from '../../../core/database/redis-service';
import { AppConfigService } from '../../../core/config/config-service';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { User } from '@prisma/client';
import { JwtPayload } from '../types/jwt-payload.type';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 'usr-123',
    email: 'test@example.com',
    password: '$2b$12$hashedPassword',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: null,
    avatarUrl: null,
    role: UserRole.ADMINISTRATOR,
    department: null,
    jobTitle: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockRedis = {
      setRefreshToken: jest.fn(),
      isRefreshTokenValid: jest.fn(),
      revokeRefreshToken: jest.fn(),
      blacklistAccessToken: jest.fn(),
      revokeAllUserSessions: jest.fn(),
    };

    const mockJwt = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfig = {
      jwtSecret: 'secret',
      jwtAccessExpiresIn: '15m',
      jwtRefreshSecret: 'refreshSecret',
      jwtRefreshExpiresIn: '7d',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: JwtService, useValue: mockJwt },
        { provide: AppConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    redisService = module.get(RedisService);
    jwtService = module.get(JwtService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('doit retourner une paire de tokens lors d\'une connexion réussie', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.user.update as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jwtService.sign
        .mockReturnValueOnce('access_token_str')
        .mockReturnValueOnce('refresh_token_str');

      const meta = { ipAddress: '127.0.0.1', userAgent: 'Jest' };
      const dto = { email: 'test@example.com', password: 'Password123!' };

      const result = await service.login(dto, meta);

      expect(result).toEqual({
        accessToken: 'access_token_str',
        refreshToken: 'refresh_token_str',
        expiresIn: 900,
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });
      expect(redisService.setRefreshToken).toHaveBeenCalledWith(mockUser.id, 'refresh_token_str', 604800);
    });

    it('doit lever UnauthorizedException si l\'utilisateur n\'existe pas ou est inactif', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const meta = { ipAddress: '127.0.0.1', userAgent: 'Jest' };
      const dto = { email: 'unknown@example.com', password: 'Password123!' };

      await expect(service.login(dto, meta)).rejects.toThrow(UnauthorizedException);
    });

    it('doit lever UnauthorizedException si le mot de passe est incorrect', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const meta = { ipAddress: '127.0.0.1', userAgent: 'Jest' };
      const dto = { email: 'test@example.com', password: 'WrongPassword' };

      await expect(service.login(dto, meta)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('doit hacher le mot de passe, créer le compte et retourner les tokens', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$hashedPassword');

      jwtService.sign
        .mockReturnValueOnce('access_token_str')
        .mockReturnValueOnce('refresh_token_str');

      const dto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Jean',
        lastName: 'Dupont',
      };

      const result = await service.register(dto);

      expect(result).toEqual({
        accessToken: 'access_token_str',
        refreshToken: 'refresh_token_str',
        expiresIn: 900,
      });
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(redisService.setRefreshToken).toHaveBeenCalledWith(mockUser.id, 'refresh_token_str', 604800);
    });

    it('doit lever ConflictException si l\'email est déjà utilisé', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const dto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Jean',
        lastName: 'Dupont',
      };

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('refresh', () => {
    it('doit rafraîchir la paire de tokens si le refresh token est valide dans Redis', async () => {
      const payload: JwtPayload = { sub: 'usr-123', email: 'test@example.com', role: UserRole.ADMINISTRATOR };
      jwtService.verify.mockReturnValue(payload);
      redisService.isRefreshTokenValid.mockResolvedValue(true);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      jwtService.sign
        .mockReturnValueOnce('new_access_token')
        .mockReturnValueOnce('new_refresh_token');

      const result = await service.refresh('old_refresh_token');

      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        expiresIn: 900,
      });
      expect(redisService.revokeRefreshToken).toHaveBeenCalledWith('usr-123', 'old_refresh_token');
      expect(redisService.setRefreshToken).toHaveBeenCalledWith('usr-123', 'new_refresh_token', 604800);
    });

    it('doit lever UnauthorizedException si le token est expiré ou révoqué', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Expired');
      });

      await expect(service.refresh('invalid_token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('doit révoquer le refresh token et blacklister l\'access token s\'ils sont fournis', async () => {
      await service.logout('usr-123', 'refresh_token', 'access_token');

      expect(redisService.revokeRefreshToken).toHaveBeenCalledWith('usr-123', 'refresh_token');
      expect(redisService.blacklistAccessToken).toHaveBeenCalledWith('access_token', 900);
    });
  });

  describe('logoutAll', () => {
    it('doit révoquer toutes les sessions Redis de l\'utilisateur', async () => {
      await service.logoutAll('usr-123');

      expect(redisService.revokeAllUserSessions).toHaveBeenCalledWith('usr-123');
    });
  });
});
