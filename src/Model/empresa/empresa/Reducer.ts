// @ts-nocheck
import { SStorage, STheme, SThread } from "servisofts-component";
import { SReducer } from "servisofts-model";

export default class Reducer extends SReducer {

    initialState(initState?: any) {
        if (!initState) initState = {}
        SStorage.getItem("empresa_select", (imt: any) => {
            if (!imt) return;
            initState.select = JSON.parse(imt);
            if (initState.select.theme) {
                new SThread(100, "asdasd", true).start(a => {
                    STheme.color = {
                        ...STheme.color,
                        ...initState.select.theme
                    }
                    STheme.repaint();
                })

            }
        });
        return initState
    }

}