# Prompt: script de build + deploy tipo "siles.sh"

Copia y pega esto (completando los datos entre `< >`) para que se genere un script
equivalente a `siles.sh` en otro proyecto.

---

Quiero un script bash `siles.sh` en la raiz del proyecto que automatice el build y
deploy a un servidor propio, con este flujo en 5 pasos, cada uno con un mensaje de
consola en color distinto (azul/cian para pasos, verde para OK, amarillo para avisos)
y numerado tipo `[1/5]`:

1. **Subir version**: leer la version actual desde `<archivo con el numero de version,
   ej: package.json>` y subir el patch en +1 (ej: 1.0.18 -> 1.0.19). Actualizar esa
   misma version en todos estos archivos: `<listar archivos que repiten el numero de
   version, ej: package.json, app.json, android/app/build.gradle (versionName +
   versionCode)>`.

2. **Compilar**: correr `<comando de build, ej: npm run build>`, que genera la carpeta
   `<carpeta de salida del build, ej: build/>`.

3. **Backup remoto**: por SSH, copiar la carpeta de build que ya esta en el servidor a
   una carpeta hermana con fecha (`<ruta remota del build, ej:
   ~/servicios/<proyecto>/entornos/<entorno>/build>` -> `..._YYYY-MM-DD_HHMMSS`), para
   tener respaldo antes de sobreescribir.

4. **Subir build nuevo**: con `rsync -avz --delete` (no `scp`, para que borre archivos
   viejos que ya no existen) sincronizar la carpeta de build local con la ruta remota
   del paso 3.

5. **Reiniciar el servicio**: correr en el servidor `<script de gestion remoto, ej:
   ./servisofts.sh down` y luego `up -d>`. Ese script es interactivo: pide elegir un
   entorno de un menu numerado (`<numero de opcion a enviar, ej: 1 para el entorno
   "serp">`) y despues pide la password de sudo. Automatizar eso con `ssh -tt` +
   `printf '1\n%s\n' "$SUDO_PASS" | ssh -tt ...` para simular esos inputs.

Datos de conexion:
- Host SSH: `<usuario@ip, ej: servisofts@192.168.2.5>`
- Directorio remoto del proyecto: `<ej: ~/servicios/<proyecto>>`

Requisitos de seguridad:
- La password de sudo y los datos de conexion **no deben quedar escritos en el script
  versionado en git**. Guardarlos en un archivo separado (ej: `.siles.env`) y agregarlo
  a `.gitignore`. Si ese archivo no existe, el script debe pedir los datos por consola
  (la password con `read -s`, sin mostrarla).
- Restringir permisos del archivo de credenciales (`chmod 600`).
- El script no debe ejecutarse solo automaticamente: mostrar cada paso y avisar antes
  de reiniciar el servicio en produccion.

Contexto de referencia (como se hizo en el proyecto `alvaro/app`):
- El script terminado esta en `siles.sh` de este repo, se puede usar como ejemplo
  directo de la implementacion (variables, sed para bump de version, rsync, ssh -tt).
