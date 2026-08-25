import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './http-exception.filter';

describe('GlobalHttpExceptionFilter', () => {
  let filter: GlobalHttpExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalHttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = { url: '/api/test' };

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

  it('doit renvoyer 404 pour une HttpException NotFoundException', () => {
    const exception = new HttpException(
      'Ressource introuvable',
      HttpStatus.NOT_FOUND,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('doit renvoyer 400 pour une HttpException BadRequestException', () => {
    const exception = new HttpException(
      'Requete invalide',
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('doit renvoyer 500 pour une erreur non-HTTP', () => {
    const exception = new Error('Erreur interne inattendue');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });

  it('doit inclure statusCode dans le corps de la reponse', () => {
    const exception = new HttpException(
      'Non autorise',
      HttpStatus.UNAUTHORIZED,
    );

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('doit inclure le timestamp dans le corps de la reponse', () => {
    const exception = new HttpException('Interdit', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(typeof body.timestamp).toBe('string');
  });

  it('doit inclure le path dans le corps de la reponse', () => {
    const exception = new HttpException('Non trouve', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.path).toBe('&#x2F;api&#x2F;test');
  });

  it('doit inclure le message dans le corps de la reponse pour une exception string', () => {
    const exception = new HttpException(
      'Message simple',
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.message).toBe('Message simple');
  });

  it('doit inclure le message depuis un objet reponse complexe', () => {
    const exception = new HttpException(
      { message: 'Champ requis manquant', error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.message).toBe('Champ requis manquant');
  });

  it('doit utiliser Internal Server Error comme erreur par defaut pour une erreur non-HTTP', () => {
    const exception = new Error('Crash inattendu');

    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.error).toBe('Internal Server Error');
  });

  it('doit appeler json une seule fois par appel a catch', () => {
    const exception = new HttpException('Test', HttpStatus.OK);

    filter.catch(exception, mockHost);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});
