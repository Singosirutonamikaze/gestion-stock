# phase-8 : qualite et integration continue

Cette phase garantit la fiabilite du code via les tests et la CI.

---

## taches

### 1. couverture de tests unitaires par module

Objectif de couverture : **>= 80%** sur chaque module metier.

Modules a couvrir :

| module           | fichier de spec cible                              |
|------------------|----------------------------------------------------|
| `auth`           | `auth.service.spec.ts`                             |
| `users`          | `users.service.spec.ts`                            |
| `categories`     | `categories.service.spec.ts`                       |
| `suppliers`      | `suppliers.service.spec.ts`                        |
| `warehouses`     | `warehouses.service.spec.ts`                       |
| `products`       | `products.service.spec.ts`                         |
| `stock`          | `stock.service.spec.ts`                            |
| `stock-movements`| `stock-movements.service.spec.ts`                  |
| `orders`         | `orders.service.spec.ts`                           |
| `reports`        | `reports.service.spec.ts`                          |

Commande de couverture :

```bash
yarn test:cov
```

### 2. tests de bout en bout sur les parcours critiques

Parcours a couvrir dans `test/` :

| parcours                             | description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| authentification                     | connexion, jeton invalide, acces non autorise                  |
| cycle de vie d'un produit            | creation, lecture, modification, desactivation                 |
| cycle de vie d'un achat              | `DRAFT -> CONFIRMED -> RECEIVED`, verification des mouvements  |
| cycle de vie d'une vente             | `DRAFT -> CONFIRMED -> SHIPPED`, verification du stock         |
| rupture de stock                     | vente bloquee si stock insuffisant                             |
| mouvement de transfert               | decrement et increment corrects sur les deux entrepots         |

Commande :

```bash
yarn test:e2e
```

### 3. pipeline CI sur chaque pull request

Le workflow GitHub Actions (`.github/workflows/`) doit :

1. installer les dependances (`yarn install`)
2. verifier le build (`yarn build`)
3. lancer le linting (`yarn lint`)
4. lancer les tests unitaires (`yarn test`)
5. lancer les tests e2e (`yarn test:e2e`) sur une base PostgreSQL de test (service GitHub Actions)

Le workflow se declenche sur chaque pull request vers `main` et `develop-server`.

### 4. linting sans erreur

Aucune erreur ESLint ne doit subsister dans `src/` ni dans `test/`.

Commande locale :

```bash
yarn lint
```

Regles actives : configuration NestJS + Prettier.  
Le formatage automatique peut etre applique avec :

```bash
yarn format
```

---

## criteres de validation

- `yarn test:cov` affiche une couverture >= 80% par module metier
- `yarn test:e2e` passe sur les parcours critiques
- La pipeline CI passe sur une pull request de test vers `main` et `develop-server`
- `yarn lint` ne retourne aucune erreur
- `yarn build` produit un artefact sans erreur TypeScript
