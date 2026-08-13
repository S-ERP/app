#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# --- Colores para los mensajes de consola ---
BLUE='\033[1;34m'
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # sin color

PKG_JSON="package.json"
APP_JSON="app.json"
GRADLE="android/app/build.gradle"

# --- 1) Subir version (patch +1) ---
# Toma la version actual de package.json y calcula la siguiente (ej: 1.0.18 -> 1.0.19)
current_version=$(node -p "require('./package.json').version")
IFS='.' read -r major minor patch <<< "$current_version"
new_patch=$((patch + 1))
new_version="$major.$minor.$new_patch"
new_version_code=$(printf "%d%02d%02d" "$major" "$minor" "$new_patch")

echo -e "${BLUE}[1/5] Subiendo version: $current_version -> $new_version${NC}"

# Actualiza la version en los 3 archivos que la usan (web/expo y android)
sed -i "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" "$PKG_JSON"
sed -i "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" "$APP_JSON"
sed -i "s/versionCode [0-9]*/versionCode $new_version_code/" "$GRADLE"
sed -i "s/versionName \"$current_version\"/versionName \"$new_version\"/" "$GRADLE"

echo -e "${GREEN}Version actualizada a $new_version (versionCode $new_version_code)${NC}"

# --- 2) Compilar el build ---
echo -e "${BLUE}[2/5] Compilando proyecto...${NC}"
npm run build

echo -e "${GREEN}Build completado.${NC}"

# --- Credenciales/datos del servidor ---
# Se leen de .siles.env (no versionado en git) o se piden por consola si no existe
ENV_FILE=".alvaro.env"
if [ -f "$ENV_FILE" ]; then
    # shellcheck disable=SC1090
    source "$ENV_FILE"
else
    echo -e "${YELLOW}No se encontro $ENV_FILE con las credenciales del servidor.${NC}"
    read -r -p "Host SSH (usuario@ip): " SSH_HOST
    read -r -p "Directorio remoto del proyecto (ej: ~/servicios/serp): " REMOTE_DIR
    read -r -s -p "Password de sudo en el servidor: " SUDO_PASS
    echo
fi

BACKUP_DATE=$(date +%Y-%m-%d_%H%M%S)
BUILD_DIR="$REMOTE_DIR/entornos/serp/build"

# --- 3) Crear una copia del build actual en el servidor (respaldo con fecha) ---
echo -e "${BLUE}[3/5] Respaldando $BUILD_DIR (fecha: $BACKUP_DATE)...${NC}"
ssh "$SSH_HOST" "cp -r $BUILD_DIR ${BUILD_DIR}_$BACKUP_DATE"

# --- 4) Subir el build nuevo al servidor ---
# rsync --delete deja el remoto identico al build local (borra archivos viejos que ya no existen)
echo -e "${CYAN}[4/5] Subiendo build nuevo a $BUILD_DIR...${NC}"
rsync -avz --delete build/ "$SSH_HOST:$BUILD_DIR/"

# --- 5) Reiniciar el servicio (docker-compose down/up) ---
# Se envia "1" para seleccionar el entorno "serp" y luego la password de sudo
echo -e "${CYAN}[5/5] Reiniciando servidor en $SSH_HOST ($REMOTE_DIR)...${NC}"

printf '1\n%s\n' "$SUDO_PASS" | ssh -tt "$SSH_HOST" "cd $REMOTE_DIR && ./servisofts.sh down"
printf '1\n%s\n' "$SUDO_PASS" | ssh -tt "$SSH_HOST" "cd $REMOTE_DIR && ./servisofts.sh up -d"

echo -e "${GREEN}Servidor reiniciado.${NC}"
