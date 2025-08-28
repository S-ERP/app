
export type Caja = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
  fecha:string;
};

export type CajaDetalle = {
  key?: string,
  key_caja: string,
  fecha: string,
  descripcion: string,
  monto: number,
  tipo: "egreso_banco" | "ingreso_banco",
  key_tipo_pago: string,
  key_cuenta_banco?: string,
}


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
