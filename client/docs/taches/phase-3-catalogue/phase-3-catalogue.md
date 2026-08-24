# phase-3 : catalogue

Cette phase implementer les pages et la logique des features `products`, `categories`, `suppliers` et `warehouses`.

---

## taches

### 1. feature `categories`

Dossier : `features/categories/`

Pages concernees :
- `app/(protected)/admin/categories/page.tsx` — liste des categories
- `app/(protected)/admin/categories/[id]/page.tsx` — detail / edition

Composants a creer dans `features/categories/components/` :
- liste tabulaire avec pagination (`DataTable`)
- formulaire de creation / edition avec champ `parentId` optionnel

Hooks dans `features/categories/hooks/` :
- `useCategories()` : `GET /categories`
- `useCategory(id)` : `GET /categories/:id`
- `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()`

### 2. feature `suppliers`

Dossier : `features/suppliers/`

Pages concernees :
- `app/(protected)/admin/suppliers/page.tsx`
- `app/(protected)/admin/suppliers/[id]/page.tsx`

Composants :
- liste tabulaire avec les colonnes `name`, `email`, `phone`, `contactPerson`
- formulaire avec tous les champs optionnels clairement marques

### 3. feature `warehouses`

Dossier : `features/warehouses/`

Pages concernees :
- `app/(protected)/admin/warehouses/page.tsx`
- `app/(protected)/admin/warehouses/[id]/page.tsx`

Composants :
- liste tabulaire avec badge `actif` / `inactif`
- formulaire avec champs `name` et `location`

### 4. feature `products`

Dossier : `features/products/`

Pages concernees :
- `app/(protected)/admin/products/page.tsx` — liste avec filtres
- `app/(protected)/admin/products/new/page.tsx` — creation
- `app/(protected)/admin/products/[id]/page.tsx` — detail
- `app/(protected)/admin/products/[id]/edit/page.tsx` — edition

Composants a creer dans `features/products/components/` :
- `ProductsTable` : tableau avec colonnes `sku`, `name`, `category`, `unitPrice`, `alertThreshold`, `isActive`
- `ProductFilters` : barre de filtres (recherche texte, categorie, fournisseur, actif/inactif, sous seuil)
- `ProductForm` : formulaire complet avec selects categories et fournisseurs
- `ProductBadge` : badge visuel indiquant si le produit est sous seuil d'alerte

Hooks dans `features/products/hooks/` :
- `useProducts(filters)` : `GET /products` avec les parametres de filtre
- `useProduct(id)` : `GET /products/:id`
- `useCreateProduct()`, `useUpdateProduct()`, `useDeactivateProduct()`

Schema Zod dans `features/products/schemas/` :
- valider `sku` (non vide, unique verifie a la soumission), `unitPrice > 0`, `costPrice > 0`, `alertThreshold >= 0`

### 5. composants partages `DataTable`

Dossier : `components/data-table/`

- `DataTable` : tableau generique acceptant des colonnes et des donnees en props, gestion du tri
- `DataTablePagination` : controles de pagination (page courante, total, items par page)

Ces composants sont utilises par toutes les features qui affichent des listes.

---

## criteres de validation

- La liste des produits s'affiche avec pagination
- Le filtre `search` met a jour les resultats sans rechargement de page
- Le formulaire produit valide les champs et affiche les erreurs inline
- Un produit sous seuil d'alerte est visuellement distingue dans le tableau
- Les actions `ADMIN` et `MANAGER` sont masquees pour les roles `STOCK_KEEPER` et `SALES`
