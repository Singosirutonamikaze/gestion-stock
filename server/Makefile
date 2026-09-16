# ------------------------------------------------------------
# Makefile Serveur - Backend (NestJS / Prisma)
# ------------------------------------------------------------

.PHONY: help install start dev build lint format test test-watch test-cov test-e2e docker-up docker-down docker-logs db-migrate db-seed db-studio db-backup db-restore

help:
	@echo ""
	@echo "------------------------------------------------------------------------------------------------------------------------"
	@echo " Guide des commandes disponibles pour le Serveur Backend (NestJS / Prisma)"
	@echo "------------------------------------------------------------------------------------------------------------------------"
	@echo ""
	@echo "  make install     - Cette commande [ make install     ] Installe l'ensemble des dépendances Node.js du serveur avec Yarn"
	@echo "  make dev         - Cette commande [ make dev         ] Démarre l'API backend NestJS avec surveillance et rechargement en direct"
	@echo ""
	@echo "  make build       - Cette commande [ make build       ] Compile le code TypeScript en JavaScript optimisé pour la production"
	@echo "  make lint        - Cette commande [ make lint        ] Analyse le code avec ESLint et applique les corrections automatiques"
	@echo "  make format      - Cette commande [ make format      ] Formate l'ensemble des fichiers TypeScript selon les règles Prettier"
	@echo ""
	@echo "  make test        - Cette commande [ make test        ] Exécute l'ensemble des tests unitaires avec Jest et enregistre les logs"
	@echo "  make test-watch  - Cette commande [ make test-watch  ] Lance les tests unitaires en mode interactif avec réexécution automatique"
	@echo "  make test-cov    - Cette commande [ make test-cov    ] Calcule et génère le rapport détaillé de couverture de code des tests"
	@echo "  make test-e2e    - Cette commande [ make test-e2e    ] Exécute la suite complète des tests d'intégration de bout en bout"
	@echo ""
	@echo "  make docker-up   - Cette commande [ make docker-up   ] Démarre le conteneur Docker hébergeant la base de données PostgreSQL"
	@echo "  make docker-down - Cette commande [ make docker-down ] Arrête le conteneur Docker hébergeant la base de données PostgreSQL"
	@echo "  make docker-logs - Cette commande [ make docker-logs ] Affiche les journaux et logs en temps réel du conteneur Docker"
	@echo ""
	@echo "  make db-migrate  - Cette commande [ make db-migrate  ] Crée et applique les nouvelles migrations Prisma sur la base de données"
	@echo "  make db-seed     - Cette commande [ make db-seed     ] Remplit la base de données avec le jeu de données initial de démonstration"
	@echo "  make db-studio   - Cette commande [ make db-studio   ] Ouvre l'interface Web Prisma Studio pour explorer et modifier les données"
	@echo "  make db-backup   - Cette commande [ make db-backup   ] Génère une archive de sauvegarde complète de la base de données et des logs"
	@echo "  make db-restore  - Cette commande [ make db-restore  ] Restaure une sauvegarde (Usage : make db-restore FILE=chemin/fichier.sql.gz)"
	@echo ""
	@echo "------------------------------------------------------------------------------------------------------------------------"
	@echo ""

install:
	yarn install

dev:
	yarn start:dev

LOG_DIR := logs
TIMESTAMP := $(shell date +%Y-%m-%d_%H-%M-%S)

$(LOG_DIR):
	mkdir -p $(LOG_DIR)

build: $(LOG_DIR)
	yarn build 2>&1 | tee $(LOG_DIR)/build_$(TIMESTAMP).log

lint:
	yarn lint

format:
	yarn format

test: $(LOG_DIR)
	yarn test 2>&1 | tee $(LOG_DIR)/test_$(TIMESTAMP).log

test-watch:
	yarn test:watch

test-cov:
	yarn test:cov

test-e2e:
	yarn test:e2e

docker-up:
	yarn docker:up

docker-down:
	yarn docker:down

docker-logs:
	yarn docker:logs

db-migrate:
	npx prisma migrate dev

db-seed:
	npx prisma db seed

db-studio:
	npx prisma studio

db-backup:
	./scripts/backup.sh

db-restore:
	./scripts/restore-db.sh $(FILE)
