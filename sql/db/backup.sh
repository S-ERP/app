#!/bin/bash

PG_DUMP="/Applications/pgAdmin 4.app/Contents/SharedSupport/pg_dump"
OUTPUT_DIR="./dumps"
mkdir -p "$OUTPUT_DIR"

# Lista de bases: "host|user|password|database"
DATABASES=(
  "192.168.5.1|postgres|postgres|servisofts.servicio"
  "192.168.5.2|postgres|postgres|servisofts.usuario"
  "192.168.5.11|postgres|postgres|servisofts.contabilidad"
  "192.168.5.16|postgres|postgres|servisofts.roles_permisos"
  "192.168.5.29|postgres|postgres|servisofts.empresa"
  "192.168.5.39|postgres|postgres|servisofts.inventario"
  "192.168.5.41|postgres|postgres|servisofts.compra_venta"
  "192.168.5.45|postgres|postgres|servisofts.caja"
  "192.168.5.48|postgres|postgres|servisofts.serp"
  
  # Agrega más bases aquí:
  # "192.168.5.X|postgres|postgres|servisofts.nombre"
)

for ENTRY in "${DATABASES[@]}"; do
  IFS='|' read -r HOST USER PASS DB <<< "$ENTRY"
  FILENAME="${OUTPUT_DIR}/${DB//\./_}.sql"

  echo "Dumping $DB desde $HOST..."
  PGPASSWORD="$PASS" "$PG_DUMP" \
    -h "$HOST" \
    -U "$USER" \
    -d "$DB" \
    --schema-only \
    -f "$FILENAME"

  if [ $? -eq 0 ]; then
    echo "  OK -> $FILENAME"
  else
    echo "  ERROR al hacer dump de $DB"
  fi
done

echo "Proceso terminado."
