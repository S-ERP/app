
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

export type EventListener = {
  type: "onChange",
} 