# Módulo de Suscripciones — Contexto para Reportes

> Objetivo: documento único con **todo lo necesario para construir reportes/gráficos** sobre suscripciones (accesos a BD, modelo de datos, relaciones, reglas de negocio y consultas SQL listas para usar).

---

## 1. Resumen del módulo

Una **suscripción** representa la cobertura temporal de un **cliente** sobre un **servicio con suscripción** (p. ej. un paquete mensual de gimnasio/calistenia).

- No genera stock: al vender un producto de tipo `servicio` con cupos, se crea una **instancia de producto** en inventario y, por cada cupo/cliente, una fila en `suscripcion`.
- Cada suscripción tiene un período `fecha_inicio` → `fecha_fin` derivado de la **duración del modelo** (paquete).
- "Mensual" no es un cobro recurrente automático: es la `duracion` del modelo. Renovar = nueva venta/suscripción.

La tabla central es **`inventario.suscripcion`**.

---

## 2. Accesos a base de datos

Todas son **PostgreSQL 5432**, usuario `postgres` / password `servisofts` (credenciales internas, ver `db.env`).

⚠️ **Son servidores/instancias SEPARADAS**: no se puede hacer `JOIN` entre bases distintas en una sola query. Para cruzar datos hay que:
- consultar cada base por separado y unir por claves (`key_*`) en la capa de reporte (Python/Node/BI), **o**
- configurar `postgres_fdw` si se necesita SQL cruzado.

| Base lógica | Host | Puerto | Database | Contenido relevante |
|---|---|---|---|---|
| **Inventario** | `192.168.5.39` | 5432 | `servisofts.inventario` | `suscripcion`, `producto`, `modelo`, `tipo_producto`, `marca` |
| **Compra/Venta** | `192.168.5.41` | 5432 | `servisofts.compra_venta` | `compra_venta`, `compra_venta_detalle` (venta que originó la suscripción, montos, fechas, tipo de pago) |
| **CRM** | `192.168.5.51` | 5432 | `servisofts.crm` | `cliente` (nombres, NIT, teléfono) — `suscripcion.key_cliente` apunta acá |
| **Empresa** | `192.168.5.29` | 5432 | `servisofts.empresa` | `empresa`, `sucursal` (nombres) |
| **Caja** | `192.168.5.45` | 5432 | `servisofts.caja` | cobros/caja (si se necesita conciliar pagos) |
| **Contabilidad** | `192.168.5.11` | 5432 | `servisofts.contabilidad` | asientos contables de la venta |

Conexión rápida (psql):
```bash
PGPASSWORD=servisofts psql -h 192.168.5.39 -p 5432 -U postgres -d servisofts.inventario
```

Empresa de ejemplo usada en pruebas:
`key_empresa = '3433c7d4-a626-44de-b825-f924334e679c'` → **Calistenia Paraguay EAS**.

---

## 3. Modelo de datos

### 3.1 Cadena de relaciones

```
tipo_producto (tipo='servicio', key_empresa)      [inventario]
   └─ modelo  (duracion, duracion_medida,
               cantidad_suscriptores, precio_venta)   ← catálogo/paquete
         │  (venta)
         ▼
   compra_venta ── compra_venta_detalle              [compra_venta]
         │              │ key_compra_venta_detalle
         ▼              ▼
   producto (instancia vendida, key_empresa,          [inventario]
             key_compra_venta_detalle, key_modelo)
         │ key_producto
         ▼
   suscripcion (key_cliente, fecha_inicio, fecha_fin, [inventario]
                estado, key_sucursal)
                     │ key_cliente
                     ▼
                 cliente (nombres, nit)                [crm]
```

### 3.2 `inventario.suscripcion` (tabla central)

| Columna | Tipo | Notas |
|---|---|---|
| `key` | varchar (PK) | UUID |
| `key_usuario` | varchar | usuario que la creó |
| `fecha_on` | timestamp | fecha de registro |
| `estado` | integer | **>0 = activa/vigente**, 0 = anulada/eliminada |
| `key_cliente` | varchar | → `crm.cliente.key` (el suscriptor) |
| `key_producto` | varchar | → `inventario.producto.key` (instancia vendida) |
| `descripcion` | varchar | normalmente `null` |
| `fecha_inicio` | timestamp | inicio de cobertura |
| `fecha_fin` | timestamp | fin de cobertura (inclusive) |
| `key_sucursal` | varchar | puede ser `null`; sucursal en `empresa.sucursal` |

> ⚠️ **Fechas**: se guardan a las `04:00:00Z` (= medianoche hora local UTC−4). Para obtener el **día calendario** usá `fecha_inicio::date` / `to_char(fecha_inicio,'YYYY-MM-DD')`.

`suscripcion` **no tiene** `key_empresa` directo → se obtiene vía `producto.key_empresa`.

### 3.3 `inventario.producto` (instancia vendida)

Claves útiles: `key`, `key_empresa`, `key_modelo`, `key_compra_venta_detalle` (liga a la venta), `nombre`, `precio`, `estado`, `fecha_on`.

### 3.4 `inventario.modelo` (catálogo del paquete)

Claves útiles: `key`, `descripcion` (nombre del paquete), `key_tipo_producto`, `precio_venta`, **`duracion`**, **`duracion_medida`** (`dias` | `meses`), **`cantidad_suscriptores`** (cupos por unidad vendida).

### 3.5 `inventario.tipo_producto`

`key`, `descripcion`, `key_empresa`, **`tipo`**. Los de suscripción tienen `tipo = 'servicio'`. Valores posibles de `tipo`: `inventario`, `producto`, `servicio`, `venta_servicio`, `activo_fijo`, `gasto`, `gasto_administrativo`, `bancos`, `null`.

> En la empresa de calistenia, **todos** los paquetes comparten un mismo `key_tipo_producto` ("Paquete de Calistenia").

### 3.6 `compra_venta.compra_venta` y `compra_venta_detalle`

- `compra_venta`: `key`, `fecha_on`, `estado`, `tipo` (`'venta'`), `tipo_pago` (`contado`/`credito`), `key_cliente` (comprador), `cliente` (json con `razon_social`/`nit`), `key_sucursal`, `key_caja`, `key_almacen`, `key_empresa`.
- `compra_venta_detalle`: `key`, `key_compra_venta`, `cantidad`, `precio_unitario`, `precio_unitario_base`, `key_modelo`, `data` (json), `fecha_on`.
- Enlace con inventario: `producto.key_compra_venta_detalle = compra_venta_detalle.key`.

> **Comprador vs suscriptor**: `compra_venta.key_cliente` es quien pagó; `suscripcion.key_cliente` es el suscriptor. Suelen coincidir, pero no siempre.

### 3.7 `empresa.sucursal` / `crm.cliente`

- `empresa.sucursal`: `key`, `descripcion`, `key_empresa`.
- `crm.cliente`: `key`, `nombres`, `apellidos`, `razon_social`, `nit`, `telefono`, `correo`.

---

## 4. Reglas de negocio

### 4.1 Suscripción "activa/vigente"
```
estado > 0
AND fecha_inicio <= now()
AND (fecha_fin IS NULL OR fecha_fin >= now())
```

### 4.2 Cálculo de fechas
- `dias_totales = duracion` si `duracion_medida='dias'`; `duracion*30` si `='meses'` (comportamiento histórico de la app).
- `fecha_fin = fecha_inicio + (dias_totales - 1)` para "dias".
- **Nuevo criterio de negocio** (carrito nuevo): para `'meses'` se usa **mes de calendario** (26 → 26). Ojo: los datos históricos guardados usan `×30`, por lo que puede haber pequeñas diferencias entre suscripciones viejas y nuevas de tipo "meses".
- **Encadenado**: si un cliente ya tiene cobertura activa del mismo `tipo_producto`, la nueva suscripción arranca en `fin_anterior + 1 día`.

### 4.3 Cómo se genera al vender (referencia)
Backend `inventario/server/.../Operations/VentaCaja.java`, rama `case "servicio"`: crea `producto` (instancia) ligado a `compra_venta_detalle`, y luego `Suscripcion.registro` inserta la fila **tal cual** llega del frontend (no recalcula fechas). Frontend: `src/Components/CarritoVenta/PopupCarrito.tsx`.

---

## 5. Funciones SQL disponibles (inventario)

- `get_clientes_suscripcion_activa(_key_empresa varchar, _key_sucursal varchar DEFAULT NULL) RETURNS json`
  Clientes con al menos una suscripción activa (detalle de suscripción + producto/modelo/marca/tipo).
- `_get_suscripciones_bycliente(_key_cliente varchar) RETURNS varchar (json)`
  Todas las suscripciones de un cliente con el `producto` embebido.

Uso:
```sql
SELECT get_clientes_suscripcion_activa('3433c7d4-a626-44de-b825-f924334e679c');
SELECT _get_suscripciones_bycliente('<key_cliente>');
```

---

## 5.1 Ejecutar funciones desde la app: `execute_function`

Cada MDL expone un método **`execute_function(func, params)`** que ejecuta una **función SQL** en la base de ese servicio y devuelve su resultado (`resp.data`). Sirve para que los reportes llamen lógica que vive en la base sin escribir el socket a mano.

Servicios que lo tienen (método `MDL.<servicio>.execute_function`):
`inventario`, `compra_venta`, `empresa`, `caja`, `contabilidad`, `factura`.

Para **suscripciones** usar **`MDL.inventario.execute_function`** (corre contra `servisofts.inventario`).

Firma y comportamiento:
```ts
// src/MDL/inventario/index.ts
await MDL.inventario.execute_function(func: string, params: any[]): Promise<any[]>
// Envía { service:"inventario", component:"reporte", type:"execute_function", func, params }
// y ejecuta:  SELECT <func>(<params...>)
```
- Los **strings se auto-encomillan** (no pongas comillas vos): pasás `'3433c7d4-...'` y llega como `'3433c7d4-...'` a la función.
- Números pasan tal cual. Para objetos/arrays, algunos servicios (p. ej. `compra_venta.execute_function_array`) los serializan a JSON.
- Devuelve un **array** (o lo que retorne la función). Conviene que la función retorne `json`/`jsonb`.

Ejemplo de uso (llamando funciones existentes):
```ts
// Clientes con suscripción activa de una empresa
const data = await MDL.inventario.execute_function(
  "get_clientes_suscripcion_activa",
  ["3433c7d4-a626-44de-b825-f924334e679c"]
);
```

## 5.2 Crear tus propias funciones para reportes

Podés **crear en la base las funciones que necesites** para tus reportes y luego llamarlas con `execute_function`.

**Reglas:**
- ✅ **Crear funciones nuevas** (`CREATE OR REPLACE FUNCTION`) con un **prefijo propio** para no chocar con las del sistema, p. ej. `rep_...` o `reporte_...`.
- ❌ **No editar/reemplazar funciones existentes** del sistema (las de la sección 5 u otras). Si necesitás una variante, creá una nueva con otro nombre.
- Ubicá la función en la base del dato: las de suscripción/inventario en `servisofts.inventario` (host `192.168.5.39`).
- Como las bases están separadas, una función SQL solo ve **su propia base** (no puede unir con `compra_venta`/`crm` salvo `postgres_fdw`).

**Plantilla** (retorna JSON, ideal para graficar):
```sql
CREATE OR REPLACE FUNCTION public.rep_suscripciones_activas_por_paquete(_key_empresa varchar)
RETURNS json
LANGUAGE sql
AS $func$
    SELECT COALESCE(json_agg(t), '[]'::json)
    FROM (
        SELECT m.descripcion AS paquete, count(*) AS activas
        FROM suscripcion s
        JOIN producto p ON s.key_producto = p.key
        JOIN modelo   m ON p.key_modelo   = m.key
        WHERE p.key_empresa = _key_empresa
          AND s.estado > 0
          AND s.fecha_inicio <= now()
          AND (s.fecha_fin IS NULL OR s.fecha_fin >= now())
        GROUP BY m.descripcion
        ORDER BY activas DESC
    ) t;
$func$;
```

Crearla (psql, base inventario):
```bash
PGPASSWORD=servisofts psql -h 192.168.5.39 -p 5432 -U postgres -d servisofts.inventario \
  -f rep_suscripciones_activas_por_paquete.sql
```

Llamarla desde la app:
```ts
const data = await MDL.inventario.execute_function(
  "rep_suscripciones_activas_por_paquete",
  ["3433c7d4-a626-44de-b825-f924334e679c"]
);
```

## 6. Consultas listas para reportes

> Todas contra **`servisofts.inventario`** salvo que se indique otra base. Reemplazá `:EMP` por el `key_empresa`.
> Para incluir todas las empresas, quitá el filtro `p.key_empresa`.

### 6.1 KPI: suscripciones activas hoy
```sql
SELECT count(*) AS activas
FROM suscripcion s
JOIN producto p ON s.key_producto = p.key
WHERE p.key_empresa = ':EMP'
  AND s.estado > 0
  AND s.fecha_inicio <= now()
  AND (s.fecha_fin IS NULL OR s.fecha_fin >= now());
```

### 6.2 Suscripciones activas por paquete (modelo)
```sql
SELECT m.descripcion AS paquete, count(*) AS activas
FROM suscripcion s
JOIN producto p ON s.key_producto = p.key
JOIN modelo   m ON p.key_modelo   = m.key
WHERE p.key_empresa = ':EMP'
  AND s.estado > 0
  AND s.fecha_inicio <= now()
  AND (s.fecha_fin IS NULL OR s.fecha_fin >= now())
GROUP BY m.descripcion
ORDER BY activas DESC;
```

### 6.3 Altas de suscripciones por mes (serie temporal)
```sql
SELECT to_char(s.fecha_inicio, 'YYYY-MM') AS mes, count(*) AS nuevas
FROM suscripcion s
JOIN producto p ON s.key_producto = p.key
WHERE p.key_empresa = ':EMP' AND s.estado > 0
GROUP BY 1
ORDER BY 1;
```

### 6.4 Suscripciones por sucursal
> `suscripcion.key_sucursal` puede ser null. Los nombres de sucursal están en `empresa.sucursal` (otra base): traé el catálogo aparte y mapeá por `key`.
```sql
SELECT s.key_sucursal, count(*) AS total
FROM suscripcion s
JOIN producto p ON s.key_producto = p.key
WHERE p.key_empresa = ':EMP' AND s.estado > 0
GROUP BY s.key_sucursal;
```
```sql
-- Catálogo de sucursales (base: servisofts.empresa)
SELECT key, descripcion FROM sucursal WHERE key_empresa = ':EMP';
```

### 6.5 Vencimientos próximos (próximos 15 días)
```sql
SELECT s.key, s.key_cliente, m.descripcion AS paquete,
       s.fecha_inicio::date AS inicio, s.fecha_fin::date AS fin
FROM suscripcion s
JOIN producto p ON s.key_producto = p.key
JOIN modelo   m ON p.key_modelo   = m.key
WHERE p.key_empresa = ':EMP' AND s.estado > 0
  AND s.fecha_fin BETWEEN now() AND now() + interval '15 days'
ORDER BY s.fecha_fin;
```

### 6.6 Clientes con suscripción activa (para cruzar con CRM)
```sql
SELECT DISTINCT s.key_cliente
FROM suscripcion s
JOIN producto p ON s.key_producto = p.key
WHERE p.key_empresa = ':EMP' AND s.estado > 0
  AND s.fecha_inicio <= now()
  AND (s.fecha_fin IS NULL OR s.fecha_fin >= now());
```
```sql
-- Nombres (base: servisofts.crm) — mapear por key
SELECT key, nombres, apellidos, razon_social, nit, telefono
FROM cliente WHERE key = ANY (ARRAY['<key1>','<key2>', ...]);
```

### 6.7 Ingresos por suscripciones (requiere 2 bases)
Cada suscripción liga a una venta vía `producto.key_compra_venta_detalle`.

**Paso A — inventario:** obtener `key_compra_venta_detalle` de las suscripciones:
```sql
SELECT s.key AS key_suscripcion, s.fecha_inicio::date, m.descripcion AS paquete,
       p.key_compra_venta_detalle
FROM suscripcion s
JOIN producto p ON s.key_producto = p.key
JOIN modelo   m ON p.key_modelo   = m.key
WHERE p.key_empresa = ':EMP' AND s.estado > 0;
```
**Paso B — compra_venta:** montos de esos detalles:
```sql
SELECT d.key AS key_compra_venta_detalle,
       d.cantidad, d.precio_unitario,
       (d.cantidad * d.precio_unitario) AS total,
       cv.fecha_on::date AS fecha_venta, cv.tipo_pago, cv.estado AS estado_venta,
       cv.key_cliente, cv.cliente->>'razon_social' AS cliente_nombre
FROM compra_venta_detalle d
JOIN compra_venta cv ON d.key_compra_venta = cv.key
WHERE d.key = ANY (ARRAY['<detalle1>','<detalle2>', ...]);
```
Unir A+B por `key_compra_venta_detalle` en la capa de reporte.

### 6.8 Suscripciones activas por vencer vs vencidas (estado calculado)
```sql
SELECT
  count(*) FILTER (WHERE s.fecha_fin >= now())                         AS vigentes,
  count(*) FILTER (WHERE s.fecha_fin <  now())                         AS vencidas,
  count(*) FILTER (WHERE s.fecha_fin BETWEEN now() AND now()+interval '7 days') AS por_vencer_7d
FROM suscripcion s
JOIN producto p ON s.key_producto = p.key
WHERE p.key_empresa = ':EMP' AND s.estado > 0;
```

---

## 7. Notas / gotchas para el reporte

- **Cross-DB**: inventario, compra_venta, crm y empresa son instancias distintas → unir por claves en el ETL/BI, no con `JOIN` SQL directo.
- **Fechas a las 04:00Z**: usá `::date` para agrupar por día calendario correcto.
- **`estado`**: filtrar siempre `estado > 0` para excluir anuladas.
- **Empresa**: filtrar por `producto.key_empresa` (la suscripción no lo tiene).
- **Comprador ≠ suscriptor**: para "quién usa" la suscripción usá `suscripcion.key_cliente`; para "quién pagó/facturación" usá `compra_venta.key_cliente` / `compra_venta.cliente`.
- **"meses" histórico vs nuevo**: registros viejos de medida `meses` usan `×30`; los nuevos usan mes calendario. Si el reporte calcula duraciones, tenerlo presente.
- **Nombres de paquete**: `modelo.descripcion`. **Tipo**: `tipo_producto.descripcion`/`tipo`.

---

## 8. Archivos de referencia en el repo

- Frontend carrito/suscripción: `src/Components/CarritoVenta/PopupCarrito.tsx`, `PopupCarritoConfirmar.tsx`, `PopupCarritoConfirmarResumen.tsx`.
- MDL (accesos vía socket): `src/MDL/inventario/index.ts` (`getSuscripcionesByCliente`, `editSuscripcion`), `src/MDL/crm/cliente.ts`.
- Backend venta: `inventario/server/src/Component/Operations/VentaCaja.java`, `inventario/server/src/Component/Suscripcion.java`.
- Función SQL: `get_clientes_suscripcion_activa.sql` (raíz del repo `app/`).
