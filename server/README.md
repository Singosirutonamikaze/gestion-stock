# Gestion de Stock et Inventaire - API Backend

Auteur  : SINGO Yao Dieu Donne
Version : 0.0.1
Stack   : NestJS 11, Prisma 7, PostgreSQL 16, Docker, TypeScript 5

---

## Presentation du Projet

Ce projet constitue le backend complet d'un systeme de gestion de stock
et d'inventaire destine a un usage professionnel en entreprise.

Il a ete concu pour repondre aux besoins de tracabilite, de gestion
multi-entrepots, de suivi des mouvements de marchandises (entrees, sorties,
transferts et ajustements), et de traitement des commandes d'achat et de vente.

L'architecture suit les principes de separation des responsabilites (SRP),
de modularite et de maintenabilite, en s'appuyant sur les meilleures pratiques
du developpement backend avec NestJS et TypeScript strict.

Le systeme supporte plusieurs niveaux d'acces (RBAC) avec des roles
distincts : administrateur, manager, gestionnaire de stock et commercial.

---

## Architecture du Projet

```
server/
├── docker/
│   └── docker-compose.yml          # Services PostgreSQL 16 et pgAdmin 4
├── prisma/
│   └── schema.prisma               # Schema de base de donnees complet
├── src/
│   ├── core/                       # Couche infrastructure transversale
│   │   ├── config/                 # Chargement et validation des variables d'environnement
│   │   ├── database/               # Service Prisma et module de base de donnees
│   │   ├── filters/                # Filtres d'exception HTTP et Prisma
│   │   ├── guards/                 # Guards d'authentification JWT et de roles RBAC
│   │   ├── health/                 # Endpoint de verification de sante de l'API
│   │   ├── interceptors/           # Intercepteurs de logs et transformation des reponses
│   │   ├── logger/                 # Service de journalisation centralise
│   │   ├── pipes/                  # Pipe de validation stricte des donnees entrantes
│   │   └── swagger/                # Configuration de la documentation OpenAPI Swagger
│   ├── modules/                    # Modules metier de l'application
│   │   ├── auth/                   # Authentification, JWT, strategies Passport local et JWT
│   │   ├── users/                  # Gestion des utilisateurs et attribution des roles
│   │   ├── categories/             # Categories et sous-categories de produits (hierarchie)
│   │   ├── suppliers/              # Gestion du referentiel fournisseurs
│   │   ├── warehouses/             # Gestion des entrepots et sites de stockage
│   │   ├── products/               # Gestion du catalogue produits avec seuil d'alerte
│   │   ├── stock/                  # Niveaux de stock consolides par produit et entrepot
│   │   ├── stock-movements/        # Mouvements d'inventaire immuables (source de verite)
│   │   └── orders/                 # Commandes d'achat fournisseur et de vente client
│   └── shared/                     # Elements partages entre tous les modules
│       ├── exceptions/             # Exceptions metier personnalisees
│       └── utils/                  # Utilitaires de pagination et helpers generiques
├── .env                            # Variables d'environnement (confidentiel, non versionne)
├── .env.example                    # Modele de variables d'environnement a copier
├── .dockerignore                   # Fichiers exclus du contexte de build Docker
├── Dockerfile                      # Image Docker multi-stage securisee (USER node)
├── nest-cli.json                   # Configuration du compilateur NestJS avec plugin Swagger
├── tsconfig.json                   # Configuration TypeScript stricte (noImplicitAny, etc.)
├── eslint.config.mjs               # Regles ESLint (no-explicit-any error) et Prettier
├── SECURITY.md                     # Protocoles et politiques de securite du projet
└── docs/
    ├── DATABASE.md                 # Schema de base de donnees et conventions
    └── TASKS.md                    # Suivi des taches et avancement du projet
```

---

## Prerequis

- Node.js version 20 ou superieure (LTS recommande)
- Docker et Docker Compose installes sur la machine
- npm version 10 ou superieure
- PostgreSQL 16 (fourni automatiquement via Docker Compose)

---

## Installation et Demarrage

### Etape 1 : Acceder au dossier serveur

```bash
cd server
```

### Etape 2 : Configurer les variables d'environnement

Copier le fichier modele et renseigner vos valeurs specifiques :

```bash
cp .env.example .env
```

Ouvrir le fichier .env et renseigner les valeurs suivantes :
- DB_USER : votre identifiant PostgreSQL
- DB_PASSWORD : votre mot de passe PostgreSQL
- DB_NAME : nom de la base de donnees (ex: gestion_stock)
- JWT_SECRET : une chaine aleatoire d'au moins 64 caracteres pour la production

### Etape 3 : Demarrer la base de donnees PostgreSQL via Docker

```bash
npm run docker:up
```

Cette commande demarre en arriere-plan :
- Un conteneur PostgreSQL 16 Alpine sur le port 5432
- Un conteneur pgAdmin 4 (interface web) sur le port 5050

### Etape 4 : Installer les dependances et generer le client Prisma

```bash
npm install
npx prisma generate
```

La generation du client Prisma est obligatoire avant de lancer l'application.
Elle produit les types TypeScript correspondant a votre schema de base de donnees.

### Etape 5 : Appliquer les migrations de base de donnees

```bash
npx prisma migrate dev
```

Cette commande cree les tables et index dans votre base de donnees PostgreSQL
en appliquant le schema defini dans prisma/schema.prisma.

### Etape 6 : Lancer le serveur en mode developpement

```bash
npm run start:dev
```

Le serveur demarre avec le mode Watch activé (rechargement automatique).
Un bandeau de demarrage s'affiche dans le terminal avec les informations de connexion.

---

## Scripts Disponibles

| Commande              | Description                                                |
|-----------------------|------------------------------------------------------------|
| npm run start:dev     | Lancement en mode developpement avec rechargement auto     |
| npm run build         | Compilation TypeScript pour la production dans dist/       |
| npm run start:prod    | Demarrage du serveur compile (necessite npm run build)     |
| npm run lint          | Verification et correction automatique du style de code    |
| npm run test          | Execution de tous les tests unitaires Jest                 |
| npm run test:cov      | Tests unitaires avec rapport de couverture de code HTML    |
| npm run docker:up     | Demarrage des conteneurs Docker en arriere-plan            |
| npm run docker:down   | Arret et suppression des conteneurs Docker                 |
| npm run docker:logs   | Affichage en temps reel des logs des conteneurs Docker     |

---

## Acces aux Interfaces

- API Backend  : http://localhost:3000
- pgAdmin      : http://localhost:5050
  - Email        : admin@admin.com
  - Mot de passe : admin

---

## Documentation Technique

- Schema base de donnees  : docs/DATABASE.md
- Suivi des taches        : docs/TASKS.md
- Protocoles de securite  : SECURITY.md

---

## Licence

Projet prive - SINGO Yao Dieu Donne - Tous droits reserves


[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
