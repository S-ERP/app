


export type FacturaDetalle = {
  actividadEconomica: string;
  codigoProductoSin: string;
  codigoProducto: string;
  descripcion: string;
  cantidad: string;
  unidadMedida: string;
  precioUnitario: string;
  montoDescuento?: string | null; // xsi:nil="true"
  subTotal: string;
  numeroSerie?: string | null; // xsi:nil="true"
  numeroImei?: string | null; // xsi:nil="true"
};


type FacturaElectronicaCompraVenta = {
  nitEmisor: string; //
  razonSocialEmisor: string;//
  municipio: string; //
  telefono: string; //
  numeroFactura: string; //
  cuf: string; //
  cufd: string; // 
  codigoSucursal: string; //
  direccion: string; // 
  codigoPuntoVenta?: string | null; //
  fechaEmision: string; // 
  nombreRazonSocial: string; //
  codigoTipoDocumentoIdentidad: string; // *****
  numeroDocumento: string; //
  complemento?: string | null; // *****
  codigoCliente: string; //
  codigoMetodoPago: string; // *****
  numeroTarjeta?: string | null; // *****
  montoTotal: string; // *****
  montoTotalSujetoIva: string;// ***** 
  codigoMoneda: string;// *****
  tipoCambio: string;// *****
  montoTotalMoneda: string;// *****
  montoGiftCard?: string | null; // *****
  descuentoAdicional: string;// *****
  codigoExcepcion: string;// *****
  cafc?: string | null;// *****
  leyenda: string;// *****
  usuario: string;// *****
  codigoDocumentoSector: string;// *****
  detalle: FacturaDetalle[];// *****
};

export type Factura = {
  key: string;
  key_usuario: string;
  fecha_on: string;
  estado: number;
  key_empresa: string;
  data: FacturaElectronicaCompraVenta;
};
export type EventListener = {
  type: "onChange",
} 