# phase-1 : modele de donnees

Cette phase definit la structure de la base de donnees via Prisma et prepare l'environnement local de developpement.

---

## taches

### 1. installer Prisma

Ajouter Prisma au projet `server/` :

```bash
yarn add prisma @prisma/client
yarn add -D @prisma/adapter-pg pg
npx prisma init
```

Configurer la variable `DATABASE_URL` dans `.env`.

### 2. ecrire le schema Prisma

Ecrire `server/prisma/schema.prisma` avec toutes les entites du modele :

- `User`
- `Category` (avec auto-reference pour les sous-categories)
- `Supplier`
- `Warehouse`
- `Product`
- `Stock` (contrainte d'unicite sur `productId + warehouseId`)
- `StockMovement` (immuable, source de verite)
- `Order` (avec champ `customerName` en texte libre)
- `OrderItem` (suppression en cascade depuis `Order`)

Respecter les noms de tables en snake_case via `@@map()`.

### 3. definir les enumerations

Declarer dans le schema :

- `UserRole` : `ADMIN`, `MANAGER`, `STOCK_KEEPER`, `SALES`
- `MovementType` : `IN`, `OUT`, `ADJUSTMENT`, `TRANSFER`
- `OrderType` : `PURCHASE`, `SALE`
- `OrderStatus` : `DRAFT`, `CONFIRMED`, `SHIPPED`, `RECEIVED`, `CANCELLED`

### 4. premiere migration

Generer et appliquer la premiere migration :

```bash
npx prisma migrate dev --name init
```

Verifier que la migration s'applique sans erreur sur la base locale.

### 5. script seed

Ecrire `server/prisma/seed.ts` contenant :

- un utilisateur administrateur par defaut (email et mot de passe haches)
- au moins deux categories
- au moins un fournisseur
- au moins un entrepot
- plusieurs produits avec `sku`, `unitPrice`, `costPrice` et `alertThreshold` renseignes
- des entrees `Stock` initiales

Configurer l'execution dans `package.json` :

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Executer avec :

```bash
npx prisma db seed
```

### 6. configurer Docker Compose pour PostgreSQL

Creer `server/docker/docker-compose.yml` avec :

- un service `postgres` (image officielle)
- un volume nomme pour la persistance des donnees
- les variables d'environnement (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`)

Ajouter les scripts dans `package.json` :

```json
"docker:up":   "docker compose -f docker/docker-compose.yml up -d",
"docker:down": "docker compose -f docker/docker-compose.yml down",
"docker:logs": "docker compose -f docker/docker-compose.yml logs -f"
```

---

## criteres de validation

- `npx prisma migrate dev` s'execute sans erreur
- `npx prisma db seed` popule la base sans erreur
- `npx prisma studio` affiche les tables et les donnees
- `yarn docker:up` demarre PostgreSQL et `yarn start:dev` se connecte correctement
