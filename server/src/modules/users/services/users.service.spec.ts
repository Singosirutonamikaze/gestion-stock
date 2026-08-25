import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users.repository';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { User } from '@prisma/client';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: {
    findAll: jest.Mock;
    count: jest.Mock;
    findById: jest.Mock;
    findByEmail: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
    getStatistics: jest.Mock;
  };

  const mockPrismaUser: User = {
    id: 'usr-123',
    email: 'kodjo.koffie@test.com',
    password: '$2b$12$hashedPasswordKeyHere',
    firstName: 'Kodjo',
    lastName: 'Koffie',
    phone: null,
    avatarUrl: null,
    role: UserRole.ADMINISTRATOR,
    department: null,
    jobTitle: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-08-25T08:00:00Z'),
    updatedAt: new Date('2026-08-25T08:00:00Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockRepo = {
      findAll: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      getStatistics: jest.fn(),
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
            email: 'kodjo.koffie@test.com',
            firstName: 'Kodjo',
            lastName: 'Koffie',
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
    it("doit retourner le DTO d'un utilisateur existant", async () => {
      repository.findById.mockResolvedValue(mockPrismaUser);

      const result = await service.findById('usr-123');

      expect(result.id).toBe('usr-123');
      expect(result.email).toBe('kodjo.koffie@test.com');
      expect(repository.findById).toHaveBeenCalledWith('usr-123');
    });

    it("doit lever NotFoundException si l'utilisateur n'existe pas", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it("doit hacher le mot de passe et créer l'utilisateur", async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockPrismaUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPasswordKeyHere');

      const dto = {
        email: 'kodjo.koffie@test.com',
        password: 'Password123!',
        firstName: 'Kodjo',
        lastName: 'Koffie',
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

    it("doit lever ConflictException si l'email existe déjà", async () => {
      repository.findByEmail.mockResolvedValue(mockPrismaUser);

      const dto = {
        email: 'kodjo.koffie@test.com',
        password: 'Password123!',
        firstName: 'Kodjo',
        lastName: 'Koffie',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('doit mettre à jour les données et hacher le nouveau mot de passe si fourni', async () => {
      repository.findById.mockResolvedValue(mockPrismaUser);
      repository.update.mockResolvedValue({
        ...mockPrismaUser,
        firstName: 'Pierre',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      const dto = { firstName: 'Pierre', password: 'NewPassword123!' };
      const result = await service.update('usr-123', dto);

      expect(repository.update).toHaveBeenCalledWith('usr-123', {
        firstName: 'Pierre',
        password: 'newHashedPassword',
      });
      expect(result.firstName).toBe('Pierre');
    });

    it("doit lever NotFoundException si l'utilisateur à modifier n'existe pas", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('unknown', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it("doit appeler softDelete du repository si l'utilisateur existe", async () => {
      repository.findById.mockResolvedValue(mockPrismaUser);
      repository.softDelete.mockResolvedValue(undefined);

      await service.softDelete('usr-123');

      expect(repository.softDelete).toHaveBeenCalledWith('usr-123');
    });

    it("doit lever NotFoundException si l'utilisateur n'existe pas", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.softDelete('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStatistics', () => {
    it('doit appeler getStatistics du repository et retourner les métriques', async () => {
      const byRole = Object.values(UserRole).reduce<Record<UserRole, number>>(
        (acc, role, index) => {
          acc[role] = index + 1;
          return acc;
        },
        {} as Record<UserRole, number>,
      );

      const mockStats = {
        totalUsers: 20,
        activeUsers: 18,
        inactiveUsers: 2,
        byRole,
        recentRegistrationsLast30Days: 4,
      };

      repository.getStatistics.mockResolvedValue(mockStats);

      const result = await service.getStatistics({
        startDate: '2026-01-01',
        endDate: '2026-06-30',
      });

      expect(result).toEqual(mockStats);
      expect(repository.getStatistics).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
      );
    });
  });

  describe('uploadAvatar', () => {
    it('doit lever BadRequestException si aucun fichier n’est transmis', async () => {
      await expect(service.uploadAvatar('usr-123', undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('doit lever NotFoundException si l’utilisateur n’existe pas', async () => {
      repository.findById.mockResolvedValue(null);
      const mockFile = {
        filename: 'avatar-123.jpg',
        path: '/tmp/avatar-123.jpg',
      } as Express.Multer.File;

      await expect(service.uploadAvatar('unknown', mockFile)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('doit mettre à jour l’avatarUrl et retourner l’utilisateur', async () => {
      repository.findById.mockResolvedValue(mockPrismaUser);
      const updatedPrismaUser = {
        ...mockPrismaUser,
        avatarUrl: '/uploads/users/usr-123/profile/avatar-123.jpg',
      };
      repository.update.mockResolvedValue(updatedPrismaUser);

      const mockFile = {
        filename: 'avatar-123.jpg',
        path: '/uploads/users/usr-123/profile/avatar-123.jpg',
      } as Express.Multer.File;

      const result = await service.uploadAvatar('usr-123', mockFile);

      expect(result.avatarUrl).toBe(
        '/uploads/users/usr-123/profile/avatar-123.jpg',
      );
      expect(repository.update).toHaveBeenCalledWith('usr-123', {
        avatarUrl: '/uploads/users/usr-123/profile/avatar-123.jpg',
      });
    });
  });

  describe('removeAvatar', () => {
    it('doit lever NotFoundException si l’utilisateur n’existe pas', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.removeAvatar('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('doit supprimer l’avatar et remettre avatarUrl à null', async () => {
      const userWithAvatar = {
        ...mockPrismaUser,
        avatarUrl: '/uploads/users/usr-123/profile/avatar-old.jpg',
      };
      repository.findById.mockResolvedValue(userWithAvatar);
      repository.update.mockResolvedValue({
        ...userWithAvatar,
        avatarUrl: null,
      });

      const result = await service.removeAvatar('usr-123');

      expect(result.avatarUrl).toBeNull();
      expect(repository.update).toHaveBeenCalledWith('usr-123', {
        avatarUrl: null,
      });
    });
  });
});
