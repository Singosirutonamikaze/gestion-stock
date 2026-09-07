import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { WarehousesRepository } from '../../repositories/warehouses-repository';
import { Warehouse, WarehouseType, Prisma } from '@prisma/client';

describe('WarehousesService', () => {
  let service: WarehousesService;
  let repository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findByCode: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
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
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehousesService,
        { provide: WarehousesRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<WarehousesService>(WarehousesService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner tous les entrepôts', async () => {
      repository.findAll.mockResolvedValue([mockWarehouse]);

      const result = await service.findAll(false);

      expect(result).toEqual([mockWarehouse]);
      expect(repository.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findById', () => {
    it('doit retourner un entrepôt existant', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);

      const result = await service.findById('wh-123');

      expect(result).toEqual(mockWarehouse);
      expect(repository.findById).toHaveBeenCalledWith('wh-123');
    });

    it('doit lever NotFoundException si l’entrepôt n’existe pas', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('doit créer un entrepôt', async () => {
      repository.findByCode.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockWarehouse);

      const dto = { name: 'Entrepôt Abidjan', code: 'WH-ABJ-01' };
      const result = await service.create(dto);

      expect(result).toEqual(mockWarehouse);
      expect(repository.create).toHaveBeenCalled();
    });

    it('doit lever ConflictException si le code existe déjà', async () => {
      repository.findByCode.mockResolvedValue(mockWarehouse);

      await expect(
        service.create({ name: 'Entrepôt Abidjan', code: 'WH-ABJ-01' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('doit mettre à jour l’entrepôt', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);
      repository.findByCode.mockResolvedValue(null);
      const updated = { ...mockWarehouse, name: 'Entrepôt Modifié' };
      repository.update.mockResolvedValue(updated);

      const result = await service.update('wh-123', {
        name: 'Entrepôt Modifié',
      });

      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('doit désactiver logiquement l’entrepôt', async () => {
      repository.findById.mockResolvedValue(mockWarehouse);
      const deactivated = { ...mockWarehouse, isActive: false };
      repository.softDelete.mockResolvedValue(deactivated);

      const result = await service.delete('wh-123');

      expect(result).toEqual(deactivated);
      expect(repository.softDelete).toHaveBeenCalledWith('wh-123');
    });
  });
});
