# ============================================================
# Makefile Client (Next.js 16)
# ============================================================

.PHONY: help install dev build start lint clean

help:
	@echo "Commandes Client :"
	@echo "  make install  - Installe les dependances avec npm"
	@echo "  make dev      - Demarre Next.js en mode dev (http://localhost:3001)"
	@echo "  make build    - Compile l'application pour la production (.next/)"
	@echo "  make start    - Demarre l'application compilee en production"
	@echo "  make lint     - Execute ESLint"
	@echo "  make clean    - Nettoie le dossier .next"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

clean:
	rm -rf .next node_modules
