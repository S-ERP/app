#!/bin/bash

HOST="servisofts@192.168.2.2"
PASS="servisofts"
REMOTE_DIR="servicios/caja"

accion="${1:-down}"

if [ "$accion" != "up" ] && [ "$accion" != "down" ]; then
  echo "Uso: $0 [up|down]"
  echo "  up   -> ./servisofts up -d   (encender)"
  echo "  down -> ./servisofts down    (apagar, default)"
  exit 1
fi

if [ "$accion" = "up" ]; then
  comando="./servisofts up -d"
else
  comando="./servisofts down"
fi

if ! command -v sshpass &> /dev/null; then
  echo "Falta 'sshpass'. Instalalo con: sudo apt install -y sshpass"
  exit 1
fi

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$HOST" "cd $REMOTE_DIR && $comando"
