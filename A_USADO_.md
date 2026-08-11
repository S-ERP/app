# React — lista completa, ¿qué se usa en este proyecto?

Auditoría real hecha con `grep` sobre `src/` del proyecto (no es teoría, es lo que hay hoy en el código).

| # | Concepto | Grupo | Activo | ¿Se usa acá? | Nota |
|---|---|---|:---:|---|---|
| 1 | Client Components | Arquitectura de la app | ✅ | Sí | Todo el proyecto (SPA) |
| 2 | CSR (Client-Side Rendering) | Arquitectura de la app | ✅ | Sí | |
| 3 | Mount | Ciclo de vida | ✅ | Sí | |
| 4 | Update | Ciclo de vida | ✅ | Sí | |
| 5 | Unmount | Ciclo de vida | ✅ | Sí | |
| 6 | Cleanup | Ciclo de vida | ✅ | Sí | `return () => {...}` dentro de `useEffect` |
| 7 | Ciclo de vida | Ciclo de vida | ✅ | Sí | |
| 8 | `constructor()` | Ciclo de vida | ✅ | Sí | |
| 9 | `render()` | Ciclo de vida | ✅ | Sí | |
| 10 | `componentDidMount()` | Ciclo de vida | ✅ | Sí | |
| 11 | `componentDidUpdate()` | Ciclo de vida | ✅ | Sí | 13 archivos |
| 12 | `componentWillUnmount()` | Ciclo de vida | ✅ | Sí | |
| 13 | `shouldComponentUpdate()` | Ciclo de vida | ✅ | Sí | 6 archivos |
| 14 | `children` | Composición | ✅ | Sí | 71 archivos |
| 15 | Composition | Composición | ✅ | Sí | |
| 16 | Comunicación Padre → Hijo | Comunicación | ✅ | Sí | Vía props |
| 17 | Comunicación Hijo → Padre | Comunicación | ✅ | Sí | Callbacks tipo `onSuccess`, `onSelect`, `onChangeText` |
| 18 | Lifting State Up | Comunicación | ✅ | Sí | Patrón usado (ej. `PopupCarrito` pasa `item`/`moneda` hacia abajo) |
| 19 | Prop Drilling | Comunicación | ✅ | Sí | Frecuente, dado el poco uso de Context |
| 20 | Fetch / APIs | Datos / APIs | ✅ | Sí | Vía `SSocket.sendPromise` |
| 21 | Loading / Error / Success states | Datos / APIs | ✅ | Sí | `SLoad`, `SNotification`, `try/catch` |
| 22 | Context API | Estado global | ✅ | Sí | 7 archivos usan `createContext` |
| 23 | State Management | Estado global | ✅ | Sí | Redux (`react-redux`, `redux-thunk`) + sistema propio `MDL` |
| 24 | Estado global | Estado global | ✅ | Sí | Redux + `MDL` |
| 25 | Eventos | Eventos | ✅ | Sí | |
| 26 | `onClick` | Eventos | ✅ | Sí | 12 archivos (poco, el proyecto usa mayormente `onPress` de React Native) |
| 27 | `onChange` | Eventos | ✅ | Sí | 117 archivos |
| 28 | `onSubmit` | Eventos | ✅ | Sí | 90 archivos — casi siempre como prop custom de `SForm2`, no `<form onSubmit>` nativo |
| 29 | `onMouseEnter` | Eventos | ✅ | Sí | 2 archivos |
| 30 | `onMouseLeave` | Eventos | ✅ | Sí | 2 archivos |
| 31 | `onKeyDown` | Eventos | ✅ | Sí | 3 archivos (ej. `PopupCarrito.tsx`, cerrar popup con Escape) |
| 32 | `onFocus` | Eventos | ✅ | Sí | 7 archivos |
| 33 | `onBlur` | Eventos | ✅ | Sí | 10 archivos |
| 34 | Controlled Components | Formularios | ✅ | Sí | `value={...}`, 99 archivos |
| 35 | Uncontrolled Components | Formularios | ✅ | Sí | `defaultValue={...}`, 127 archivos (patrón muy usado acá) |
| 36 | Formularios | Formularios | ✅ | Sí | `SForm`/`SForm2` propios |
| 37 | Forms + Validación | Formularios | ✅ | Sí | |
| 38 | Componentes | Fundamentos | ✅ | Sí | Todo el proyecto son componentes (de clase y de función) |
| 39 | JSX | Fundamentos | ✅ | Sí | En todos los `.tsx`/`.js` de `Pages`/`Components` |
| 40 | Props | Fundamentos | ✅ | Sí | |
| 41 | State | Fundamentos | ✅ | Sí | Mezcla de `this.state` (clases) y `useState` (funciones) |
| 42 | Render | Fundamentos | ✅ | Sí | |
| 43 | Re-render | Fundamentos | ✅ | Sí | Vía `setState`/hooks |
| 44 | Refs | Fundamentos | ✅ | Sí | |
| 45 | Rendering | Fundamentos | ✅ | Sí | |
| 46 | `useState` | Hooks | ✅ | Sí | ~52 archivos |
| 47 | `useEffect` | Hooks | ✅ | Sí | 46 archivos |
| 48 | `useRef` | Hooks | ✅ | Sí | 40 archivos |
| 49 | `useContext` | Hooks | ✅ | Sí | 6 archivos |
| 50 | `useMemo` | Hooks | ✅ | Sí (poco) | Solo 3 archivos |
| 51 | `useCallback` | Hooks | ✅ | Sí | 5 archivos |
| 52 | `useImperativeHandle` | Hooks | ✅ | Sí | 13 archivos |
| 53 | Custom Hooks | Hooks | ✅ | Sí | ej. `useLimitedFPS` en `Components/SThree` |
| 54 | `componentDidCatch()` | Manejo de errores | ✅ | Sí | `src/Components/ErrorBoundary` |
| 55 | Error Boundaries | Manejo de errores | ✅ | Sí | `src/Components/ErrorBoundary`, usado en `App.js` |
| 56 | `React.memo` | Optimización | ✅ | Sí | 6 archivos |
| 57 | Higher-Order Components (HOC) | Patrones avanzados | ✅ | **Sí, muchísimo** | 422 archivos usan `connect(...)` (patrón de `servisofts-page`, no Redux) — es el patrón dominante del proyecto, más que Context o Hooks |
| 58 | `React.forwardRef` | Patrones avanzados | ✅ | Sí | 17 archivos |
| 59 | `defaultProps` | Patrones avanzados | ✅ | Sí | 9 archivos |
| 60 | React Native / React Native Web | Plataforma | ✅ | **Sí, es la base de todo** | 520 archivos importan de `react-native`. El proyecto no es "React DOM puro": corre sobre React Native Web (por eso `SView`, `onPress` en vez de `onClick`, etc.) |
| 61 | `FlatList` / listas virtualizadas | Plataforma | ✅ | Sí | 51 archivos (ej. la lista de items del carrito en `PopupCarrito.tsx`) |
| 62 | Animated API (`Animated.*`) | Plataforma | ✅ | Sí | 60 archivos |
| 63 | `TouchableOpacity` | Plataforma | ✅ | Sí | 19 archivos |
| 64 | `createRoot` (API de montaje React 18) | Plataforma | ✅ | Sí | `src/index.js` — el proyecto ya usa React 18.2.0 |
| 65 | Conditional Rendering | Renderizado | ✅ | Sí | `{cond ? <A/> : null}` en todos lados |
| 66 | Listas | Renderizado | ✅ | Sí | `.map()` en todos lados |
| 67 | `key` | Renderizado | ✅ | Sí | |
| 68 | Fragments (`<>...</>`) | Renderizado | ✅ | Sí | Muy usado |
| 69 | Rutas | Routing | ✅ | Sí | Sistema propio (`SPage.combinePages`) |
| 70 | Parámetros de URL | Routing | ✅ | Sí | `SNavigation.getParam`, 118 archivos |
| 71 | Nested Routes | Routing | ✅ | Sí | `SPage.combinePages` anida sub-rutas (ej. `productos/modelo/table`) |
| 72 | Inmutabilidad | Buenas prácticas | ⚠️ | Parcial / No | El proyecto **muta** `this.state` directo en muchos lugares (ej. `this.state.key_marca = x`) en vez de copiar |
| 73 | Context + Reducer | Estado global | ⚠️ | Parcial | Hay Context; `useReducer` no se usa |
| 74 | Optimización | Optimización | ⚠️ | Parcial | Poco `useMemo`/`memo`, la mayoría recalcula siempre |
| 75 | Performance | Optimización | ⚠️ | Parcial | Sin profiling sistemático |
| 76 | Refs vs State | Conceptos comparativos | ➖ | — | Conceptual |
| 77 | Props vs State | Conceptos comparativos | ➖ | — | Conceptual |
| 78 | React DevTools | Herramientas | ➖ | — | Herramienta externa, no es parte del código |
| 79 | Virtual DOM | React interno | ➖ | — | Conceptual, interno de React |
| 80 | Reconciliation | React interno | ➖ | — | Conceptual, interno de React |
| 81 | Diffing | React interno | ➖ | — | Conceptual, interno de React |
| 82 | Fiber | React interno | ➖ | — | Conceptual, interno de React |
| 83 | SyntheticEvent | React interno | ➖ | — | Conceptual, interno de React |
| 84 | Automatic Batching (React 18) | React interno | ➖ | — | Viene gratis con React 18, no es algo que se "use" explícitamente |
| 85 | Server Components | Arquitectura de la app | ❌ | No | No es Next.js, es SPA con webpack |
| 86 | SSR (Server-Side Rendering) | Arquitectura de la app | ❌ | No | |
| 87 | Hydration | Arquitectura de la app | ❌ | No | No aplica sin SSR |
| 88 | Lazy Loading | Carga diferida | ❌ | No | Sin `React.lazy` |
| 89 | `React.lazy` | Carga diferida | ❌ | No | 0 archivos |
| 90 | Suspense | Carga diferida | ❌ | No | 0 archivos |
| 91 | Code Splitting | Carga diferida | ❌ | No (vía React) | No hay `lazy`/`Suspense`; posible que webpack lo haga a otro nivel, pero no manejado desde React |
| 92 | `getDerivedStateFromProps()` | Ciclo de vida | ❌ | No | 0 archivos |
| 93 | Custom Hooks para API | Datos / APIs | ❌ | No | Usan métodos de clase de `MDL` + promesas, no hooks propios de fetching |
| 94 | `dangerouslySetInnerHTML` | Fundamentos | ❌ | No | 0 archivos |
| 95 | Profiling | Herramientas | ❌ | No evidencia | |
| 96 | `React.StrictMode` | Herramientas | ❌ | No | 0 archivos — no está activado |
| 97 | `useReducer` | Hooks | ❌ | No | 0 archivos |
| 98 | `useLayoutEffect` | Hooks | ❌ | No | 0 archivos |
| 99 | `useId` | Hooks | ❌ | No | 0 archivos |
| 100 | `useTransition` | Hooks | ❌ | No | 0 archivos |
| 101 | `useDeferredValue` | Hooks | ❌ | No | 0 archivos |
| 102 | `useSyncExternalStore` | Hooks | ❌ | No | 0 archivos |
| 103 | `useDebugValue` | Hooks | ❌ | No | 0 archivos |
| 104 | `getDerivedStateFromError()` | Manejo de errores | ❌ | No | 0 archivos |
| 105 | Pure Components | Optimización | ❌ | No | `React.PureComponent`: 0 archivos |
| 106 | PropTypes | Patrones avanzados | ❌ | No | 0 archivos (usan TypeScript/Flow en su lugar, no siempre) |
| 107 | Render Props | Patrones avanzados | ❌ | No evidente | El proyecto resuelve composición con HOC (`connect`) y props normales, no con este patrón |
| 108 | `startTransition` / Concurrent Features | React interno | ❌ | No | 0 archivos, pese a estar en React 18 |
| 109 | Portals | Renderizado | ❌ | No | `createPortal`: 0 archivos |
| 110 | React Router | Routing | ❌ | No | No está en `package.json`; routing propio vía `servisofts-page` / `SNavigation` |
| 111 | Testing | Testing | ❌ | No | 0 archivos `.test.`/`.spec.` |
| 112 | React Testing Library | Testing | ❌ | No | No está en `package.json` |
| 113 | Vitest / Jest | Testing | ❌ | No | No está en `package.json` |

**Conclusión corta:** lo más relevante que faltaba no eran hooks raros, sino que la lista original asumía una app 100% React DOM — y este proyecto en realidad es **React Native Web + HOCs (`connect`)** como columna vertebral, con Hooks usados de forma parcial/mezclada con clases.

<!-- Dime qué quieres que haga tu extensión. Por ejemplo:

“Quiero una extensión que traduzca automáticamente una página.”

o

“Quiero una extensión que detecte precios y los convierta a otra moneda.” -->
