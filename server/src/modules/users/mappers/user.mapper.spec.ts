import { UserMapper } from './user.mapper';
import { UserRole } from '../../../shared/enums/user-role-enum';
import { User } from '@prisma/client';

describe('UserMapper', () => {
  it('doit correctement transformer un User Prisma en UserResponseDto sans le mot de passe', () => {
    const prismaUser: User = {
      id: 'usr-123',
      email: 'jean.dupont@test.com',
      password: 'hashedpassword123',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: null,
      avatarUrl: null,
      role: 'ADMINISTRATOR' as any,
      department: null,
      jobTitle: null,
      isActive: true,
      lastLoginAt: new Date('2026-08-25T10:00:00Z'),
      createdAt: new Date('2026-08-25T08:00:00Z'),
      updatedAt: new Date('2026-08-25T09:00:00Z'),
    };

    const dto = UserMapper.toResponseDto(prismaUser);

    expect(dto).toEqual({
      id: 'usr-123',
      email: 'jean.dupont@test.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      role: UserRole.ADMINISTRATOR,
      isActive: true,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });

    expect((dto as any).password).toBeUndefined();
  });
});
