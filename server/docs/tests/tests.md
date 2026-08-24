# strategie de tests — server

Ce document decrit la strategie de test pour l'API NestJS (`server/`).

---

## 1. types de tests

### tests unitaires (`*.spec.ts`)
- **Emplacement** : a cote des fichiers source testés dans `src/`
- **Objectif** : tester la logique metier isolee des services, des mappers et des utilitaires
- **Mocks** : tous les acces a la base de donnees via `PrismaService` ou repositories sont mockes avec NestJS Testing Module & Jest (`jest.fn()`)
- **Execution** :
  ```bash
  yarn test
  yarn test:watch # mode watch
  yarn test:cov   # couverture de code
  ```

### tests de bout en bout / e2e (`*.e2e-spec.ts`)
- **Emplacement** : dossier `test/`
- **Objectif** : valider le fonctionnement global de l'API (requetes HTTP -> Guard -> Controller -> Service -> Database -> Response)
- **Base de donnees** : s'exécute sur une base de données PostgreSQL de test isolee
- **Execution** :
  ```bash
  yarn test:e2e
  ```

---

## 2. objectifs de couverture

- **Couverture globale minimale** : 80% sur les modules metier (`src/modules/`)
- **Couverture obligatoire** :
  - Services d'authentification et de gestion des roles
  - Calculs de stock et transactions de mouvements (`StockMovementsService`)
  - Logique de transition de statut des commandes (`OrdersService`)

---

## 3. execution et integration continue

Les tests unitaires et e2e sont exécutes automatiquement par GitHub Actions sur chaque pull request vers `main` et `develop-server`.
