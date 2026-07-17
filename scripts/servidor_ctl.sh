#!/bin/bash
# Control remoto generico via flujo servisofts.sh (con menu interactivo).
# SSH a <host>, cd servicios/<carpeta>, corre ./servisofts.sh up -d / down.
# No se llama directo: lo usan restart_servidores.sh, off_servidor.sh y on_servidor.sh.

PASS="servisofts"

carpeta="$1"
accion="${2:-down}"
host_ip="${3:-192.168.2.2}"
HOST="servisofts@$host_ip"

if [ -z "$carpeta" ] || { [ "$accion" != "up" ] && [ "$accion" != "down" ]; }; then
  echo "Uso: $0 <carpeta> [up|down] [host_ip]"
  echo "  up   -> ./servisofts.sh up -d   (encender)"
  echo "  down -> ./servisofts.sh down    (apagar, default)"
  echo "  host_ip por default: 192.168.2.2"
  exit 1
fi

REMOTE_DIR="servicios/$carpeta"

if [ "$accion" = "up" ]; then
  comando="./servisofts.sh up -d"
else
  comando="./servisofts.sh down"
fi

if ! command -v sshpass &> /dev/null; then
  echo "Falta 'sshpass'. Instalalo con: sudo apt install -y sshpass"
  exit 1
fi

# -tt fuerza pseudo-terminal para que el menu interactivo y el sudo
# remoto puedan leer las respuestas por stdin (1 = unico entorno de
# la carpeta, despues la contrasena de sudo).
sshpass -p "$PASS" ssh -tt -o StrictHostKeyChecking=no "$HOST" "cd $REMOTE_DIR && $comando" << EOF
1
$PASS
EOF
