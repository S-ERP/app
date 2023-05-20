import { SReducer } from "servisofts-model";

export default class Reducer extends SReducer {


    change_plan_pago(state: any, action: any): void {
        if (action.data) {
            var obj = action.data;
            if (state.data) {
                if (state.data[obj.key_compra_venta]) {
                    state.data[obj.key_compra_venta] = {
                        ...state.data[obj.key_compra_venta],
                        periodicidad_medida: obj.periodicidad_medida,
                        periodicidad_valor: obj.periodicidad_valor,
                        porcentaje_interes: obj.porcentaje_interes,

                    }
                }
            }
        }
    }
}