import { InsufficientStockException } from './insufficient-stock.exception';
import { BadRequestException } from '@nestjs/common';

describe('InsufficientStockException', () => {
  const PRODUCT_ID = 'prod-abc';
  const WAREHOUSE_ID = 'wh-xyz';
  const AVAILABLE = 5;
  const REQUESTED = 20;

  let exception: InsufficientStockException;

  beforeEach(() => {
    exception = new InsufficientStockException(
      PRODUCT_ID,
      WAREHOUSE_ID,
      AVAILABLE,
      REQUESTED,
    );
  });

  it('doit etre instanciee', () => {
    expect(exception).toBeDefined();
  });

  it('doit etre une instance de BadRequestException', () => {
    expect(exception).toBeInstanceOf(BadRequestException);
  });

  it('doit etre une instance de InsufficientStockException', () => {
    expect(exception).toBeInstanceOf(InsufficientStockException);
  });

  it('doit avoir le statut HTTP 400', () => {
    expect(exception.getStatus()).toBe(400);
  });

  it('doit exposer la propriete productId correcte', () => {
    expect(exception.productId).toBe(PRODUCT_ID);
  });

  it('doit exposer la propriete warehouseId correcte', () => {
    expect(exception.warehouseId).toBe(WAREHOUSE_ID);
  });

  it('doit exposer la propriete available correcte', () => {
    expect(exception.available).toBe(AVAILABLE);
  });

  it('doit exposer la propriete requested correcte', () => {
    expect(exception.requested).toBe(REQUESTED);
  });

  it('doit inclure le productId dans le corps de la reponse', () => {
    const response = exception.getResponse() as Record<string, unknown>;

    expect(response.productId).toBe(PRODUCT_ID);
  });

  it('doit inclure le warehouseId dans le corps de la reponse', () => {
    const response = exception.getResponse() as Record<string, unknown>;

    expect(response.warehouseId).toBe(WAREHOUSE_ID);
  });

  it('doit inclure available dans le corps de la reponse', () => {
    const response = exception.getResponse() as Record<string, unknown>;

    expect(response.available).toBe(AVAILABLE);
  });

  it('doit inclure requested dans le corps de la reponse', () => {
    const response = exception.getResponse() as Record<string, unknown>;

    expect(response.requested).toBe(REQUESTED);
  });

  it('doit inclure le statusCode 400 dans le corps de la reponse', () => {
    const response = exception.getResponse() as Record<string, unknown>;

    expect(response.statusCode).toBe(400);
  });

  it('doit inclure le champ error "Bad Request" dans le corps de la reponse', () => {
    const response = exception.getResponse() as Record<string, unknown>;

    expect(response.error).toBe('Bad Request');
  });

  it('doit inclure le productId dans le message', () => {
    const response = exception.getResponse() as Record<string, unknown>;

    expect(response.message as string).toContain(PRODUCT_ID);
  });

  it('doit inclure le warehouseId dans le message', () => {
    const response = exception.getResponse() as Record<string, unknown>;

    expect(response.message as string).toContain(WAREHOUSE_ID);
  });

  it('doit creer une exception avec des valeurs de stock differentes', () => {
    const autre = new InsufficientStockException('prod-2', 'wh-2', 0, 10);

    expect(autre.available).toBe(0);
    expect(autre.requested).toBe(10);
  });
});
