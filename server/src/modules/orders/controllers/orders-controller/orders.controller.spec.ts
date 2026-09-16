import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../../services/orders-service';
import { ForbiddenException } from '@nestjs/common';
import { OrderStatus, OrderType } from '@prisma/client';
import { UserRole } from '../../../../shared/enums/user-role-enum';
import type { JwtPayload } from '../../../auth/types/jwt-payload.type';
import { CreateOrderDto } from '../../dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    cancel: jest.Mock;
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'SO-20260916-XYZ',
    type: OrderType.SALE,
    status: OrderStatus.DRAFT,
    totalAmount: 15000,
    items: [],
  };

  const mockUser: JwtPayload = {
    sub: 'user-1',
    email: 'sales@test.com',
    role: UserRole.SALES,
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({
        items: [mockOrder],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      findById: jest.fn().mockResolvedValue(mockOrder),
      create: jest.fn().mockResolvedValue(mockOrder),
      update: jest.fn().mockResolvedValue(mockOrder),
      cancel: jest
        .fn()
        .mockResolvedValue({ ...mockOrder, status: OrderStatus.CANCELLED }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner la liste paginée des commandes', async () => {
      const result = await controller.findAll({ page: 1, limit: 20 });
      expect(result.success).toBe(true);
      expect(result.data.items).toEqual([mockOrder]);
    });
  });

  describe('findById', () => {
    it('doit retourner une commande par son identifiant', async () => {
      const result = await controller.findById('order-1');
      expect(result).toEqual(mockOrder);
      expect(service.findById).toHaveBeenCalledWith('order-1');
    });
  });

  describe('create', () => {
    it('doit créer une commande si autorisé', async () => {
      const dto: CreateOrderDto = {
        type: OrderType.SALE,
        warehouseId: 'wh-1',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 100 }],
      };

      const result = await controller.create(dto, mockUser);
      expect(result).toEqual(mockOrder);
      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
    });

    it('doit interdire à un utilisateur SALES de créer un achat (PURCHASE)', async () => {
      const dto: CreateOrderDto = {
        type: OrderType.PURCHASE,
        supplierId: 'sup-1',
        warehouseId: 'wh-1',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 100 }],
      };

      await expect(controller.create(dto, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('doit mettre à jour une commande', async () => {
      const dto = { status: OrderStatus.CONFIRMED };

      const result = await controller.update('order-1', dto, mockUser);
      expect(result).toEqual(mockOrder);
      expect(service.update).toHaveBeenCalledWith('order-1', dto, 'user-1');
    });
  });

  describe('cancel', () => {
    it('doit annuler une commande', async () => {
      const result = await controller.cancel('order-1', mockUser);
      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(service.cancel).toHaveBeenCalledWith('order-1', 'user-1');
    });
  });
});
