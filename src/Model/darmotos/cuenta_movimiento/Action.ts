import { SAction } from "servisofts-model";
export default class Action extends SAction {
    getTypes() {
        return [
            { key: "", content: "--" },
            { key: "ingreso", content: "Ingreso" },
            { key: "egreso", content: "Egreso" },
        ]
    }


}