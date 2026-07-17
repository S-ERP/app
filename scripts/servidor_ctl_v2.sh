#!/bin/bash
# Control remoto generico via docker-compose directo (sin menu interactivo).
# SSH a <host>, cd <base_dir>/<carpeta>, corre docker-compose up -d / down.
# No se llama directo: lo usan restart_servidores.sh, off_servidor.sh y on_servidor.sh.
#
# modo "simple" (default): docker-compose up -d / down, tal cual, sin sudo.
# modo "entorno": replica lo que hace servisofts.sh pero sin el menu
#   interactivo -- necesario cuando el docker-compose.yaml usa ${NAME} y
#   ${IP} (container_name, ipv4_address) que salen de config/.env.<carpeta>.
#   Sin esto, NAME e IP quedan vacios: los contenedores se llaman mal
#   (choque de nombre con otros servicios) y no toman la IP fija esperada.

PASS="servisofts"

carpeta="$1"
accion="${2:-down}"
host_ip="${3:-192.168.2.3}"
base_dir="${4:-v2}"
modo="${5:-simple}"
HOST="servisofts@$host_ip"

if [ -z "$carpeta" ] || { [ "$accion" != "up" ] && [ "$accion" != "down" ]; }; then
  echo "Uso: $0 <carpeta> [up|down] [host_ip] [base_dir] [simple|entorno]"
  echo "  up   -> docker-compose up -d   (encender)"
  echo "  down -> docker-compose down    (apagar, default)"
  echo "  host_ip por default: 192.168.2.3"
  echo "  base_dir por default: v2 (usar '.' para la raiz del home)"
  echo "  modo por default: simple (usar 'entorno' si el compose usa \${NAME}/\${IP})"
  exit 1
fi

if [ "$base_dir" = "." ]; then
  REMOTE_DIR="$carpeta"
else
  REMOTE_DIR="$base_dir/$carpeta"
fi

if ! command -v sshpass &> /dev/null; then
  echo "Falta 'sshpass'. Instalalo con: sudo apt install -y sshpass"
  exit 1
fi

if [ "$modo" = "entorno" ]; then
  if [ "$accion" = "up" ]; then
    accion_cmd="up -d"
  else
    accion_cmd="down"
  fi
  comando="sudo NAME=$carpeta docker-compose -f docker-compose.yaml --env-file ./config/.env.$carpeta -p $carpeta $accion_cmd"
  # -tt fuerza pseudo-terminal para que el sudo remoto pueda leer la
  # contrasena por stdin.
  sshpass -p "$PASS" ssh -tt -o StrictHostKeyChecking=no "$HOST" "cd $REMOTE_DIR && $comando" << EOF
$PASS
EOF
else
  if [ "$accion" = "up" ]; then
    comando="docker-compose up -d"
  else
    comando="docker-compose down"
  fi
  sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$HOST" "cd $REMOTE_DIR && $comando"
fi
