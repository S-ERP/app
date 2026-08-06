
export type Caja = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
  fecha:string;
  key_punto_venta?: string;
  key_sucursal?: string;
  fraccionar_moneda?: boolean;
};

export type CajaDetalle = {
  key?: string,
  key_caja?: string,
  fecha?: string,
  descripcion?: string,
  monto?: number,
  tipo?: "egreso_banco" | "ingreso_banco" | "anular_venta",
  key_tipo_pago?: string,
  key_moneda?:string,
  key_cuenta_banco?: string,
}

export type datosAnulacion = {
  key_compra_venta?: string,
  fecha?: string,
  motivo_anulacion?: string,
  nombre_solicitante?: string,
  key_usuario?: string,
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
