import { BadRequestException } from '@nestjs/common';

export class InsufficientStockException extends BadRequestException {
  constructor(
    public readonly productId: string,
    public readonly warehouseId: string,
    public readonly available: number,
    public readonly requested: number,
  ) {
    super({
      statusCode: 400,
      message: `Stock insuffisant pour le produit (${productId}) dans l'entrepot (${warehouseId}). Disponible: ${available}, Demande: ${requested}`,
      error: 'Bad Request',
      available,
      requested,
      productId,
      warehouseId,
    });
  }
}
