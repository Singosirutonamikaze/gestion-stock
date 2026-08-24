# phase-6 : commandes

Cette phase implementer le module de gestion des commandes d'achat et de vente.  
A chaque transition de statut critique, un mouvement de stock est genere automatiquement.

---

## taches

### 1. module orders

Chemin : `src/modules/orders/`

| methode  | route            | action                          | roles autorises                        |
|----------|------------------|---------------------------------|----------------------------------------|
| `GET`    | `/orders`        | lister les commandes            | tous                                   |
| `GET`    | `/orders/:id`    | consulter une commande          | tous                                   |
| `POST`   | `/orders`        | creer une commande              | `ADMIN`, `MANAGER`, `SALES` (vente uniquement) |
| `PATCH`  | `/orders/:id`    | mettre a jour une commande      | `ADMIN`, `MANAGER`                     |
| `DELETE` | `/orders/:id`    | annuler une commande            | `ADMIN`, `MANAGER`                     |

Champs du `CreateOrderDto` :

| champ          | requis            | description                               |
|----------------|-------------------|-------------------------------------------|
| `type`         | oui               | `PURCHASE` ou `SALE`                      |
| `supplierId`   | si `PURCHASE`     | fournisseur de la commande d'achat        |
| `customerName` | non               | nom du client pour une commande de vente  |
| `warehouseId`  | oui               | entrepot concerne                         |
| `items`        | oui, min 1        | lignes de commande                        |

Chaque element de `items` :

| champ       | requis | description              |
|-------------|--------|--------------------------|
| `productId` | oui    | produit commande         |
| `quantity`  | oui    | quantite, > 0            |
| `unitPrice` | oui    | prix unitaire au moment de la commande |

### 2. gestion des transitions de statut

Les transitions autorisees sont :

```
DRAFT -> CONFIRMED -> SHIPPED -> RECEIVED
DRAFT -> CANCELLED
CONFIRMED -> CANCELLED
```

Toute autre transition est rejetee avec une erreur `400`.  
Le service valide la transition avant de la persister.

### 3. mouvement automatique a la reception d'un achat

Lors du passage d'une commande `PURCHASE` au statut `RECEIVED` :

- Pour chaque ligne de commande, creer un mouvement `IN` :
  - `productId` depuis la ligne
  - `warehouseId` depuis la commande
  - `quantity` depuis la ligne
  - `reference` egal au numero de commande
  - `userId` egal a l'utilisateur effectuant la transition

L'ensemble (mise a jour du statut + creation des mouvements + mise a jour du stock) est realise dans une **transaction Prisma**.

### 4. mouvement automatique a l'expedition d'une vente

Lors du passage d'une commande `SALE` au statut `SHIPPED` :

- Verifier le stock disponible pour chaque ligne (meme logique que la phase 5)
- Pour chaque ligne de commande, creer un mouvement `OUT`
- Si un produit est en rupture, annuler toute la transaction et renvoyer `400`

### 5. calcul automatique du montant total

Lors de la creation ou de la mise a jour des lignes :

- `subtotal` de chaque ligne = `quantity * unitPrice`
- `totalAmount` de la commande = somme de tous les `subtotal`

Ce calcul est effectue dans le service, pas dans le controleur ni dans la base.

### 6. tests unitaires et de bout en bout

Tests unitaires :
- `OrdersService.create` : generation du numero de commande, calcul du total
- `OrdersService.updateStatus` : transitions valides et invalides
- Mouvement automatique a `RECEIVED`
- Mouvement automatique a `SHIPPED` avec stock insuffisant

Tests de bout en bout :
- Cycle complet achat : `DRAFT -> CONFIRMED -> RECEIVED` et verifier les mouvements generes
- Cycle complet vente : `DRAFT -> CONFIRMED -> SHIPPED` et verifier le decrement du stock
- Vente en rupture de stock : `SHIPPED` renvoie `400`
- Transition invalide (`RECEIVED -> CONFIRMED`) : `400`

---

## criteres de validation

- La creation d'une commande genere un `orderNumber` unique
- Le `totalAmount` est correctement calcule depuis les lignes
- Le passage a `RECEIVED` cree autant de mouvements `IN` que de lignes de commande
- Le passage a `SHIPPED` sur stock insuffisant renvoie `400` et ne cree aucun mouvement
- Une transition invalide renvoie `400` avec un message explicite
- Les tests unitaires et e2e passent
