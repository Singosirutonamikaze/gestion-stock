import { Test, TestingModule } from '@nestjs/testing';
import { OrdersRepository } from './orders.repository';
import { PrismaService } from '../../../../core/database/prisma-service';
import { OrderStatus, OrderType } from '@prisma/client';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let prisma: {
    order: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-2026-001',
    type: OrderType.PURCHASE,
    status: OrderStatus.DRAFT,
  };

  beforeEach(async () => {
    prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([mockOrder]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn().mockResolvedValue(mockOrder),
      },
      $transaction: jest
        .fn()
        .mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) =>
          cb(prisma),
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<OrdersRepository>(OrdersRepository);
  });

  it('doit être défini', () => {
    expect(repository).toBeDefined();
  });

  it('findMany doit appeler prisma.order.findMany avec pagination', async () => {
    const result = await repository.findMany({ page: 2, limit: 10 });
    expect(result).toEqual([mockOrder]);
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it('count doit appeler prisma.order.count', async () => {
    const count = await repository.count();
    expect(count).toBe(1);
    expect(prisma.order.count).toHaveBeenCalled();
  });

  it('findById doit appeler prisma.order.findUnique avec include', async () => {
    const result = await repository.findById('order-1');
    expect(result).toEqual(mockOrder);
    expect(prisma.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
      }),
    );
  });

  it('findByOrderNumber doit appeler prisma.order.findUnique', async () => {
    const result = await repository.findByOrderNumber('ORD-2026-001');
    expect(result).toEqual(mockOrder);
    expect(prisma.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderNumber: 'ORD-2026-001' },
      }),
    );
  });
});
