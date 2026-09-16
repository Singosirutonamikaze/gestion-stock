import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from '../../services/reports-service';
import { ReportFormat } from '../../dto';
import type { Response } from 'express';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: {
    getStockReport: jest.Mock;
    getLowStockReport: jest.Mock;
    getMovementsReport: jest.Mock;
    getStockValuation: jest.Mock;
  };
  let mockResponse: Partial<Response>;

  const mockStockReportData = [
    {
      product: { id: 'p1', sku: 'SKU1', name: 'Prod 1', unit: 'pcs' },
      warehouse: { id: 'w1', code: 'WH1', name: 'Warehouse 1' },
      quantity: 10,
      reservedQuantity: 2,
      totalQuantity: 12,
      alertThreshold: 5,
      isAlert: false,
    },
  ];

  beforeEach(async () => {
    mockResponse = {
      setHeader: jest.fn(),
    };

    service = {
      getStockReport: jest
        .fn()
        .mockResolvedValue({ data: mockStockReportData }),
      getLowStockReport: jest.fn().mockResolvedValue([]),
      getMovementsReport: jest
        .fn()
        .mockResolvedValue({ data: { items: [], summary: {} } }),
      getStockValuation: jest.fn().mockResolvedValue({
        data: {
          items: [],
          grandTotalCostValue: 0,
          grandTotalSaleValue: 0,
          grandTotalMargin: 0,
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('getStockReport', () => {
    it('doit retourner le rapport de stock en JSON', async () => {
      const result = await controller.getStockReport(
        {},
        mockResponse as Response,
      );
      expect(result).toEqual({ success: true, data: mockStockReportData });
    });

    it('doit configurer les headers et retourner le contenu CSV', async () => {
      service.getStockReport.mockResolvedValue({ csv: 'SKU,Nom\nSKU1,Prod 1' });
      const result = await controller.getStockReport(
        { format: ReportFormat.CSV },
        mockResponse as Response,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8',
      );
      expect(result).toBe('SKU,Nom\nSKU1,Prod 1');
    });
  });

  describe('getLowStockReport', () => {
    it('doit retourner le rapport des alertes', async () => {
      const result = await controller.getLowStockReport();
      expect(result).toEqual({ success: true, data: [] });
    });
  });

  describe('getMovementsReport', () => {
    it('doit retourner le rapport des mouvements en JSON', async () => {
      const query = { from: '2026-01-01', to: '2026-12-31' };
      const result = await controller.getMovementsReport(
        query,
        mockResponse as Response,
      );
      expect(result).toEqual({
        success: true,
        data: { items: [], summary: {} },
      });
    });

    it('doit configurer les headers et retourner le CSV', async () => {
      service.getMovementsReport.mockResolvedValue({
        csv: 'Date,Type\n2026-01-01,IN',
      });
      const query = {
        from: '2026-01-01',
        to: '2026-12-31',
        format: ReportFormat.CSV,
      };
      const result = await controller.getMovementsReport(
        query,
        mockResponse as Response,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8',
      );
      expect(result).toBe('Date,Type\n2026-01-01,IN');
    });
  });

  describe('getStockValuation', () => {
    it('doit retourner la valorisation du stock', async () => {
      const result = await controller.getStockValuation(
        {},
        mockResponse as Response,
      );
      expect(result).toEqual({
        success: true,
        data: {
          items: [],
          grandTotalCostValue: 0,
          grandTotalSaleValue: 0,
          grandTotalMargin: 0,
        },
      });
    });

    it('doit exporter la valorisation en CSV', async () => {
      service.getStockValuation.mockResolvedValue({
        csv: 'SKU,Marge\nSKU1,1000',
      });
      const result = await controller.getStockValuation(
        { format: ReportFormat.CSV },
        mockResponse as Response,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8',
      );
      expect(result).toBe('SKU,Marge\nSKU1,1000');
    });
  });
});
