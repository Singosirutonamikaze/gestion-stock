# phase-5 : rapports et finitions

Cette phase implementer les pages de rapports, les exports et les derniers ajustements qualite.

---

## taches

### 1. feature `reports`

Dossier : `features/reports/`

Pages concernees :
- `app/(protected)/admin/reports/page.tsx` — page d'accueil des rapports avec les liens vers chaque rapport
- `app/(protected)/admin/reports/stock/page.tsx` — etat du stock
- `app/(protected)/admin/reports/stock/low/page.tsx` — produits sous seuil
- `app/(protected)/admin/reports/movements/page.tsx` — mouvements sur une periode
- `app/(protected)/admin/reports/stock/valuation/page.tsx` — valorisation

Composants a creer dans `features/reports/components/` :

**Rapport stock :**
- `StockReportTable` : tableau avec colonnes `sku`, `produit`, `entrepot`, `quantite`, `seuil`, badge alerte
- `ExportCsvButton` : bouton declenchant le telechargement via `GET /reports/stock?format=csv`

**Rapport ruptures :**
- `LowStockReportTable` : tableau avec colonnes `produit`, `quantite totale`, `seuil`, `deficit`
- Mise en evidence visuelle des produits en rupture complete (quantite = 0)

**Rapport mouvements :**
- `MovementsReportFilters` : selects de periode (`from`, `to`), produit, entrepot, type
- `MovementsReportTable` : tableau des mouvements avec totaux agregees en pied de tableau
- `ExportCsvButton` : export via `GET /reports/movements?format=csv&from=...&to=...`

**Rapport valorisation :**
- `ValuationReportTable` : tableau avec colonnes `sku`, `produit`, `quantite`, `cout`, `valeur cout`, `valeur vente`, `marge`
- Ligne de total general en pied de tableau

Hooks dans `features/reports/hooks/` :
- `useStockReport()` : `GET /reports/stock`
- `useLowStockReport()` : `GET /reports/stock/low`
- `useMovementsReport(filters)` : `GET /reports/movements`
- `useValuationReport()` : `GET /reports/stock/valuation`

### 2. feature `users` (administration)

Dossier : `features/users/`

Pages concernees :
- `app/(protected)/admin/users/page.tsx` — liste des utilisateurs (ADMIN uniquement)
- `app/(protected)/admin/users/new/page.tsx` — creer un utilisateur
- `app/(protected)/admin/users/[id]/page.tsx` — detail / edition

Composants :
- `UsersTable` : tableau avec colonnes `nom`, `email`, `role`, `statut`
- `UserRoleBadge` : badge colore selon le role
- `CreateUserForm` / `EditUserForm` : formulaire avec select du role, sans affichage du mot de passe en edition

### 3. hook `useDebounce`

Dossier : `hooks/debounce/`

```typescript
const debouncedValue = useDebounce(value, 300)
```

Utilise dans les barres de filtres de recherche texte pour eviter un appel API a chaque frappe.

### 4. hook `useToast`

Dossier : `hooks/toast/`

```typescript
const { toast } = useToast()
toast({ type: 'success', message: 'mouvement cree avec succes' })
toast({ type: 'error', message: 'stock insuffisant' })
```

Affiche des notifications temporaires en haut ou en bas de l'ecran apres chaque action utilisateur.

### 5. gestion des erreurs API

Dans `lib/api/` :

- Capturer les reponses d'erreur de l'API (format `{ statusCode, message }`)
- Afficher un toast d'erreur avec le message retourne par l'API
- Pour les erreurs `401`, rediriger vers la page de connexion automatiquement

### 6. linting et qualite

- `npm run lint` sans erreur
- Aucune prop TypeScript `any` non justifiee
- Tous les composants ont leurs types correctement declares
- Verifier que `npm run build` produit un build de production sans erreur

---

## criteres de validation

- Tous les rapports s'affichent avec les bonnes donnees
- Le bouton d'export CSV declenche un telechargement du fichier
- Les toasts s'affichent apres chaque creation, modification ou erreur
- `npm run build` s'execute sans erreur ni avertissement TypeScript
- `npm run lint` ne retourne aucune erreur
