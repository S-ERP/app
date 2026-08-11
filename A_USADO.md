# React — lista completa, ¿qué se usa en este proyecto?

Auditoría real hecha con `grep` sobre `src/` del proyecto (no es teoría, es lo que hay hoy en el código).

| # | Concepto | ¿Se usa acá? | Nota |
|---|---|---|---|
| 1 | Componentes | Sí | Todo el proyecto son componentes (de clase y de función) |
| 2 | JSX | Sí | En todos los `.tsx`/`.js` de `Pages`/`Components` |
| 3 | Props | Sí | |
| 4 | State | Sí | Mezcla de `this.state` (clases) y `useState` (funciones) |
| 5 | `useState` | Sí | ~52 archivos |
| 6 | Render | Sí | |
| 7 | Re-render | Sí | Vía `setState`/hooks |
| 8 | Eventos | Sí | |
| 9 | `onClick` | Sí | 12 archivos (poco, el proyecto usa mayormente `onPress` de React Native) |
| 10 | `onChange` | Sí | 117 archivos |
| 11 | `onSubmit` | Sí | 90 archivos — casi siempre como prop custom de `SForm2`, no `<form onSubmit>` nativo |
| 12 | `onMouseEnter` | Sí | 2 archivos |
| 13 | `onMouseLeave` | Sí | 2 archivos |
| 14 | `onKeyDown` | Sí | 3 archivos (ej. `PopupCarrito.tsx`, cerrar popup con Escape) |
| 15 | `onFocus` | Sí | 7 archivos |
| 16 | `onBlur` | Sí | 10 archivos |
| 17 | Conditional Rendering | Sí | `{cond ? <A/> : null}` en todos lados |
| 18 | Listas | Sí | `.map()` en todos lados |
| 19 | `key` | Sí | |
| 20 | `children` | Sí | 71 archivos |
| 21 | Comunicación Padre → Hijo | Sí | Vía props |
| 22 | Comunicación Hijo → Padre | Sí | Callbacks tipo `onSuccess`, `onSelect`, `onChangeText` |
| 23 | `useEffect` | Sí | 46 archivos |
| 24 | Mount | Sí | |
| 25 | Update | Sí | |
| 26 | Unmount | Sí | |
| 27 | Cleanup | Sí | `return () => {...}` dentro de `useEffect` |
| 28 | Ciclo de vida | Sí | |
| 29 | `constructor()` | Sí | |
| 30 | `render()` | Sí | |
| 31 | `componentDidMount()` | Sí | |
| 32 | `componentDidUpdate()` | Sí | 13 archivos |
| 33 | `componentWillUnmount()` | Sí | |
| 34 | `shouldComponentUpdate()` | Sí | 6 archivos |
| 35 | `getDerivedStateFromProps()` | **No** | 0 archivos |
| 36 | `componentDidCatch()` | Sí | `src/Components/ErrorBoundary` |
| 37 | `getDerivedStateFromError()` | **No** | 0 archivos |
| 38 | `useRef` | Sí | 40 archivos |
| 39 | `useContext` | Sí | 6 archivos |
| 40 | Context API | Sí | 7 archivos usan `createContext` |
| 41 | `useReducer` | **No** | 0 archivos |
| 42 | `useMemo` | Sí (poco) | Solo 3 archivos |
| 43 | `useCallback` | Sí | 5 archivos |
| 44 | `useLayoutEffect` | **No** | 0 archivos |
| 45 | `useId` | **No** | 0 archivos |
| 46 | `useTransition` | **No** | 0 archivos |
| 47 | `useDeferredValue` | **No** | 0 archivos |
| 48 | `useImperativeHandle` | Sí | 13 archivos |
| 49 | `useSyncExternalStore` | **No** | 0 archivos |
| 50 | `useDebugValue` | **No** | 0 archivos |
| 51 | Custom Hooks | Sí | ej. `useLimitedFPS` en `Components/SThree` |
| 52 | `React.memo` | Sí | 6 archivos |
| 53 | Refs | Sí | |
| 54 | Controlled Components | Sí | `value={...}`, 99 archivos |
| 55 | Uncontrolled Components | Sí | `defaultValue={...}`, 127 archivos (patrón muy usado acá) |
| 56 | Formularios | Sí | `SForm`/`SForm2` propios |
| 57 | Fragments (`<>...</>`) | Sí | Muy usado |
| 58 | Portals | **No** | `createPortal`: 0 archivos |
| 59 | Error Boundaries | Sí | `src/Components/ErrorBoundary`, usado en `App.js` |
| 60 | Lazy Loading | **No** | Sin `React.lazy` |
| 61 | `React.lazy` | **No** | 0 archivos |
| 62 | Suspense | **No** | 0 archivos |
| 63 | Code Splitting | **No** (vía React) | No hay `lazy`/`Suspense`; posible que webpack lo haga a otro nivel, pero no manejado desde React |
| 64 | Virtual DOM | — | Conceptual, interno de React |
| 65 | Reconciliation | — | Conceptual, interno de React |
| 66 | Diffing | — | Conceptual, interno de React |
| 67 | Fiber | — | Conceptual, interno de React |
| 68 | Lifting State Up | Sí | Patrón usado (ej. `PopupCarrito` pasa `item`/`moneda` hacia abajo) |
| 69 | Composition | Sí | |
| 70 | Prop Drilling | Sí | Frecuente, dado el poco uso de Context |
| 71 | State Management | Sí | Redux (`react-redux`, `redux-thunk`) + sistema propio `MDL` |
| 72 | Inmutabilidad | Parcial / No | El proyecto **muta** `this.state` directo en muchos lugares (ej. `this.state.key_marca = x`) en vez de copiar |
| 73 | Refs vs State | — | Conceptual |
| 74 | Props vs State | — | Conceptual |
| 75 | Pure Components | **No** | `React.PureComponent`: 0 archivos |
| 76 | Optimización | Parcial | Poco `useMemo`/`memo`, la mayoría recalcula siempre |
| 77 | Rendering | Sí | |
| 78 | Server Components | **No** | No es Next.js, es SPA con webpack |
| 79 | Client Components | Sí | Todo el proyecto (SPA) |
| 80 | SSR (Server-Side Rendering) | **No** | |
| 81 | CSR (Client-Side Rendering) | Sí | |
| 82 | Hydration | **No** | No aplica sin SSR |
| 83 | React Router | **No** | No está en `package.json`; routing propio vía `servisofts-page` / `SNavigation` |
| 84 | Rutas | Sí | Sistema propio (`SPage.combinePages`) |
| 85 | Parámetros de URL | Sí | `SNavigation.getParam`, 118 archivos |
| 86 | Nested Routes | Sí | `SPage.combinePages` anida sub-rutas (ej. `productos/modelo/table`) |
| 87 | Forms + Validación | Sí | |
| 88 | Fetch / APIs | Sí | Vía `SSocket.sendPromise` |
| 89 | Loading / Error / Success states | Sí | `SLoad`, `SNotification`, `try/catch` |
| 90 | Custom Hooks para API | **No** | Usan métodos de clase de `MDL` + promesas, no hooks propios de fetching |
| 91 | Estado global | Sí | Redux + `MDL` |
| 92 | Context + Reducer | Parcial | Hay Context; `useReducer` no se usa |
| 93 | Testing | **No** | 0 archivos `.test.`/`.spec.` |
| 94 | React Testing Library | **No** | No está en `package.json` |
| 95 | Vitest / Jest | **No** | No está en `package.json` |
| 96 | Performance | Parcial | Sin profiling sistemático |
| 97 | Profiling | **No evidencia** | |
| 98 | React DevTools | — | Herramienta externa, no es parte del código |


<!-- Dime qué quieres que haga tu extensión. Por ejemplo:

“Quiero una extensión que traduzca automáticamente una página.”

o

“Quiero una extensión que detecte precios y los convierta a otra moneda.” -->