import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from '../../services/suppliers-service';
import { Supplier, Prisma } from '@prisma/client';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockSupplier: Supplier = {
    id: 'sup-123',
    name: 'Fournisseur Test',
    logoUrl: null,
    email: 'contact@fournisseur.com',
    phone: '+225 01020304',
    website: null,
    taxId: 'TX-12345',
    contactPerson: 'M. Kouassi',
    contactEmail: null,
    contactPhone: null,
    paymentTerms: '30 jours',
    currency: 'XOF',
    rating: new Prisma.Decimal(4.5),
    notes: null,
    addressId: null,
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
      controllers: [SuppliersController],
      providers: [{ provide: SuppliersService, useValue: service }],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner la liste des fournisseurs', async () => {
      service.findAll.mockResolvedValue([mockSupplier]);

      const result = await controller.findAll(false);

      expect(result).toEqual([mockSupplier]);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findById', () => {
    it('doit retourner un fournisseur par son id', async () => {
      service.findById.mockResolvedValue(mockSupplier);

      const result = await controller.findById('sup-123');

      expect(result).toEqual(mockSupplier);
      expect(service.findById).toHaveBeenCalledWith('sup-123');
    });
  });

  describe('create', () => {
    it('doit créer un fournisseur et le retourner', async () => {
      service.create.mockResolvedValue(mockSupplier);

      const dto = { name: 'Fournisseur Test' };
      const result = await controller.create(dto);

      expect(result).toEqual(mockSupplier);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('doit modifier un fournisseur', async () => {
      const updated = { ...mockSupplier, name: 'Fournisseur Mis à Jour' };
      service.update.mockResolvedValue(updated);

      const dto = { name: 'Fournisseur Mis à Jour' };
      const result = await controller.update('sup-123', dto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('sup-123', dto);
    });
  });

  describe('delete', () => {
    it('doit supprimer un fournisseur', async () => {
      service.delete.mockResolvedValue(mockSupplier);

      const result = await controller.delete('sup-123');

      expect(result).toEqual(mockSupplier);
      expect(service.delete).toHaveBeenCalledWith('sup-123');
    });
  });
});
