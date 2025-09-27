import { SPage } from "servisofts-component";

import root from "./root";
import Model from "../../Model";
import mensajes from "./mensajes";


const model = Model.compra_venta;

export const Parent = {
    name: "social_media",
    path: `/social_media`,
    model
}
export default SPage.combinePages("social_media",
    {

        "mensajes": mensajes,
        "root": root,

    }
)