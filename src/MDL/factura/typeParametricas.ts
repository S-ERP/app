type UnidadMedida = {
  descripcion: string;
  codigoClasificador: number;
};

type LeyendaFactura = {
  codigoActividad: number;
  descripcionLeyenda: string;
};

type TipoDocSector = {
  descripcion: string;
  codigoClasificador: number;
};

type ActividadEconomica = {
  descripcion: string;
  codigoCaeb: number;
  tipoActividad: string;
};

type TipoMoneda = {
  descripcion: string;
  codigoClasificador: number;
};

type TipoDocumentoIdentidad = {
  descripcion: string;
  codigoClasificador: number;
};

type ProductoServicio = {
  codigoActividad: number;
  descripcionProducto: string;
  codigoProducto: number;
  nandina?: string[];
};

type ActividadEconomicaDocumentoSector = {
  tipoDocumentoSector: string;
  codigoActividad: number;
  codigoDocumentoSector: number;
};

type MotivoAnulacion = {
  descripcion: string;
  codigoClasificador: number;
};

type TipoFactura = {
  descripcion: string;
  codigoClasificador: number;
};

type EventoSignificativo = {
  descripcion: string;
  codigoClasificador: number;
};

type TipoHabitacion = {
  descripcion: string;
  codigoClasificador: number;
};

type TipoPuntoVenta = {
  descripcion: string;
  codigoClasificador: number;
};

type PaisOrigen = {
  descripcion: string;
  codigoClasificador: number;
};

export type Parametricas = {
  unidadMedida?: UnidadMedida[];
  leyendasFactura?: LeyendaFactura[];
  tiposDocSector?: TipoDocSector[];
  actividadEconomica?: ActividadEconomica[];
  tipoMoneda?: TipoMoneda[];
  tipoDocumentoIdentidad?: TipoDocumentoIdentidad[];
  productosServicios?: ProductoServicio[];
  actividadesEconomicas?: ActividadEconomicaDocumentoSector[];
  motivoAnulacion?: MotivoAnulacion[];
  tipoFactura?: TipoFactura[];
  eventoSignificativo?: EventoSignificativo[];
  tiposHabitacion?: TipoHabitacion[];
  tiposPuntoVenta?: TipoPuntoVenta[];
  paisOrigen?: PaisOrigen[];
};

