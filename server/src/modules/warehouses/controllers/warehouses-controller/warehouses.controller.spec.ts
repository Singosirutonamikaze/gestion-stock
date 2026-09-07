import { Test, TestingModule } from '@nestjs/testing';
import { WarehousesController } from './warehouses.controller';
import { WarehousesService } from '../../services/warehouses-service';
import { Warehouse, WarehouseType, Prisma } from '@prisma/client';

describe('WarehousesController', () => {
  let controller: WarehousesController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockWarehouse: Warehouse = {
    id: 'wh-123',
    name: 'Entrepôt Abidjan',
    code: 'WH-ABJ-01',
    type: WarehouseType.MAIN,
    addressId: null,
    phone: '+225 01020304',
    email: 'contact@entrepot.com',
    managerId: null,
    capacity: 10000,
    surfaceM2: new Prisma.Decimal(500.0),
    isActive: true,
    createdAt: new Date('2026-08-25T08:00:00Z'),
    updatedAt: new Date('2026-08-25T08:00:00Z'),
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehousesController],
      providers: [{ provide: WarehousesService, useValue: service }],
    }).compile();

    controller = module.get<WarehousesController>(WarehousesController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner la liste des entrepôts', async () => {
      service.findAll.mockResolvedValue([mockWarehouse]);

      const result = await controller.findAll(false);

      expect(result).toEqual([mockWarehouse]);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findById', () => {
    it('doit retourner un entrepôt par son id', async () => {
      service.findById.mockResolvedValue(mockWarehouse);

      const result = await controller.findById('wh-123');

      expect(result).toEqual(mockWarehouse);
      expect(service.findById).toHaveBeenCalledWith('wh-123');
    });
  });

  describe('create', () => {
    it('doit créer un entrepôt et le retourner', async () => {
      service.create.mockResolvedValue(mockWarehouse);

      const dto = { name: 'Entrepôt Abidjan', code: 'WH-ABJ-01' };
      const result = await controller.create(dto);

      expect(result).toEqual(mockWarehouse);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('doit modifier un entrepôt', async () => {
      const updated = { ...mockWarehouse, name: 'Entrepôt Abidjan Modifié' };
      service.update.mockResolvedValue(updated);

      const dto = { name: 'Entrepôt Abidjan Modifié' };
      const result = await controller.update('wh-123', dto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('wh-123', dto);
    });
  });

  describe('delete', () => {
    it('doit désactiver logiquement un entrepôt', async () => {
      const deactivated = { ...mockWarehouse, isActive: false };
      service.delete.mockResolvedValue(deactivated);

      const result = await controller.delete('wh-123');

      expect(result).toEqual(deactivated);
      expect(service.delete).toHaveBeenCalledWith('wh-123');
    });
  });
});
