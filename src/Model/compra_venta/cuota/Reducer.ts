import { SReducer } from "servisofts-model";

export default class Reducer extends SReducer {


    registroAll(state: any, action: any): void {
        if (action.estado == "exito") {
            if (state.key_compra_venta == action.key_compra_venta) {
                state.data = null
            }
        }
    }
}