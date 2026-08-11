# Cómo crear un item agrupado (combo) — ej. "2 Hamburguesa Simple + Coca Cola"

Investigué el código y **existen tres sistemas paralelos** en el proyecto
relacionados con "ingredientes"/composición. Dos (A y B) sirven para definir
de qué se compone un `modelo` del catálogo (lo que te interesa). El tercero
(C) es para otra cosa: costeo contable de una unidad ya producida/comprada, no
para armar combos de venta. Este documento explica los tres para que no se
confundan, cuál usar, y los pasos concretos.

## Resumen rápido

| | Sistema A — "modelo_ingrediente directo" (legacy) | Sistema B — "grupos de ingrediente" (nuevo) |
|---|---|---|
| Archivos clave | `Components/Ingrediente.js`, `profile.js`, `elavorar.js` | `ingrediente.js`, `Components/Elaborar.tsx` |
| ¿Agregar componentes desde la UI? | ✅ Funciona (botón "+" abre selector) | ❌ Comentado en el código (líneas 128 y 338-366 de `ingrediente.js`) |
| ¿Descuenta stock? | ✅ Botón "PROCESAR" en `elavorar.js` llama a `modelo/procesar` | ⚠️ Botón "PRODUCIR" llama a `modelo/producir`, pero no hay forma de cargar datos porque no se pueden crear ingredientes desde la UI |
| ¿Permite variantes/opciones? (ej. "elige 1 de 3 bebidas") | ❌ No, es 1 componente = 1 cantidad fija | ✅ Sí, ese es su propósito (grupos con opciones) |
| ¿Alcanzable desde la tabla actual (`table.js`)? | ❌ No hay botón que navegue ahí todavía | ❌ Sí existe el botón "Ingredientes" en el `FloatMenu` de `table.js` (línea 319-327), pero lleva al sistema B que no permite agregar |

**Para tu caso ("2 Hamburguesa Simple + 1 Coca Cola", cantidad fija, sin
variantes) el Sistema A es el que ya funciona hoy sin escribir código.**

## Sistema C — `producto_ingrediente` (no es para armar combos)

Vive en `src/Pages/productos/producto/Components/Ingrediente.js` y se usa en
`producto/profile.js`. **`producto` no es lo mismo que `modelo`**: `modelo`
es la plantilla/catálogo (lo que ves en tu `table.js`, ej. "Hamburguesa
Simple"), mientras que `producto` es una unidad/lote específico ya producido
o comprado (tiene su propio perfil con `AlmacenActual`,
`AlmacenProductoHistory`, documentos, etc.).

`producto_ingrediente` registra, para ESA unidad puntual, qué `modelo`s se
consumieron para producirla, con `cantidad` y `precio_compra`, y permite
generar el asiento contable correspondiente (`type: "generar_asiento"`,
línea 66-72 de `Ingrediente.js`). Es decir: es el **costeo/contabilización**
de una producción ya hecha, no la definición reutilizable de un combo
vendible. No sirve para lo que buscas ("Combo Hamburguesa" como item del
catálogo que cualquiera pueda vender repetidamente) — para eso usa el
Sistema A o B de arriba.

## Modelo de datos

**Sistema A** (tabla `modelo_ingrediente`):
```
modelo_ingrediente {
  key
  key_modelo             // el modelo COMPUESTO (ej. "Combo Hamburguesa")
  key_modelo_ingrediente // el modelo COMPONENTE (ej. "Hamburguesa Simple")
  cantidad                // ej. 2.00
}
```

**Sistema B** (tablas `ingrediente` + `modelo_ingrediente` como opciones):
```
ingrediente {
  key, key_modelo, descripcion, cantidad, is_required
}
modelo_ingrediente {
  key, key_ingrediente, key_modelo (una opción candidata), cantidad
}
```

## Opción 1 — Usar el Sistema A tal como está (sin tocar código)

1. Crea el modelo "Combo Hamburguesa" normalmente (botón `+` en `table.js`
   abre `PopupDetalleModelo`).
2. Navega manualmente a `/productos/modelo/profile?pk=<key_del_combo>`
   (esta página no está enlazada desde `table.js` todavía, hay que ir por URL
   o agregar un botón — ver Opción 2).
3. Al fondo del perfil verás el componente `Ingrediente` (línea 55 de
   `profile.js`). Usa el botón "+" para buscar y agregar:
   - Hamburguesa Simple, cantidad `2`
   - Coca Cola, cantidad `1`
4. Click en "BUSCAR INGREDIENTES PARA ELABORAR" → te lleva a `elavorar.js`.
5. Ahí eliges sucursal, almacén, cantidad a producir y precio de venta, y
   presionas "PROCESAR" → llama a `modelo/procesar` en el backend, que
   (asumiendo que el backend lo tiene implementado — no está en este repo)
   descuenta el stock de Hamburguesa Simple x2 y Coca Cola x1, y genera stock
   del Combo.

Esto es un flujo de **producción manual/previa** (tipo "receta"): armas el
combo en inventario antes de venderlo, no se arma automáticamente al momento
de la venta en el punto de venta.

## Opción 2 — Enlazar el Sistema A desde `table.js`

Si quieres acceso directo desde la tabla de modelos (en vez de escribir la
URL a mano), agregar una opción al `FloatMenu` de `table.js` (junto a
"Ingredientes", línea 319) que navegue a `/productos/modelo/profile` con
`pk: e.row.key` es un cambio pequeño y de bajo riesgo.

## Lo que falta decidir antes de invertir en el Sistema B

El Sistema B (grupos con opciones, `ingrediente.js` + `Elaborar.tsx`) parece
pensado para punto de venta: el cajero elige productos dentro de un combo
(ej. "elige tu bebida") y se arma/descuenta en el momento de vender, no antes.
Pero:
- Falta la UI para crear ingredientes/opciones (está comentada).
- El botón "Elaborar" en `Elaborar.tsx` (línea 106-110) no tiene `onPress`
  implementado — no hace nada todavía.
- No confirmé si el backend soporta descuento automático de stock al vender
  un modelo compuesto en el flujo normal de venta (`puntoventa`/`caja`) — eso
  requeriría revisar el servicio de venta, que no vi en esta exploración.

**Pregunta pendiente para definir el alcance real:** ¿el combo debe
descontarse automáticamente al venderse en el punto de venta (requiere
trabajo nuevo en el flujo de venta + terminar el Sistema B), o basta con
producirlo manualmente de antemano como stock propio (Sistema A, ya
funciona)? Esa decisión cambia cuánto código nuevo hace falta.

## Servicios de backend involucrados (no están en este repo)

- `service: "inventario", component: "modelo_ingrediente", type: "registro" | "editar" | "getAll"`
- `service: "inventario", component: "modelo", type: "procesar"` (Sistema A)
- `service: "inventario", component: "modelo", type: "producir"` (Sistema B)
- `service: "inventario", component: "ingrediente", type: "registro" | "editar" | "getAll" | "getPizarra"` (Sistema B)

Si alguno de estos `type` no está implementado en el backend, hay que
coordinarlo con quien mantiene ese servicio (fuera de este repositorio).
