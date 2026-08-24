# roles et permissions

Ce document decrit les quatre roles du systeme et les actions autorisees pour chacun.

---

## roles

### ADMIN

Acces total. Seul role autorise a gerer les comptes utilisateurs.

### MANAGER

Gere le catalogue (produits, categories, fournisseurs, entrepots) et les commandes.  
Peut consulter les rapports.  
Ne peut pas gerer les comptes utilisateurs.

### STOCK_KEEPER

Cree des mouvements de stock.  
Peut consulter les produits et les niveaux de stock.  
Ne peut pas creer de commandes ni gerer les utilisateurs.

### SALES

Cree des commandes de vente.  
Peut consulter les produits et les niveaux de stock.  
Ne peut pas creer de mouvements de stock ni gerer les utilisateurs.

---

## matrice de permissions

| action                                                   | ADMIN | MANAGER | STOCK_KEEPER | SALES |
|----------------------------------------------------------|:-----:|:-------:|:------------:|:-----:|
| gerer les utilisateurs (creer, modifier, supprimer)      | oui   | non     | non          | non   |
| gerer les produits                                       | oui   | oui     | non          | non   |
| gerer les categories                                     | oui   | oui     | non          | non   |
| gerer les fournisseurs                                   | oui   | oui     | non          | non   |
| gerer les entrepots                                      | oui   | oui     | non          | non   |
| consulter produits, categories, fournisseurs, entrepots  | oui   | oui     | oui          | oui   |
| creer un mouvement de stock                              | oui   | oui     | oui          | non   |
| consulter les niveaux de stock                           | oui   | oui     | oui          | oui   |
| creer une commande d'achat                               | oui   | oui     | non          | non   |
| creer une commande de vente                              | oui   | oui     | non          | oui   |
| consulter les commandes                                  | oui   | oui     | oui          | oui   |
| consulter les rapports                                   | oui   | oui     | non          | non   |

---

## implementation technique

Les permissions sont appliquees cote serveur via :

- un **guard JWT** (`JwtAuthGuard`) qui verifie la validite du jeton sur toutes les routes protegees
- un **guard de roles** (`RolesGuard`) qui compare le role extrait du jeton avec les roles autorises sur la route
- un **decorateur** `@Roles(...roles)` place sur chaque controleur ou methode

Aucune logique de permission n'est implementee cote client. L'interface peut masquer des elements de navigation selon le role, mais la protection reelle reste cote API.
