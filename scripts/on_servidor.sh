#!/bin/bash
# Pide el nombre de un servicio y lo enciende (sin pasar por el dashboard).

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/servidores_config.sh"

read -r -p "Nombre del servidor a encender: " nombre

if [ -z "${carpetas[$nombre]}" ]; then
  echo "No conozco la carpeta remota de '$nombre'. Servicios disponibles:"
  printf '  %s\n' "${!carpetas[@]}" | sort
  exit 1
fi

echo "Encendiendo $nombre..."
"$DIR/${ctl_script[$nombre]:-servidor_ctl.sh}" "${carpetas[$nombre]}" up "${hosts[$nombre]:-192.168.2.2}" "${base_dirs[$nombre]:-v2}"
