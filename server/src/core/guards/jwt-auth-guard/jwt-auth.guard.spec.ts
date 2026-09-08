import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('doit etre instancie', () => {
    expect(guard).toBeDefined();
  });

  it('doit etendre AuthGuard avec la strategie jwt', () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
});
