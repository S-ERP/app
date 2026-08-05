# Soporte Servidores Facturación y PDF

## Problemas con Facturación

### 1. Buscar la IP del contenedor
Ingresar a:

```bash
http://192.168.2.2/container
```

Buscar la IP del servidor de facturación.

---

### 2. Conectarse por SSH

```bash
ssh servisofts@192.168.2.5
```

---

### 3. Limpiar logs del contenedor

```bash
sudo truncate -s 0 $(docker inspect --format='{{.LogPath}}' servisofts_facturacion_server)
```

---

### 4. Verificar logs en vivo

```bash
docker logs servisofts_facturacion_server -f
```

---

# Problemas con PDF al imprimir factura

## 1. Buscar la IP del contenedor

Ingresar a:

```bash
http://192.168.2.2/container
```

Buscar la IP del servidor PDF.

---

## 2. Conectarse por SSH

```bash
ssh servisofts@192.168.2.2
```

---

## 3. Limpiar logs del contenedor

```bash
sudo truncate -s 0 $(docker inspect --format='{{.LogPath}}' servisofts_spdf_server)
```

---

## 4. Verificar logs en vivo

```bash
docker logs servisofts_spdf_server -f
```

---

## 5. Pendiente: preflight (OPTIONS) sin respuesta en `/http/api`

**Síntoma en la app:** al generar un PDF (ej. Kardex Individual) el navegador tira:

```
TypeError: Failed to fetch
  en SHttp.postAsync (node_modules/servisofts-socket/SSocket/SHttp/index.js)
```

**Diagnóstico (03/08/2026):** el endpoint `https://spdf.servisofts.com/http/api` responde bien a un `POST` directo (200 OK), pero el preflight `OPTIONS` que el navegador manda automáticamente (porque `SHttp.postAsync` envía `Content-Type: application/json`) se queda colgado y hace timeout sin devolver nada:

```bash
curl -v -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  https://spdf.servisofts.com/http/api
# -> Operation timed out after 10002 milliseconds with 0 bytes received
```

Al no responder el preflight, el navegador bloquea la petición real y `fetch()` falla con "Failed to fetch". El `POST` normal sí funciona (confirmado con curl), así que no es un problema de la app ni del payload — es el manejo de CORS/OPTIONS en el servidor PDF.

**Por revisar en el servidor (`servisofts_spdf_server`):**
- Ver si el reverse proxy / nginx delante del contenedor tiene una ruta explícita para `OPTIONS` en `/http/api` (o en general `/http/*`).
- Confirmar que el proceso que atiende `OPTIONS` no dependa de lógica pesada (parseo del body, DB, etc.) que lo cuelgue — un preflight debería responder solo con los headers `Access-Control-Allow-*`, sin tocar el body.
- Revisar logs en vivo (`docker logs servisofts_spdf_server -f`) justo mientras se reproduce el error, filtrando por `OPTIONS`.
- Si el server es Node/Express, verificar que el middleware de CORS esté antes de cualquier middleware que consuma el stream del request y que responda a `OPTIONS` sin pasar por el resto de la cadena.