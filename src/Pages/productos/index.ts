import { SPage } from "servisofts-component";

import root from "./root";
import producto from "./producto";
import marca from "./marca";
import modelo from "./modelo";
import inventario_dato from "./inventario_dato";
import tipo_producto from "./tipo_producto";
import inventario from "./inventario";

export default SPage.combinePages("productos",
    {
        "": root,
        ...producto,
        ...marca,
        ...modelo,
        ...inventario_dato,
        ...inventario,
        ...tipo_producto


    }
)