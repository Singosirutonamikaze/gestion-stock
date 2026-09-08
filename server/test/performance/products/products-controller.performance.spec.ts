import { performance } from 'node:perf_hooks';
import { ProductsController } from '../../../src/modules/products/controllers/products-controller/products.controller';
import { ProductsService } from '../../../src/modules/products/services/products-service';
import { ProductQueryDto } from '../../../src/modules/products/dto/product-query-dto';

describe('ProductsController performance', () => {
  it('exécute 1000 appels findAll sans dépasser 250 ms', async () => {
    const findAll = jest
      .fn()
      .mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }) as jest.MockedFunction<ProductsService['findAll']>;
    const controller = new ProductsController({ findAll } as ProductsService);
    const query: ProductQueryDto = { page: 1, limit: 20 };
    const start = performance.now();

    for (let index = 0; index < 1000; index += 1) {
      await controller.findAll(query);
    }

    expect(findAll).toHaveBeenCalledTimes(1000);
    expect(performance.now() - start).toBeLessThan(250);
  });
});
