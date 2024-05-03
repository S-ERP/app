export type Widget = {
    key: string,
    x: number, y: number, w: number, h: number,
    index?: number,
    descripcion?: string,
    estado?: number,
    fecha_on?: string,
    key_empresa?: string,
    key_page?: string,
    key_servicio?: string,
    key_usuario?: string,
    type?: string,
    url?: string,
    data?: any,


}

export type Page = {
    cant: number, select: number,
    col: number,
    row: number,
    gridWidth: number,
    gridHeight: number
}

export type XY = {
    x: number,
    y: number
}

export type Layout = {
    width: number,
    height: number
} & XY