import { performance } from 'node:perf_hooks';
import { AuthController } from '../../../src/modules/auth/controllers/auth.controller';
import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';

describe('AuthController performance', () => {
  it('exécute 1000 appels login sans dépasser 250 ms', async () => {
    const login = jest.fn<AuthService['login']>().mockResolvedValue(
      undefined as never,
    );
    const controller = new AuthController({ login } as AuthService);
    const credentials: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };
    const start = performance.now();

    for (let index = 0; index < 1000; index += 1) {
      await controller.login(credentials);
    }

    expect(login).toHaveBeenCalledTimes(1000);
    expect(performance.now() - start).toBeLessThan(250);
  });
});
