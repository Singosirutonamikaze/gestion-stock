# ============================================================
# Makefile Root - Gestion de Stock (Client & Server)
# ============================================================

.PHONY: help install dev build lint test docker-up docker-down clean

help:
	@echo "Commandes disponibles :"
	@echo "  make install      - Installe les dependances du client et du serveur"
	@echo "  make dev-server   - Lance le serveur NestJS en mode dev"
	@echo "  make dev-client   - Lance le client Next.js en mode dev"
	@echo "  make build        - Compile le client et le serveur"
	@echo "  make lint         - Execute le linting sur le client et le serveur"
	@echo "  make test         - Execute les tests sur le serveur"
	@echo "  make docker-up    - Demarre la base PostgreSQL via Docker"
	@echo "  make docker-down  - Arrete la base PostgreSQL Docker"
	@echo "  make db-migrate   - ExeCute les migrations Prisma (server)"
	@echo "  make db-seed      - Popule la base avec le seed Prisma (server)"

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

docker-up:
	cd server && yarn docker:up

docker-down:
	cd server && yarn docker:down

db-migrate:
	cd server && npx prisma migrate dev

db-seed:
	cd server && npx prisma db seed

clean:
	rm -rf server/dist server/node_modules client/.next client/node_modules
