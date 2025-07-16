
export type Inventario = {
    estado: "exito" | "error",
}



export type EventListener = {
    type: "handleChange"
} | {
    type: "chavalEventos"
}
