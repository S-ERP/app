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
  punto_venta?: PuntoVenta[];
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
  razon_social:string;
};

export type TurnoHorarioAtencion = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
  key_empresa: string;

  nombre: string;
  atiende_feriado: number;
  horarios: Horario[];
};

export type Horario = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;

  dia: number; // "0" a "6"
  hora_inicio: string; // formato "HH:mm"
  hora_fin: string; // formato "HH:mm"
};

export type EventListener =
  | {
      type: "onChange";
    }
  | {
      type: "onChangeEmpresaSelect";
    };
