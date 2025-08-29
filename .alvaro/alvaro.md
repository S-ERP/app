# Tabla de RegExp para Limpieza de Código

## 📁 Breve documentación sobre `include` y `exclude`

- **include**: Especifica los archivos que deben procesarse. Por ejemplo:
  ```json
  "include": ["src/Pages/punto_venta/**/*"]

  "exclude": ["src/Pages/punto_venta/tests/**/*"]

  ```markdown
# Tabla de RegExp para Limpieza de Código

## 📁 Breve documentación sobre `include` y `exclude`

- **include**: Especifica los archivos que deben procesarse. Por ejemplo:
  ```json
  "include": ["src/Pages/punto_venta/**/*"]
  ```

- **exclude**: Sirve para ignorar archivos o carpetas irrelevantes. Por ejemplo:
  ```json
  "exclude": ["src/Pages/punto_venta/tests/**/*"]
  ```

- **Exclusiones comunes en tu proyecto**:
  `expo`, `.github`, `ssh`, `android`, `bin`, `dist`, `ios`, `node_modules`, `patches`, `public`, `ssh_drive_sync`, `temp`

| Nº  | ¿Qué hace?                          | RegExp para Buscar             | Reemplazo sugerido         | Notas                                              |
|-----|-------------------------------------|--------------------------------|----------------------------|----------------------------------------------------|
| 1️⃣  | Eliminar líneas vacías              | `^\s*\n`                      | (vacío)                    | Limpia líneas innecesarias                         |
| 2️⃣  | Eliminar comentarios de línea `//`  | `^\s*//.*`                    | (vacío)                    | Quita todos los comentarios de línea               |
| 3️⃣  | Eliminar comentarios de bloque `/* */` | `/\*[\s\S]*?\*/`          | (vacío)                    | Usar con cuidado, puede eliminar documentación     |
| 4️⃣  | Eliminar espacios duplicados        | `[ ]{2,}`                     | (espacio simple)           | Normaliza los espacios                            |
| 5️⃣  | Eliminar tabs al inicio             | `^\t+`                        | (vacío) o (2 espacios)     | Útil si combinas espacios y tabs                  |
| 6️⃣  | Quitar `console.log(...)`           | `^\s*console\.log\(.*\);\s*$` | (vacío)                    | Elimina todos los `console.log`                    |
| 7️⃣  | Quitar `debugger;`                  | `^\s*debugger;\s*$`           | (vacío)                    | Elimina puntos de pausa innecesarios              |
| 8️⃣  | Quitar imports no usados (parcial)  | `^import .* from .*;\s*\n?`   | (vacío)                    | Solo si estás seguro que no se usa                |
| 9️⃣  | Quitar espacios al final de línea   | `[ \t]+$`                     | (vacío)                    | Limpieza visual automática                        |
| 🔟  | Quitar comas finales dobles         | `,,+`                         | `,`                        | Corrige errores de coma repetida                  |
```