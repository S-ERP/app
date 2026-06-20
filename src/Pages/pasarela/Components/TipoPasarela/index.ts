import banco_continental from "./banco_continental";
import banco_ganadero_qr from "./banco_ganadero_qr";
import banco_economico from "./banco_economico";

export type TipoPasarelaProps = {
    key_pasarela_empresa: string,
    descripcion?: string,
    monto: number,
    pasarela_empresa?: any,
    data?: any,
    tipo?: string
}

export default {
    banco_ganadero_qr,
    banco_continental,
    banco_economico
}