import { SStorage } from "servisofts-component";
import { SReducer } from "servisofts-model";

export default class Reducer extends SReducer {

    initialState(initState?: any) {
        if (!initState) initState = {}
        SStorage.getItem("empresa_select", (imt: any) => {
            if (!imt) return;
            initState.select = JSON.parse(imt);
        });
        return initState
    }

}