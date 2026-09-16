import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersRepository } from '../../repositories/suppliers-repository';
import { Supplier, Prisma } from '@prisma/client';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let repository: {
    findAll: jest.Mock;
    findById: jest.Mock;
    findByName: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    countProducts: jest.Mock;
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
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countProducts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: SuppliersRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner tous les fournisseurs', async () => {
      repository.findAll.mockResolvedValue([mockSupplier]);

      const result = await service.findAll(false);

      expect(result).toEqual([mockSupplier]);
      expect(repository.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findById', () => {
    it('doit retourner un fournisseur existant', async () => {
      repository.findById.mockResolvedValue(mockSupplier);

      const result = await service.findById('sup-123');

      expect(result).toEqual(mockSupplier);
      expect(repository.findById).toHaveBeenCalledWith('sup-123');
    });

    it('doit lever NotFoundException si le fournisseur n’existe pas', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('doit créer un fournisseur', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockSupplier);

      const dto = { name: 'Fournisseur Test' };
      const result = await service.create(dto);

      expect(result).toEqual(mockSupplier);
      expect(repository.create).toHaveBeenCalled();
    });

    it('doit lever ConflictException si le nom existe déjà', async () => {
      repository.findByName.mockResolvedValue(mockSupplier);

      await expect(
        service.create({ name: 'Fournisseur Test' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('doit mettre à jour le fournisseur', async () => {
      repository.findById.mockResolvedValue(mockSupplier);
      repository.findByName.mockResolvedValue(null);
      const updated = { ...mockSupplier, name: 'Fournisseur Modifié' };
      repository.update.mockResolvedValue(updated);

      const result = await service.update('sup-123', {
        name: 'Fournisseur Modifié',
      });

      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('doit supprimer un fournisseur sans produits associés', async () => {
      repository.findById.mockResolvedValue(mockSupplier);
      repository.countProducts.mockResolvedValue(0);
      repository.delete.mockResolvedValue(mockSupplier);

      const result = await service.delete('sup-123');

      expect(result).toEqual(mockSupplier);
      expect(repository.delete).toHaveBeenCalledWith('sup-123');
    });

    it('doit lever ConflictException si le fournisseur a des produits associés', async () => {
      repository.findById.mockResolvedValue(mockSupplier);
      repository.countProducts.mockResolvedValue(3);

      await expect(service.delete('sup-123')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
