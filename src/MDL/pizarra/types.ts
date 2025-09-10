
export type Pizarra = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
  descripcion?: string;
  key_empresa: string;
  nodes?: any[]
};



export type EventListener = {
  type: "onChange"
} 