#!/bin/bash

PASS="servisofts"

carpeta="$1"
accion="${2:-down}"
host_ip="${3:-192.168.2.3}"
base_dir="${4:-v2}"
HOST="servisofts@$host_ip"

if [ -z "$carpeta" ] || { [ "$accion" != "up" ] && [ "$accion" != "down" ]; }; then
  echo "Uso: $0 <carpeta> [up|down] [host_ip] [base_dir]"
  echo "  up   -> docker-compose up -d   (encender)"
  echo "  down -> docker-compose down    (apagar, default)"
  echo "  host_ip por default: 192.168.2.3"
  echo "  base_dir por default: v2 (usar '.' para la raiz del home)"
  exit 1
fi

if [ "$base_dir" = "." ]; then
  REMOTE_DIR="$carpeta"
else
  REMOTE_DIR="$base_dir/$carpeta"
fi

if [ "$accion" = "up" ]; then
  comando="docker-compose up -d"
else
  comando="docker-compose down"
fi

if ! command -v sshpass &> /dev/null; then
  echo "Falta 'sshpass'. Instalalo con: sudo apt install -y sshpass"
  exit 1
fi

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$HOST" "cd $REMOTE_DIR && $comando"
