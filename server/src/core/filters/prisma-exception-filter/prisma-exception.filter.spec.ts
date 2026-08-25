import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

const buildException = (
  code: string,
  meta?: Record<string, unknown>,
): Prisma.PrismaClientKnownRequestError => {
  return new Prisma.PrismaClientKnownRequestError('erreur prisma', {
    code,
    clientVersion: '5.0.0',
    meta,
  });
};

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = { url: '/api/products' };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;
  });

  it('doit etre instancie', () => {
    expect(filter).toBeDefined();
  });

  it('doit renvoyer 409 pour une erreur P2002 (contrainte unique)', () => {
    const exception = buildException('P2002', { target: ['email'] });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it('doit renvoyer 404 pour une erreur P2025 (ressource introuvable)', () => {
    const exception = buildException('P2025');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('doit renvoyer 500 pour un code Prisma inconnu', () => {
    const exception = buildException('P9999');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('doit inclure le champ error "Conflict" pour P2002', () => {
    const exception = buildException('P2002', { target: ['sku'] });

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.error).toBe('Conflict');
  });

  it('doit inclure le champ error "Not Found" pour P2025', () => {
    const exception = buildException('P2025');

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.error).toBe('Not Found');
  });

  it('doit inclure le champ error "Database Error" pour un code inconnu', () => {
    const exception = buildException('P0001');

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.error).toBe('Database Error');
  });

  it('doit inclure le champ timestamp dans la reponse', () => {
    const exception = buildException('P2002', { target: ['name'] });

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(typeof body.timestamp).toBe('string');
  });

  it('doit inclure le champ path dans la reponse', () => {
    const exception = buildException('P2025');

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.path).toBe('/api/products');
  });

  it('doit mentionner les champs cibles dans le message P2002', () => {
    const exception = buildException('P2002', {
      target: ['email', 'username'],
    });

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.message as string).toContain('email');
    expect(body.message as string).toContain('username');
  });

  it('doit renvoyer le statusCode correct dans le corps JSON', () => {
    const exception = buildException('P2002', { target: ['sku'] });

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.statusCode).toBe(HttpStatus.CONFLICT);
  });

  it('doit appeler json une seule fois', () => {
    const exception = buildException('P2025');

    filter.catch(exception, mockHost);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});
