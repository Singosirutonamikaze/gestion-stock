# phase-4 : catalogue

Cette phase implementer les modules du catalogue : categories, fournisseurs, entrepots et produits.

---

## taches

### 1. module categories

Chemin : `src/modules/categories/`

| methode  | route                  | action                         | roles autorises       |
|----------|------------------------|--------------------------------|-----------------------|
| `GET`    | `/categories`          | lister toutes les categories   | tous                  |
| `GET`    | `/categories/:id`      | consulter une categorie        | tous                  |
| `POST`   | `/categories`          | creer une categorie            | `ADMIN`, `MANAGER`    |
| `PATCH`  | `/categories/:id`      | modifier une categorie         | `ADMIN`, `MANAGER`    |
| `DELETE` | `/categories/:id`      | supprimer une categorie        | `ADMIN`, `MANAGER`    |

Regles metier :
- Le champ `parentId` est optionnel pour creer une sous-categorie
- Une categorie parente ne peut pas etre supprimee si elle a des enfants
- La reponse inclut la liste des sous-categories directes

### 2. module suppliers

Chemin : `src/modules/suppliers/`

| methode  | route              | action                        | roles autorises    |
|----------|--------------------|-------------------------------|--------------------|
| `GET`    | `/suppliers`       | lister tous les fournisseurs  | tous               |
| `GET`    | `/suppliers/:id`   | consulter un fournisseur      | tous               |
| `POST`   | `/suppliers`       | creer un fournisseur          | `ADMIN`, `MANAGER` |
| `PATCH`  | `/suppliers/:id`   | modifier un fournisseur       | `ADMIN`, `MANAGER` |
| `DELETE` | `/suppliers/:id`   | supprimer un fournisseur      | `ADMIN`, `MANAGER` |

### 3. module warehouses

Chemin : `src/modules/warehouses/`

| methode  | route               | action                      | roles autorises    |
|----------|---------------------|-----------------------------|--------------------|
| `GET`    | `/warehouses`       | lister tous les entrepots   | tous               |
| `GET`    | `/warehouses/:id`   | consulter un entrepot       | tous               |
| `POST`   | `/warehouses`       | creer un entrepot           | `ADMIN`, `MANAGER` |
| `PATCH`  | `/warehouses/:id`   | modifier un entrepot        | `ADMIN`, `MANAGER` |
| `DELETE` | `/warehouses/:id`   | desactiver un entrepot      | `ADMIN`, `MANAGER` |

Regles metier :
- La suppression est logique (`isActive = false`)

### 4. module products

Chemin : `src/modules/products/`

| methode  | route             | action                     | roles autorises    |
|----------|-------------------|----------------------------|--------------------|
| `GET`    | `/products`       | lister les produits        | tous               |
| `GET`    | `/products/:id`   | consulter un produit       | tous               |
| `POST`   | `/products`       | creer un produit           | `ADMIN`, `MANAGER` |
| `PATCH`  | `/products/:id`   | modifier un produit        | `ADMIN`, `MANAGER` |
| `DELETE` | `/products/:id`   | desactiver un produit      | `ADMIN`, `MANAGER` |

Decoupage interne :

```
modules/products/
├── controllers/
├── dto/
├── entities/       type Product metier (sans les champs Prisma internes)
├── mappers/        conversion PrismaProduct -> ProductEntity
├── repositories/   acces a la base via PrismaService
└── services/       logique metier
```

### 5. filtres de recherche sur les produits

La route `GET /products` accepte les parametres de requete suivants :

| parametre     | type    | description                                     |
|---------------|---------|-------------------------------------------------|
| `search`      | string  | recherche par nom ou sku (ILIKE)                |
| `categoryId`  | uuid    | filtre par categorie                            |
| `supplierId`  | uuid    | filtre par fournisseur                          |
| `isActive`    | boolean | filtre par statut actif/inactif                 |
| `belowAlert`  | boolean | si `true`, renvoie uniquement les produits sous seuil d'alerte |
| `page`        | integer | numero de page (defaut 1)                       |
| `limit`       | integer | nombre de resultats par page (defaut 20, max 100) |

La reponse inclut les metadonnees de pagination :

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### 6. tests unitaires et tests de bout en bout

Tests unitaires (`*.spec.ts`) :
- `ProductsService` : creation avec `sku` duplique, desactivation, filtrage

Tests de bout en bout (`test/`) :
- `GET /products` avec differents filtres
- `POST /products` avec un corps valide et un corps invalide
- Verifier les codes HTTP et le format de reponse

---

## criteres de validation

- `GET /products?search=cafe` renvoie les produits correspondants
- `GET /products?belowAlert=true` renvoie uniquement les produits sous seuil
- `POST /products` avec un `sku` duplique renvoie `409`
- Les relations `category` et `supplier` sont incluses dans les reponses produit
- Les tests unitaires et e2e passent
