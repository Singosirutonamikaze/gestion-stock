import { ResourceNotFoundException } from './resource-not-found.exception';
import { NotFoundException } from '@nestjs/common';

describe('ResourceNotFoundException', () => {
  it('doit etre une instance de NotFoundException', () => {
    const exception = new ResourceNotFoundException('Produit', 'abc-123');

    expect(exception).toBeInstanceOf(NotFoundException);
  });

  it('doit etre une instance de ResourceNotFoundException', () => {
    const exception = new ResourceNotFoundException('Produit', 'abc-123');

    expect(exception).toBeInstanceOf(ResourceNotFoundException);
  });

  it('doit avoir le statut HTTP 404', () => {
    const exception = new ResourceNotFoundException('Commande', '42');

    expect(exception.getStatus()).toBe(404);
  });

  it('doit inclure le nom de la ressource dans le message', () => {
    const exception = new ResourceNotFoundException('Entrepot', 'ent-001');

    expect(exception.message).toContain('Entrepot');
  });

  it('doit inclure l\'identifiant dans le message', () => {
    const exception = new ResourceNotFoundException('Produit', 'prod-xyz');

    expect(exception.message).toContain('prod-xyz');
  });

  it('doit inclure l\'identifiant numerique dans le message', () => {
    const exception = new ResourceNotFoundException('Utilisateur', 99);

    expect(exception.message).toContain('99');
  });

  it('doit inclure le nom de ressource Fournisseur dans le message', () => {
    const exception = new ResourceNotFoundException('Fournisseur', 'four-001');

    expect(exception.message).toContain('Fournisseur');
  });

  it('doit inclure le mot "introuvable" dans le message', () => {
    const exception = new ResourceNotFoundException('Categorie', 'cat-01');

    expect(exception.message).toContain('introuvable');
  });
});
