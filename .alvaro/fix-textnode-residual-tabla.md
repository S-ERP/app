# Pendiente: warning residual "Unexpected text node" en /venta/tabla (origen sin confirmar)

## Síntoma

```
index.js:82 Unexpected text node:  . A text node cannot be a child of a <View>.
```

Se ve en la consola al cargar `/venta/tabla` (y ya se redujo bastante,
ver "Contexto" abajo), pero queda un residuo que no depende de la
cantidad de filas — pasa una vez al terminar de cargar los datos, no por
cada fila.

## Contexto (lo que ya se investigó y arregló)

Se encontraron y arreglaron 6 casos concretos del patrón
`<SView col> {expr} </SView>` (espacio suelto en una sola línea, que
React Native Web interpreta como nodo de texto hijo directo de un
`View`, inválido):

- `tabla.js`: columnas "Detalle" (`detalles_`), "Concepto"
  (`detallesw_`), "Suscriptores" (`detalles__lista`), y el ícono del
  menú de opciones (`RenderOption`).
- `Suscriptores.js`: columnas `modelo_`, `marca_`, `tipo_producto_`
  (el espacio quedaba entre `<SImage .../>` y `</SView>` en la misma
  línea).

Con la empresa de 7 ventas, esto bajó el conteo de 74 a 16 warnings por
carga. Con la empresa de 2874 ventas (100 filas por página), bajó a 50.
O sea: **sigue habiendo una fuente sin identificar**, pero ya no es la
mayoría del ruido.

## Por qué no se pudo localizar por búsqueda estática

El último reporte del usuario trajo un stack trace distinto a los
anteriores: en vez de mostrar el árbol de componentes (`at ComponentName`,
como en los casos ya resueltos), mostró la cadena de llamadas asíncronas:

```
postMessage
(anonymous) @ tabla.js:157        <- loadInitialData
Promise.then
loadInitialData @ tabla.js:157
(anonymous) @ tabla.js:157
loadData @ tabla.js:157
(anonymous) @ DinamicTable.js:72  <- scheduler interno de React / DinamicTable
step @ DinamicTable.js:72
...
__awaiter @ DinamicTable.js:72
```

Esto indica que el warning se dispara durante un re-render programado
por el scheduler de React (después de que `loadData()` resuelve y
`DinamicTable` actualiza su estado con los nuevos datos), no durante un
render síncrono directo — por eso no aparece el nombre del componente
que realmente lo causa, solo la cadena de scheduling/promesas.

Se revisó buscando el mismo patrón (`<Tag ...> {expr} </Tag>` en una
sola línea) en:

- Todo `tabla.js` completo — sin más coincidencias.
- Todo el código fuente de `servisofts-table`: `DinamicTable.tsx`,
  `Header.tsx`, `Col.tsx`, `Row.tsx`, `TopMenuOptions.tsx`, `Popup.tsx`,
  `Components/Select.tsx`, `Components/CheckBox.tsx`,
  `Components/DraggableList.tsx` — sin coincidencias.

No hay más resultados por grep estático; hace falta depuración en vivo.

## Cómo depurarlo en vivo cuando se retome

La forma confiable de encontrar el origen real es interceptar el
`console.error` del navegador para capturar el component-stack real en
el momento exacto en que se dispara (React Native Web llama a
`console.error` directamente en su validación de children, sin pasar
por el sistema de warnings de React que agrega automáticamente el
component stack — por eso el stack que se ve es "crudo").

Pasos sugeridos:

1. Abrir la app en el navegador con DevTools abierto.
2. En la consola, ANTES de que cargue la tabla, pegar:
   ```js
   const _origError = console.error;
   console.error = function (...args) {
     if (String(args[0]).includes("Unexpected text node")) {
       debugger; // o: console.trace()
     }
     return _origError.apply(console, args);
   };
   ```
3. Recargar `/venta/tabla` y dejar que pare en el `debugger`.
4. Con el debugger detenido, usar el panel de "React" de las DevTools
   (o inspeccionar `document.activeElement`/el DOM alrededor del punto
   de fallo) para ver qué `View` específico tiene el nodo de texto
   suelto — el DOM real en ese momento ya tiene el problema, solo hay
   que ubicar qué elemento del árbol lo tiene.
5. Alternativa más rápida si el paso 4 es incómodo: comentar columnas
   de `tabla.js` una por una (o secciones de `DinamicTable` como
   header/toolbar) y recargar, hasta ver cuándo desaparece el warning
   residual — bisección manual.

## Impacto / prioridad

Bajo. Mismo tipo de problema que los ya documentados en
`fix-sform-key-warning.md` — solo ensucia la consola, no hay evidencia
de que rompa nada ni escale de forma significativa con el volumen de
datos. Se puede resolver sin apuro, cuando se quiera invertir el tiempo
en la depuración en vivo descrita arriba.
