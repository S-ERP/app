# ¿Qué son los Hooks?

Los **Hooks** son funciones especiales de React (`useState`, `useEffect`, `useMemo`, etc.) que le permiten a un **componente de función** tener cosas que antes solo tenían los componentes de **clase**: estado propio, ciclo de vida, referencias, cálculos memoizados, etc.

Se introdujeron en React 16.8 (2019) para no tener que escribir una clase solo para poder usar `this.state`. El nombre viene de que la función "engancha" (*hooks into*) funcionalidad interna de React.

## Cómo funcionan por dentro

React mantiene, por cada instancia de componente, una **lista interna ordenada de "celdas"** (una por cada hook usado). En cada render, React recorre esa lista en el mismo orden y le entrega a cada llamada `useX(...)` su celda correspondiente — los hooks se identifican por **posición de llamada**, no por nombre de variable.

De ahí sale la regla de oro:

> **Nunca llamar un hook dentro de un `if`, un `return` condicional o un loop.**

Si el orden de llamadas cambia entre renders, React entrega la celda equivocada a cada hook. Es exactamente el bug que tuvimos: *"Rendered more hooks than during the previous render"*, causado por tener `useMemo`/`useState` después de un `return` condicional.

## Tabla: Hooks vs. equivalente en componentes de clase

| Hook | Para qué sirve | Equivalente en clase |
|---|---|---|
| `useState` | Estado local del componente | `this.state` + `this.setState()` |
| `useEffect` | Efectos secundarios (fetch, subscripciones, timers) | `componentDidMount` + `componentDidUpdate` + `componentWillUnmount` combinados |
| `useMemo` | Memoiza (cachea) un **valor** calculado, para no recalcularlo si sus dependencias no cambiaron | Calcularlo a mano en `render()`, o guardarlo en una propiedad de instancia si hace falta cachear |
| `useCallback` | Memoiza una **función**, para no recrearla en cada render | Método de clase ligado con `.bind(this)` o arrow function como propiedad de instancia |
| `useRef` | Guarda un valor mutable que persiste entre renders sin causar re-render al cambiar | Propiedad de instancia normal, ej. `this.algo = x` |

## Terminología técnica

| Término coloquial | Nombre técnico en ciencias de la computación |
|---|---|
| `useState` | State management / estado encapsulado con **clausura (closure)** |
| `useMemo` | **Memoización** (memoization) — mismo concepto que en programación dinámica: cachear un resultado costoso y reusarlo mientras las dependencias no cambien |
| Hooks en general | Implementación de **programación reactiva declarativa**: describís el estado, el framework reconcilia la UI |

---

# `render()` y `componentDidMount()`

Estos son dos de los **métodos del ciclo de vida** de un componente de clase (`extends React.Component`). Cada uno tiene un momento y un propósito muy distinto.

## `render()`

Es el **único método obligatorio** de una clase React. Su trabajo es devolver el JSX que describe cómo se ve el componente **en este instante**, según los valores actuales de `this.props` y `this.state`.

- Se ejecuta automáticamente cada vez que cambia `this.state` (por `this.setState()`) o `this.props` (porque el padre le pasó datos nuevos).
- Tiene que ser **puro**: a partir de los mismos `props`/`state` siempre debe devolver el mismo JSX. No debe hacer llamadas a APIs, no debe mutar `this.state` directamente, no debe tener `setTimeout`, etc. — eso son "efectos secundarios" y van en otro lado (`componentDidMount`/`componentDidUpdate`).
- Es el equivalente exacto de **lo que devuelve un componente de función** cada vez que se re-renderiza (no hay hook para esto, es simplemente "la función entera").

```tsx
render() {
    const { isOpen, ingredientes } = this.state; // lee el estado actual
    const grupos = this.agrupar(ingredientes ?? []); // calcula lo que necesita mostrar
    if (!grupos.length) return null; // puede devolver null: no renderiza nada
    return ( /* JSX */ );
}
```

## `componentDidMount()`

Se ejecuta **una sola vez**, justo después de que el componente se insertó por primera vez en el DOM (después del primer `render()`). Es el lugar correcto para todo lo que sea un **efecto secundario de arranque**:

- Pedir datos a una API.
- Suscribirse a eventos.
- Medir el tamaño de un elemento del DOM, iniciar un timer, etc.

```tsx
componentDidMount() {
    fetch("/api/datos").then((resp) => {
        this.setState({ datos: resp }); // dispara un nuevo render() con los datos ya cargados
    });
}
```

Es exactamente el reemplazo de `React.useEffect(() => { ... }, [])` (con array de dependencias vacío, "solo al montar") en un componente de función.

## Orden real de ejecución (ciclo de vida completo)

| Fase | Orden de métodos | Cuándo pasa |
|---|---|---|
| **Montaje** (mounting) | `constructor()` → `render()` → `componentDidMount()` | Cuando el componente aparece por primera vez en pantalla |
| **Actualización** (updating) | `render()` → `componentDidUpdate()` | Cada vez que cambian `props` o `state` (ej. `this.setState({ isOpen: !isOpen })`) |
| **Desmontaje** (unmounting) | `componentWillUnmount()` | Cuando el componente se saca de pantalla (ej. se cierra el popup) |

## Por qué importa el orden

`render()` **no puede** disparar side effects como pedir datos, porque se ejecuta muchísimas veces (cada cambio de estado) y de forma síncrona durante el renderizado — si ahí mismo hicieras un `fetch`, dispararías una petición nueva en cada re-render, un bucle infinito potencial. Por eso `componentDidMount` existe separado: garantiza que el efecto corra **una sola vez**, después de que ya hay algo pintado en pantalla.

Secuencia típica de un componente que carga datos:

1. `render()` se ejecuta primero con el estado inicial (ej. `datos: null`) → muestra un loader o nada.
2. `componentDidMount()` corre después, pide los datos.
3. Cuando la respuesta llega, `this.setState({ datos: ... })` dispara un **nuevo** `render()`, esta vez con los datos ya disponibles.
