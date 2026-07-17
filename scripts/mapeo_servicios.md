# Mapeo de servicios — `restart_servidores.sh`

Qué pasa con cada servicio cuando `restart_servidores.sh` lo detecta OFFLINE y respondés "sí" para encenderlo.

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

## Host `192.168.2.2` — flujo `docker-compose` directo (`servidor_ctl_v2.sh`), raíz del home

| Servicio | Carpeta remota |
|---|---|
| stats | `stats` |

## Host `192.168.2.3` — flujo `docker-compose` directo, bajo `v2/`

| Servicio | Carpeta remota |
|---|---|
| servicios | `v2/servicio` |
| roles | `v2/roles_permisos` |
| usuario | `v2/usuario` |

## Host `192.168.2.5` — flujo `docker-compose` directo (`servidor_ctl_v2.sh`), bajo `servicios/`

| Servicio | Carpeta remota |
|---|---|
| facturacion | `servicios/facturacion` |
| calistenia | `servicios/calistenia` |
| serp | `servicios/serp` |
| zkteco | `servicios/zkteco` |

## Sin auto-encendido

Se detectan caídos y se listan en el resumen, pero no se ofrece prenderlos (no tienen carpeta remota mapeada):

- `nginx` (192.168.2.3, ping)
- `wireguard` (192.168.2.4, ping)

---

## Scripts involucrados

- **`servidor_ctl.sh <carpeta> <up|down> [host_ip]`** — SSH + `cd servicios/<carpeta>` + `./servisofts.sh up -d` / `down`, respondiendo el menú de entorno (`1`) y la contraseña de `sudo` por stdin. Host default: `192.168.2.2`.
- **`servidor_ctl_v2.sh <carpeta> <up|down> [host_ip] [base_dir]`** — SSH + `cd <base_dir>/<carpeta>` + `docker-compose up -d` / `down`, sin menú interactivo. Host default: `192.168.2.3`. `base_dir` default: `v2` (usar `.` para la raíz del home, como en `stats`).
