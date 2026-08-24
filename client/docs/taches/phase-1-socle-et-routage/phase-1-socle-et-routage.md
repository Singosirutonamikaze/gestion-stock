# phase-1 : socle et routage

Cette phase met en place la structure de base de l'application Next.js : layout, groupes de routes, protection et navigation.

---

## taches

### 1. configurer le layout racine

Fichier : `app/layout.tsx`

- Configurer les polices (Geist Sans, Geist Mono)
- Definir les metadata de base (`title`, `description`)
- Appliquer les classes Tailwind globales sur `<html>` et `<body>`

### 2. creer le groupe de routes `(auth)`

Dossier : `app/(auth)/`

- Contient les routes publiques (connexion, eventuelle inscription)
- Pas de layout partage avec les routes protegees
- Accessible sans jeton JWT

### 3. creer le groupe de routes `(protected)`

Dossier : `app/(protected)/`

Fichier : `app/(protected)/layout.tsx`

- Contient le layout commun a toutes les routes protegees : sidebar et topbar
- Verifie la presence d'un jeton valide, redirige vers `(auth)` si absent
- Passe le profil utilisateur courant aux composants enfants via un contexte

### 4. creer les sous-dossiers de routes par role

```
app/(protected)/
├── admin/
│   ├── dashboard/
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── suppliers/
│   ├── warehouses/
│   ├── stock/
│   ├── stock-movements/
│   ├── orders/
│   ├── reports/
│   └── settings/
├── manager/
├── sales/
└── stock-keeper/
```

Chaque dossier contient au minimum une `page.tsx` vide pour valider le routage.

### 5. implementer la sidebar

Composant : `components/layout/sidebar/`

- Liste les liens de navigation selon le role courant
- Utilise `ProtectedNavLink` pour masquer les liens non autorises
- S'adapte a la largeur de l'ecran (collapsible sur mobile)

### 6. implementer la topbar

Composant : `components/layout/topbar/`

- Affiche le nom et le role de l'utilisateur connecte
- Contient un bouton de deconnexion
- Affiche eventuellement des notifications ou alertes de stock

### 7. composant `RoleGate`

Composant : `components/layout/role-gate/`

```tsx
<RoleGate allowedRoles={['ADMIN', 'MANAGER']}>
  <BoutonSuppression />
</RoleGate>
```

- Recoit un tableau de roles autorises
- Rend les enfants uniquement si le role courant est dans la liste
- Sinon rend `null` (ne redirige pas, masque simplement)

### 8. composant `ProtectedNavLink`

Composant : `components/layout/protected-nav-link/`

- Etend le composant `Link` de Next.js
- N'est rendu que si le role courant correspond aux roles autorises
- Applique une classe active si la route courante correspond au lien

### 9. page 404 personnalisee

Fichier : `app/not-found.tsx`

- Message d'erreur clair et lien vers le tableau de bord

---

## criteres de validation

- `npm run dev` demarre sans erreur TypeScript
- Naviguer vers une route protegee sans jeton redirige vers la connexion
- La sidebar affiche uniquement les liens autorises pour le role courant
- `RoleGate` masque correctement les elements selon le role
- La page 404 s'affiche pour toute route inexistante
