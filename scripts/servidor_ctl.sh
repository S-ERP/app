#!/bin/bash
# Control remoto generico via flujo servisofts.sh (con menu interactivo).
# SSH a <host>, cd servicios/<carpeta>, corre ./servisofts.sh up -d / down.
# No se llama directo: lo usan restart_servidores.sh, off_servidor.sh y on_servidor.sh.

PASS="servisofts"

carpeta="$1"
accion="${2:-down}"
host_ip="${3:-192.168.2.2}"
HOST="servisofts@$host_ip"

if [ -z "$carpeta" ] || { [ "$accion" != "up" ] && [ "$accion" != "down" ] && [ "$accion" != "kill" ]; }; then
  echo "Uso: $0 <carpeta> [up|down|kill] [host_ip]"
  echo "  up   -> ./servisofts.sh up -d       (encender)"
  echo "  down -> ./servisofts.sh down        (apagar, default)"
  echo "  kill -> docker-compose kill + rm -f (forzado, salteando el menu,"
  echo "          para cuando 'down' no libera el puerto/IP)"
  echo "  host_ip por default: 192.168.2.2"
  exit 1
fi

REMOTE_DIR="servicios/$carpeta"

if ! command -v sshpass &> /dev/null; then
  echo "Falta 'sshpass'. Instalalo con: sudo apt install -y sshpass"
  exit 1
fi

if [ "$accion" = "kill" ]; then
  # Bypassea el menu de servisofts.sh: docker-compose kill manda SIGKILL
  # directo y rm -f saca el contenedor aunque haya quedado colgado
  # reteniendo el puerto/IP.
  comando="docker-compose kill && docker-compose rm -f"
  sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$HOST" "cd $REMOTE_DIR && $comando"
  exit $?
fi

if [ "$accion" = "up" ]; then
  comando="./servisofts.sh up -d"
else
  comando="./servisofts.sh down"
fi

# -tt fuerza pseudo-terminal para que el menu interactivo y el sudo
# remoto puedan leer las respuestas por stdin (1 = unico entorno de
# la carpeta, despues la contrasena de sudo).
sshpass -p "$PASS" ssh -tt -o StrictHostKeyChecking=no "$HOST" "cd $REMOTE_DIR && $comando" << EOF
1
$PASS
EOF
