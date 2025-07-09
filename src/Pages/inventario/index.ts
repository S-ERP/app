import { SPage } from "servisofts-component";

import root from "./root";

import almacen from "./almacen";
import list from "./almacen/list";
import RegistroInventario from "./almacen/RegistroInventarios";
// import inventario from "./inventario";
export default SPage.combinePages("inventario",
    {
        "": list,
        ...almacen,
        RegistroInventario,
        // ...inventario

    }
)