# guide de contribution — server

Ce document définit les normes et processus de contribution pour le projet `server/` (API NestJS).

---

## 1. workflow git & branches

Le dépot suit une strategie de nommage stricte pour les branches :

| Branche | Rôle |
|---|---|
| `main` | Production / Code stable et teste |
| `develop-server` | Integration continue pour le backend |
| `feature/<nom>` | Nouvelle fonctionnalite backend |
| `fix/<nom>` | Correction de bug backend |

Toute modification doit passer par une Pull Request (PR) vers `develop-server`.

---

## 2. normes de code & linting

- **Linter & Formateur** : ESLint + Prettier
- **Verification avant commit** :
  ```bash
  yarn lint
  yarn format
  ```
- Aucune erreur de linting ou de compilation TypeScript (`yarn build`) n'est autorisee.

---

## 3. processus de pull request

1. Creer une branche depuis `develop-server` (`git checkout -b feature/nom-feature`)
2. Completer les taches et ecrire les tests unitaires / e2e correspondants
3. S'assurer que `yarn test` et `yarn lint` passent sans erreur
4. Ouvrir une PR vers `develop-server`
5. La CI (GitHub Actions) doit valider la PR avant le merge
