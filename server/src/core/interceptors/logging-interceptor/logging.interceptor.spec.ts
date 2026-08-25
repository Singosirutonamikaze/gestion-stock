import { ExecutionContext } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockContext: { switchToHttp: jest.Mock };
  let mockNext: { handle: jest.Mock };

  beforeEach(() => {
    interceptor = new LoggingInterceptor();

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest
          .fn()
          .mockReturnValue({ method: 'GET', url: '/health' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    };

    mockNext = {
      handle: jest.fn().mockReturnValue(of({ status: 'ok' })),
    };
  });

  it('doit etre instancie', () => {
    expect(interceptor).toBeDefined();
  });

  it('doit retourner un Observable', (done) => {
    const result = interceptor.intercept(
      mockContext as unknown as ExecutionContext,
      mockNext,
    );

    result.subscribe({
      next: (value) => {
        expect(value).toBeDefined();
        done();
      },
    });
  });

  it('doit appeler handle() sur le CallHandler', (done) => {
    const result = interceptor.intercept(
      mockContext as unknown as ExecutionContext,
      mockNext,
    );

    result.subscribe({
      complete: () => {
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });

  it('doit transmettre la valeur de la reponse originale sans la modifier', (done) => {
    const payload = { data: 'valeur test' };
    mockNext.handle = jest.fn().mockReturnValue(of(payload));

    const result = interceptor.intercept(
      mockContext as unknown as ExecutionContext,
      mockNext,
    );

    result.subscribe({
      next: (value) => {
        expect(value).toEqual(payload);
        done();
      },
    });
  });

  it('doit appeler switchToHttp pour acceder au contexte HTTP', (done) => {
    const result = interceptor.intercept(
      mockContext as unknown as ExecutionContext,
      mockNext,
    );

    result.subscribe({
      complete: () => {
        expect(mockContext.switchToHttp).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });

  it("doit consigner l'erreur si la requête échoue", (done) => {
    const error = new Error('Test error');
    mockNext.handle = jest.fn().mockReturnValue(throwError(() => error));

    const result = interceptor.intercept(
      mockContext as unknown as ExecutionContext,
      mockNext,
    );

    result.subscribe({
      error: (err) => {
        expect(err).toEqual(error);
        done();
      },
    });
  });
});
