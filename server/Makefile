# ============================================================
# Makefile Server (NestJS / Prisma)
# ============================================================

.PHONY: help install start dev build lint format test test-watch test-cov test-e2e docker-up docker-down docker-logs db-migrate db-seed db-studio db-backup db-restore

help:
	@echo "Commandes Server :"
	@echo "  make install     - Installe les dependances avec Yarn"
	@echo "  make dev         - Demarre l'API NestJS en mode watch"
	@echo "  make build       - Compile le serveur pour la prod (dist/)"
	@echo "  make lint        - Verifie et corrige les erreurs d'eslint"
	@echo "  make format      - Formate le code avec Prettier"
	@echo "  make test        - ExeCute les tests unitaires"
	@echo "  make test-cov    - ExeCute la couverture de tests"
	@echo "  make test-e2e    - ExeCute les tests de bout en bout"
	@echo "  make docker-up   - Lance le conteneur PostgreSQL"
	@echo "  make docker-down - Arrete le conteneur PostgreSQL"
	@echo "  make db-migrate  - Applique les migrations Prisma"
	@echo "  make db-seed     - Execute le script seed"
	@echo "  make db-studio   - Lance Prisma Studio"
	@echo "  make db-backup   - Exporte une sauvegarde de la base de donnees et des logs"
	@echo "  make db-restore  - Restaure la base (usage: make db-restore FILE=backups/fichier.sql.gz)"

install:
	yarn install

dev:
	yarn start:dev

build:
	yarn build

lint:
	yarn lint

format:
	yarn format

test:
	yarn test

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
