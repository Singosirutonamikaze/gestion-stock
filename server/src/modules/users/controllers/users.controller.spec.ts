import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { UserResponseDto } from '../dto/user-response.dto';
import { Paginated } from '../../../shared/types/paginated.type';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUserResponse: UserResponseDto = {
    id: 'usr-123',
    email: 'jean.dupont@test.com',
    firstName: 'Jean',
    lastName: 'Dupont',
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
    it('doit retourner les détails d\'un utilisateur', async () => {
      service.findById.mockResolvedValue(mockUserResponse);

      const result = await controller.findById('usr-123');

      expect(result).toEqual(mockUserResponse);
      expect(service.findById).toHaveBeenCalledWith('usr-123');
    });
  });

  describe('create', () => {
    it('doit créer un utilisateur et retourner la réponse', async () => {
      const createDto = {
        email: 'jean.dupont@test.com',
        password: 'Password123!',
        firstName: 'Jean',
        lastName: 'Dupont',
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
      service.softDelete.mockResolvedValue();

      await controller.softDelete('usr-123');

      expect(service.softDelete).toHaveBeenCalledWith('usr-123');
    });
  });
});
