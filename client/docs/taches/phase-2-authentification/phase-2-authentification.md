# phase-2 : authentification

Cette phase implementer la connexion, la gestion du jeton JWT et la session utilisateur cote client.  
Elle correspond a la feature `features/auth/`.

---

## taches

### 1. types et schemas

Dossier : `features/auth/types/` et `features/auth/schemas/`

Types :

```typescript
// types/index.ts
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
}

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
}
```

Schema Zod pour le formulaire de connexion :

```typescript
// schemas/login.schema.ts
export const loginSchema = z.object({
  email: z.string().email('adresse email invalide'),
  password: z.string().min(1, 'le mot de passe est requis'),
})
```

### 2. fonctions d'appel API

Dossier : `features/auth/api/`

- `login(credentials)` : `POST /auth/login`, renvoie `AuthResponse`
- `getProfile()` : `GET /auth/me`, renvoie `UserProfile`

### 3. gestion du jeton

Dossier : `lib/auth/`

- Stocker le jeton dans un cookie HTTP-only via une Server Action Next.js
- Fournir des helpers :
  - `getToken()` : lit le jeton depuis le cookie
  - `setToken(token)` : ecrit le jeton
  - `deleteToken()` : supprime le jeton (deconnexion)

Ne jamais stocker le jeton dans `localStorage` pour eviter les failles XSS.

### 4. hook `useCurrentUser`

Dossier : `hooks/current/`

```typescript
const { user, isLoading } = useCurrentUser()
```

- Appelle `GET /auth/me` au montage
- Met le profil en cache pour eviter les requetes repetees
- Utilise par la sidebar, la topbar et `RoleGate`

### 5. page de connexion

Dossier : `app/(auth)/` — composants dans `features/auth/components/`

- Formulaire email + mot de passe
- Validation avec Zod au submit
- Affichage des erreurs inline
- Redirection vers la page d'accueil de l'utilisateur apres connexion selon son role
- Indicateur de chargement pendant la requete

### 6. deconnexion

- Bouton present dans la topbar
- Appelle `deleteToken()` puis redirige vers la page de connexion
- Pas de requete API necessaire (le jeton est simplement supprime cote client)

---

## criteres de validation

- La connexion avec des identifiants valides stocke le jeton et redirige
- La connexion avec un mot de passe incorrect affiche un message d'erreur clair
- Apres deconnexion, toute route protegee redirige vers la connexion
- `useCurrentUser` renvoie le profil sans re-appeler l'API a chaque rendu
- Le jeton n'est pas accessible depuis `window.localStorage` ni `document.cookie` en JavaScript
