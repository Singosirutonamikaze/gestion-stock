import { PaginationUtil } from './pagination.util';

describe('PaginationUtil', () => {
  describe('calculateTotalPages', () => {
    it('doit calculer correctement le nombre total de pages', () => {
      expect(PaginationUtil.calculateTotalPages(100, 20)).toBe(5);
      expect(PaginationUtil.calculateTotalPages(95, 20)).toBe(5);
      expect(PaginationUtil.calculateTotalPages(1, 20)).toBe(1);
    });

    it('doit retourner 0 si le total ou la limite est <= 0', () => {
      expect(PaginationUtil.calculateTotalPages(0, 20)).toBe(0);
      expect(PaginationUtil.calculateTotalPages(-5, 20)).toBe(0);
      expect(PaginationUtil.calculateTotalPages(10, 0)).toBe(0);
      expect(PaginationUtil.calculateTotalPages(10, -5)).toBe(0);
    });
  });

  describe('getPaginationParams', () => {
    it('doit calculer skip et take avec les valeurs fournies', () => {
      const params = PaginationUtil.getPaginationParams({
        page: 3,
        limit: 15,
      });

      expect(params).toEqual({
        page: 3,
        limit: 15,
        skip: 30,
        take: 15,
      });
    });

    it('doit appliquer les valeurs par défaut si aucun paramètre fourni', () => {
      const params = PaginationUtil.getPaginationParams();

      expect(params).toEqual({
        page: 1,
        limit: 20,
        skip: 0,
        take: 20,
      });
    });

    it('doit contraindre les valeurs négatives ou nulles à 1 au minimum', () => {
      const params = PaginationUtil.getPaginationParams({
        page: -2,
        limit: 0,
      });

      expect(params.page).toBe(1);
      expect(params.limit).toBe(1);
      expect(params.skip).toBe(0);
      expect(params.take).toBe(1);
    });
  });

  describe('createPaginatedResult', () => {
    it('doit formater un résultat paginé standard', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const result = PaginationUtil.createPaginatedResult(items, 50, 2, 10);

      expect(result).toEqual({
        data: items,
        total: 50,
        page: 2,
        limit: 10,
        totalPages: 5,
      });
    });
  });
});
