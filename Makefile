# ------------------------------------------------------------
# Makefile Racine - Gestion de Stock (Client & Serveur)
# ------------------------------------------------------------

.PHONY: help install dev-server dev-client build lint test test-e2e test-perf test-all docker-up docker-down docker-logs db-migrate db-seed db-studio db-backup db-restore clean

help:
	@echo ""
	@echo "------------------------------------------------------------------------------------------------------------------------"
	@echo " Guide des commandes disponibles pour le projet Gestion de Stock"
	@echo "------------------------------------------------------------------------------------------------------------------------"
	@echo ""
	@echo "  make install      - Cette commande [ make install      ] Installe l'ensemble des modules et dependances pour le client et le serveur"
	@echo ""
	@echo "  make dev-server   - Cette commande [ make dev-server   ] Demarre l'API backend NestJS avec rechargement automatique en direct (Watch mode)"
	@echo "  make dev-client   - Cette commande [ make dev-client   ] Demarre l'application frontend Next.js sur le serveur de developpement local"
	@echo ""
	@echo "  make build        - Cette commande [ make build        ] Genere les fichiers de production optimises pour le client et le serveur"
	@echo "  make lint         - Cette commande [ make lint         ] Analyse et corrige les erreurs de syntaxe et de style sur l'ensemble du code"
	@echo "  make test         - Cette commande [ make test         ] Execute la suite complete des tests unitaires automatises du serveur"
	@echo "  make test-e2e     - Cette commande [ make test-e2e     ] Execute la suite complete des tests E2E du serveur"
	@echo "  make test-perf    - Cette commande [ make test-perf    ] Execute la suite des tests de performance du serveur"
	@echo "  make test-all     - Cette commande [ make test-all     ] Execute l'ensemble des tests (unitaires, performance, E2E)"
	@echo ""
	@echo "  make docker-up    - Cette commande [ make docker-up    ] Initialise et demarre le conteneur Docker contenant la base de donnees PostgreSQL"
	@echo "  make docker-down  - Cette commande [ make docker-down  ] Arrete et desactive proprement les conteneurs Docker en cours d'execution"
	@echo "  make docker-logs  - Cette commande [ make docker-logs  ] Affiche le flux des journaux d'evenements et logs du conteneur en temps reel"
	@echo ""
	@echo "  make db-migrate   - Cette commande [ make db-migrate   ] Applique les dernieres migrations Prisma et synchronise le schema de base"
	@echo "  make db-seed      - Cette commande [ make db-seed      ] Insere les jeux de donnees initiaux et donnees de demonstration dans la base"
	@echo "  make db-studio    - Cette commande [ make db-studio    ] Lance l'interface graphique Prisma Studio pour visualiser et editer les tables"
	@echo "  make db-backup    - Cette commande [ make db-backup    ] Cree une archive de sauvegarde complete de la base de donnees et des logs"
	@echo "  make db-restore   - Cette commande [ make db-restore   ] Restaure une sauvegarde existante (Exemple : make db-restore FILE=chemin/fichier.sql.gz)"
	@echo ""
	@echo "  make clean        - Cette commande [ make clean        ] Supprime les repertoires de compilation dist, .next et les modules installes"
	@echo ""
	@echo "------------------------------------------------------------------------------------------------------------------------"
	@echo ""

install:
	cd server && yarn install
	cd client && npm install

dev-server:
	cd server && yarn start:dev

dev-client:
	cd client && npm run dev

build:
	cd server && yarn build
	cd client && npm run build

lint:
	cd server && yarn lint
	cd client && npm run lint

test:
	cd server && yarn test

test-e2e:
	cd server && yarn test:e2e

test-perf:
	cd server && yarn test:performance

test-all:
	cd server && yarn test && yarn test:performance && yarn test:e2e

docker-up:
	cd server && yarn docker:up

docker-down:
	cd server && yarn docker:down

docker-logs:
	cd server && yarn docker:logs

db-migrate:
	cd server && npx prisma migrate dev

db-seed:
	cd server && npx prisma db seed

db-studio:
	cd server && npx prisma studio

db-backup:
	cd server && ./scripts/backup.sh

db-restore:
	cd server && ./scripts/restore-db.sh $(FILE)

clean:
	rm -rf server/dist server/node_modules client/.next client/node_modules
