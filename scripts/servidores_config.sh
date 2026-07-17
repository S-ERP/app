#!/bin/bash
# Config compartida de servidores. Se usa con `source` desde
# restart_servidores.sh, off_servidor.sh y on_servidor.sh.

declare -A servidores=(
  ["empresa"]="192.168.5.29"
  ["servicios"]="192.168.5.1"
  ["roles"]="192.168.5.16"
  ["usuario"]="192.168.5.2"
  ["facturacion"]="192.168.5.28"
  ["spdf"]="192.168.5.46"
  ["drive"]="192.168.5.17"
  ["notification"]="192.168.5.33"
  ["chat"]="192.168.5.9"
  ["calistenia"]="192.168.5.18"
  ["geolocation"]="192.168.5.5"
  ["proyecto"]="192.168.5.14"
  ["serp"]="192.168.5.48"
  ["caja"]="192.168.5.45"
  ["compra-venta"]="192.168.5.41"
  ["crm"]="192.168.5.51"
  ["inventario"]="192.168.5.39"
  ["contabilidad"]="192.168.5.11"
  ["sqr"]="192.168.5.34"
  ["zkteco"]="192.168.5.32"
  ["nginx"]="192.168.2.3"
  ["wireguard"]="192.168.2.4"
  ["stats"]="192.168.2.2"
)

# Mapea el nombre usado arriba a la carpeta remota real.
# Solo estos tienen encendido/apagado remoto.
declare -A carpetas=(
  ["caja"]="caja"
  ["chat"]="chat"
  ["compra-venta"]="compra_venta"
  ["contabilidad"]="contabilidad"
  ["crm"]="crm"
  ["drive"]="drive"
  ["empresa"]="empresa"
  ["geolocation"]="geolocation"
  ["inventario"]="inventario"
  ["notification"]="notification"
  ["proyecto"]="proyecto"
  ["spdf"]="spdf"
  ["sqr"]="sqr"
  ["facturacion"]="facturacion"
  ["calistenia"]="calistenia"
  ["serp"]="serp"
  ["zkteco"]="zkteco"
  ["servicios"]="servicio"
  ["roles"]="roles_permisos"
  ["usuario"]="usuario"
  ["stats"]="stats"
  ["nginx"]="nginx"
  ["wireguard"]="wireguard"
)

# Host donde vive cada carpeta (default 192.168.2.2 si no aparece aca).
declare -A hosts=(
  ["facturacion"]="192.168.2.5"
  ["calistenia"]="192.168.2.5"
  ["serp"]="192.168.2.5"
  ["zkteco"]="192.168.2.5"
  ["servicios"]="192.168.2.3"
  ["roles"]="192.168.2.3"
  ["usuario"]="192.168.2.3"
)

# Que script de control usar por servicio (servidor_ctl.sh = servisofts.sh
# con menu interactivo; servidor_ctl_v2.sh = docker-compose directo).
declare -A ctl_script=(
  ["servicios"]="servidor_ctl_v2.sh"
  ["roles"]="servidor_ctl_v2.sh"
  ["usuario"]="servidor_ctl_v2.sh"
  ["stats"]="servidor_ctl_v2.sh"
  ["facturacion"]="servidor_ctl_v2.sh"
  ["calistenia"]="servidor_ctl_v2.sh"
  ["serp"]="servidor_ctl_v2.sh"
  ["zkteco"]="servidor_ctl_v2.sh"
  ["nginx"]="servidor_ctl_v2.sh"
  ["wireguard"]="servidor_ctl_v2.sh"
)

# Carpeta base remota para servidor_ctl_v2.sh (default "v2"; "." = raiz del home).
declare -A base_dirs=(
  ["stats"]="."
  ["facturacion"]="servicios"
  ["calistenia"]="servicios"
  ["serp"]="servicios"
  ["zkteco"]="servicios"
  ["nginx"]="servicios"
  ["wireguard"]="servicios"
)

grupos_nombres=("CORE SERVICES" "PLATAFORMA SERVICES" "CALISTENIA BOLIVIA" "SISTEMA EMPRESARIAL")
grupos_servidores=(
  "nginx wireguard stats"
  "empresa servicios roles usuario"
  "facturacion spdf drive notification chat"
  "calistenia geolocation proyecto sqr zkteco"
  "serp caja compra-venta crm inventario contabilidad"
)
