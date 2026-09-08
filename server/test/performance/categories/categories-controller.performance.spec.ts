import { performance } from 'node:perf_hooks';
import { CategoriesController } from '../../../src/modules/categories/controllers/categories-controller/categories.controller';
import { CategoriesService } from '../../../src/modules/categories/services/categories-service';

describe('CategoriesController performance', () => {
  it('exécute 1000 appels findAll sans dépasser 250 ms', async () => {
    const findAll = jest
      .fn()
      .mockResolvedValue([]) as jest.MockedFunction<CategoriesService['findAll']>;
    const controller = new CategoriesController({ findAll } as CategoriesService);
    const start = performance.now();

    for (let index = 0; index < 1000; index += 1) {
      await controller.findAll(false);
    }

    expect(findAll).toHaveBeenCalledTimes(1000);
    expect(performance.now() - start).toBeLessThan(250);
  });
});
