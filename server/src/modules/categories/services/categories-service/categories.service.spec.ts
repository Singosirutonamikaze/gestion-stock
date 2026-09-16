import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from '../../repositories/categories-repository';
import { Category } from '@prisma/client/index';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: {
    findAll: jest.MockedFunction<CategoriesRepository['findAll']>;
    findById: jest.MockedFunction<CategoriesRepository['findById']>;
    findByName: jest.MockedFunction<CategoriesRepository['findByName']>;
    findBySlug: jest.MockedFunction<CategoriesRepository['findBySlug']>;
    create: jest.MockedFunction<CategoriesRepository['create']>;
    update: jest.MockedFunction<CategoriesRepository['update']>;
    delete: jest.MockedFunction<CategoriesRepository['delete']>;
    countChildren: jest.MockedFunction<CategoriesRepository['countChildren']>;
    countProducts: jest.MockedFunction<CategoriesRepository['countProducts']>;
  };

  const mockCategory: Category = {
    id: 'cat-123',
    name: 'Informatique',
    slug: 'informatique',
    description: 'Matériel info',
    imageUrl: null,
    icon: null,
    parentId: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date('2026-08-25T08:00:00Z'),
    updatedAt: new Date('2026-08-25T08:00:00Z'),
  };

  beforeEach(async () => {
    repository = {
      findAll: jest.fn() as jest.MockedFunction<
        CategoriesRepository['findAll']
      >,
      findById: jest.fn() as jest.MockedFunction<
        CategoriesRepository['findById']
      >,
      findByName: jest.fn() as jest.MockedFunction<
        CategoriesRepository['findByName']
      >,
      findBySlug: jest.fn() as jest.MockedFunction<
        CategoriesRepository['findBySlug']
      >,
      create: jest.fn() as jest.MockedFunction<CategoriesRepository['create']>,
      update: jest.fn() as jest.MockedFunction<CategoriesRepository['update']>,
      delete: jest.fn() as jest.MockedFunction<CategoriesRepository['delete']>,
      countChildren: jest.fn() as jest.MockedFunction<
        CategoriesRepository['countChildren']
      >,
      countProducts: jest.fn() as jest.MockedFunction<
        CategoriesRepository['countProducts']
      >,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: CategoriesRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner la liste des catégories', async () => {
      repository.findAll.mockResolvedValue([mockCategory]);

      const result = await service.findAll(false);

      expect(result).toEqual([mockCategory]);
      expect(repository.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findById', () => {
    it('doit retourner une catégorie existante', async () => {
      repository.findById.mockResolvedValue(mockCategory);

      const result = await service.findById('cat-123');

      expect(result).toEqual(mockCategory);
      expect(repository.findById).toHaveBeenCalledWith('cat-123');
    });

    it('doit lever NotFoundException si la catégorie n’existe pas', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('doit créer une catégorie avec un slug auto-généré', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockCategory);

      const dto = { name: 'Informatique' };
      const result = await service.create(dto);

      expect(result).toEqual(mockCategory);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'Informatique',
        slug: 'informatique',
        description: undefined,
        imageUrl: undefined,
        icon: undefined,
        displayOrder: 0,
        isActive: true,
      });
    });

    it('doit lever ConflictException si le nom existe déjà', async () => {
      repository.findByName.mockResolvedValue(mockCategory);

      await expect(service.create({ name: 'Informatique' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('doit lever NotFoundException si la catégorie parente est introuvable', async () => {
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      repository.findById.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Ordinateurs', parentId: 'unknown-parent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('doit modifier la catégorie', async () => {
      repository.findById.mockResolvedValue(mockCategory);
      repository.findByName.mockResolvedValue(null);
      repository.findBySlug.mockResolvedValue(null);
      const updated: Category = { ...mockCategory, name: 'Bureautique' };
      repository.update.mockResolvedValue(updated);

      const result = await service.update('cat-123', { name: 'Bureautique' });

      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalled();
    });

    it('doit lever BadRequestException si la catégorie est son propre parent', async () => {
      repository.findById.mockResolvedValue(mockCategory);

      await expect(
        service.update('cat-123', { parentId: 'cat-123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('doit supprimer une catégorie sans enfants ni produits', async () => {
      repository.findById.mockResolvedValue(mockCategory);
      repository.countChildren.mockResolvedValue(0);
      repository.countProducts.mockResolvedValue(0);
      repository.delete.mockResolvedValue(mockCategory);

      const result = await service.delete('cat-123');

      expect(result).toEqual(mockCategory);
      expect(repository.delete).toHaveBeenCalledWith('cat-123');
    });

    it('doit lever ConflictException si la catégorie a des sous-catégories', async () => {
      repository.findById.mockResolvedValue(mockCategory);
      repository.countChildren.mockResolvedValue(2);

      await expect(service.delete('cat-123')).rejects.toThrow(
        ConflictException,
      );
    });

    it('doit lever ConflictException si la catégorie a des produits associés', async () => {
      repository.findById.mockResolvedValue(mockCategory);
      repository.countChildren.mockResolvedValue(0);
      repository.countProducts.mockResolvedValue(5);

      await expect(service.delete('cat-123')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
