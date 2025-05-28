
export type Proyecto = {
 key: string;
 key_usuario: string;
 fecha_on: string;
 estado: number;
 key_empresa: string;
 descripcion: string;
 nombre: string;
 fecha_inicio?: string;
 fecha_fin?: string;
};

export type Cliente = {
 key: string;
 key_usuario: string;
 fecha_on: string;
 estado: number;
 key_empresa: string;
 descripcion: string;
 key_servicio: string;
 nombres: string;
 apellidos: string;
 nit: string;
 razon_social: string;
 correo: string;
 telefono: string;
 lat: string;
 lng: string;
 direccion: string;
 fecha_nacimiento: Date;
 sexo: string;
};

export type EventListener = {
 type: "onChange",
}