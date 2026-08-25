import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  it('doit consigner un message log/info sans erreur', () => {
    expect(() => service.log('Test message', 'TestContext')).not.toThrow();
  });

  it('doit consigner une erreur avec trace', () => {
    expect(() =>
      service.error('Test error', 'Error: Stack trace', 'TestContext'),
    ).not.toThrow();
  });

  it('doit consigner un avertissement (warn)', () => {
    expect(() => service.warn('Test warning', 'TestContext')).not.toThrow();
  });

  it('doit consigner un message de debug', () => {
    expect(() => service.debug('Test debug', 'TestContext')).not.toThrow();
  });

  it('doit consigner un message verbose', () => {
    expect(() => service.verbose('Test verbose', 'TestContext')).not.toThrow();
  });

  it('doit consigner un message fatal', () => {
    expect(() =>
      service.fatal('Test fatal', 'Error: fatal trace', 'TestContext'),
    ).not.toThrow();
  });
});
