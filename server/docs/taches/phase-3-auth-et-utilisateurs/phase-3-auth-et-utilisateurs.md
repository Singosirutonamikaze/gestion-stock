# Convention de structure des modules — version complète

Corrige le problème des sous-dossiers "un fichier = un dossier + un index.ts" et ajoute les couches manquantes : `interfaces/`, `types/`, `schemas/`.

---

## 1. Qui va où ?

| Dossier         | Contenu                                                                 | Exemple                                      |
|-----------------|--------------------------------------------------------------------------|-----------------------------------------------|
| `dto/`          | Classes avec décorateurs `class-validator` — valident et documentent (Swagger) les entrées/sorties HTTP | `LoginDto`, `CreateUserDto`, `UserResponseDto` |
| `entities/`     | Représentation du modèle métier/persistance (souvent miroir du modèle Prisma, enrichi de méthodes) | `User` entity                                |
| `interfaces/`   | **Contrats** entre couches — ce qu'un service/repository *doit* implémenter, indépendamment de l'implémentation | `IUsersRepository`, `IAuthService`           |
| `types/`        | Alias de types, unions, objets internes qui ne nécessitent ni validation ni classe (pas de décorateurs) | `JwtPayload`, `TokenPair`, `AuthenticatedRequest` |
| `schemas/`      | Schémas de validation hors DTO HTTP (variables d'env avec `Joi`/`zod`, payload JWT, config) | `env.schema.ts`, `jwt-payload.schema.ts`     |
| `mappers/`      | Fonctions pures de transformation entre entité ↔ DTO ↔ modèle Prisma      | `user.mapper.ts`                              |
| `repositories/` | Accès aux données (Prisma), implémente les `interfaces/`                 | `users.repository.ts`                         |
| `services/`     | Logique métier, orchestration                                            | `auth.service.ts`                             |
| `controllers/`  | Routes HTTP, délèguent aux services                                      | `auth.controller.ts`                          |
| `strategies/`   | Stratégies Passport                                                       | `jwt.strategy.ts`                              |

**Règle de décision DTO vs Type vs Interface :**
- Ça traverse une route HTTP (body/query/response) et doit être validé → **DTO**
- C'est un contrat qu'une classe doit respecter (`implements X`) → **Interface**
- C'est juste une forme de données interne, sans validation ni contrat d'implémentation → **Type**

---

## 2. Un seul `index.ts` par dossier (pas par fichier)

```
dto/
├── login.dto.ts
├── register.dto.ts
├── auth-response.dto.ts
└── index.ts          ← un seul barrel pour tout le dossier
```

```typescript
// dto/index.ts
export * from './login.dto';
export * from './register.dto';
export * from './auth-response.dto';
```

Plus de dossier par fichier (`login-dto/login.dto.ts` + `login-dto/index.ts`) — c'est ce niveau intermédiaire qui est supprimé.

---

## 3. Arborescence complète — module `auth`

```
src/modules/auth/
├── auth.module.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── auth.controller.spec.ts
│   └── index.ts
├── services/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts
│   └── index.ts
├── strategies/
│   ├── jwt.strategy.ts
│   ├── local.strategy.ts
│   └── index.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   ├── auth-response.dto.ts
│   ├── refresh-token.dto.ts
│   └── index.ts
├── interfaces/
│   ├── auth-service.interface.ts      # IAuthService
│   ├── session-repository.interface.ts # ISessionRepository
│   └── index.ts
├── types/
│   ├── jwt-payload.type.ts       # JwtPayload
│   ├── token-pair.type.ts        # TokenPair
│   └── index.ts
└── schemas/
    ├── jwt-payload.schema.ts     # validation runtime du payload décodé
    └── index.ts
```

### Exemples de contenu

**`types/jwt-payload.type.ts`**
```typescript
export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  sid: string; // session id
  iat?: number;
  exp?: number;
};
```

**`types/token-pair.type.ts`**
```typescript
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
```

**`interfaces/auth-service.interface.ts`**
```typescript
export interface IAuthService {
  login(dto: LoginDto, meta: RequestMeta): Promise<TokenPair>;
  register(dto: RegisterDto): Promise<TokenPair>;
  refresh(token: string): Promise<TokenPair>;
  logout(sessionId: string): Promise<void>;
  logoutAll(userId: string): Promise<void>;
}
```

**`interfaces/session-repository.interface.ts`**
```typescript
export interface ISessionRepository {
  create(data: CreateSessionData): Promise<Session>;
  findByHash(hash: string): Promise<Session | null>;
  revoke(sessionId: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  listActiveForUser(userId: string): Promise<Session[]>;
}
```

**`schemas/jwt-payload.schema.ts`** (validation runtime au décodage, en plus du typage statique — utile car un JWT décodé n'est pas garanti conforme au type TS à la compilation)
```typescript
import { z } from 'zod';

export const jwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  sid: z.string().uuid(),
});

export type JwtPayloadValidated = z.infer<typeof jwtPayloadSchema>;
```

---

## 4. Arborescence complète — module `users`

```
src/modules/users/
├── users.module.ts
├── controllers/
│   ├── users.controller.ts
│   ├── users.controller.spec.ts
│   └── index.ts
├── services/
│   ├── users.service.ts
│   ├── users.service.spec.ts
│   └── index.ts
├── repositories/
│   ├── users.repository.ts
│   └── index.ts
├── entities/
│   ├── user.entity.ts
│   └── index.ts
├── mappers/
│   ├── user.mapper.ts
│   ├── user.mapper.spec.ts
│   └── index.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── user-response.dto.ts
│   ├── user-query.dto.ts          # pagination/filtre GET /users
│   └── index.ts
├── interfaces/
│   ├── users-service.interface.ts  # IUsersService
│   ├── users-repository.interface.ts # IUsersRepository
│   └── index.ts
└── types/
    ├── user-with-relations.type.ts # ex: User & { orders: Order[] }
    └── index.ts
```

**`interfaces/users-repository.interface.ts`**
```typescript
export interface IUsersRepository {
  findAll(query: UserQueryDto): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  softDelete(id: string): Promise<void>;
}
```

**Pourquoi une interface pour le repository ?** Ça permet d'injecter un mock dans les tests unitaires du service sans toucher à Prisma (`providers: [{ provide: 'IUsersRepository', useValue: mockRepo }]`), et de changer d'implémentation (Prisma → autre ORM) sans toucher au service.

---

## 5. Dossier `shared/` — types et interfaces transverses

À ajouter si pas déjà prévu :

```
src/shared/
├── types/
│   ├── request-meta.type.ts    # { ip, userAgent } réutilisé partout
│   ├── paginated.type.ts
│   └── index.ts
└── interfaces/
    ├── base-repository.interface.ts  # interface générique CRUD
    └── index.ts
```

**`shared/types/request-meta.type.ts`**
```typescript
export type RequestMeta = {
  ipAddress: string;
  userAgent: string;
};
```

---

## 6. Règle à ajouter dans `docs/architectures/architecture.md`

> Chaque module suit la structure : `controllers/`, `services/`, `repositories/`, `entities/`, `dto/`, `interfaces/`, `types/`, `mappers/` selon les besoins du module (tous ne sont pas obligatoires — `interfaces/` et `types/` uniquement si le module en a l'usage réel, pas par principe).
> Chaque dossier contenant plusieurs fichiers du même type expose **un seul** `index.ts` en barrel. Pas de sous-dossier par fichier individuel.
> Un fichier va dans `dto/` s'il traverse une route HTTP et nécessite une validation `class-validator`. Il va dans `types/` s'il s'agit d'une forme de données interne sans validation. Il va dans `interfaces/` s'il définit un contrat qu'une classe doit `implements`.