

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
}