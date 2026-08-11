# React — lista completa, ¿qué se usa en este proyecto?

Auditoría real hecha con `grep` sobre `src/` del proyecto (no es teoría, es lo que hay hoy en el código).

| # | Concepto | Grupo | Activo | ¿Se usa acá? | Nota |
|---|---|---|:---:|---|---|
| 1 | CSR (Client-Side Rendering) | Arquitectura de la app | ✅ | Sí | |
| 2 | Server Components | Arquitectura de la app | ❌ | No | No es Next.js, es SPA con webpack |
| 3 | SSR (Server-Side Rendering) | Arquitectura de la app | ❌ | No | |
| 4 | Hydration | Arquitectura de la app | ❌ | No | No aplica sin SSR |
| 5 | Inmutabilidad | Buenas prácticas | ⚠️ | Parcial / No | El proyecto **muta** `this.state` directo en muchos lugares (ej. `this.state.key_marca = x`) en vez de copiar |
| 6 | Lazy Loading | Carga diferida | ❌ | No | Sin `React.lazy` |
| 7 | `React.lazy` | Carga diferida | ❌ | No | 0 archivos |
| 8 | Suspense | Carga diferida | ❌ | No | 0 archivos |
| 9 | Code Splitting | Carga diferida | ❌ | No (vía React) | No hay `lazy`/`Suspense`; posible que webpack lo haga a otro nivel, pero no manejado desde React |
| 10 | Cleanup | Ciclo de vida | ✅ | Sí | `return () => {...}` dentro de `useEffect` |
| 11 | `constructor()` | Ciclo de vida | ✅ | Sí | |
| 12 | `render()` | Ciclo de vida | ✅ | Sí | |
| 13 | `componentDidMount()` | Ciclo de vida | ✅ | Sí | |
| 14 | `componentDidUpdate()` | Ciclo de vida | ✅ | Sí | 13 archivos |
| 15 | `componentWillUnmount()` | Ciclo de vida | ✅ | Sí | |
| 16 | `shouldComponentUpdate()` | Ciclo de vida | ✅ | Sí | 6 archivos |
| 17 | `getDerivedStateFromProps()` | Ciclo de vida | ❌ | No | 0 archivos |
| 18 | `children` | Composición | ✅ | Sí | 71 archivos |
| 19 | Composition | Composición | ✅ | Sí | |
| 20 | Comunicación Padre → Hijo | Comunicación | ✅ | Sí | Vía props |
| 21 | Comunicación Hijo → Padre | Comunicación | ✅ | Sí | Callbacks tipo `onSuccess`, `onSelect`, `onChangeText` |
| 22 | Lifting State Up | Comunicación | ✅ | Sí | Patrón usado (ej. `PopupCarrito` pasa `item`/`moneda` hacia abajo) |
| 23 | Prop Drilling | Comunicación | ✅ | Sí | Frecuente, dado el poco uso de Context |
| 24 | Refs vs State | Conceptos comparativos | ➖ | — | Conceptual |
| 25 | Props vs State | Conceptos comparativos | ➖ | — | Conceptual |
| 26 | Fetch / APIs | Datos / APIs | ✅ | Sí | Vía `SSocket.sendPromise` |
| 27 | Loading / Error / Success states | Datos / APIs | ✅ | Sí | `SLoad`, `SNotification`, `try/catch` |
| 28 | Custom Hooks para API | Datos / APIs | ❌ | No | Usan métodos de clase de `MDL` + promesas, no hooks propios de fetching |
| 29 | Context API | Estado global | ✅ | Sí | 7 archivos usan `createContext` |
| 30 | Estado global | Estado global | ✅ | Sí | Redux + `MDL` |
| 31 | Context + Reducer | Estado global | ⚠️ | Parcial | Hay Context; `useReducer` no se usa |
| 32 | `onClick` | Eventos | ✅ | Sí | 12 archivos (poco, el proyecto usa mayormente `onPress` de React Native) |
| 33 | `onChange` | Eventos | ✅ | Sí | 117 archivos |
| 34 | `onSubmit` | Eventos | ✅ | Sí | 90 archivos — casi siempre como prop custom de `SForm2`, no `<form onSubmit>` nativo |
| 35 | `onMouseEnter` | Eventos | ✅ | Sí | 2 archivos |
| 36 | `onMouseLeave` | Eventos | ✅ | Sí | 2 archivos |
| 37 | `onKeyDown` | Eventos | ✅ | Sí | 3 archivos (ej. `PopupCarrito.tsx`, cerrar popup con Escape) |
| 38 | `onFocus` | Eventos | ✅ | Sí | 7 archivos |
| 39 | `onBlur` | Eventos | ✅ | Sí | 10 archivos |
| 40 | Controlled Components | Formularios | ✅ | Sí | `value={...}`, 99 archivos |
| 41 | Uncontrolled Components | Formularios | ✅ | Sí | `defaultValue={...}`, 127 archivos (patrón muy usado acá) |
| 42 | Formularios | Formularios | ✅ | Sí | `SForm`/`SForm2` propios |
| 43 | Forms + Validación | Formularios | ✅ | Sí | |
| 44 | Componentes | Fundamentos | ✅ | Sí | Todo el proyecto son componentes (de clase y de función) |
| 45 | JSX | Fundamentos | ✅ | Sí | En todos los `.tsx`/`.js` de `Pages`/`Components` |
| 46 | Props | Fundamentos | ✅ | Sí | |
| 47 | State | Fundamentos | ✅ | Sí | Mezcla de `this.state` (clases) y `useState` (funciones) |
| 48 | Render | Fundamentos | ✅ | Sí | |
| 49 | Re-render | Fundamentos | ✅ | Sí | Vía `setState`/hooks |
| 50 | Refs | Fundamentos | ✅ | Sí | |
| 51 | `dangerouslySetInnerHTML` | Fundamentos | ❌ | No | 0 archivos |
| 52 | React DevTools | Herramientas | ➖ | — | Herramienta externa, no es parte del código |
| 53 | Profiling | Herramientas | ❌ | No evidencia | |
| 54 | `React.StrictMode` | Herramientas | ❌ | No | 0 archivos — no está activado |
| 55 | `useState` | Hooks | ✅ | Sí | ~52 archivos |
| 56 | `useEffect` | Hooks | ✅ | Sí | 46 archivos |
| 57 | `useRef` | Hooks | ✅ | Sí | 40 archivos |
| 58 | `useContext` | Hooks | ✅ | Sí | 6 archivos |
| 59 | `useMemo` | Hooks | ✅ | Sí (poco) | Solo 3 archivos |
| 60 | `useCallback` | Hooks | ✅ | Sí | 5 archivos |
| 61 | `useImperativeHandle` | Hooks | ✅ | Sí | 13 archivos |
| 62 | Custom Hooks | Hooks | ✅ | Sí | ej. `useLimitedFPS` en `Components/SThree` |
| 63 | `useReducer` | Hooks | ❌ | No | 0 archivos |
| 64 | `useLayoutEffect` | Hooks | ❌ | No | 0 archivos |
| 65 | `useId` | Hooks | ❌ | No | 0 archivos |
| 66 | `useTransition` | Hooks | ❌ | No | 0 archivos |
| 67 | `useDeferredValue` | Hooks | ❌ | No | 0 archivos |
| 68 | `useSyncExternalStore` | Hooks | ❌ | No | 0 archivos |
| 69 | `useDebugValue` | Hooks | ❌ | No | 0 archivos |
| 70 | `componentDidCatch()` | Manejo de errores | ✅ | Sí | `src/Components/ErrorBoundary` |
| 71 | Error Boundaries | Manejo de errores | ✅ | Sí | `src/Components/ErrorBoundary`, usado en `App.js` |
| 72 | `getDerivedStateFromError()` | Manejo de errores | ❌ | No | 0 archivos |
| 73 | `React.memo` | Optimización | ✅ | Sí | 6 archivos |
| 74 | Optimización | Optimización | ⚠️ | Parcial | Poco `useMemo`/`memo`, la mayoría recalcula siempre |
| 75 | Pure Components | Optimización | ❌ | No | `React.PureComponent`: 0 archivos |
| 76 | Higher-Order Components (HOC) | Patrones avanzados | ✅ | **Sí, muchísimo** | 422 archivos usan `connect(...)` (patrón de `servisofts-page`, no Redux) — es el patrón dominante del proyecto, más que Context o Hooks |
| 77 | `React.forwardRef` | Patrones avanzados | ✅ | Sí | 17 archivos |
| 78 | `defaultProps` | Patrones avanzados | ✅ | Sí | 9 archivos |
| 79 | PropTypes | Patrones avanzados | ❌ | No | 0 archivos (usan TypeScript/Flow en su lugar, no siempre) |
| 80 | Render Props | Patrones avanzados | ❌ | No evidente | El proyecto resuelve composición con HOC (`connect`) y props normales, no con este patrón |
| 81 | React Native / React Native Web | Plataforma | ✅ | **Sí, es la base de todo** | 520 archivos importan de `react-native`. El proyecto no es "React DOM puro": corre sobre React Native Web (por eso `SView`, `onPress` en vez de `onClick`, etc.) |
| 82 | `FlatList` / listas virtualizadas | Plataforma | ✅ | Sí | 51 archivos (ej. la lista de items del carrito en `PopupCarrito.tsx`) |
| 83 | Animated API (`Animated.*`) | Plataforma | ✅ | Sí | 60 archivos |
| 84 | `TouchableOpacity` | Plataforma | ✅ | Sí | 19 archivos |
| 85 | `createRoot` (API de montaje React 18) | Plataforma | ✅ | Sí | `src/index.js` — el proyecto ya usa React 18.2.0 |
| 86 | Virtual DOM | React interno | ➖ | — | Conceptual, interno de React |
| 87 | Reconciliation | React interno | ➖ | — | Conceptual, interno de React |
| 88 | Diffing | React interno | ➖ | — | Conceptual, interno de React |
| 89 | Fiber | React interno | ➖ | — | Conceptual, interno de React |
| 90 | SyntheticEvent | React interno | ➖ | — | Conceptual, interno de React |
| 91 | Automatic Batching (React 18) | React interno | ➖ | — | Viene gratis con React 18, no es algo que se "use" explícitamente |
| 92 | `startTransition` / Concurrent Features | React interno | ❌ | No | 0 archivos, pese a estar en React 18 |
| 93 | Conditional Rendering | Renderizado | ✅ | Sí | `{cond ? <A/> : null}` en todos lados |
| 94 | Listas | Renderizado | ✅ | Sí | `.map()` en todos lados |
| 95 | `key` | Renderizado | ✅ | Sí | |
| 96 | Fragments (`<>...</>`) | Renderizado | ✅ | Sí | Muy usado |
| 97 | Portals | Renderizado | ❌ | No | `createPortal`: 0 archivos |
| 98 | Rutas | Routing | ✅ | Sí | Sistema propio (`SPage.combinePages`) |
| 99 | Parámetros de URL | Routing | ✅ | Sí | `SNavigation.getParam`, 118 archivos |
| 100 | Nested Routes | Routing | ✅ | Sí | `SPage.combinePages` anida sub-rutas (ej. `productos/modelo/table`) |
| 101 | React Router | Routing | ❌ | No | No está en `package.json`; routing propio vía `servisofts-page` / `SNavigation` |
| 102 | Testing | Testing | ❌ | No | 0 archivos `.test.`/`.spec.` |
| 103 | React Testing Library | Testing | ❌ | No | No está en `package.json` |
| 104 | Vitest / Jest | Testing | ❌ | No | No está en `package.json` |

**Conclusión corta:** lo más relevante que faltaba no eran hooks raros, sino que la lista original asumía una app 100% React DOM — y este proyecto en realidad es **React Native Web + HOCs (`connect`)** como columna vertebral, con Hooks usados de forma parcial/mezclada con clases.

<!-- Dime qué quieres que haga tu extensión. Por ejemplo:

“Quiero una extensión que traduzca automáticamente una página.”

o

“Quiero una extensión que detecte precios y los convierta a otra moneda.” -->






<!-- Etapa	Método de clase	¿Cuándo ocurre?	¿Para qué sirve?	Equivalente moderno
🟢 Mount	constructor()	Antes del primer render	Inicializar estado/preparar datos	useState() / useRef()
🟢 Mount	render()	Al montar y actualizar	Define la UI	return (...)
🟢 Mount	componentDidMount()	Después del primer render	API, eventos, timers	useEffect(..., [])
🟡 Update	shouldComponentUpdate()	Antes de actualizar	Decidir si necesita re-render	React.memo()
🟡 Update	getDerivedStateFromProps()	Antes de renderizar	Ajustar state según props	No hay equivalente directo
🟡 Update	componentDidUpdate()	Después de actualizar	Reaccionar a cambios	useEffect(..., [dato])
🔴 Unmount	componentWillUnmount()	Antes de desaparecer	Limpiar recursos	return () => {} en useEffect
⚠️ Error	getDerivedStateFromError()	Cuando un hijo tiene error	Mostrar estado de error	Error Boundary
⚠️ Error	componentDidCatch()	Después de un error	Registrar/manejar error	Error Boundary


Etapa	Método de clase	¿Cuándo ocurre?	¿Para qué sirve?	Equivalente moderno


Hook	¿Para qué sirve?	Ejemplo
useState	Guardar estado	Contador, formulario
useEffect	Ejecutar efectos secundarios	API, timers
useContext	Acceder a contexto	Usuario, tema
useRef	Guardar referencia/valor sin re-render	DOM, valores anteriores
useMemo	Memorizar un cálculo	Cálculos pesados
useCallback	Memorizar una función	Optimización
useReducer	Manejar estado complejo	Carrito, formularios
useLayoutEffect	Efecto antes de pintar la pantalla	Medir DOM
useId	Crear IDs únicos	Accesibilidad
useTransition	Marcar actualización como no urgente	Interfaces complejas
useDeferredValue	Retrasar un valor	Búsquedas/filtros
useImperativeHandle	Controlar qué expone una ref	Componentes avanzados
useSyncExternalStore	Conectar React con estados externos	Librerías de estado
useDebugValue	Mostrar información en DevTools	Custom Hooks


Concepto	Props	State
Viene de	Padre	Componente
Se modifica directamente	❌	❌
Se cambia mediante	Padre	Setter
Ejemplo	nombre="Carlos"	useState(0)
Puede provocar render	✅	✅

Concepto	Significado	Ejemplo
🟢 Mount	Aparece el componente	Abrir una página
🟡 Update	Cambia algo	Cambia state
🔴 Unmount	Desaparece	Cambiar de página

Evento	Uso
onClick	Click
onChange	Cambio en input
onSubmit	Envío de formulario
onMouseEnter	Mouse entra
onMouseLeave	Mouse sale
onKeyDown	Se presiona tecla
onFocus	Elemento recibe foco
onBlur	Elemento pierde foco

children
children representa lo que colocas dentro de un componente.

<Card>
  <h1>Hola</h1>
  <p>Contenido</p>
</Card>

El componente:

function Card({ children }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

Aquí children contiene:

<h1>Hola</h1>
<p>Contenido</p>



4. Props
Los props son datos que un componente recibe de su padre.

<Usuario nombre="Carlos" edad={25} />

El componente:

function Usuario({ nombre, edad }) {
  return (
    <div>
      {nombre} - {edad}
    </div>
  );
}


titulo
siginificado
ejmeplo padre
ejemplo lo que hacer o una diagrama de idea
mensaje de Importante -->


