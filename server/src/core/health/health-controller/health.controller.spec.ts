import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('doit etre instancie', () => {
    expect(controller).toBeDefined();
  });

  it('doit renvoyer le champ status egal a "ok"', () => {
    const result = controller.checkHealth();

    expect(result.status).toBe('ok');
  });

  it('doit renvoyer un objet avec le champ timestamp', () => {
    const result = controller.checkHealth();

    expect(result).toHaveProperty('timestamp');
  });

  it('doit renvoyer un timestamp en format ISO 8601', () => {
    const result = controller.checkHealth();
    const date = new Date(result.timestamp);

    expect(date.toISOString()).toBe(result.timestamp);
  });

  it('doit renvoyer un timestamp recemment genere', () => {
    const avant = Date.now();
    const result = controller.checkHealth();
    const apres = Date.now();
    const ts = new Date(result.timestamp).getTime();

    expect(ts).toBeGreaterThanOrEqual(avant);
    expect(ts).toBeLessThanOrEqual(apres);
  });

  it('doit renvoyer exactement deux proprietes : status et timestamp', () => {
    const result = controller.checkHealth();

    expect(Object.keys(result)).toHaveLength(2);
  });
});
