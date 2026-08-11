# INFO.md — Versiones y requisitos del proyecto

`servisofts_erp_app` — App React Native (Expo bare workflow) con soporte Web (webpack) y builds nativos Android/iOS.

## Lenguajes

| Lenguaje    | Uso                                      |
|-------------|-------------------------------------------|
| TypeScript  | 4.8.4 — código principal (`.tsx`/`.ts`)   |
| JavaScript  | ES2020+ / ESNext — parte del código legado |
| Kotlin      | 1.8.10 — módulos nativos Android          |
| Java        | módulos nativos Android (Gradle)          |
| Objective-C/Swift | proyecto iOS nativo (`ios/`)        |
| Groovy      | scripts de Gradle (`build.gradle`)        |
| SQL         | scripts en `sql/` y `get_clientes_suscripcion_activa.sql` |

## Entorno / Runtime

| Herramienta | Versión requerida |
|-------------|--------------------|
| Node.js     | 18.x (probado con 18.20.8; README menciona `nvm install 14.18.0` como legado, preferir 18.x) |
| npm         | 10.x |
| Java (JDK)  | 17 (usado para build de Android con Gradle 7.5.1) |
| Python      | 3.x (requerido por tooling de Gradle/React Native) |

## Framework principal

| Paquete       | Versión |
|---------------|---------|
| react         | 18.2.0  |
| react-dom     | 18.2.0  |
| react-native  | 0.71.4  |
| react-native-web | 0.18.2 |
| expo          | 48.0.8  |
| Expo SDK (app.json) | 49.0.0 |
| react-redux / redux | 7.2.4 / 4.1.1 |
| @react-navigation/native | 5.9.6 |

> Nota: `expo` en `dependencies` está en `48.0.8` mientras que `app.json` declara `sdkVersion: 49.0.0`. Verificar consistencia antes de un build limpio.

## Build Web

| Herramienta | Versión |
|-------------|---------|
| webpack     | ^5.91.0 |
| webpack-cli | ^5.1.4  |
| webpack-dev-server | ^5.0.4 |
| babel (core) | 7.24.8 |
| ts-loader   | ^9.5.1  |
| esbuild-loader | ^4.4.0 |

Scripts relevantes (`package.json`):
- `npm run web` → `webpack serve --config webpack.dev.js`
- `npm run build` → `webpack --config webpack.prod.js`
- `npm run start` → `react-native start`

## Build Android

| Herramienta         | Versión   |
|----------------------|-----------|
| Gradle               | 7.5.1     |
| Android Gradle Plugin | 7.4.1    |
| Kotlin               | 1.8.10    |
| compileSdkVersion    | 34        |
| targetSdkVersion     | 34        |
| minSdkVersion        | 23        |
| buildToolsVersion    | 33.0.0    |
| NDK                  | 23.1.7779620 |
| Google Play Services Auth | 19.2.0 |
| google-services (Gradle plugin) | 4.3.15 |

Comandos típicos:
```bash
cd android
./gradlew clean --info --stacktrace
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Build iOS

| Herramienta | Versión |
|-------------|---------|
| iOS deployment target | 13.0 |
| CocoaPods   | requerido (sin `Gemfile` fijado; usar versión estable de CocoaPods actual) |

## TypeScript config

- `tsconfig.json` extiende `@tsconfig/react-native/tsconfig.json`
- `jsx: react-jsx`, `module`/`target: esnext`

## Dependencias internas Servisofts (paquetes propios)

- servisofts-component ^3.0.77
- servisofts-db ^1.0.7
- servisofts-model ^1.0.7
- servisofts-page ^1.0.12
- servisofts-rn-chat 1.0.12
- servisofts-rn-contabilidad ^1.0.9
- servisofts-rn-geolocation ^1.0.4
- servisofts-rn-roles_permisos ^1.0.8
- servisofts-rn-spdf ^1.0.7
- servisofts-rn-usuario 1.0.11
- servisofts-socket 4.0.8
- servisofts-table ^1.0.35
- servisofts-background-location ^2.0.3
- servisofts-canvas ^1.0.4
- servisofts-charts 1.0.5

## Otras dependencias notables

- three 0.166.1 / expo-three 7.0.1 / expo-gl 13.0.1 (renderizado 3D)
- realm 11.10.1 (base de datos local)
- firebase ^9.6.11
- recharts ^2.15.4
- xlsx / xlsx-color / xlsx-js-style (exportación Excel)
