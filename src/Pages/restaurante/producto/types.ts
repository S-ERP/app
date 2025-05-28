export interface SubProductoDetalleType {
    descripcion: string | null;
    estado: number;
    key_sub_producto: string;
    precio: number | null;
    key_usuario: string;
    fecha_on: string;
    index: number;
    nombre: string;
    habilitado?: boolean,
    key: string;
    estado_old?: number;
}

export interface SubProductoType {
    descripcion: string | null;
    estado: number;
    key_producto: string;
    key_usuario: string;
    sub_producto_detalles: SubProductoDetalleType[];
    fecha_on: string;
    cantidad_seleccion_minima: number;
    index: number;
    nombre: string;
    key: string;
    cantidad_seleccion: number;
    estado_old?: number;
}

export interface ProductoType {
    descripcion: string;
    label_oferta: string;
    estado: number;
    key_usuario: string;
    fecha_on: string;
    descuento_monto: number | null;
    index: number;
    nombre: string;
    key_categoria_producto: string;
    ley_seca: boolean;
    precio: number;
    descuento_porcentaje: number | null;
    key_restaurante: string;
    limite_compra: number;
    habilitado: boolean;
    fecha_habilitacion_automatica: string | null;
    sku: string | null;
    sub_productos: SubProductoType[];
    key: string;
    mayor_edad: boolean;
}
