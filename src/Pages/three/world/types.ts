export type TypeLayout = {
    x: number,
    y: number,
    width: number,
    height: number
}

export type TypeMeshDB = {
    descripcion: string,
    observacion?: string,
    url: string,
    key: string,
    data?: {
        transform?: {
            position?: { x?: number, y?: number, z?: number },
            scale?: { x?: number, y?: number, z?: number },
            rotation?: { x?: number, y?: number, z?: number },
        }
    },
}