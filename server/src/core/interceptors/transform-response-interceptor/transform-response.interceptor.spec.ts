import { ExecutionContext, CallHandler } from '@nestjs/common';
import { ResponseTransformInterceptor } from './transform-response.interceptor';
import { of } from 'rxjs';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor<unknown>;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();

    mockContext = {} as ExecutionContext;
  });

  it('doit etre instancie', () => {
    expect(interceptor).toBeDefined();
  });

  it('doit envelopper la reponse avec success: true', (done) => {
    const mockNext: CallHandler = {
      handle: jest.fn().mockReturnValue(of({ id: 1, name: 'Produit A' })),
    };

    interceptor.intercept(mockContext, mockNext).subscribe({
      next: (result) => {
        expect(result.success).toBe(true);
        done();
      },
    });
  });

  it('doit placer les donnees originales dans le champ data', (done) => {
    const payload = { id: 42, name: 'Entrepot B' };
    const mockNext: CallHandler = {
      handle: jest.fn().mockReturnValue(of(payload)),
    };

    interceptor.intercept(mockContext, mockNext).subscribe({
      next: (result) => {
        expect(result.data).toEqual(payload);
        done();
      },
    });
  });

  it('doit retourner un objet avec exactement deux proprietes : success et data', (done) => {
    const mockNext: CallHandler = {
      handle: jest.fn().mockReturnValue(of('valeur')),
    };

    interceptor.intercept(mockContext, mockNext).subscribe({
      next: (result) => {
        expect(Object.keys(result)).toHaveLength(2);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('data');
        done();
      },
    });
  });

  it('doit envelopper un tableau dans le champ data', (done) => {
    const liste = [{ id: 1 }, { id: 2 }];
    const mockNext: CallHandler = {
      handle: jest.fn().mockReturnValue(of(liste)),
    };

    interceptor.intercept(mockContext, mockNext).subscribe({
      next: (result) => {
        expect(result.data).toEqual(liste);
        done();
      },
    });
  });

  it('doit envelopper null dans le champ data', (done) => {
    const mockNext: CallHandler = {
      handle: jest.fn().mockReturnValue(of(null)),
    };

    interceptor.intercept(mockContext, mockNext).subscribe({
      next: (result) => {
        expect(result.data).toBeNull();
        done();
      },
    });
  });

  it('doit appeler handle() exactement une fois', (done) => {
    const mockNext: CallHandler = {
      handle: jest.fn().mockReturnValue(of('test')),
    };

    interceptor.intercept(mockContext, mockNext).subscribe({
      complete: () => {
        expect(mockNext.handle).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });
});
