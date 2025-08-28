import { SPage } from "servisofts-component";

import root from "./root";

import almacen from "./almacen";
import list from "./almacen/list";
// import RegistroInventario from "./almacen/RegistroInventarios";
import ReporteConteoInventario from "./almacen/ReporteConteoInventario";
import tabla from "./almacen/tabla";


export default SPage.combinePages("inventario",
    {
        "": tabla,
        "list": list,
        ...almacen,
        "reporteConteoInventario": ReporteConteoInventario,

    }
)