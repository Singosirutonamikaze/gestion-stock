import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { UserResponseDto } from '../dto/user-response.dto';
import { Paginated } from '../../../shared/types/paginated.type';

describe('UsersController', () => {
  let controller: UsersController;
  let service: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
    getStatistics: jest.Mock;
    uploadAvatar: jest.Mock;
    removeAvatar: jest.Mock;
  };

  const mockUserResponse: UserResponseDto = {
    id: 'usr-123',
    email: 'kodjo.koffie@test.com',
    firstName: 'Kodjo',
    lastName: 'Koffie',
    role: UserRole.ADMINISTRATOR,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      getStatistics: jest.fn(),
      uploadAvatar: jest.fn(),
      removeAvatar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner la liste paginée transmise par le service', async () => {
      const paginatedResult: Paginated<UserResponseDto> = {
        data: [mockUserResponse],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      service.findAll.mockResolvedValue(paginatedResult);

      const query = { page: 1, limit: 20 };
      const result = await controller.findAll(query);

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findById', () => {
    it("doit retourner les détails d'un utilisateur", async () => {
      service.findById.mockResolvedValue(mockUserResponse);

      const result = await controller.findById('usr-123');

      expect(result).toEqual(mockUserResponse);
      expect(service.findById).toHaveBeenCalledWith('usr-123');
    });
  });

  describe('create', () => {
    it('doit créer un utilisateur et retourner la réponse', async () => {
      const createDto = {
        email: 'kodjo.koffie@test.com',
        password: 'Password123!',
        firstName: 'Kodjo',
        lastName: 'Koffie',
        role: UserRole.ADMINISTRATOR,
      };

      service.create.mockResolvedValue(mockUserResponse);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockUserResponse);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('doit mettre à jour un utilisateur', async () => {
      const updateDto = { firstName: 'Pierre' };
      const updatedUser = { ...mockUserResponse, firstName: 'Pierre' };

      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update('usr-123', updateDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('usr-123', updateDto);
    });
  });

  describe('softDelete', () => {
    it('doit appeler softDelete du service', async () => {
      service.softDelete.mockResolvedValue(undefined);

      await controller.softDelete('usr-123');

      expect(service.softDelete).toHaveBeenCalledWith('usr-123');
    });
  });

  describe('getStatistics', () => {
    it('doit retourner les statistiques consolidées', async () => {
      const byRole = Object.values(UserRole).reduce<Record<UserRole, number>>(
        (acc, role, index) => {
          acc[role] = index + 1;
          return acc;
        },
        {} as Record<UserRole, number>,
      );

      const mockStats = {
        totalUsers: 10,
        activeUsers: 9,
        inactiveUsers: 1,
        byRole,
        recentRegistrationsLast30Days: 2,
      };

      service.getStatistics.mockResolvedValue(mockStats);

      const query = { startDate: '2026-01-01', endDate: '2026-06-30' };
      const result = await controller.getStatistics(query);

      expect(result).toEqual(mockStats);
      expect(service.getStatistics).toHaveBeenCalledWith(query);
    });
  });

  describe('uploadAvatar', () => {
    it('doit appeler uploadAvatar du service et retourner la réponse', async () => {
      const mockFile = {
        filename: 'avatar-123.jpg',
      } as Express.Multer.File;
      const updatedUser = {
        ...mockUserResponse,
        avatarUrl: '/uploads/users/usr-123/profile/avatar-123.jpg',
      };
      service.uploadAvatar.mockResolvedValue(updatedUser);

      const result = await controller.uploadAvatar('usr-123', mockFile);

      expect(result).toEqual(updatedUser);
      expect(service.uploadAvatar).toHaveBeenCalledWith('usr-123', mockFile);
    });
  });

  describe('removeAvatar', () => {
    it('doit appeler removeAvatar du service et retourner la réponse', async () => {
      const updatedUser = { ...mockUserResponse, avatarUrl: null };
      service.removeAvatar.mockResolvedValue(updatedUser);

      const result = await controller.removeAvatar('usr-123');

      expect(result).toEqual(updatedUser);
      expect(service.removeAvatar).toHaveBeenCalledWith('usr-123');
    });
  });
});
