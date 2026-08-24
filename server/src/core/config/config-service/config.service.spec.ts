import { ConfigService as NestConfigService } from '@nestjs/config';
import { AppConfigService } from './config.service';

const buildMockConfigService = (values: Record<string, unknown>) => ({
  get: jest.fn((key: string, defaultValue?: unknown) =>
    key in values ? values[key] : defaultValue,
  ),
});

describe('AppConfigService', () => {
  let service: AppConfigService;
  let mockConfigService: ReturnType<typeof buildMockConfigService>;

  beforeEach(() => {
    mockConfigService = buildMockConfigService({
      NODE_ENV: 'test',
      PORT: 4000,
      DB_USER: 'admin',
      DB_PASSWORD: 'secret',
      DB_HOST: 'db-host',
      DB_PORT: 5433,
      DB_NAME: 'gestion_stock_test',
      DB_SCHEMA: 'public',
      DATABASE_URL: 'postgresql://admin:secret@db-host:5433/gestion_stock_test?schema=public',
      JWT_SECRET: 'super-jwt-secret',
      JWT_EXPIRES_IN: '2d',
    });

    service = new AppConfigService(mockConfigService as unknown as NestConfigService);
  });

  it('doit etre instancie', () => {
    expect(service).toBeDefined();
  });

  it('doit retourner nodeEnv', () => {
    expect(service.nodeEnv).toBe('test');
  });

  it('doit retourner port', () => {
    expect(service.port).toBe(4000);
  });

  it('doit retourner dbUser', () => {
    expect(service.dbUser).toBe('admin');
  });

  it('doit retourner dbPassword', () => {
    expect(service.dbPassword).toBe('secret');
  });

  it('doit retourner dbHost', () => {
    expect(service.dbHost).toBe('db-host');
  });

  it('doit retourner dbPort', () => {
    expect(service.dbPort).toBe(5433);
  });

  it('doit retourner dbName', () => {
    expect(service.dbName).toBe('gestion_stock_test');
  });

  it('doit retourner dbSchema', () => {
    expect(service.dbSchema).toBe('public');
  });

  it('doit retourner DATABASE_URL directement quand elle est definie', () => {
    expect(service.databaseUrl).toBe(
      'postgresql://admin:secret@db-host:5433/gestion_stock_test?schema=public',
    );
  });

  it('doit retourner jwtSecret', () => {
    expect(service.jwtSecret).toBe('super-jwt-secret');
  });

  it('doit retourner jwtExpiresIn', () => {
    expect(service.jwtExpiresIn).toBe('2d');
  });

  describe('valeurs par defaut', () => {
    let serviceDefaut: AppConfigService;

    beforeEach(() => {
      const mockDefaut = {
        get: jest.fn((_key: string, defaultValue?: unknown) => defaultValue),
      };

      serviceDefaut = new AppConfigService(mockDefaut as unknown as NestConfigService);
    });

    it('doit retourner "development" par defaut pour nodeEnv', () => {
      expect(serviceDefaut.nodeEnv).toBe('development');
    });

    it('doit retourner 3000 par defaut pour port', () => {
      expect(serviceDefaut.port).toBe(3000);
    });

    it('doit retourner "postgres" par defaut pour dbUser', () => {
      expect(serviceDefaut.dbUser).toBe('postgres');
    });

    it('doit retourner 5432 par defaut pour dbPort', () => {
      expect(serviceDefaut.dbPort).toBe(5432);
    });

    it('doit retourner "1d" par defaut pour jwtExpiresIn', () => {
      expect(serviceDefaut.jwtExpiresIn).toBe('1d');
    });
  });
});
