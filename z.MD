# Pasos realizados

## 1. Proyecto `library`

El proyecto `library` es una:

- librería npm privada/local
- escrita en TypeScript + React
- consumida por otra aplicación

## Arquitectura

```text
library/
 ├── src/        ← código fuente
 ├── dist/       ← artefacto compilado
 ├── package.json
 └── tsconfig.json
```

## Instalación y ejecución

En el proyecto se ejecutó:

```bash
npm install --legacy-peer-deps && npm start
```

Esto permite:

1. instalar las dependencias del proyecto
2. resolver conflictos de `peerDependencies`
3. iniciar el proyecto localmente

---

# 2. Proyecto `serp`

En el proyecto `serp` se linkeó la librería mediante una dependencia local en el `package.json`:

```json
"servisofts-rn-contabilidad": "file:../contabilidad/library/dist"
```

Esto permite consumir la librería compilada desde el proyecto `serp`.

---

## Instalación y ejecución

Luego se ejecutó:

```bash
npm install --legacy-peer-deps && npm run web
```

Esto permite:

1. instalar las dependencias del proyecto
2. resolver conflictos de `peerDependencies`
3. levantar la aplicación web consumiendo la librería local

---

# Flujo de trabajo

## Cuando se realizan cambios en la librería

### 1. Compilar nuevamente la librería

Desde el proyecto `library`:

```bash
npm run build
```

Esto actualiza la carpeta:

```text
dist/
```

---

### 2. Reinstalar dependencias en `serp`

Desde el proyecto `serp`:

```bash
npm install
```

o si npm mantiene caché:

```bash
npm install --force
```

---

# Concepto técnico

La aplicación `serp` NO consume directamente el código fuente de la librería.

Consume únicamente el artefacto compilado ubicado en:

```text
library/dist
```

Esto desacopla:

- el código fuente (`src`)
- del código distribuible (`dist`)

siguiendo el mismo modelo utilizado por librerías npm profesionales como:

- React
- axios
- lodash
- date-fns
- Material UI

<!-- 
 rm -r -fo .\node_modules\servisofts-rn-contabilidad
PS C:\Users\ALVARO\Documents\GitHub\app> npm install --legacy-peer-deps -->