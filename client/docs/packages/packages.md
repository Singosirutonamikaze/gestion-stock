# packages — client

Ce document liste les dependances de l'application Next.js et justifie leur presence.

Gestionnaire de paquets : **npm**

---

## dependances de production

| paquet       | version  | role                                        |
|--------------|----------|---------------------------------------------|
| `next`       | 16.2.12  | framework React avec App Router et rendu serveur |
| `react`      | 19.2.4   | bibliotheque d'interface utilisateur        |
| `react-dom`  | 19.2.4   | rendu React dans le DOM du navigateur       |

---

## dependances de developpement

| paquet                   | version | role                                              |
|--------------------------|---------|---------------------------------------------------|
| `typescript`             | ^5      | langage de compilation, typage statique           |
| `tailwindcss`            | ^4      | framework CSS utilitaire, styles de l'interface   |
| `@tailwindcss/postcss`   | ^4      | integration PostCSS requise par Tailwind v4       |
| `eslint`                 | ^9      | linteur, detection des erreurs de code            |
| `eslint-config-next`     | 16.2.12 | regles ESLint recommandees par l'equipe Next.js   |
| `@types/node`            | ^20     | types TypeScript pour Node.js                     |
| `@types/react`           | ^19     | types TypeScript pour React 19                    |
| `@types/react-dom`       | ^19     | types TypeScript pour ReactDOM 19                 |

---

## dependances detectees dans le projet

Ces paquets sont presents dans `node_modules` et utilises dans le code :

| paquet                 | role                                                    |
|------------------------|---------------------------------------------------------|
| `zod`                  | validation des schemas de formulaire (schemas/)         |
| `zod-validation-error` | messages d'erreur lisibles depuis les erreurs Zod       |

> Si ces paquets ne sont pas encore declares dans `package.json`, les ajouter avec :
> ```bash
> npm install zod zod-validation-error
> ```
