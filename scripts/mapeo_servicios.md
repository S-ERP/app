# Mapeo de servicios

Toda la configuración vive en un solo lugar: **`servidores_config.sh`** (se carga con `source` desde `restart_servidores.sh`, `off_servidor.sh` y `on_servidor.sh`, así los tres quedan siempre sincronizados).

---

## Host `192.168.2.2` (default) — flujo `servisofts.sh` con menú interactivo (`servidor_ctl.sh`)

| Servicio | Carpeta remota |
|---|---|
| caja | `servicios/caja` |
| chat | `servicios/chat` |
| compra-venta | `servicios/compra_venta` |
| contabilidad | `servicios/contabilidad` |
| crm | `servicios/crm` |
| drive | `servicios/drive` |
| empresa | `servicios/empresa` |
| geolocation | `servicios/geolocation` |
| inventario | `servicios/inventario` |
| notification | `servicios/notification` |
| proyecto | `servicios/proyecto` |
| spdf | `servicios/spdf` |
| sqr | `servicios/sqr` |

## Host `192.168.2.2` — flujo `docker-compose` directo (`servidor_ctl_v2.sh`)

| Servicio | Carpeta remota |
|---|---|
| stats | `stats` (raíz del home) |
| nginx | `servicios/nginx` |
| wireguard | `servicios/wireguard` |

## Host `192.168.2.3` — flujo `docker-compose` directo, bajo `v2/`

| Servicio | Carpeta remota |
|---|---|
| servicios | `v2/servicio` |
| roles | `v2/roles_permisos` |
| usuario | `v2/usuario` |

## Host `192.168.2.5` — flujo `docker-compose` directo, bajo `servicios/`

| Servicio | Carpeta remota |
|---|---|
| facturacion | `servicios/facturacion` |
| calistenia | `servicios/calistenia` |
| serp | `servicios/serp` |
| zkteco | `servicios/zkteco` |
| staffprousa | `servicios/staffprousa` |

Los 24 servicios monitoreados tienen carpeta remota mapeada (ninguno queda sin auto-encendido/apagado).

---

## Scripts involucrados

- **`servidores_config.sh`** — config compartida: `servidores` (IP a pingear), `carpetas` (carpeta remota), `hosts` (host SSH si no es el default), `ctl_script` (qué script de control usar), `base_dirs` (carpeta base para `servidor_ctl_v2.sh`), y `grupos_nombres`/`grupos_servidores` (agrupación del dashboard). Se edita acá, no en los otros scripts.
- **`servidor_ctl.sh <carpeta> <up|down> [host_ip]`** — SSH + `cd servicios/<carpeta>` + `./servisofts.sh up -d` / `down`, respondiendo el menú de entorno (`1`) y la contraseña de `sudo` por stdin. Host default: `192.168.2.2`.
- **`servidor_ctl_v2.sh <carpeta> <up|down> [host_ip] [base_dir]`** — SSH + `cd <base_dir>/<carpeta>` + `docker-compose up -d` / `down`, sin menú interactivo. Host default: `192.168.2.3`. `base_dir` default: `v2` (usar `.` para la raíz del home, `servicios` para ese subdirectorio).
- **`restart_servidores.sh`** — dashboard de monitoreo (pinguea los 24 servicios, agrupados). Si detecta uno OFFLINE con carpeta mapeada, pregunta `¿Querés encenderlo? (s/n)` y si decís que sí lo prende con el script de control correspondiente.
- **`off_servidor.sh`** / **`on_servidor.sh`** — piden el nombre del servicio por input (`Nombre del servidor a apagar/encender:`) y lo apagan/prenden directamente, sin pasar por el dashboard. Si el nombre no está mapeado, listan los servicios disponibles.
- **`ping_servidores.sh`** — versión anterior, solo monitoreo sin acciones (no usa `servidores_config.sh`, queda como referencia/uso en cron sin interacción).
