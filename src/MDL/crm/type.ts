
export type Proyecto = {
    key: string;
    key_usuario: string;
    fecha_on: string;
    estado: number;
    key_empresa: string;
    descripcion: string;
    nombre: string;
    fecha_inicio?: string;
    fecha_fin?: string;
};
export type Campana = {
    key: string;
    key_usuario: string;
    fecha_on: string;
    estado: number;
    key_proyecto: string;
    descripcion: string;
    nombre: string;
};
export type ProyectoProducto = {
    key: string;
    key_usuario: string;
    fecha_on: string;
    estado: number;
    key_proyecto: string;
    key_producto: string;
    // nombre: string;
};

export type Cliente = {
    key: string;
    key_usuario: string;
    fecha_on: string;
    estado: number;
    key_empresa: string;
    descripcion: string;
    key_servicio: string;
    nombres: string;
    apellidos: string;
    nit: string;
    razon_social: string;
    correo: string;
    telefono: string;
    lat: string;
    lng: string;
    direccion: string;
    fecha_nacimiento: Date;
    sexo: string;
};

export type TipoMovimientoLead = {
    key: string;
    key_usuario: string;
    fecha_on: string;
    estado: number;

    key_empresa: string;
    titulo: string;
    tipo: string;
    descripcion: string;
};

export type StatesClienteProyecto = "nuevo"
    | "en_proceso"
    | "rellamada"
    | "llamada_fallida"
    | "en_espera"
    | "confirmado"
    | "cancelado"
    | "enviado"
    | "en_espera_pago"
    | "en_espera_pago_sin_respuesta"
    | "en_espera_pago_rellamada"
    | "rechazo"
    | "pagado"
    | "devuelto"
    | "spam"
    | "double"

export type EventListener = {
    type: "onChange",
}