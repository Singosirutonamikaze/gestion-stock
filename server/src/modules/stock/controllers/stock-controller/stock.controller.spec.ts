import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from '../../services/stock-service';

describe('StockController', () => {
  let controller: StockController;
  let service: {
    findAll: jest.Mock;
    getLowStock: jest.Mock;
  };

  const mockStock = {
    id: 'stock-1',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    locationId: null,
    quantity: 10,
    reservedQuantity: 0,
    availableQuantity: 10,
    updatedAt: new Date(),
  };

  const mockLowStock = {
    id: 'prod-1',
    sku: 'SKU-01',
    name: 'Produit 1',
    totalQuantity: 2,
    totalAvailableQuantity: 2,
    alertThreshold: 5,
    warehouses: [],
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({
        items: [mockStock],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      getLowStock: jest.fn().mockResolvedValue([mockLowStock]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [{ provide: StockService, useValue: service }],
    }).compile();

    controller = module.get<StockController>(StockController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner les niveaux de stock', async () => {
      const query = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        page: 1,
        limit: 10,
      };
      const result = await controller.findAll(query);

      expect(result.items).toEqual([mockStock]);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getLowStock', () => {
    it('doit retourner les produits sous le seuil d’alerte', async () => {
      const result = await controller.getLowStock();

      expect(result).toEqual([mockLowStock]);
      expect(service.getLowStock).toHaveBeenCalled();
    });
  });
});
