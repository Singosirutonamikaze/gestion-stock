import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementsRepository } from './stock-movements.repository';
import { PrismaService } from '../../../../core/database/prisma-service';
import { MovementType } from '@prisma/client';

describe('StockMovementsRepository', () => {
  let repository: StockMovementsRepository;
  let prisma: {
    stockMovement: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockMovement = {
    id: 'mov-1',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    type: MovementType.IN,
    quantity: 10,
    reason: 'Initial',
    reference: null,
    relatedWarehouseId: null,
    userId: 'user-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      stockMovement: {
        findMany: jest.fn().mockResolvedValue([mockMovement]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn().mockResolvedValue(mockMovement),
      },
      $transaction: jest
        .fn()
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) =>
          cb(prisma),
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<StockMovementsRepository>(StockMovementsRepository);
  });

  it('doit être défini', () => {
    expect(repository).toBeDefined();
  });

  describe('findMany', () => {
    it('doit retourner les mouvements filtrés', async () => {
      const result = await repository.findMany({
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.IN,
        page: 1,
        limit: 10,
      });

      expect(result).toEqual([mockMovement]);
      expect(prisma.stockMovement.findMany).toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('doit compter les mouvements', async () => {
      const result = await repository.count({ productId: 'prod-1' });
      expect(result).toBe(1);
    });
  });

  describe('findById', () => {
    it('doit retourner un mouvement par id', async () => {
      const result = await repository.findById('mov-1');
      expect(result).toEqual(mockMovement);
      expect(prisma.stockMovement.findUnique).toHaveBeenCalledWith({
        where: { id: 'mov-1' },
        include: expect.any(Object),
      });
    });
  });
});
