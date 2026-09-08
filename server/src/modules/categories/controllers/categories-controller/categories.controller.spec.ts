import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../../services/categories-service';
import { Category } from '@prisma/client/index';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: {
    findAll: jest.MockedFunction<CategoriesService['findAll']>;
    findById: jest.MockedFunction<CategoriesService['findById']>;
    create: jest.MockedFunction<CategoriesService['create']>;
    update: jest.MockedFunction<CategoriesService['update']>;
    delete: jest.MockedFunction<CategoriesService['delete']>;
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
    service = {
      findAll: jest.fn() as jest.MockedFunction<CategoriesService['findAll']>,
      findById: jest.fn() as jest.MockedFunction<CategoriesService['findById']>,
      create: jest.fn() as jest.MockedFunction<CategoriesService['create']>,
      update: jest.fn() as jest.MockedFunction<CategoriesService['update']>,
      delete: jest.fn() as jest.MockedFunction<CategoriesService['delete']>,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: service }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner la liste des catégories', async () => {
      service.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll(false);

      expect(result).toEqual([mockCategory]);
      expect(service.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findById', () => {
    it('doit retourner une catégorie par son id', async () => {
      service.findById.mockResolvedValue(mockCategory);

      const result = await controller.findById('cat-123');

      expect(result).toEqual(mockCategory);
      expect(service.findById).toHaveBeenCalledWith('cat-123');
    });
  });

  describe('create', () => {
    it('doit créer une catégorie et la retourner', async () => {
      service.create.mockResolvedValue(mockCategory);

      const dto = { name: 'Informatique' };
      const result = await controller.create(dto);

      expect(result).toEqual(mockCategory);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('doit modifier une catégorie', async () => {
      const updated: Category = {
        ...mockCategory,
        name: 'Informatique & Réseau',
      };
      service.update.mockResolvedValue(updated);

      const dto = { name: 'Informatique & Réseau' };
      const result = await controller.update('cat-123', dto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('cat-123', dto);
    });
  });

  describe('delete', () => {
    it('doit supprimer une catégorie', async () => {
      service.delete.mockResolvedValue(mockCategory);

      const result = await controller.delete('cat-123');

      expect(result).toEqual(mockCategory);
      expect(service.delete).toHaveBeenCalledWith('cat-123');
    });
  });
});
