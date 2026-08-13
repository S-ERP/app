# Eliminar espacios en blanco en campos de facturación

## Descripción
Se ha implementado la limpieza automática de espacios en blanco (trim) en los campos de entrada de texto en el módulo de facturación. Esto previene errores al capturar datos incompletos o con espacios accidentales al inicio y final, ya que el servidor rechaza cualquier dato con espacios en esas posiciones.

## Cambios realizados

### Frontend - Cabecera.tsx
Se agregó `.trim()` a los siguientes campos en `/src/Pages/facturacion/create/Cabecera.tsx`:
- **Fecha de emisión** (línea 32)
- **Número de documento** (línea 88, 90)
- **Complemento** (línea 114)
- **Nombre/Razón social** (línea 129)
- **Código de cliente** (línea 139)

**Enlace:** [Cabecera.tsx](./src/Pages/facturacion/create/Cabecera.tsx)

### Frontend - Detalle.tsx
Se agregó `.trim()` a los siguientes campos en `/src/Pages/facturacion/create/Detalle.tsx`:
- **Descripción del producto** (línea 144)

**Enlace:** [Detalle.tsx](./src/Pages/facturacion/create/Detalle.tsx)

### Backend - Factura.java
El servidor Java ya cuenta con validación de espacios en el método `validarEspacios()` (líneas 156-167) en `/facturacion/server/src/Component/Factura.java`:

```java
public static void validarEspacios(JSONObject obj) throws Exception {
    for (String key : obj.keySet()) {
        Object value = obj.get(key);
        if (value instanceof String) {
            String str = (String) value;
            if (str.length() > 0 && (str.charAt(0) == ' ' || str.charAt(str.length() - 1) == ' ')) {
                throw new Exception(
                    "❌ El campo '" + key + "' tiene espacios al inicio o al final. Valor: [" + str + "]");
            }
        }
    }
}
```

Este método se ejecuta en operaciones críticas como `reconstruir()` (línea 171) para garantizar que los datos cumplan con el formato requerido.

**Enlace:** [Factura.java](../facturacion/server/src/Component/Factura.java)

## Nota importante
Se removieron los `.trim()` en campos numéricos (cantidad, precio, descuento) ya que `parseFloat()` maneja automáticamente espacios al inicio y final, y aplicar trim en estos campos es innecesario y puede causar inconsistencias.

Tampoco se aplicó trim al campo select (tipo de documento identidad) para evitar problemas con la selección de opciones.
