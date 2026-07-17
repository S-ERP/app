#!/bin/bash
# Dashboard de monitoreo: pinguea los servicios de servidores_config.sh,
# agrupados, y si detecta uno OFFLINE con carpeta mapeada pregunta si
# queres encenderlo (usa servidor_ctl.sh / servidor_ctl_v2.sh segun corresponda).

export LC_NUMERIC=C

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$DIR/servidores_config.sh"

online=0
offline=0
alertas=()

LINEA="────────────────────────────────────────────────────────────"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              MONITOR DE SERVICIOS - RED INTERNA            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
printf " %-22s %-15s %-14s %8s\n" "SERVICIO" "IP" "ESTADO" "LATENCIA"
echo "$LINEA"

for i in "${!grupos_nombres[@]}"; do
  echo ""
  echo " ${grupos_nombres[$i]}"
  echo "$LINEA"

  for nombre in ${grupos_servidores[$i]}; do
    ip="${servidores[$nombre]}"
    resultado=$(ping -c 1 -W 1 "$ip" 2>/dev/null)

    if [ $? -eq 0 ]; then
      latencia_ms=$(echo "$resultado" | grep -oP 'time=\K[0-9.]+')
      printf -v latencia "%.0f ms" "$latencia_ms"
      estado="🟢 ONLINE"
      online=$((online + 1))
    else
      latencia="---"
      estado="🔴 OFFLINE"
      offline=$((offline + 1))
      alertas+=("$nombre ($ip) no responde")
    fi

    printf " %-22s %-15s %-14s %8s\n" "$nombre" "$ip" "$estado" "$latencia"

    if [ "$estado" = "🔴 OFFLINE" ] && [ -n "${carpetas[$nombre]}" ]; then
      read -r -p "    ⚠️  $nombre está apagado. ¿Querés encenderlo? (s/n): " respuesta
      if [ "$respuesta" = "s" ] || [ "$respuesta" = "S" ]; then
        "$DIR/${ctl_script[$nombre]:-servidor_ctl.sh}" "${carpetas[$nombre]}" up "${hosts[$nombre]:-192.168.2.2}" "${base_dirs[$nombre]:-v2}"
      fi
    fi
  done
done

echo ""
echo "════════════════════════════════════════════════════════════"
echo " RESUMEN DEL SISTEMA"
echo ""

total=$((online + offline))
disponibilidad=$(awk -v o="$online" -v t="$total" 'BEGIN { printf "%.1f", (t > 0 ? o / t * 100 : 0) }')

printf " 🟢 SERVICIOS ACTIVOS  : %d\n" "$online"
printf " 🔴 SERVICIOS CAÍDOS   : %d\n" "$offline"
printf " 📊 DISPONIBILIDAD     : %s%%\n" "$disponibilidad"

if [ "${#alertas[@]}" -gt 0 ]; then
  echo ""
  echo " ⚠️  ALERTAS:"
  for alerta in "${alertas[@]}"; do
    echo "    - $alerta"
  done
fi

echo ""
printf " ⏱  Última actualización : %s\n" "$(date '+%Y-%m-%d %H:%M:%S')"
printf " 🔄 Próxima revisión     : %s\n" "$(date -d '+5 minutes' '+%H:%M:%S')"
echo "════════════════════════════════════════════════════════════"
