import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AppConfigService } from '../../../core/config/config-service';
import { RedisService } from '../../../core/database/redis-service';
import { UserRole } from '../../../shared/enums/user-role-enum';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const mockConfigService = {
      jwtSecret: 'super-jwt-secret',
    };

    const mockRedisService = {
      isAccessTokenBlacklisted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AppConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    redisService = module.get(RedisService);
  });

  it('doit être défini', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const validPayload = {
      sub: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      email: 'user@example.com',
      role: UserRole.ADMINISTRATOR,
      sid: 'b1b2c3d4-e5f6-7890-abcd-ef1234567890',
    };

    it('doit retourner le payload validé si non blacklisté et conforme', async () => {
      redisService.isAccessTokenBlacklisted.mockResolvedValue(false);

      const req = {
        headers: {
          authorization: 'Bearer valid.jwt.token',
        },
      };

      const result = await strategy.validate(req, validPayload);

      expect(result).toEqual(validPayload);
      expect(redisService.isAccessTokenBlacklisted).toHaveBeenCalledWith('valid.jwt.token');
    });

    it('doit lever UnauthorizedException si le token est dans la blacklist Redis', async () => {
      redisService.isAccessTokenBlacklisted.mockResolvedValue(true);

      const req = {
        headers: {
          authorization: 'Bearer blacklisted.jwt.token',
        },
      };

      await expect(strategy.validate(req, validPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('doit lever UnauthorizedException si le payload ne respecte pas le schéma Zod', async () => {
      redisService.isAccessTokenBlacklisted.mockResolvedValue(false);

      const req = { headers: {} };
      const invalidPayload = { email: 'invalid-payload-without-sub' };

      await expect(strategy.validate(req, invalidPayload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
