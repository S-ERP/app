#!/bin/bash

declare -A servidores=(
  ["servicios"]="192.168.5.1"
  ["empresa"]="192.168.5.29"
  ["usuario"]="192.168.5.2"
  ["roles"]="192.168.5.16"
  ["calistenia"]="192.168.5.18"
  ["serp"]="192.168.5.48"
  ["caja"]="192.168.5.45"
  ["compra venta"]="192.168.5.45"
  ["contabilidad"]="192.168.5.45"
  ["crm"]="192.168.5.45"
  ["facturacion"]="192.168.5.45"
  ["inventario"]="192.168.5.45"
  ["spdf"]="192.168.5.46"
  ["notification"]="192.168.5.33"
  ["drive"]="192.168.5.17"
  ["chat"]="192.168.5.9"
  ["proyecto"]="192.168.5.14"
  ["geolocation"]="192.168.5.5"
)

orden=(
  servicios empresa usuario roles
  "-------------------"
  drive notification spdf facturacion calistenia
  "-------------------"
  geolocation proyecto serp
  "-------------------"
  crm caja "compra venta" contabilidad inventario chat
)

for nombre in "${orden[@]}"; do
  if [ "$nombre" = "-------------------" ]; then
    echo "-------------------"
    continue
  fi
  ip="${servidores[$nombre]}"
  if ping -c 1 -W 1 "$ip" &> /dev/null; then
    estado="\e[32mOK\e[0m"
  else
    estado="\e[31mCAIDO\e[0m"
  fi
  printf "servidor %-12s %-15s -> %b\n" "$nombre" "$ip" "$estado"
done
