
export type types = "apple" | "facebook" | "google";

export type LoginApiTypes = {
    type: types,
    onLogin: (data: UsuarioType, type:types, NombreDato:string) => any,
    onError: (data: any) => any,
}

export type UsuarioType = {
    id: string, name: string, last_name: string, email: string
}

export type LoginType = {
    onLogin: (data: UsuarioType) => any,
}

export type LoginApiConfigType = {
    google?: {
        NombreDato:string,
        clientId: string
    },
    facebook?: {
        NombreDato:string,
        appId: string
    },
    apple?:{
        NombreDato:string,
        clientId:string,
        redirectURI:string
    }

}