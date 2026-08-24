# phase-3 : authentification et utilisateurs

Cette phase met en place la gestion des comptes utilisateurs et la protection des routes par jeton JWT.

---

## taches

### 1. module users

Chemin : `src/modules/users/`

Implementer le CRUD complet :

| methode | route              | action                              | roles autorises |
|---------|--------------------|-------------------------------------|-----------------|
| `GET`   | `/users`           | lister tous les utilisateurs        | `ADMIN`         |
| `GET`   | `/users/:id`       | consulter un utilisateur            | `ADMIN`         |
| `POST`  | `/users`           | creer un utilisateur                | `ADMIN`         |
| `PATCH` | `/users/:id`       | modifier un utilisateur             | `ADMIN`         |
| `DELETE`| `/users/:id`       | supprimer (desactiver) un utilisateur | `ADMIN`       |

Regles metier :
- Le mot de passe est hache avec `bcrypt` avant persistance
- Le champ `password` n'est jamais renvoye dans les reponses
- La suppression est logique (`isActive = false`), pas physique

### 2. module auth

Chemin : `src/modules/auth/`

Sous-dossiers :
- `controllers/` : `AuthController`
- `services/` : `AuthService`
- `strategies/` : `JwtStrategy` (Passport)
- `dto/` : `LoginDto`, `RegisterDto`, `AuthResponseDto`

Endpoints :

| methode | route             | action                               | protection |
|---------|-------------------|--------------------------------------|------------|
| `POST`  | `/auth/login`     | connexion, retourne un jeton JWT     | publique   |
| `POST`  | `/auth/register`  | creation d'un compte                 | publique   |
| `GET`   | `/auth/me`        | profil de l'utilisateur connecte     | JWT        |

Le jeton JWT contient dans son payload :
- `sub` : identifiant de l'utilisateur
- `email`
- `role`

### 3. garde de roles et decorateur

Chemin : `src/core/guards/` et `src/shared/decorators/`

- `JwtAuthGuard` : verifie la validite du jeton JWT sur chaque route protegee
- `RolesGuard` : compare le role du jeton avec les roles autorises sur la route, applique apres `JwtAuthGuard`
- `@Roles(...roles)` : decorateur a placer sur les controleurs ou les methodes

Les deux gardes sont enregistres globalement dans `AppModule`.

### 4. decorateur `@CurrentUser`

Chemin : `src/shared/decorators/`

Creer un decorateur de parametre qui extrait l'utilisateur courant du contexte de la requete :

```typescript
@Get('me')
getProfile(@CurrentUser() user: JwtPayload) { ... }
```

### 5. tests unitaires

Couvrir avec des tests unitaires :

- `AuthService` : connexion avec identifiants valides, connexion avec mot de passe incorrect, connexion avec email inexistant
- `UsersService` : creation avec email duplique, suppression logique, hachage du mot de passe

---

## criteres de validation

- `POST /auth/login` avec des identifiants valides renvoie un jeton JWT
- `POST /auth/login` avec un mot de passe incorrect renvoie `401`
- `GET /auth/me` sans jeton renvoie `401`
- `GET /users` avec un jeton `SALES` renvoie `403`
- `GET /users` avec un jeton `ADMIN` renvoie la liste
- Le champ `password` n'apparait dans aucune reponse
- Les tests unitaires passent
