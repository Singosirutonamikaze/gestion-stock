# phase-7 : rapports

Cette phase implementer les endpoints de rapports et d'export.  
Tous les rapports sont accessibles aux roles `ADMIN` et `MANAGER` uniquement.

---

## taches

### 1. export de l'etat du stock

Route : `GET /reports/stock`

Retourne la liste complete des niveaux de stock avec, pour chaque entree :

| champ            | description                                  |
|------------------|----------------------------------------------|
| `product.sku`    | code article                                 |
| `product.name`   | nom du produit                               |
| `warehouse.name` | nom de l'entrepot                            |
| `quantity`       | quantite disponible                          |
| `alertThreshold` | seuil d'alerte du produit                    |
| `isAlert`        | `true` si `quantity < alertThreshold`         |

Support d'un parametre optionnel `format=csv` pour retourner un fichier CSV telechargeable.

### 2. rapport des ruptures et produits sous seuil

Route : `GET /reports/stock/low`

Retourne les produits dont la quantite totale (somme de tous les entrepots) est inferieure a leur `alertThreshold`.

Pour chaque produit :

| champ              | description                               |
|--------------------|-------------------------------------------|
| `product`          | informations du produit                   |
| `totalQuantity`    | quantite totale disponible (tous entrepots) |
| `alertThreshold`   | seuil d'alerte                            |
| `deficit`          | `alertThreshold - totalQuantity`          |
| `warehouseDetails` | detail par entrepot                       |

### 3. rapport des mouvements sur une periode

Route : `GET /reports/movements`

Parametres de requete :

| parametre     | requis | description                        |
|---------------|--------|------------------------------------|
| `from`        | oui    | date de debut (ISO 8601)           |
| `to`          | oui    | date de fin (ISO 8601)             |
| `productId`   | non    | filtrer par produit                |
| `warehouseId` | non    | filtrer par entrepot               |
| `type`        | non    | filtrer par type de mouvement      |

La reponse inclut :
- la liste des mouvements sur la periode avec les relations (`product`, `warehouse`, `user`)
- des totaux agregees : `totalIn`, `totalOut`, `totalAdjustment`, `totalTransfer`

Support d'un parametre optionnel `format=csv`.

### 4. rapport de valorisation du stock

Route : `GET /reports/stock/valuation`

Pour chaque produit en stock, calcule :

| champ           | description                                      |
|-----------------|--------------------------------------------------|
| `product`       | informations du produit                          |
| `totalQuantity` | quantite totale disponible                       |
| `costPrice`     | prix d'achat unitaire                            |
| `unitPrice`     | prix de vente unitaire                           |
| `costValue`     | `totalQuantity * costPrice`                      |
| `saleValue`     | `totalQuantity * unitPrice`                      |
| `margin`        | `saleValue - costValue`                          |

La reponse inclut egalement un total general (`grandTotalCostValue`, `grandTotalSaleValue`, `grandTotalMargin`).

---

## criteres de validation

- `GET /reports/stock` avec un jeton `STOCK_KEEPER` renvoie `403`
- `GET /reports/stock?format=csv` renvoie un fichier CSV avec les entetes corrects
- `GET /reports/movements?from=2026-01-01&to=2026-12-31` renvoie les mouvements de l'annee
- `GET /reports/stock/valuation` renvoie des totaux coherents avec les donnees de la base
