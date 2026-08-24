# phase-2 : socle applicatif

Cette phase met en place l'infrastructure transversale du serveur : configuration, journalisation, gestion des erreurs, validation et documentation.  
Tout ce qui est cree ici vit dans `src/core/` ou `src/shared/`.

---

## taches

### 1. module de configuration

Chemin : `src/core/config/`

- Creer un module NestJS wrappant `@nestjs/config`
- Definir un schema de validation Joi pour toutes les variables d'environnement :
  - `NODE_ENV` (`development`, `production`, `test`)
  - `PORT` (entier, defaut `3000`)
  - `DATABASE_URL` (string, requis)
  - `JWT_SECRET` (string, requis)
  - `JWT_EXPIRES_IN` (string, defaut `7d`)
- Creer un `AppConfigService` injectable qui expose chaque variable typee

Le module leve une erreur explicite au demarrage si une variable obligatoire est absente.

### 2. service Prisma

Chemin : `src/core/database/`

- Creer un `DatabaseModule` exporte globalement
- Creer un `PrismaService` qui etend `PrismaClient` et gere la connexion dans `onModuleInit`
- Le service est injecte dans tous les repositories

### 3. journalisation structuree

Chemin : `src/core/logger/`

- Configurer le logger NestJS avec un format structure (JSON en production, lisible en developpement)
- Chaque entree de log inclut au minimum : `timestamp`, `level`, `context`, `message`

### 4. filtres d'exception

Chemin : `src/core/filters/`

Creer deux filtres globaux :

- `HttpExceptionFilter` : capture les `HttpException` NestJS et renvoie une reponse JSON normalisee
- `PrismaExceptionFilter` : capture les erreurs Prisma connues (`P2002` unique, `P2025` not found) et les convertit en `HttpException` appropriees

Format de reponse d'erreur :

```json
{
  "statusCode": 404,
  "message": "ressource introuvable",
  "error": "Not Found",
  "timestamp": "2026-08-24T10:00:00.000Z",
  "path": "/api/products/xxx"
}
```

### 5. intercepteurs

Chemin : `src/core/interceptors/`

- `LoggingInterceptor` : journalise la methode, l'URL, la duree et le code HTTP de chaque requete
- `ResponseTransformInterceptor` : enveloppe chaque reponse reussie dans un objet uniforme

Format de reponse de succes :

```json
{
  "success": true,
  "data": { ... }
}
```

### 6. pipe de validation global

Configurer un `ValidationPipe` global dans `main.ts` :

- `whitelist: true` — rejette les champs non declares dans le DTO
- `forbidNonWhitelisted: true` — renvoie une erreur si des champs inconnus sont envoyes
- `transform: true` — convertit automatiquement les types primitifs

### 7. documentation API (Swagger)

Chemin : `src/core/swagger/`

- Configurer Swagger avec `DocumentBuilder` dans un module dedie
- Activer le support des JWT (`addBearerAuth`)
- La documentation est accessible sur `/api` uniquement en `NODE_ENV !== production`

### 8. endpoint de sante

Chemin : `src/core/health/`

- Creer un `HealthController` exposant `GET /health`
- Renvoyer `{ status: "ok", timestamp: "..." }`
- Ce endpoint ne necessite pas d'authentification

### 9. exceptions metier

Chemin : `src/shared/exceptions/`

Creer les classes d'exceptions personnalisees :

- `ResourceNotFoundException` : etend `NotFoundException`, message parametrable
- `InsufficientStockException` : etend `BadRequestException`, inclut `productId`, `warehouseId`, `available` et `requested`

Ces classes sont utilisees dans les services metier et capturees par `HttpExceptionFilter`.

---

## criteres de validation

- Le serveur demarre et repond sur `GET /health`
- Un appel avec un corps invalide renvoie une erreur `400` au format normalise
- Un appel sur une route inexistante renvoie `404` au format normalise
- La page Swagger est accessible sur `http://localhost:<PORT>/api`
- Les variables d'environnement manquantes bloquent le demarrage avec un message clair
