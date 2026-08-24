#!/bin/bash
set -e

# ============================================================
# Script de vérification globale de la qualité du code backend
# ============================================================

echo "Execution du check de qualite backend..."

# 1. Formatage
echo "[1/4] Verification du formatage..."
yarn format

# 2. Linting
echo "[2/4] Verification du linting..."
yarn lint

# 3. Tests Unitaires
echo "[3/4] Execution des tests unitaires..."
yarn test

# 4. Verification de Compilation
echo "[4/4] Verification de la compilation TypeScript..."
yarn build

echo "Check de qualite passe avec succes!"
