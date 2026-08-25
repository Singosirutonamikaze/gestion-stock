import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users.repository';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { User } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockPrismaUser: User = {
    id: 'usr-123',
    email: 'jean.dupont@test.com',
    password: '$2b$12$hashedPasswordKeyHere',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: null,
    avatarUrl: null,
    role: 'ADMINISTRATOR' as any,
    department: null,
    jobTitle: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-08-25T08:00:00Z'),
    updatedAt: new Date('2026-08-25T08:00:00Z'),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAll: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner une structure paginée avec les utilisateurs convertis en DTO', async () => {
      repository.findAll.mockResolvedValue([mockPrismaUser]);
      repository.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: [
          {
            id: 'usr-123',
            email: 'jean.dupont@test.com',
            firstName: 'Jean',
            lastName: 'Dupont',
            role: UserRole.ADMINISTRATOR,
            isActive: true,
            createdAt: mockPrismaUser.createdAt,
            updatedAt: mockPrismaUser.updatedAt,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(repository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(repository.count).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('findById', () => {
    it('doit retourner le DTO d\'un utilisateur existant', async () => {
      repository.findById.mockResolvedValue(mockPrismaUser);

      const result = await service.findById('usr-123');

      expect(result.id).toBe('usr-123');
      expect(result.email).toBe('jean.dupont@test.com');
      expect(repository.findById).toHaveBeenCalledWith('usr-123');
    });

    it('doit lever NotFoundException si l\'utilisateur n\'existe pas', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('doit hacher le mot de passe et créer l\'utilisateur', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockPrismaUser);

      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedPasswordKeyHere');

      const dto = {
        email: 'jean.dupont@test.com',
        password: 'Password123!',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: UserRole.ADMINISTRATOR,
      };

      const result = await service.create(dto);

      expect(repository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashedPasswordKeyHere',
      });
      expect(result.id).toBe('usr-123');
    });

    it('doit lever ConflictException si l\'email existe déjà', async () => {
      repository.findByEmail.mockResolvedValue(mockPrismaUser);

      const dto = {
        email: 'jean.dupont@test.com',
        password: 'Password123!',
        firstName: 'Jean',
        lastName: 'Dupont',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('doit mettre à jour les données et hacher le nouveau mot de passe si fourni', async () => {
      repository.findById.mockResolvedValue(mockPrismaUser);
      repository.update.mockResolvedValue({ ...mockPrismaUser, firstName: 'Pierre' });

      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'newHashedPassword');

      const dto = { firstName: 'Pierre', password: 'NewPassword123!' };
      const result = await service.update('usr-123', dto);

      expect(repository.update).toHaveBeenCalledWith('usr-123', {
        firstName: 'Pierre',
        password: 'newHashedPassword',
      });
      expect(result.firstName).toBe('Pierre');
    });

    it('doit lever NotFoundException si l\'utilisateur à modifier n\'existe pas', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('unknown', { firstName: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('doit appeler softDelete du repository si l\'utilisateur existe', async () => {
      repository.findById.mockResolvedValue(mockPrismaUser);
      repository.softDelete.mockResolvedValue();

      await service.softDelete('usr-123');

      expect(repository.softDelete).toHaveBeenCalledWith('usr-123');
    });

    it('doit lever NotFoundException si l\'utilisateur n\'existe pas', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.softDelete('unknown')).rejects.toThrow(NotFoundException);
    });
  });
});
