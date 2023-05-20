import { SReducer } from "servisofts-model";

export default class Reducer extends SReducer {

    comprasSinRecepcionar(state: any, action: any): void {
        if (action.estado == "exito") {
            state.data_compras_sr = action.data;
        }
    }
    ventasSinEntregar(state: any, action: any): void {
        if (action.estado == "exito") {
            state.ventar_sin_entregar = action.data;
        }
    }
    editar_cantidad_compras_sr(state: any, action: any): void {
        if (action.estado == "exito") {
            if (state.data_compras_sr) {
                var cvd = state.data_compras_sr[action.data.key_compra_venta_detalle]
                if (cvd) {
                    cvd.cantidad -= 1;

                }
            }
        }
    }

}