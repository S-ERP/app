#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# --- Colores para los mensajes de consola ---
BLUE='\033[1;34m'
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # sin color

# --- Datos del servidor ---
# Se leen de .alvaro.env
ENV_FILE=".alvaro.env"
if [ -f "$ENV_FILE" ]; then
    # shellcheck disable=SC1090
    source "$ENV_FILE"
else
    echo -e "${YELLOW}No se encontro $ENV_FILE con los datos del servidor.${NC}"
    exit 1
fi

# Contraseña de sudo
SUDO_PASS="${SUDO_PASS:-servisofts}"

BUILD_DIR="$REMOTE_DIR/entornos/serp/build"

# Se puede pasar el nombre de un backup puntual como argumento (ej: build_2026-08-13_142530)
# Si no se pasa nada, se usa el backup mas reciente que haya en el servidor.
BACKUP_NAME="${1:-}"

# --- 1) Elegir el backup a restaurar ---
echo -e "${BLUE}[1/3] Buscando backup para revertir...${NC}"

if [ -z "$BACKUP_NAME" ]; then
    BACKUP_NAME=$(ssh "$SSH_HOST" "cd $REMOTE_DIR && ls -d build_* 2>/dev/null | sort | tail -n 1")
fi

if [ -z "$BACKUP_NAME" ]; then
    echo -e "${YELLOW}No se encontro ningun backup (build_*) en $REMOTE_DIR.${NC}"
    exit 1
fi

echo -e "${GREEN}Se va a restaurar: $BACKUP_NAME${NC}"

# --- 2) Quitar lo subido y restaurar el backup anterior ---
# El build actual se guarda aparte por si hace falta revisarlo despues
UNDO_DATE=$(date +%Y-%m-%d_%H%M%S)

echo -e "${CYAN}[2/3] Restaurando $BACKUP_NAME como build...${NC}"
ssh "$SSH_HOST" "cd $REMOTE_DIR && mv $BUILD_DIR ${BUILD_DIR}_revertido_$UNDO_DATE && cp -r $BACKUP_NAME $BUILD_DIR"

echo -e "${GREEN}build restaurado desde $BACKUP_NAME (el que estaba se guardo como ${BUILD_DIR}_revertido_$UNDO_DATE).${NC}"

# --- 3) Reiniciar el servicio (docker-compose down/up) ---
echo -e "${CYAN}[3/3] Reiniciando servidor...${NC}"

printf '1\n%s\n' "$SUDO_PASS" | ssh -tt "$SSH_HOST" "cd $REMOTE_DIR && ./servisofts.sh down"
printf '1\n%s\n' "$SUDO_PASS" | ssh -tt "$SSH_HOST" "cd $REMOTE_DIR && ./servisofts.sh up -d"

echo -e "${GREEN}Listo. Servidor reiniciado con $BACKUP_NAME.${NC}"
