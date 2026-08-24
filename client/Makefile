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

LOG_DIR := logs
TIMESTAMP := $(shell date +%Y-%m-%d_%H-%M-%S)

$(LOG_DIR):
	mkdir -p $(LOG_DIR)

build: $(LOG_DIR)
	npm run build 2>&1 | tee $(LOG_DIR)/build_$(TIMESTAMP).log

start:
	npm run start

lint:
	npm run lint

clean:
	rm -rf .next node_modules
