# ------------------------------------------------------------
# Makefile Client - Frontend (Next.js 16)
# ------------------------------------------------------------

.PHONY: help install dev build start lint clean

help:
	@echo ""
	@echo "------------------------------------------------------------------------------------------------------------------------"
	@echo " Guide des commandes disponibles pour le Client Frontend (Next.js 16)"
	@echo "------------------------------------------------------------------------------------------------------------------------"
	@echo ""
	@echo "  make install  - Cette commande [ make install  ] Installe l'ensemble des dépendances Node.js du client avec npm"
	@echo "  make dev      - Cette commande [ make dev      ] Démarre le serveur de développement Next.js avec rechargement à chaud"
	@echo ""
	@echo "  make build    - Cette commande [ make build    ] Compile et optimise l'application pour le déploiement en production"
	@echo "  make start    - Cette commande [ make start    ] Démarre le serveur Next.js en mode production à partir du build généré"
	@echo ""
	@echo "  make lint     - Cette commande [ make lint     ] Analyse le code source avec ESLint pour détecter les erreurs de syntaxe"
	@echo "  make clean    - Cette commande [ make clean    ] Supprime le dossier de compilation .next et le répertoire node_modules"
	@echo ""
	@echo "------------------------------------------------------------------------------------------------------------------------"
	@echo ""

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
