import { performance } from 'node:perf_hooks';
import { WarehousesController } from '../../../src/modules/warehouses/controllers/warehouses-controller/warehouses.controller';
import { WarehousesService } from '../../../src/modules/warehouses/services/warehouses-service';

describe('WarehousesController performance', () => {
  it('exécute 1000 appels findAll sans dépasser 250 ms', async () => {
    const findAll = jest
      .fn()
      .mockResolvedValue([]) as jest.MockedFunction<WarehousesService['findAll']>;
    const controller = new WarehousesController({ findAll } as WarehousesService);
    const start = performance.now();

    for (let index = 0; index < 1000; index += 1) {
      await controller.findAll(false);
    }

    expect(findAll).toHaveBeenCalledTimes(1000);
    expect(performance.now() - start).toBeLessThan(250);
  });
});
