
export type Caja = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
};


export type CajaTypeAbstract = {
  key: string,
  label: string,
}

export type EventListener = {
  type: "onChangeActiva"
} |
{
  type: "onDetalleChange"
}
