#!/bin/bash
set -e

# ============================================================
# Script de restauration de la base de données PostgreSQL
# ============================================================

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore-db.sh <chemin_du_fichier_backup.sql.gz>"
  echo "Exemple: ./scripts/restore-db.sh backups/db_backup_20260824_100000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Erreur: Le fichier de sauvegarde '$BACKUP_FILE' n'existe pas."
  exit 1
fi

echo "=================================================="
echo "Restauration de la base de donnees depuis: $BACKUP_FILE"
echo "=================================================="

if docker ps | grep -q "postgres"; then
  CONTAINER_ID=$(docker ps -q -f name=postgres)
  echo "Restauration en cours dans le conteneur PostgreSQL ($CONTAINER_ID)..."
  gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_ID" psql -U postgres
  echo "Restauration de la base de donnees reussie !"
else
  echo "Erreur: Le conteneur Docker PostgreSQL n'est pas en cours d'execution."
  echo "Lancez d'abord: yarn docker:up ou make docker-up"
  exit 1
fi
