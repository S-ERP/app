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