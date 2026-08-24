# phase-0 : mise en place

Cette phase etablit les fondations du projet avant d'ecrire le moindre code metier.

---

## taches

### 1. initialiser NestJS dans `server/`

- Creer le projet NestJS avec Yarn comme gestionnaire de paquets
- Choisir la structure de projet par defaut

```bash
yarn global add @nestjs/cli
nest new server --package-manager yarn
```

### 2. initialiser Next.js dans `client/`

- Creer le projet Next.js avec npm comme gestionnaire de paquets
- Activer TypeScript, Tailwind CSS et l'App Router

```bash
npx create-next-app@latest client
```

### 3. depot Git et branches

Creer le depot sur GitHub et configurer les branches suivantes :

| branche             | role                               |
|---------------------|------------------------------------|
| `main`              | code stable, protege               |
| `develop-client`    | integration continue du client     |
| `develop-server`    | integration continue du serveur    |
| `production-client` | deploiement production du client   |
| `production-server` | deploiement production du serveur  |

Activer la protection de branche sur `main` et les branches `production-*`.

### 4. fichier dependabot et CI GitHub Actions

- Creer `.github/dependabot.yml` pour les mises a jour automatiques des dependances npm et yarn
- Creer les workflows GitHub Actions pour les pipelines CI :
  - lint et build sur chaque pull request vers `develop-*`
  - tests sur chaque pull request vers `main`

### 5. arborescence scaffoldee

- Ecrire un script `scaffold-client.sh` pour creer l'arborescence des dossiers du client
- Ecrire un equivalent pour le serveur si besoin
- Executer les scripts et committer la structure vide

---

## criteres de validation

- `yarn start:dev` dans `server/` demarre sans erreur
- `npm run dev` dans `client/` demarre sans erreur
- Les cinq branches existent sur le depot distant
- La CI GitHub Actions s'execute sur une pull request de test
