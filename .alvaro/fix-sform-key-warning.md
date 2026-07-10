# Pendientes: warnings de consola en servisofts-component (SForm / SInput)

## Síntoma

En consola, cada vez que se renderiza un `SForm` (ej. el filtro de fechas
`FechaFullFilter` que se usa arriba de `venta/tabla` y otras tablas):

```
Warning: Each child in a list should have a unique "key" prop.
Check the render method of `SForm`.
```

No rompe nada (no es un crash), solo ensucia la consola. No es un bug de
este repo (`app`) — es un bug de la librería externa `servisofts-component`.

## Causa raíz

Archivo: `node_modules/servisofts-component/Component/SForm/index.js`
(compilado, no hay fuente `.ts`/`.tsx` en este repo — hay que buscar el
repo fuente de `servisofts-component`, no está en
`/home/servisofts/Documents/GitHub/alvaro/`, solo están `app`,
`servisofts-table` y `cocacola`).

Alrededor de la línea 383, `SForm.getInputs()` hace:

```js
return Object.keys(this.props.inputs).map(function (key) {
    ...
    return React.createElement(SView, __assign({}, inputProps, { style: [...], row: true }),
        React.createElement(CustomInput, __assign({ key: "imput_" + key, ... }))
        // el key se lo pasan al hijo de adentro (CustomInput/SInput)
    )
    // pero el SView de AFUERA, que es el elemento que realmente
    // devuelve el .map(), no tiene "key" -> ese es el que React reclama
})
```

React exige el `key` en el elemento que el `.map()` devuelve directamente
(el `SView` exterior), no en un hijo interno. Como se lo pusieron al
`CustomInput`/`SInput` en vez de al `SView`, React no lo ve y tira el
warning.

## Cómo reproducirlo

1. Levantar la app (`npm run web`, puerto 3010).
2. Login + seleccionar cualquier empresa.
3. Entrar a `/venta/tabla` (o cualquier página que use `FechaFullFilter`
   u otro `SForm`).
4. Consola del navegador → aparece el warning apuntando a `SForm`.

## Fix propuesto (para cuando se resuelva)

En el `.map()` de `SForm/index.js` (`getInputs` o como se llame el método
que arma los campos), mover el `key` al `SView` exterior:

```js
return Object.keys(this.props.inputs).map(function (key) {
    ...
    return React.createElement(SView, __assign({ key: "field_" + key }, inputProps, { style: [...], row: true }),
        React.createElement(CustomInput, __assign({ name: key, ... }))
    )
})
```

(El `key: "imput_" + key` del `CustomInput` interno se puede dejar o
quitar, ya no es el que React necesita para la lista).

## Cómo aplicarlo

Dos opciones, según dónde viva el código fuente real de
`servisofts-component`:

1. **Si hay un repo fuente separado** (como `servisofts-table`): arreglar
   ahí, publicar nueva versión del paquete, actualizar
   `servisofts-component` en `app/package.json`.
2. **Si no hay repo fuente a mano / se necesita un fix rápido en este
   repo**: usar `patch-package` (ya está configurado, ver
   `app/patches/` y el script `postinstall` en `package.json`):
   - Editar directamente `node_modules/servisofts-component/Component/SForm/index.js`
     con el fix de arriba.
   - Correr `npx patch-package servisofts-component`.
   - Confirmar que se generó `app/patches/servisofts-component+<version>.patch`.
   - Commitear el patch — se reaplica solo en cada `npm install` gracias
     al `postinstall`.

## Impacto / prioridad

Bajo. Es cosmético (ruido en consola), no afecta funcionalidad ni
rendimiento de forma perceptible — se renderiza una vez por formulario,
no escala con la cantidad de filas de una tabla. Se puede resolver sin
apuro.

---

# Pendiente 2: warning "value and defaultValue" en SInput (servisofts-component)

## Síntoma

```
Warning: TextInput contains an input of type text with both value and
defaultValue props. Input elements must be either controlled or
uncontrolled...
```

Aparece en los campos `fecha_inicio` / `fecha_fin` del mismo
`FechaFullFilter` (los que usan `type: "date"`, renderizados por
`SInput`, no por `InputSelector`).

## Nota: había un caso hermano YA arreglado en este repo

El mismo warning también salía desde `InputSelector.tsx` (el
`customInputClass` del campo `key_opciones`, en este repo, no en
`node_modules`). Ya se arregló ahí: en
`src/Components/Selectores/InputSelector.tsx`, el `<TextInput>` hacía
`{...this.props}` (que incluye `defaultValue`, reenviado desde el
`inputs.key_opciones.defaultValue` que arma `FechaFullFilter.js`) y
además fijaba `value={...}` explícito — las dos props llegaban juntas al
`<input>` nativo. Fix aplicado: se agregó `defaultValue={undefined}`
justo después del spread y antes de `value=`, para anular el
`defaultValue` heredado (ver el archivo, línea ~540). `InputSelector` ya
usaba `this.props.value || this.props.defaultValue` solo para sembrar su
propio estado interno (`state.inputValue`), así que no se perdió
funcionalidad.

## Causa raíz del caso pendiente (SInput)

Archivo: `node_modules/servisofts-component/Component/SInput/index.js`
(compilado, mismo caso que `SForm`: no hay fuente en este repo, hay que
ubicar el repo fuente de `servisofts-component`).

Alrededor de la línea 296-337:

```js
var extraprops = __assign(__assign({}, this.props), type.props); // incluye defaultValue
...
delete extraprops["flex"]; // a "flex" sí lo limpian, a "defaultValue" no
...
React.createElement(TextInput, __assign({
    ref: ...,
    value: valueFilter,        // <- value explícito
    editable: !this.props.disabled,
    placeholderTextColor: ...,
}, extraprops, {               // <- extraprops trae defaultValue (y también value, pero es el mismo valor)
    autoFocus: false,
    style: styleInputFinal,
    onChangeText: this.onChangeText,
}))
```

`extraprops` es básicamente una copia de todas las props recibidas por
`SInput` (incluye `defaultValue`, que `FechaFullFilter.js` pasa como
`fecha_inicio: { defaultValue: this.state.fecha_inicio, ... }`). Nunca
se borra `defaultValue` de `extraprops` antes de pasarlo al `TextInput`
nativo, así que termina con `value` y `defaultValue` puestos a la vez.

## Fix propuesto (para cuando se resuelva)

Igual que se hizo en `InputSelector.tsx`: en el `React.createElement(TextInput, ...)`
de `SInput/index.js`, borrar `defaultValue` de `extraprops` antes de
usarlo (misma línea donde ya borran `flex`):

```js
delete extraprops["flex"];
delete extraprops["defaultValue"];
```

o, más simple, forzar `defaultValue: undefined` en el último objeto del
`__assign` (el que ya sobrescribe `autoFocus`/`style`/`onChangeText`).

## Cómo aplicarlo

Mismas dos opciones que el Pendiente 1 (repo fuente de
`servisofts-component`, o `patch-package` en este repo — ver esa
sección arriba).

## Impacto / prioridad

Bajo. Cosmético, no afecta funcionalidad. Mismo formulario que el
Pendiente 1, así que si se termina arreglando el paquete
`servisofts-component`, conviene resolver los dos juntos.
