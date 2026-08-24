# architecture — client

Ce document decrit la structure de l'application Next.js et les conventions du projet.

---

## stack technique

| technologie       | version  | role                                        |
|-------------------|----------|---------------------------------------------|
| Next.js           | 16.2.12  | framework React avec App Router             |
| React             | 19.2.4   | bibliotheque d'interface utilisateur        |
| TypeScript        | 5        | langage de compilation                      |
| Tailwind CSS      | 4        | framework CSS utilitaire                    |
| Zod               | —        | validation des schemas de formulaire        |

---

## structure de `client/`

```
client/
├── app/                          routage Next.js (App Router)
│   ├── layout.tsx                layout HTML racine (polices, metadata)
│   ├── page.tsx                  page d'accueil / redirection selon le role
│   ├── not-found.tsx             page 404 personnalisee
│   ├── globals.css               styles globaux Tailwind
│   │
│   ├── (auth)/                   groupe de routes publiques
│   │   └── ...                   page de connexion
│   │
│   └── (protected)/              groupe de routes protegees
│       ├── layout.tsx            layout commun (sidebar, topbar)
│       ├── admin/                pages accessibles au role ADMIN
│       │   ├── dashboard/
│       │   ├── users/
│       │   ├── products/
│       │   ├── categories/
│       │   ├── suppliers/
│       │   ├── warehouses/
│       │   ├── stock/
│       │   ├── stock-movements/
│       │   ├── orders/
│       │   ├── reports/
│       │   └── settings/
│       ├── manager/              pages accessibles au role MANAGER
│       ├── sales/                pages accessibles au role SALES
│       └── stock-keeper/         pages accessibles au role STOCK_KEEPER
│
├── features/                     logique metier par domaine
│   ├── auth/
│   ├── dashboard/
│   ├── products/
│   ├── categories/
│   ├── suppliers/
│   ├── warehouses/
│   ├── stock/
│   ├── stock-movements/
│   ├── orders/
│   ├── reports/
│   └── users/
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
├── hooks/                        hooks React globaux
│   ├── current/
│   ├── debounce/
│   └── toast/
│
├── lib/                          utilitaires et configuration globale
│   ├── api/                      client HTTP de base
│   ├── auth/                     helpers d'authentification
│   ├── constants/                constantes partagees
│   └── utils/                    fonctions utilitaires generiques
│
├── types/                        types TypeScript globaux
│   ├── api/                      types de reponse API
│   └── enums/                    enumerations partagees
│
└── docs/                         documentation du client
```

---

## conventions d'une feature

Chaque dossier dans `features/` respecte la meme structure interne :

```
features/<nom>/
├── api/          fonctions d'appel HTTP vers l'API
├── components/   composants React specifiques a cette feature
├── hooks/        hooks React specifiques a cette feature
├── schemas/      schemas Zod de validation des formulaires
├── types/        types TypeScript specifiques a cette feature
└── index.ts      exports publics de la feature
```

Aucun composant d'une feature n'importe directement depuis une autre feature.  
Les elements partages transitent par `components/` ou `lib/`.

---

## routage et protection

### groupes de routes

Next.js App Router utilise des groupes de routes entre parentheses pour organiser les layouts :

- `(auth)` : routes publiques, pas de verification de jeton
- `(protected)` : routes qui necessitent un jeton JWT valide

### protection par role

La protection est double :

1. **Middleware Next.js** : verifie la presence d'un jeton valide avant d'acceder a une route protegee. Redirige vers la page de connexion si absent.
2. **Composant `RoleGate`** : masque les elements d'interface selon le role de l'utilisateur connecte.
3. **Composant `ProtectedNavLink`** : n'affiche un lien de navigation que si le role courant y a acces.

La protection reelle reste cote API. Le client ne fait que masquer des elements.

---

## appels API

Toutes les fonctions d'appel HTTP sont centralisees dans `features/<nom>/api/`.  
Un client de base configure dans `lib/api/` gere :
- l'URL de base (depuis les variables d'environnement)
- l'injection automatique du jeton JWT dans l'en-tete `Authorization`
- la gestion des erreurs HTTP

Le client Next.js communique avec le serveur NestJS via un proxy configure dans `proxy.ts`.

---

## variables d'environnement

| variable                  | requis | description                                |
|---------------------------|--------|--------------------------------------------|
| `NEXT_PUBLIC_API_URL`     | oui    | URL de base de l'API NestJS                |

Le fichier `.env.local.example` liste toutes les variables avec des exemples.  
Le fichier `.env.local` reel ne doit jamais etre committe.
