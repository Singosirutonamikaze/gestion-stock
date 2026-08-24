# phase-4 : stock et commandes

Cette phase implementer les features `stock`, `stock-movements` et `orders`.

---

## taches

### 1. feature `stock`

Dossier : `features/stock/`

Pages concernees :
- `app/(protected)/admin/stock/page.tsx` — niveaux de stock par produit et entrepot

Composants a creer dans `features/stock/components/` :
- `StockTable` : tableau avec colonnes `produit`, `entrepot`, `quantite`, `seuil`, badge alerte
- `StockFilters` : filtres par produit, entrepot, et option "uniquement les alertes"
- `StockLevelBadge` : indicateur visuel (vert / orange / rouge) selon la quantite par rapport au seuil

Hooks dans `features/stock/hooks/` :
- `useStock(filters)` : `GET /stock` avec les parametres de filtre
- `useLowStock()` : `GET /stock/low`

### 2. feature `stock-movements`

Dossier : `features/stock-movements/`

Pages concernees :
- `app/(protected)/admin/stock-movements/page.tsx` — historique des mouvements
- `app/(protected)/admin/stock-movements/new/page.tsx` — creer un mouvement

Composants a creer dans `features/stock-movements/components/` :
- `StockMovementsTable` : tableau avec colonnes `date`, `produit`, `entrepot`, `type`, `quantite`, `motif`, `utilisateur`
- `StockMovementTypeBadge` : badge colore selon `IN`, `OUT`, `ADJUSTMENT`, `TRANSFER`
- `CreateStockMovementForm` : formulaire avec :
  - select `produit`
  - select `entrepot source`
  - select `type` (modifie les champs disponibles : `relatedWarehouseId` n'apparait que si `TRANSFER`)
  - champ `quantity` (entier positif)
  - champs optionnels `reason` et `reference`

Schema Zod : `quantity > 0`, `relatedWarehouseId` requis si `type === 'TRANSFER'`

Hooks dans `features/stock-movements/hooks/` :
- `useStockMovements(filters)` : `GET /stock-movements`
- `useCreateStockMovement()` : `POST /stock-movements`

### 3. feature `orders`

Dossier : `features/orders/`

Pages concernees :
- `app/(protected)/admin/orders/page.tsx` — liste des commandes
- `app/(protected)/admin/orders/new/page.tsx` — creer une commande
- `app/(protected)/admin/orders/[id]/page.tsx` — detail de la commande avec boutons de transition

Composants a creer dans `features/orders/components/` :
- `OrdersTable` : tableau avec colonnes `numero`, `type`, `statut`, `entrepot`, `total`, `date`
- `OrderStatusBadge` : badge colore selon `DRAFT`, `CONFIRMED`, `SHIPPED`, `RECEIVED`, `CANCELLED`
- `OrderTypeBadge` : badge `ACHAT` ou `VENTE`
- `CreateOrderForm` :
  - select `type` (`PURCHASE` ou `SALE`)
  - si `PURCHASE` : select `fournisseur`
  - si `SALE` : champ texte `nom du client`
  - select `entrepot`
  - section dynamique de lignes de commande (ajouter / supprimer des lignes)
  - chaque ligne : select `produit`, champ `quantite`, champ `prix unitaire`, affichage du sous-total calcule
  - affichage du montant total mis a jour en temps reel
- `OrderStatusTransition` : boutons d'action selon le statut courant et le role

Hooks dans `features/orders/hooks/` :
- `useOrders(filters)` : `GET /orders`
- `useOrder(id)` : `GET /orders/:id`
- `useCreateOrder()` : `POST /orders`
- `useUpdateOrderStatus()` : `PATCH /orders/:id`

### 4. dashboard

Dossier : `features/dashboard/`

Page : `app/(protected)/admin/dashboard/page.tsx`

Composants :
- carte "produits sous seuil d'alerte" avec lien vers la liste filtrée
- carte "commandes en attente" (statut `DRAFT` ou `CONFIRMED`)
- tableau des derniers mouvements de stock
- resume des entrepots actifs

---

## criteres de validation

- La creation d'un mouvement `IN` met a jour le niveau de stock dans la liste
- Le formulaire de mouvement masque `relatedWarehouseId` si le type n'est pas `TRANSFER`
- Un mouvement `OUT` sur stock insuffisant affiche le message d'erreur retourne par l'API
- Les boutons de transition de statut sont conditionnes au role et au statut courant
- Le calcul du total de la commande se met a jour en temps reel lors de la saisie des lignes
- Le dashboard affiche les bonnes donnees sans erreur
