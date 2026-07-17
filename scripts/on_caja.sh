#!/bin/bash

HOST="servisofts@192.168.2.2"
PASS="servisofts"
REMOTE_DIR="servicios/caja"
comando="./servisofts up -d"

if ! command -v sshpass &> /dev/null; then
  echo "Falta 'sshpass'. Instalalo con: sudo apt install -y sshpass"
  exit 1
fi

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$HOST" "cd $REMOTE_DIR && $comando"
