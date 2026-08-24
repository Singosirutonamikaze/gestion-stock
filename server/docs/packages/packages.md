# packages

Ce document liste les dependances principales des deux applications et justifie leur presence.

---

## serveur (`server/`)

Gestionnaire de paquets : **Yarn 4**

### dependances de production

| paquet                        | version   | role                                              |
|-------------------------------|-----------|---------------------------------------------------|
| `@nestjs/common`              | ^11       | decorateurs, modules, pipes, guards, intercepteurs |
| `@nestjs/core`                | ^11       | noyau du framework NestJS                         |
| `@nestjs/platform-express`    | ^11       | adaptateur HTTP (Express)                         |
| `@nestjs/config`              | ^4        | gestion des variables d'environnement             |
| `@nestjs/swagger`             | ^11       | generation automatique de la documentation OpenAPI |
| `@prisma/client`              | 7.9.1     | client Prisma genere, acces a la base de donnees  |
| `prisma`                      | 7.9.1     | CLI Prisma, migrations, generation du client      |
| `joi`                         | ^18       | validation du schema des variables d'environnement |
| `rxjs`                        | ^7        | programmation reactive, requis par NestJS         |
| `reflect-metadata`            | ^0.2      | metadata TypeScript, requis par NestJS            |
| `picocolors`                  | ^1        | couleurs dans le terminal (banniere de demarrage) |

### dependances de developpement

| paquet                | version | role                                            |
|-----------------------|---------|-------------------------------------------------|
| `@nestjs/cli`         | ^11     | generateur de code NestJS                       |
| `@nestjs/testing`     | ^11     | utilitaires de test pour les modules NestJS     |
| `@nestjs/schematics`  | ^11     | schematics pour le CLI NestJS                   |
| `@prisma/adapter-pg`  | ^7      | adaptateur natif PostgreSQL pour Prisma         |
| `pg`                  | ^8      | driver PostgreSQL natif                         |
| `jest`                | ^30     | runner de tests unitaires et d'integration      |
| `ts-jest`             | ^29     | transformation TypeScript pour Jest             |
| `supertest`           | ^7      | tests HTTP de bout en bout                      |
| `typescript`          | ^5      | langage de compilation                          |
| `ts-node`             | ^10     | execution TypeScript directe (seed, scripts)    |
| `tsconfig-paths`      | ^4      | resolution des alias de chemins TypeScript      |
| `eslint`              | ^9      | linteur                                         |
| `prettier`            | ^3      | formateur de code                               |

---

## client (`client/`)

Gestionnaire de paquets : **npm**

### dependances de production

| paquet       | version  | role                                        |
|--------------|----------|---------------------------------------------|
| `next`       | 16.2.12  | framework React avec App Router et SSR      |
| `react`      | 19.2.4   | bibliotheque d'interface utilisateur        |
| `react-dom`  | 19.2.4   | rendu React dans le DOM                     |

### dependances de developpement

| paquet                   | version | role                                    |
|--------------------------|---------|-----------------------------------------|
| `typescript`             | ^5      | langage de compilation                  |
| `tailwindcss`            | ^4      | framework CSS utilitaire                |
| `@tailwindcss/postcss`   | ^4      | integration PostCSS pour Tailwind v4    |
| `eslint`                 | ^9      | linteur                                 |
| `eslint-config-next`     | 16.2.12 | configuration ESLint recommandee Next   |
| `@types/node`            | ^20     | types TypeScript pour Node.js           |
| `@types/react`           | ^19     | types TypeScript pour React             |
| `@types/react-dom`       | ^19     | types TypeScript pour ReactDOM          |
