import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../../../core/database/prisma-service';
import { MovementType, Prisma } from '@prisma/client';
import { ReportFormat } from '../../dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    stock: { findMany: jest.Mock };
    product: { findMany: jest.Mock };
    stockMovement: { findMany: jest.Mock };
  };

  const mockProduct = {
    id: 'prod-1',
    sku: 'SKU-001',
    name: 'Disque SSD',
    unit: 'pièce',
    alertThreshold: 10,
    costPrice: new Prisma.Decimal(10000),
    unitPrice: new Prisma.Decimal(15000),
    isActive: true,
  };

  const mockWarehouse = {
    id: 'wh-1',
    code: 'WH-01',
    name: 'Entrepôt Principal',
  };

  const mockStock = {
    id: 'stock-1',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    quantity: 20,
    reservedQuantity: 5,
    availableQuantity: 15,
    product: mockProduct,
    warehouse: mockWarehouse,
  };

  const mockMovement = {
    id: 'mov-1',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    type: MovementType.IN,
    quantity: 10,
    reason: 'Arrivage',
    reference: 'PO-2026-001',
    createdAt: new Date('2026-05-10T10:00:00Z'),
    product: { id: 'prod-1', sku: 'SKU-001', name: 'Disque SSD' },
    warehouse: { id: 'wh-1', code: 'WH-01', name: 'Entrepôt Principal' },
    user: {
      id: 'user-1',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
    },
  };

  beforeEach(async () => {
    prisma = {
      stock: {
        findMany: jest.fn().mockResolvedValue([mockStock]),
      },
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            ...mockProduct,
            stocks: [mockStock],
          },
        ]),
      },
      stockMovement: {
        findMany: jest.fn().mockResolvedValue([mockMovement]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('getStockReport', () => {
    it('doit retourner le rapport d’état du stock en format JSON', async () => {
      const result = await service.getStockReport();
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].product.sku).toBe('SKU-001');
      expect(result.data![0].quantity).toBe(15);
      expect(result.data![0].isAlert).toBe(false);
    });

    it('doit retourner un CSV quand format=csv', async () => {
      const result = await service.getStockReport({ format: ReportFormat.CSV });
      expect(result.csv).toBeDefined();
      expect(result.csv).toContain('SKU,Nom Produit');
      expect(result.csv).toContain('SKU-001');
    });
  });

  describe('getLowStockReport', () => {
    it('doit identifier les produits sous le seuil d’alerte', async () => {
      // Produit avec stock dispo = 5 alors que alertThreshold = 10
      prisma.product.findMany.mockResolvedValue([
        {
          ...mockProduct,
          alertThreshold: 10,
          stocks: [
            {
              ...mockStock,
              availableQuantity: 5,
            },
          ],
        },
      ]);

      const result = await service.getLowStockReport();
      expect(result).toHaveLength(1);
      expect(result[0].totalQuantity).toBe(5);
      expect(result[0].deficit).toBe(5);
      expect(result[0].warehouseDetails).toHaveLength(1);
    });

    it('ne doit pas inclure les produits dont le stock dépasse le seuil d’alerte', async () => {
      prisma.product.findMany.mockResolvedValue([
        {
          ...mockProduct,
          alertThreshold: 10,
          stocks: [
            {
              ...mockStock,
              availableQuantity: 15,
            },
          ],
        },
      ]);

      const result = await service.getLowStockReport();
      expect(result).toHaveLength(0);
    });
  });

  describe('getMovementsReport', () => {
    it('doit retourner les mouvements sur la période avec totaux agrégés', async () => {
      const result = await service.getMovementsReport({
        from: '2026-01-01T00:00:00Z',
        to: '2026-12-31T23:59:59Z',
      });

      expect(result.data).toBeDefined();
      expect(result.data!.items).toHaveLength(1);
      expect(result.data!.summary.totalIn).toBe(10);
      expect(result.data!.summary.totalCount).toBe(1);
    });

    it('doit retourner un export CSV pour les mouvements', async () => {
      const result = await service.getMovementsReport({
        from: '2026-01-01T00:00:00Z',
        to: '2026-12-31T23:59:59Z',
        format: ReportFormat.CSV,
      });

      expect(result.csv).toBeDefined();
      expect(result.csv).toContain('Date,Reference,Type');
      expect(result.csv).toContain('PO-2026-001');
    });

    it('doit rejeter une requête avec des dates invalides', async () => {
      await expect(
        service.getMovementsReport({
          from: 'date-invalide',
          to: '2026-12-31',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('doit rejeter une date de début postérieure à la date de fin', async () => {
      await expect(
        service.getMovementsReport({
          from: '2026-12-31T00:00:00Z',
          to: '2026-01-01T00:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStockValuation', () => {
    it('doit calculer les valorisations financières et marges', async () => {
      const result = await service.getStockValuation();
      expect(result.data).toBeDefined();
      expect(result.data!.items).toHaveLength(1);
      expect(result.data!.items[0].costValue).toBe(150000); // 15 * 10000
      expect(result.data!.items[0].saleValue).toBe(225000); // 15 * 15000
      expect(result.data!.items[0].margin).toBe(75000); // 225000 - 150000
      expect(result.data!.grandTotalCostValue).toBe(150000);
      expect(result.data!.grandTotalSaleValue).toBe(225000);
      expect(result.data!.grandTotalMargin).toBe(75000);
    });

    it('doit exporter la valorisation en format CSV', async () => {
      const result = await service.getStockValuation({
        format: ReportFormat.CSV,
      });
      expect(result.csv).toBeDefined();
      expect(result.csv).toContain('SKU,Nom Produit');
      expect(result.csv).toContain('TOTAL GENERAL');
    });
  });
});
