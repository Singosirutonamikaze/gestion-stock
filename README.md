# gestion-stock

Application de gestion de stock composee d'une API REST NestJS et d'une interface Next.js.

---

## structure du depot

```
gestion-stock/
├── client/          interface Next.js 16 (App Router)
├── server/          API NestJS 11 + Prisma 7 + PostgreSQL
└── .github/         workflows CI et dependabot
```

---

## prerequis

| outil      | version minimale |
|------------|-----------------|
| Node.js    | 22              |
| npm        | 10              |
| Yarn       | 4 (server)      |
| Docker     | 24              |

---

## demarrage rapide

### base de donnees (docker)

```bash
# depuis server/
yarn docker:up
```

### serveur (NestJS)

```bash
cd server
yarn install
cp .env.example .env   # renseigner les variables
yarn start:dev
```

L'API ecoute sur `http://localhost:3000` par defaut.  
La documentation Swagger est accessible sur `http://localhost:3000/api`.

### client (Next.js)

```bash
cd client
npm install
cp .env.local.example .env.local   # renseigner les variables
npm run dev
```

L'interface est accessible sur `http://localhost:3001` par defaut.

---

## documentation detaillee

La documentation technique est centralisee dans [`server/docs/`](./server/docs/).

| document                                                          | contenu                           |
|-------------------------------------------------------------------|-----------------------------------|
| [modele-de-donnees.md](./server/docs/modele-de-donnees.md)        | entites, champs, relations        |
| [roles-et-permissions.md](./server/docs/roles-et-permissions.md)  | roles et matrice de permissions   |
| [architecture.md](./server/docs/architectures/architecture.md)    | choix techniques, structure       |
| [packages.md](./server/docs/packages/packages.md)                 | dependances et justifications     |
| [taches/](./server/docs/taches/)                                  | phases de developpement           |

---

## branches git

| branche             | role                                    |
|---------------------|-----------------------------------------|
| `main`              | branche principale, code stable         |
| `develop-client`    | integration continue du client          |
| `develop-server`    | integration continue du serveur         |
| `production-client` | deploiement production du client        |
| `production-server` | deploiement production du serveur       |

---

## licence

Projet prive — tous droits reserves.
