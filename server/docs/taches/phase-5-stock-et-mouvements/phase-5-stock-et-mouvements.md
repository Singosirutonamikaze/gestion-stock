# phase-5 : stock et mouvements

Cette phase implementer les modules de gestion du stock et des mouvements de stock.  
Le mouvement est la source de verite ; la table `stocks` est une vue agregee maintenue automatiquement.

---

## taches

### 1. creation d'un mouvement de stock

Chemin : `src/modules/stock-movements/`

| methode | route               | action                         | roles autorises               |
|---------|---------------------|--------------------------------|-------------------------------|
| `GET`   | `/stock-movements`  | lister les mouvements          | tous                          |
| `GET`   | `/stock-movements/:id` | consulter un mouvement      | tous                          |
| `POST`  | `/stock-movements`  | creer un mouvement de stock    | `ADMIN`, `MANAGER`, `STOCK_KEEPER` |

Un mouvement cree n'est jamais modifie ni supprime.

Champs du `CreateStockMovementDto` :

| champ                | requis | description                                                    |
|----------------------|--------|----------------------------------------------------------------|
| `productId`          | oui    | identifiant du produit                                         |
| `warehouseId`        | oui    | entrepot source                                                |
| `type`               | oui    | `IN`, `OUT`, `ADJUSTMENT` ou `TRANSFER`                        |
| `quantity`           | oui    | quantite positive                                              |
| `reason`             | non    | motif libre                                                    |
| `reference`          | non    | reference externe                                              |
| `relatedWarehouseId` | non    | entrepot destination, obligatoire si `type = TRANSFER`         |

### 2. operation transactionnelle

Lors de la creation d'un mouvement, le service execute les deux operations suivantes dans une **transaction Prisma** :

1. creer l'enregistrement `StockMovement`
2. mettre a jour la quantite dans la table `stocks` (upsert)

La logique de mise a jour de la quantite selon le type :

| type         | effet sur `quantity`                                             |
|--------------|------------------------------------------------------------------|
| `IN`         | `quantity += mouvement.quantity`                                 |
| `OUT`        | `quantity -= mouvement.quantity`                                 |
| `ADJUSTMENT` | `quantity = mouvement.quantity` (remplacement direct)            |
| `TRANSFER`   | source : `quantity -= mouvement.quantity` / destination : `quantity += mouvement.quantity` |

Si la transaction echoue, aucun changement n'est persiste.

### 3. verification du stock disponible

Avant de valider une sortie (`OUT`) ou un transfert (`TRANSFER`) :

1. lire la quantite disponible dans `stocks` pour `(productId, warehouseId)`
2. si `quantite_disponible < mouvement.quantity`, lever une `InsufficientStockException`

L'exception renvoie une reponse `400` avec le detail :

```json
{
  "statusCode": 400,
  "message": "stock insuffisant",
  "available": 5,
  "requested": 10
}
```

### 4. consultation des niveaux de stock

Chemin : `src/modules/stock/`

| methode | route                          | action                                            | roles autorises |
|---------|--------------------------------|---------------------------------------------------|-----------------|
| `GET`   | `/stock`                       | lister tous les niveaux de stock                  | tous            |
| `GET`   | `/stock?productId=:id`         | stock d'un produit dans tous les entrepots        | tous            |
| `GET`   | `/stock?warehouseId=:id`       | stock de tous les produits dans un entrepot       | tous            |
| `GET`   | `/stock/low`                   | produits sous le seuil d'alerte                   | tous            |

### 5. detection des produits sous seuil d'alerte

La route `GET /stock/low` retourne les produits dont la quantite totale (somme de tous les entrepots) est inferieure a leur `alertThreshold`.

La reponse inclut pour chaque produit :
- les informations du produit
- la quantite totale disponible
- le seuil d'alerte
- le detail par entrepot

### 6. tests unitaires et de bout en bout

Tests unitaires :
- sortie avec stock suffisant : succes
- sortie avec stock insuffisant : `InsufficientStockException`
- transfert : decrement de la source et increment de la destination
- creation : la transaction est atomique (si le upsert echoue, le mouvement n'est pas cree)

Tests de bout en bout :
- sequence complete : `IN` puis `OUT` puis verifier le solde
- `OUT` sur un stock a zero : `400`
- `TRANSFER` sans `relatedWarehouseId` : `400`

---

## criteres de validation

- Creer un mouvement `IN` de 100 unites, puis un `OUT` de 100 unites laisse un solde de 0
- Un `OUT` de 1 unite sur un stock a 0 renvoie `400` avec le detail
- Un `TRANSFER` met a jour les deux entrepots dans la meme transaction
- `GET /stock/low` retourne correctement les produits sous seuil
- Les tests unitaires et e2e passent, cas limites inclus
