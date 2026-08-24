# phase-9 : deploiement

Cette phase prepare l'application pour la production.

---

## taches

### 1. Dockerfile pour l'API

Chemin : `server/Dockerfile`

Utiliser un **build multi-etapes** :

```
stage build :
  - image node:22-alpine
  - installer les dependances (yarn install --frozen-lockfile)
  - compiler TypeScript (yarn build)
  - generer le client Prisma

stage production :
  - image node:22-alpine
  - copier uniquement dist/, node_modules/ de production et le schema Prisma
  - exposer le port defini par la variable PORT
  - commande de demarrage : node dist/main
```

L'image finale ne doit pas contenir les sources TypeScript ni les outils de developpement.

### 2. Docker Compose complet

Fichier : `server/docker/docker-compose.yml`

Le compose de production inclut :

| service    | image               | role                         |
|------------|---------------------|------------------------------|
| `api`      | image construite    | API NestJS                   |
| `postgres` | `postgres:17-alpine`| base de donnees PostgreSQL   |

Configuration :
- les deux services partagent un reseau interne prive
- la base de donnees utilise un volume nomme pour la persistance
- l'API attend que la base soit disponible avant de demarrer (`healthcheck`)
- les variables d'environnement sont injectees via un fichier `.env`

### 3. variables d'environnement de production

Documenter chaque variable dans `server/.env.example` :

| variable         | requis | valeur exemple            | description                                    |
|------------------|--------|---------------------------|------------------------------------------------|
| `NODE_ENV`       | oui    | `production`              | environnement d'execution                      |
| `PORT`           | non    | `3000`                    | port d'ecoute HTTP                             |
| `DATABASE_URL`   | oui    | `postgresql://user:pass@postgres:5432/gestion_stock` | chaine de connexion PostgreSQL |
| `JWT_SECRET`     | oui    | chaine aleatoire longue   | cle de signature des jetons JWT                |
| `JWT_EXPIRES_IN` | non    | `7d`                      | duree de vie des jetons JWT                    |

Le fichier `.env` reel ne doit jamais etre committe (verifie par `.gitignore`).

### 4. strategie de deploiement

Choisir et documenter la strategie de deploiement :

**Option A — VPS avec Docker Compose**
- Deploiement manuel ou via un script sur un serveur Linux
- Mise a jour : `docker compose pull && docker compose up -d`
- Adapte pour un projet interne ou de petite equipe

**Option B — Platform as a Service**
- Deploiement automatise depuis la branche `production-server`
- Services cibles possibles : Render, Railway, Fly.io
- Adapte pour reduire la charge operationnelle

**Option C — Kubernetes**
- Orchestration avancee, adapte si les besoins de montee en charge le justifient
- A privilegier uniquement si l'infrastructure le necessite

Documenter le choix retenu et les etapes de deploiement dans ce fichier une fois la decision prise.

---

## criteres de validation

- `docker build -t gestion-stock-api .` s'execute sans erreur dans `server/`
- `docker compose up` demarre l'API et la base, `GET /health` repond `200`
- L'image de production ne contient pas les fichiers `.ts` sources
- Les variables de production sont documentees et le `.env` reel est dans `.gitignore`
