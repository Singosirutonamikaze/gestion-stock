import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole, OPERATION } from '../../../shared/enums/user-role-enum';
import { Permission, RESOURCE } from '../../../shared/constants';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new RolesGuard(mockReflector as unknown as Reflector);
  });

  const createMockContext = (user?: { role: UserRole }): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('doit etre instancie', () => {
    expect(guard).toBeDefined();
  });

  it('doit autoriser l\'acces aux routes publiques sans restriction', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('doit autoriser ADMINISTRATOR quand le role ADMINISTRATOR est requis', () => {
    mockReflector.getAllAndOverride
      .mockReturnValueOnce([UserRole.ADMINISTRATOR])
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);

    const context = createMockContext({ role: UserRole.ADMINISTRATOR });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('doit refuser SALES quand le role ADMINISTRATOR est requis', () => {
    mockReflector.getAllAndOverride
      .mockReturnValueOnce([UserRole.ADMINISTRATOR])
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);

    const context = createMockContext({ role: UserRole.SALES });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('doit autoriser MANAGER pour la permission PRODUCTS_CREATE', () => {
    mockReflector.getAllAndOverride
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce([Permission.PRODUCTS_CREATE])
      .mockReturnValueOnce(undefined);

    const context = createMockContext({ role: UserRole.MANAGER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('doit autoriser un acces par couple Ressource et Operation (ex: STOCK + MOVE)', () => {
    mockReflector.getAllAndOverride
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce({ resource: RESOURCE.STOCK, operation: OPERATION.MOVE });

    const context = createMockContext({ role: UserRole.STOCK_KEEPER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('doit refuser un acces par couple Ressource et Operation si le role ne l\'a pas', () => {
    mockReflector.getAllAndOverride
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce({ resource: RESOURCE.USERS, operation: OPERATION.RESTORE });

    const context = createMockContext({ role: UserRole.SALES });
    expect(guard.canActivate(context)).toBe(false);
  });
});
