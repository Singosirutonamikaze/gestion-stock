import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../../../core/database/prisma-service';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { UserQueryDto } from '../dto/user-query.dto';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'usr-1',
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: null,
    avatarUrl: null,
    role: UserRole.ADMINISTRATOR as any,
    department: null,
    jobTitle: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    prismaService = module.get(PrismaService);
  });

  it('doit être défini', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('doit retourner une liste d\'utilisateurs filtrée et paginée', async () => {
      const query: UserQueryDto = { page: 1, limit: 10, search: 'jean', role: UserRole.ADMINISTRATOR, isActive: true };
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([mockUser]);

      const result = await repository.findAll(query);

      expect(result).toEqual([mockUser]);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'jean', mode: 'insensitive' } },
            { firstName: { contains: 'jean', mode: 'insensitive' } },
            { lastName: { contains: 'jean', mode: 'insensitive' } },
          ],
          role: UserRole.ADMINISTRATOR,
          isActive: true,
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('count', () => {
    it('doit retourner le nombre total d\'utilisateurs selon les filtres', async () => {
      const query: UserQueryDto = { search: 'jean' };
      (prismaService.user.count as jest.Mock).mockResolvedValue(5);

      const result = await repository.count(query);

      expect(result).toBe(5);
      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'jean', mode: 'insensitive' } },
            { firstName: { contains: 'jean', mode: 'insensitive' } },
            { lastName: { contains: 'jean', mode: 'insensitive' } },
          ],
        },
      });
    });
  });

  describe('findById', () => {
    it('doit retourner l\'utilisateur correspondant à l\'ID', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findById('usr-1');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: 'usr-1' } });
    });

    it('doit retourner null si non trouvé', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('unknown');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('doit retourner l\'utilisateur correspondant à l\'email', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });
  });

  describe('create', () => {
    it('doit créer et retourner un nouvel utilisateur', async () => {
      const createData = {
        email: 'new@example.com',
        password: 'hashedpassword',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.SALES,
      };

      (prismaService.user.create as jest.Mock).mockResolvedValue({ ...mockUser, ...createData });

      const result = await repository.create(createData);

      expect(result.email).toBe('new@example.com');
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe('update', () => {
    it('doit mettre à jour l\'utilisateur', async () => {
      const updateData = { firstName: 'Updated' };
      (prismaService.user.update as jest.Mock).mockResolvedValue({ ...mockUser, firstName: 'Updated' });

      const result = await repository.update('usr-1', updateData);

      expect(result.firstName).toBe('Updated');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: updateData,
      });
    });
  });

  describe('softDelete', () => {
    it('doit passer isActive à false', async () => {
      (prismaService.user.update as jest.Mock).mockResolvedValue({ ...mockUser, isActive: false });

      await repository.softDelete('usr-1');

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: { isActive: false },
      });
    });
  });
});
