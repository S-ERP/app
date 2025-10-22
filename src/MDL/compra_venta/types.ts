
export type compra_venta = {
  estado: "exito" | "error";
};


export type Sucursal = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
  descripcion: string;
  observacion?: string;
  codigo_facturacion?: string;
  telefono?: string;
  direccion?: string;
  municipio?: string;
  correo?: string;
  lat?: number;
  lng?: number;
  //   punto_venta?: PuntoVenta[];
};

export type Descuento = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
  key_empresa: string;
  descripcion: string;
  monto: string;
  porcentaje: string;
};

export type EventListener = {
  type: "handleChange"
} | {
  type: "venta_realizada"
} | {
  type: "conStock"
} | {
  type: "carrito_globo"
}

