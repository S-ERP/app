
export type Cuenta_contable = {
    estado: "exito" | "error",
}



export type EventListener = {
    type: "handleChange"
} | {
    type: "handleDropAjuste",
    ajuste: any,
    event: any,
}
