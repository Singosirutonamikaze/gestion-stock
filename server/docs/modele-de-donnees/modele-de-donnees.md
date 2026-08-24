# modele de donnees

Ce document decrit l'ensemble des entites persistees en base de donnees.  
Le schema source est [`server/prisma/schema.prisma`](../prisma/schema.prisma).

---

## enumerations

### UserRole

| valeur        | description                          |
|---------------|--------------------------------------|
| `ADMIN`       | acces complet, gestion des utilisateurs |
| `MANAGER`     | gestion du catalogue et des commandes |
| `STOCK_KEEPER` | creation des mouvements de stock    |
| `SALES`       | creation des commandes de vente      |

### MovementType

| valeur       | description                                 |
|--------------|---------------------------------------------|
| `IN`         | entree en stock                             |
| `OUT`        | sortie de stock                             |
| `ADJUSTMENT` | ajustement d'inventaire                     |
| `TRANSFER`   | transfert entre deux entrepots              |

### OrderType

| valeur     | description        |
|------------|--------------------|
| `PURCHASE` | commande d'achat   |
| `SALE`     | commande de vente  |

### OrderStatus

| valeur      | description                    |
|-------------|--------------------------------|
| `DRAFT`     | brouillon, modifiable          |
| `CONFIRMED` | confirme, en cours de traitement |
| `SHIPPED`   | expedie                        |
| `RECEIVED`  | recu (achat) ou livre (vente)  |
| `CANCELLED` | annule                         |

---

## entites

### User

Table `users`. Represente un compte utilisateur du systeme.

| champ       | type       | contraintes              | description                              |
|-------------|------------|--------------------------|------------------------------------------|
| `id`        | uuid       | cle primaire             | identifiant unique                       |
| `email`     | string     | unique, non null         | adresse email de connexion               |
| `password`  | string     | non null                 | mot de passe hache, jamais renvoye au client |
| `firstName` | string     | non null                 | prenom                                   |
| `lastName`  | string     | non null                 | nom de famille                           |
| `role`      | UserRole   | defaut `SALES`           | role de l'utilisateur dans le systeme    |
| `isActive`  | boolean    | defaut `true`            | compte actif ou desactive                |
| `createdAt` | datetime   | defaut `now()`           | date de creation                         |
| `updatedAt` | datetime   | mis a jour automatiquement | date de derniere modification          |

Relations :
- un utilisateur peut avoir plusieurs `StockMovement`
- un utilisateur peut avoir plusieurs `Order`

---

### Category

Table `categories`. Permet d'organiser les produits en arborescence.

| champ         | type     | contraintes              | description                                   |
|---------------|----------|--------------------------|-----------------------------------------------|
| `id`          | uuid     | cle primaire             | identifiant unique                            |
| `name`        | string   | unique, non null         | nom de la categorie                           |
| `description` | string   | optionnel                | description libre                             |
| `parentId`    | uuid     | optionnel, cle etrangere | identifiant de la categorie parente           |
| `createdAt`   | datetime | defaut `now()`           | date de creation                              |
| `updatedAt`   | datetime | mis a jour automatiquement | date de derniere modification               |

Relations :
- une categorie peut avoir une categorie parente (`parent`)
- une categorie peut avoir plusieurs sous-categories (`children`)
- une categorie peut avoir plusieurs `Product`

---

### Supplier

Table `suppliers`. Represente un fournisseur externe.

| champ           | type     | contraintes              | description              |
|-----------------|----------|--------------------------|--------------------------|
| `id`            | uuid     | cle primaire             | identifiant unique       |
| `name`          | string   | non null                 | nom du fournisseur       |
| `email`         | string   | optionnel                | adresse email            |
| `phone`         | string   | optionnel                | numero de telephone      |
| `address`       | string   | optionnel                | adresse physique         |
| `contactPerson` | string   | optionnel                | nom du contact principal |
| `createdAt`     | datetime | defaut `now()`           | date de creation         |
| `updatedAt`     | datetime | mis a jour automatiquement | date de derniere modification |

Relations :
- un fournisseur peut fournir plusieurs `Product`
- un fournisseur peut etre associe a plusieurs `Order` de type `PURCHASE`

---

### Warehouse

Table `warehouses`. Represente un site de stockage physique.

| champ      | type     | contraintes              | description                          |
|------------|----------|--------------------------|--------------------------------------|
| `id`       | uuid     | cle primaire             | identifiant unique                   |
| `name`     | string   | non null                 | nom de l'entrepot                    |
| `location` | string   | non null                 | adresse ou description de la zone    |
| `isActive` | boolean  | defaut `true`            | entrepot actif ou desactive          |
| `createdAt` | datetime | defaut `now()`          | date de creation                     |
| `updatedAt` | datetime | mis a jour automatiquement | date de derniere modification      |

Relations :
- un entrepot contient plusieurs `Stock`
- un entrepot est lie a plusieurs `StockMovement` (comme source ou comme destination pour les transferts)
- un entrepot est lie a plusieurs `Order`

---

### Product

Table `products`. Represente un article du catalogue.

| champ            | type     | contraintes              | description                                   |
|------------------|----------|--------------------------|-----------------------------------------------|
| `id`             | uuid     | cle primaire             | identifiant unique                            |
| `sku`            | string   | unique, non null         | code article unique                           |
| `name`           | string   | non null                 | nom du produit                                |
| `description`    | string   | optionnel                | description libre                             |
| `unitPrice`      | decimal  | 10,2 — non null          | prix de vente                                 |
| `costPrice`      | decimal  | 10,2 — non null          | prix d'achat                                  |
| `unit`           | string   | non null                 | unite de mesure (`piece`, `kg`, `litre`, etc.) |
| `categoryId`     | uuid     | cle etrangere, non null  | categorie du produit                          |
| `supplierId`     | uuid     | optionnel, cle etrangere | fournisseur principal                         |
| `alertThreshold` | integer  | defaut `0`               | seuil declenchant une alerte de rupture       |
| `isActive`       | boolean  | defaut `true`            | produit actif ou desactive                    |
| `createdAt`      | datetime | defaut `now()`           | date de creation                              |
| `updatedAt`      | datetime | mis a jour automatiquement | date de derniere modification               |

Index : `categoryId`, `supplierId`

Relations :
- un produit appartient a une `Category`
- un produit peut avoir un `Supplier` principal
- un produit peut avoir plusieurs entrees `Stock` (une par entrepot)
- un produit peut avoir plusieurs `StockMovement`
- un produit peut apparaitre dans plusieurs `OrderItem`

---

### Stock

Table `stocks`. Vue agregee de la quantite disponible par produit et par entrepot.  
Cette table est tenue a jour automatiquement par le service `stock-movements` via une transaction.  
Elle n'est jamais modifiee directement par l'API.

| champ         | type     | contraintes                       | description                       |
|---------------|----------|-----------------------------------|-----------------------------------|
| `id`          | uuid     | cle primaire                      | identifiant unique                |
| `productId`   | uuid     | cle etrangere, non null           | produit concerne                  |
| `warehouseId` | uuid     | cle etrangere, non null           | entrepot concerne                 |
| `quantity`    | integer  | defaut `0`                        | quantite disponible               |
| `updatedAt`   | datetime | mis a jour automatiquement        | date de derniere modification     |

Contrainte d'unicite : `(productId, warehouseId)`

---

### StockMovement

Table `stock_movements`. Source de verite immuable de tous les mouvements de stock.  
Un enregistrement cree n'est jamais modifie ni supprime.

| champ                | type         | contraintes              | description                                                    |
|----------------------|--------------|--------------------------|----------------------------------------------------------------|
| `id`                 | uuid         | cle primaire             | identifiant unique                                             |
| `productId`          | uuid         | cle etrangere, non null  | produit concerne                                               |
| `warehouseId`        | uuid         | cle etrangere, non null  | entrepot source                                                |
| `type`               | MovementType | non null                 | type de mouvement                                              |
| `quantity`           | integer      | non null, > 0            | quantite concernee, toujours positive                          |
| `reason`             | string       | optionnel                | motif (`casse`, `inventaire`, `retour`, etc.)                  |
| `reference`          | string       | optionnel                | reference externe (numero de commande, bon de livraison, etc.) |
| `relatedWarehouseId` | uuid         | optionnel, cle etrangere | entrepot destination, uniquement pour `TRANSFER`               |
| `userId`             | uuid         | cle etrangere, non null  | utilisateur ayant declenche le mouvement                       |
| `createdAt`          | datetime     | defaut `now()`, immuable | date de creation                                               |

Index : `productId`, `warehouseId`, `createdAt`

---

### Order

Table `orders`. Represente une commande d'achat ou de vente.

| champ          | type        | contraintes              | description                                          |
|----------------|-------------|--------------------------|------------------------------------------------------|
| `id`           | uuid        | cle primaire             | identifiant unique                                   |
| `orderNumber`  | string      | unique, non null         | numero de commande genere automatiquement            |
| `type`         | OrderType   | non null                 | `PURCHASE` ou `SALE`                                 |
| `status`       | OrderStatus | defaut `DRAFT`           | statut courant de la commande                        |
| `supplierId`   | uuid        | optionnel, cle etrangere | obligatoire si `type = PURCHASE`                     |
| `customerName` | string      | optionnel                | nom du client pour une commande de vente             |
| `warehouseId`  | uuid        | cle etrangere, non null  | entrepot concerne                                    |
| `totalAmount`  | decimal     | 10,2 — defaut `0`        | montant total, recalcule depuis les lignes           |
| `createdById`  | uuid        | cle etrangere, non null  | utilisateur ayant cree la commande                   |
| `createdAt`    | datetime    | defaut `now()`           | date de creation                                     |
| `updatedAt`    | datetime    | mis a jour automatiquement | date de derniere modification                      |

Index : `supplierId`, `warehouseId`, `status`

Note : il n'existe pas d'entite `Customer` separee pour l'instant. Le champ `customerName` (texte libre) suffit. Il sera remplace par une relation si un module client est cree ulterieurement.

---

### OrderItem

Table `order_items`. Represente une ligne dans une commande.

| champ       | type    | contraintes              | description                          |
|-------------|---------|--------------------------|--------------------------------------|
| `id`        | uuid    | cle primaire             | identifiant unique                   |
| `orderId`   | uuid    | cle etrangere, non null  | commande parente                     |
| `productId` | uuid    | cle etrangere, non null  | produit commande                     |
| `quantity`  | integer | non null                 | quantite commandee                   |
| `unitPrice` | decimal | 10,2 — non null          | prix au moment de la commande        |
| `subtotal`  | decimal | 10,2 — non null          | `quantity * unitPrice`               |

Index : `orderId`, `productId`  
Suppression en cascade si la commande parente est supprimee.
