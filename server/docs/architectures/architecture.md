# architecture

Ce document decrit les choix techniques et la structure des deux applications.

---

## vue d'ensemble

```
gestion-stock/
├── client/    Next.js 16 — interface utilisateur (App Router)
└── server/    NestJS 11  — API REST + base de donnees
```

Les deux applications sont independantes et communiquent uniquement via HTTP.  
Le client appelle l'API via un proxy configure dans `client/proxy.ts`.

---

## serveur (NestJS)

### structure de `server/src/`

```
src/
├── main.ts                 point d'entree, configuration du serveur HTTP
├── app.module.ts           module racine
├── app.controller.ts       route de sante basique
├── app.service.ts
│
├── core/                   infrastructure transversale, chargee au demarrage
│   ├── config/             module de configuration (variables d'environnement)
│   │   ├── config-module/
│   │   ├── config-service/
│   │   └── validation-schema/
│   ├── database/           service Prisma et connexion a la base
│   ├── filters/            filtres d'exception HTTP et Prisma
│   ├── guards/             garde JWT
│   ├── health/             endpoint /health
│   ├── interceptors/       journalisation et transformation de reponse
│   ├── logger/             journalisation structuree
│   ├── pipes/              pipe de validation global
│   └── swagger/            configuration de la documentation OpenAPI
│
├── shared/                 code reutilisable entre modules
│   ├── constants/
│   ├── decorators/
│   ├── dto/
│   ├── enums/
│   ├── exceptions/         exceptions metier (StockInsuffisantException, etc.)
│   ├── interfaces/
│   └── utils/
│
└── modules/                fonctionnalites metier, un dossier par domaine
    ├── auth/
    │   ├── controllers/
    │   ├── dto/
    │   ├── services/
    │   └── strategies/
    ├── users/
    ├── categories/
    ├── suppliers/
    ├── warehouses/
    ├── products/
    │   ├── controllers/
    │   ├── dto/
    │   ├── entities/
    │   ├── mappers/
    │   ├── repositories/
    │   └── services/
    ├── stock/
    ├── stock-movements/
    ├── orders/
    └── reports/
```

### conventions d'un module metier

Chaque module suit le meme decoupage interne :

| dossier         | role                                                          |
|-----------------|---------------------------------------------------------------|
| `controllers/`  | reception des requetes HTTP, validation d'entree via DTO      |
| `dto/`          | objets de transfert de donnees (entree et sortie)             |
| `services/`     | logique metier, orchestration                                 |
| `repositories/` | couche d'acces aux donnees via Prisma                         |
| `entities/`     | types internes representant les agregats metier               |
| `mappers/`      | conversion entre entites Prisma et entites metier             |

### base de donnees

- **PostgreSQL** comme base relationnelle
- **Prisma 7** comme ORM et outil de migration
- Le schema source est `server/prisma/schema.prisma`
- Les migrations sont versionnees dans `server/prisma/migrations/`
- Un script `server/prisma/seed.ts` cree un administrateur par defaut et des produits de test

### authentification

- Authentification par **JSON Web Token (JWT)**
- Le jeton est signe avec une cle secrete definie dans les variables d'environnement
- Chaque requete protegee doit inclure un en-tete `Authorization: Bearer <token>`
- Le role est encode dans le payload du jeton et verifie par le `RolesGuard`

### documentation de l'API

- **Swagger / OpenAPI** genere automatiquement depuis les decorateurs NestJS
- Accessible sur `http://localhost:<PORT>/api` en mode developpement

---

## client (Next.js)

### structure de `client/`

```
client/
├── app/                          routage (App Router)
│   ├── layout.tsx                layout racine
│   ├── page.tsx                  page d'accueil / redirection
│   ├── (auth)/                   groupe de routes publiques (connexion)
│   └── (protected)/              groupe de routes protegees par role
│       ├── layout.tsx            layout commun (sidebar, topbar)
│       ├── admin/                pages accessibles a ADMIN
│       │   ├── dashboard/
│       │   ├── users/
│       │   ├── products/
│       │   ├── categories/
│       │   ├── suppliers/
│       │   ├── warehouses/
│       │   ├── stock/
│       │   ├── stock-movements/
│       │   ├── orders/
│       │   └── reports/
│       ├── manager/
│       ├── sales/
│       └── stock-keeper/
│
├── features/                     logique par domaine metier
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── index.ts
│   ├── products/
│   ├── categories/
│   ├── suppliers/
│   ├── warehouses/
│   ├── stock/
│   ├── stock-movements/
│   ├── orders/
│   ├── reports/
│   ├── users/
│   └── dashboard/
│
├── components/                   composants partages entre features
│   ├── layout/
│   │   ├── sidebar/
│   │   ├── topbar/
│   │   ├── role-gate/
│   │   └── protected-nav-link/
│   ├── data-table/
│   │   ├── data-table/
│   │   └── data-table-pagination/
│   ├── forms/
│   └── ui/
│
├── hooks/                        hooks globaux partages
│   ├── current/
│   ├── debounce/
│   └── toast/
│
├── lib/                          utilitaires et configuration globale
│   ├── api/
│   ├── auth/
│   ├── constants/
│   └── utils/
│
└── types/                        types TypeScript globaux
    ├── api/
    └── enums/
```

### conventions d'une feature

Chaque dossier dans `features/` suit la meme structure :

| dossier       | role                                                    |
|---------------|---------------------------------------------------------|
| `api/`        | fonctions d'appel HTTP vers l'API (fetch, axios, etc.)  |
| `components/` | composants React specifiques a cette feature            |
| `hooks/`      | hooks React specifiques a cette feature                 |
| `schemas/`    | schemas de validation Zod des formulaires               |
| `types/`      | types TypeScript specifiques a cette feature            |
| `index.ts`    | exports publics de la feature                           |

### gestion des routes protegees

- Le groupe `(protected)` est protege par un middleware d'authentification
- Le composant `RoleGate` masque les elements d'interface selon le role
- Le composant `ProtectedNavLink` gere la navigation conditionnelle

---

## infrastructure

### Docker (developpement local)

```
server/docker/docker-compose.yml  PostgreSQL en local
```

Commandes disponibles depuis `server/` :

```bash
yarn docker:up    # demarrer la base
yarn docker:down  # arreter la base
yarn docker:logs  # suivre les logs
```

### CI (GitHub Actions)

Les workflows sont dans `.github/workflows/`.  
Un fichier `.github/dependabot.yml` gere les mises a jour automatiques des dependances.
