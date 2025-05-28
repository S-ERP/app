

export type PuntoVenta = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
  descripcion: string;
  observacion: string;
  codigo_facturacion: string;

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
  punto_venta?: PuntoVenta[]
};
export type Empresa = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
  descripcion: string;
  observacion: string;
  nit: string;
  theme?: any;
};

export type EventListener = {
  type: "onChange",
} | {
  type: "onChangeEmpresaSelect",
} 