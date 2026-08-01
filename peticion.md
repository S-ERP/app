# Petición: Limpieza de código

## Prompt reutilizable

Copiar/pegar este texto (agregando la lista de archivos) para repetir esta limpieza en otros archivos:

```
Necesito que limpies código de estos archivos:
[LISTA DE ARCHIVOS]

- Que solo haya una tabulación (indentación a tabs, consistente).
- Borrar comentarios.
- Borrar todos los console.*.
- Solo deja los console dentro de catch y en el caso de que venga vacía la variable, ten en cuenta que sea console.warning y el mensaje que corresponda.
- Quitar imports no usados.
- Quitar variables y código muerto (código que nunca se ejecuta o ya no se usa).
- Unificar el estilo de comillas (un solo tipo por archivo).
- Revisar y corregir errores ortográficos en los textos visibles (labels, títulos, mensajes).
- Verificar que el archivo siga compilando/parseando sin errores después de la limpieza.
- Si detectas código duplicado con otro archivo del proyecto, avisar antes de tocarlo (no refactorizar solo por tu cuenta).
- Déjalo limpio como un profesional de 5 años de experiencia.
```

## Checklist de lo que se hace en cada archivo

- Quitar todos los comentarios (con el script `scripts/clean-file.js` del propio proyecto).
- Normalizar la indentación a tabs (una sola tabulación consistente).
- Borrar todos los `console.log` / `console.clear` / dumps de debug.
- Dejar solo los `console.*` dentro de `catch` o en checks de "variable vacía", convertidos todos a `console.warn` con mensaje descriptivo.
- Quitar imports no usados.
- Quitar variables, funciones y bloques de código muerto (sin referencias en el archivo).
- Unificar el estilo de comillas (un solo tipo, simples o dobles, por archivo).
- Revisar errores ortográficos en textos visibles (labels, títulos, mensajes).
- Validar el archivo con el parser de TypeScript (0 diagnósticos) para confirmar que no se rompió la sintaxis.
- Si dos archivos comparten lógica casi idéntica (copy-paste), señalarlo como nota aparte en vez de fusionarlos sin permiso.

## Referencia: última limpieza aplicada

Archivos:
- `src/Pages/cliente/tabla_transacciones.js`
- `src/Pages/proveedor/tabla_transacciones.js`
- `src/Pages/compra/tabla.js`
- `src/Components/PDF/compra/ComprobanteKardexIndividual.js`
- `src/Pages/cliente/tabla.js`

Resultado:
- Quité todos los comentarios (con el script `scripts/clean-file.js` del propio proyecto).
- Normalicé la indentación a tabs (una sola tabulación consistente).
- Borré todos los `console.log`/`console.clear`/dumps de debug.
- Dejé solo los `console.*` dentro de `catch` o en checks de "variable vacía", convertidos todos a `console.warn` con mensaje descriptivo.
- De regalo encontré y corregí 4 errores ortográficos ("AMORTIZARv", "AMORTIZssAR", "trasabilidad", "ENCONTRO" sin tilde).
