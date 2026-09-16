import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from '../../services/stock-movements-service';
import { MovementType } from '@prisma/client';
import { JwtPayload } from '../../../auth/types/jwt-payload.type';
import { UserRole } from '../../../../shared/enums/user-role-enum';

describe('StockMovementsController', () => {
  let controller: StockMovementsController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };

  const mockMovement = {
    id: 'mov-1',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    type: MovementType.IN,
    quantity: 10,
    reason: 'Arrivage',
    reference: 'BL-001',
    relatedWarehouseId: null,
    userId: 'user-1',
    createdAt: new Date(),
  };

  const mockUser: JwtPayload = {
    sub: 'user-1',
    email: 'test@example.com',
    role: UserRole.MANAGER,
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue({
        items: [mockMovement],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      findById: jest.fn().mockResolvedValue(mockMovement),
      create: jest.fn().mockResolvedValue(mockMovement),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockMovementsController],
      providers: [{ provide: StockMovementsService, useValue: service }],
    }).compile();

    controller = module.get<StockMovementsController>(StockMovementsController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner la liste paginée des mouvements', async () => {
      const result = await controller.findAll(
        'prod-1',
        'wh-1',
        MovementType.IN,
        '1',
        '20',
      );
      expect(result.items).toEqual([mockMovement]);
      expect(service.findAll).toHaveBeenCalledWith({
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.IN,
        page: 1,
        limit: 20,
      });
    });
  });

  describe('findById', () => {
    it('doit retourner le mouvement demandé', async () => {
      const result = await controller.findById('mov-1');
      expect(result).toEqual(mockMovement);
      expect(service.findById).toHaveBeenCalledWith('mov-1');
    });
  });

  describe('create', () => {
    it('doit créer un mouvement avec l’utilisateur extrait du token', async () => {
      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: MovementType.IN,
        quantity: 10,
      };

      const result = await controller.create(dto, mockUser);
      expect(result).toEqual(mockMovement);
      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
    });
  });
});
