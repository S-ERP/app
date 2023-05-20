import { SReducer } from "servisofts-model";

export default class Reducer extends SReducer {


    traspaso(state: any, action: any): void {
        if (action.estado == "exito") {
            if (state.data) {
                var antes: any = Object.values(state.data).find((o: any) => o.key_producto == action.key_producto)
                if (antes) {
                    delete state.data[antes.key];
                }
                state.data[action.data.key] = action.data;
            }
        }
    }

    getHistorico(state: any, action: any): void {
        if (action.estado == "exito") {
            state.data_history = action.data;
        }
    }
}