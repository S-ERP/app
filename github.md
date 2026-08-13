# Eliminar espacios en blanco en campos de facturación

## Descripción
Se ha implementado la limpieza automática de espacios en blanco (trim) en los campos de entrada de texto en el módulo de facturación. Esto previene errores al capturar datos incompletos o con espacios accidentales al inicio y final.

## Cambios realizados

### Cabecera.tsx
Se agregó `.trim()` a los siguientes campos en `/src/Pages/facturacion/create/Cabecera.tsx`:
- **Fecha de emisión** (línea 32)
- **Número de documento** (línea 88, 90)
- **Complemento** (línea 114)
- **Nombre/Razón social** (línea 129)
- **Código de cliente** (línea 139)

**Enlace:** [Cabecera.tsx](./src/Pages/facturacion/create/Cabecera.tsx)

### Detalle.tsx
Se agregó `.trim()` a los siguientes campos en `/src/Pages/facturacion/create/Detalle.tsx`:
- **Descripción del producto** (línea 144)

**Enlace:** [Detalle.tsx](./src/Pages/facturacion/create/Detalle.tsx)

## Nota importante
Se removieron los `.trim()` en campos numéricos (cantidad, precio, descuento) ya que `parseFloat()` maneja automáticamente espacios al inicio y final, y aplicar trim en estos campos es innecesario y puede causar inconsistencias.

Tampoco se aplicó trim al campo select (tipo de documento identidad) para evitar problemas con la selección de opciones.
