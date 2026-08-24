#!/bin/bash
set -e

# ============================================================
# Script de reset et ré-initialisation de la base de données
# ============================================================

echo "Reinitialisation de la base de donnees..."

# Generer le client Prisma
echo "Generation du client Prisma..."
npx prisma generate

# Executer les migrations dev avec reset
echo "Execution des migrations Prisma..."
npx prisma migrate dev --name reset --skip-seed

# Re-executer le seed
echo "Execution du seeding..."
npx prisma db seed

echo "Reinitialisation de la base de donnees terminee avec succes!"
