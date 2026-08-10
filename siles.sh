#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PKG_JSON="package.json"
APP_JSON="app.json"
GRADLE="android/app/build.gradle"

current_version=$(node -p "require('./package.json').version")
IFS='.' read -r major minor patch <<< "$current_version"
new_patch=$((patch + 1))
new_version="$major.$minor.$new_patch"
new_version_code=$(printf "%d%02d%02d" "$major" "$minor" "$new_patch")

echo "Subiendo version: $current_version -> $new_version"

sed -i "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" "$PKG_JSON"
sed -i "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" "$APP_JSON"
sed -i "s/versionCode [0-9]*/versionCode $new_version_code/" "$GRADLE"
sed -i "s/versionName \"$current_version\"/versionName \"$new_version\"/" "$GRADLE"

echo "Version actualizada a $new_version (versionCode $new_version_code)"

echo "Compilando proyecto..."
npm run build

echo "Build completado."

# --- Reinicio del servidor (serp) ---
ENV_FILE=".siles.env"
if [ -f "$ENV_FILE" ]; then
    # shellcheck disable=SC1090
    source "$ENV_FILE"
else
    echo "No se encontro $ENV_FILE con las credenciales del servidor."
    read -r -p "Host SSH (usuario@ip): " SSH_HOST
    read -r -p "Directorio remoto del proyecto (ej: ~/servicios/serp): " REMOTE_DIR
    read -r -s -p "Password de sudo en el servidor: " SUDO_PASS
    echo
fi

BACKUP_DATE=$(date +%Y-%m-%d_%H%M%S)
BUILD_DIR="$REMOTE_DIR/entornos/serp/build"

echo "Respaldando $BUILD_DIR (fecha: $BACKUP_DATE)..."
ssh "$SSH_HOST" "cp -r $BUILD_DIR ${BUILD_DIR}_$BACKUP_DATE"

echo "Subiendo build nuevo a $BUILD_DIR..."
rsync -avz --delete build/ "$SSH_HOST:$BUILD_DIR/"

echo "Reiniciando servidor en $SSH_HOST ($REMOTE_DIR)..."

printf '1\n%s\n' "$SUDO_PASS" | ssh -tt "$SSH_HOST" "cd $REMOTE_DIR && ./servisofts.sh down"
printf '1\n%s\n' "$SUDO_PASS" | ssh -tt "$SSH_HOST" "cd $REMOTE_DIR && ./servisofts.sh up"

echo "Servidor reiniciado."
