#!/bin/bash

HOST="servisofts@192.168.2.2"
PASS="servisofts"
REMOTE_DIR="servicios/caja"

accion="${1:-down}"

if [ "$accion" != "up" ] && [ "$accion" != "down" ]; then
  echo "Uso: $0 [up|down]"
  echo "  up   -> ./servisofts.sh up -d   (encender)"
  echo "  down -> ./servisofts.sh down    (apagar, default)"
  exit 1
fi

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
# remoto puedan leer las respuestas por stdin (1 = entorno "caja",
# despues la contrasena de sudo).
sshpass -p "$PASS" ssh -tt -o StrictHostKeyChecking=no "$HOST" "cd $REMOTE_DIR && $comando" << EOF
1
$PASS
EOF
