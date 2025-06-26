
export type Usuario = {
    key: string;
    Nombres: string;
    Apellidos: string;
    Correo: string;
    Telefono: string;
    CI?: string;
    enable?: string;
    estado: number;
    fecha_nacimiento?: string;
    genero?: string;
    fecha_on: string;
    apple_key?: string;
    google_key?: string;
    Password?: string;
    CI_EXPE?: string;
    CI_COMP?: string;
}



export type EventListener = {
    type: "changeSessionStatus",
    session: Usuario | undefined,
} 
