import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { StockRepository } from '../../repositories/stock-repository';

describe('StockService', () => {
  let service: StockService;
  let repository: {
    findMany: jest.Mock;
    count: jest.Mock;
    findProductsWithStocks: jest.Mock;
  };

  const mockStock = {
    id: 'stock-1',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    locationId: null,
    quantity: 5,
    reservedQuantity: 1,
    availableQuantity: 4,
    updatedAt: new Date(),
    product: {
      id: 'prod-1',
      sku: 'SKU-01',
      name: 'Produit 1',
      alertThreshold: 10,
    },
    warehouse: {
      id: 'wh-1',
      code: 'WH-01',
      name: 'Entrepôt Abidjan',
    },
  };

  beforeEach(async () => {
    repository = {
      findMany: jest.fn().mockResolvedValue([mockStock]),
      count: jest.fn().mockResolvedValue(1),
      findProductsWithStocks: jest.fn().mockResolvedValue([
        {
          id: 'prod-1',
          sku: 'SKU-01',
          name: 'Produit 1',
          alertThreshold: 10,
          stocks: [
            {
              warehouseId: 'wh-1',
              quantity: 5,
              availableQuantity: 4,
              warehouse: { code: 'WH-01', name: 'Entrepôt Abidjan' },
            },
          ],
        },
        {
          id: 'prod-2',
          sku: 'SKU-02',
          name: 'Produit 2',
          alertThreshold: 5,
          stocks: [
            {
              warehouseId: 'wh-1',
              quantity: 20,
              availableQuantity: 20,
              warehouse: { code: 'WH-01', name: 'Entrepôt Abidjan' },
            },
          ],
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        { provide: StockRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner les niveaux de stock paginés', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.items).toEqual([mockStock]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(repository.findMany).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('getLowStock', () => {
    it('doit retourner uniquement les produits sous le seuil d’alerte', async () => {
      const result = await service.getLowStock();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('prod-1');
      expect(result[0].totalQuantity).toBe(5);
      expect(result[0].totalAvailableQuantity).toBe(4);
      expect(result[0].alertThreshold).toBe(10);
      expect(result[0].warehouses).toHaveLength(1);
      expect(result[0].warehouses[0].warehouseCode).toBe('WH-01');
    });
  });
});
