#!/bin/bash
set -e

# ============================================================
# Script de sauvegarde (Backup) PostgreSQL et Logs
# ============================================================

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql.gz"
LOGS_BACKUP_FILE="${BACKUP_DIR}/logs_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "=================================================="
echo "Lancement de la sauvegarde: $TIMESTAMP"
echo "=================================================="

# 1. Sauvegarde de la base de donnees via pg_dump dans le conteneur Docker
if docker ps | grep -q "postgres"; then
  echo "[1/2] Exportation et compression de la base de donnees PostgreSQL..."
  docker exec -t $(docker ps -q -f name=postgres) pg_dumpall -U postgres | gzip > "$DB_BACKUP_FILE"
  echo " Base de donnees sauvegardee dans: $DB_BACKUP_FILE"
else
  echo "[1/2] ATTENTION: Conteneur PostgreSQL non detecte. Sauvegarde DB ignoree."
fi

# 2. Sauvegarde des fichiers de logs s'ils existent
echo "[2/2] Archivage des fichiers de logs..."
if [ -d "logs" ] || [ -f "app.log" ]; then
  tar -czf "$LOGS_BACKUP_FILE" logs/*.log app.log 2>/dev/null || true
  echo " Logs archives dans: $LOGS_BACKUP_FILE"
else
  echo " Aucun fichier de log a archiver."
fi

# Nettoyage des anciennes sauvegardes (conserver uniquement les 7 derniers jours)
find "$BACKUP_DIR" -type f -name "*.gz" -mtime +7 -exec rm -f {} \;

echo "=================================================="
echo "Sauvegarde terminee avec succes!"
echo "=================================================="
