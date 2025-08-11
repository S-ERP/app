import { SPage } from "servisofts-component";

import root from "./root";

import almacen from "./almacen";
import list from "./almacen/list";
// import RegistroInventario from "./almacen/RegistroInventarios";
import ReporteConteoInventario from "./almacen/ReporteConteoInventario";


export default SPage.combinePages("inventario",
    {
        "": list,
        ...almacen,
       "reporteConteoInventario": ReporteConteoInventario,

    }
)