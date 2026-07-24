#!/bin/bash
# Pinguea (4 paquetes) las IPs base de la red interna:
# 192.168.2.1 (gateway), .2 (stats), .3 (nginx), .5 (facturacion/calistenia/serp/zkteco/staffprousa).

ips=(192.168.2.2 192.168.2.3 192.168.2.5)

CIAN='\033[1;36m'
VERDE='\033[0;32m'
AMARILLO='\033[1;33m'
ROJO='\033[0;31m'
RESET='\033[0m'

for ip in "${ips[@]}"; do
  echo -e "${CIAN}ping $ip${RESET}"

  ping -c 4 "$ip" | while IFS= read -r linea; do
    if [[ "$linea" == "64 bytes"* ]]; then
      echo -e "${VERDE}${linea}${RESET}"
    elif [[ "$linea" == ---* ]]; then
      echo -e "${AMARILLO}${linea}${RESET}"
    elif [[ "$linea" == *"packet loss"* ]]; then
      if [[ "$linea" == *"0% packet loss"* ]]; then
        echo -e "${VERDE}${linea}${RESET}"
      else
        echo -e "${ROJO}${linea}${RESET}"
      fi
    elif [[ "$linea" == rtt* ]]; then
      echo -e "${CIAN}${linea}${RESET}"
    else
      echo "$linea"
    fi
  done

  echo
done
