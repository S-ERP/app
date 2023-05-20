import { SPage } from "servisofts-component";

import root from "./root";

import almacen from "./almacen";
import list from "./almacen/list";
// import inventario from "./inventario";
export default SPage.combinePages("inventario",
    {
        "": list,
        ...almacen,
        // ...inventario

    }
)