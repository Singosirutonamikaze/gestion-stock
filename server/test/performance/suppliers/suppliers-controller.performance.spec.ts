import { performance } from 'node:perf_hooks';
import { SuppliersController } from '../../../src/modules/suppliers/controllers/suppliers-controller/suppliers.controller';
import { SuppliersService } from '../../../src/modules/suppliers/services/suppliers-service';

describe('SuppliersController performance', () => {
  it('exécute 1000 appels findAll sans dépasser 250 ms', async () => {
    const findAll = jest
      .fn()
      .mockResolvedValue([]) as jest.MockedFunction<SuppliersService['findAll']>;
    const controller = new SuppliersController({ findAll } as SuppliersService);
    const start = performance.now();

    for (let index = 0; index < 1000; index += 1) {
      await controller.findAll(false);
    }

    expect(findAll).toHaveBeenCalledTimes(1000);
    expect(performance.now() - start).toBeLessThan(250);
  });
});
