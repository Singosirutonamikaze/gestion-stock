import { performance } from 'node:perf_hooks';
import { UsersController } from '../../../src/modules/users/controllers/users.controller';
import { UsersService } from '../../../src/modules/users/services/users.service';
import { UserRole } from '../../../src/shared/enums/user-role-enum';

type UsersServiceMock = {
  findAll: jest.MockedFunction<UsersService['findAll']>;
  findById: jest.MockedFunction<UsersService['findById']>;
  create: jest.MockedFunction<UsersService['create']>;
  update: jest.MockedFunction<UsersService['update']>;
  softDelete: jest.MockedFunction<UsersService['softDelete']>;
  getStatistics: jest.MockedFunction<UsersService['getStatistics']>;
  uploadAvatar: jest.MockedFunction<UsersService['uploadAvatar']>;
  removeAvatar: jest.MockedFunction<UsersService['removeAvatar']>;
};

const createUsersServiceMock = (): UsersServiceMock => ({
  findAll: jest.fn().mockResolvedValue({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  }),
  findById: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  softDelete: jest.fn().mockResolvedValue(undefined),
  getStatistics: jest.fn().mockResolvedValue(undefined),
  uploadAvatar: jest.fn().mockResolvedValue(undefined),
  removeAvatar: jest.fn().mockResolvedValue(undefined),
});

describe('UsersController performance', () => {
  it('exécute 1000 appels findAll sans dépasser 250 ms', async () => {
    const service = createUsersServiceMock();
    const controller = new UsersController(service as unknown as UsersService);
    const start = performance.now();

    for (let index = 0; index < 1000; index += 1) {
      await controller.findAll({ page: 1, limit: 20 });
    }

    const elapsed = performance.now() - start;

    expect(service.findAll).toHaveBeenCalledTimes(1000);
    expect(elapsed).toBeLessThan(250);
  });

  it('exécute les opérations CRUD sans dépendre de la base de données', async () => {
    const service = createUsersServiceMock();
    const controller = new UsersController(service as unknown as UsersService);
    const start = performance.now();

    await controller.findById('usr-123');
    await controller.create({
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.SALES,
    });
    await controller.update('usr-123', { firstName: 'Updated' });
    await controller.softDelete('usr-123');

    const elapsed = performance.now() - start;

    expect(service.findById).toHaveBeenCalledWith('usr-123');
    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.update).toHaveBeenCalledWith('usr-123', {
      firstName: 'Updated',
    });
    expect(service.softDelete).toHaveBeenCalledWith('usr-123');
    expect(elapsed).toBeLessThan(100);
  });
});
