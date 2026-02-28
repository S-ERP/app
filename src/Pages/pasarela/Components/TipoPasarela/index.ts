import banco_continental from "./banco_continental";
import banco_ganadero_qr from "./banco_ganadero_qr";

export type TipoPasarelaProps = {
    key_pasarela_empresa: string,
    descripcion?: string,
    monto: number,
    pasarela_empresa?: any,
}

export default {
    banco_ganadero_qr,
    banco_continental,
}