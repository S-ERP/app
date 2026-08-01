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
- Déjalo limpio como un profesional de 5 años de experiencia.
```

## Checklist de lo que se hace en cada archivo

- Quitar todos los comentarios (con el script `scripts/clean-file.js` del propio proyecto).
- Normalizar la indentación a tabs (una sola tabulación consistente).
- Borrar todos los `console.log` / `console.clear` / dumps de debug.
- Dejar solo los `console.*` dentro de `catch` o en checks de "variable vacía", convertidos todos a `console.warn` con mensaje descriptivo.
- Revisar errores ortográficos en textos visibles (labels, títulos, mensajes).

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
