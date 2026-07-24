#!/bin/bash
# Reinicia TODOS los servidores mapeados en servidores_config.sh:
# 1) los apaga todos en paralelo y espera a que terminen de apagarse
# 2) recien entonces los enciende de nuevo, uno por uno, en el orden
#    de los grupos (infraestructura primero).

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/servidores_config.sh"

LINEA="────────────────────────────────────────────────────────────"

# Orden = el de grupos_servidores, filtrando solo los que tienen
# encendido/apagado remoto (los que aparecen en `carpetas`).
orden=()
for i in "${!grupos_servidores[@]}"; do
  for nombre in ${grupos_servidores[$i]}; do
    if [ -n "${carpetas[$nombre]}" ]; then
      orden+=("$nombre")
    fi
  done
done

apagar() {
  local nombre="$1"
  "$DIR/${ctl_script[$nombre]:-servidor_ctl.sh}" "${carpetas[$nombre]}" down "${hosts[$nombre]:-192.168.2.2}" "${base_dirs[$nombre]:-v2}" "${modos[$nombre]:-simple}"
}

encender() {
  local nombre="$1"
  "$DIR/${ctl_script[$nombre]:-servidor_ctl.sh}" "${carpetas[$nombre]}" up "${hosts[$nombre]:-192.168.2.2}" "${base_dirs[$nombre]:-v2}" "${modos[$nombre]:-simple}"
}

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              REINICIO COMPLETO DE SERVIDORES                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo " Se van a apagar y volver a encender ${#orden[@]} servidores:"
printf '   - %s\n' "${orden[@]}"
echo ""
read -r -p " Esto apaga TODOS los servidores de golpe. ¿Continuar? (s/n): " confirmar
if [ "$confirmar" != "s" ] && [ "$confirmar" != "S" ]; then
  echo "Cancelado."
  exit 0
fi

echo ""
echo "$LINEA"
echo " PASO 1/2: Apagando todos los servidores..."
echo "$LINEA"

pids=()
for nombre in "${orden[@]}"; do
  echo " -> Apagando $nombre..."
  apagar "$nombre" &
  pids+=($!)
done

# Espera a que TODOS terminen de apagarse antes de seguir
for pid in "${pids[@]}"; do
  wait "$pid"
done

echo ""
echo " Todos los servidores fueron apagados."
echo ""
echo "$LINEA"
echo " PASO 2/2: Encendiendo uno por uno..."
echo "$LINEA"

for nombre in "${orden[@]}"; do
  echo " -> Encendiendo $nombre..."
  encender "$nombre"
done

echo ""
echo "$LINEA"
echo " Reinicio completo. Todos los servidores fueron encendidos."
echo "$LINEA"
