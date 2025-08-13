import { SPage } from "servisofts-component";

import root from "./root";
import producto from "./producto";
import marca from "./marca";
import modelo from "./modelo";
import inventario_dato from "./inventario_dato";
import tipo_producto from "./tipo_producto";
import catalogo from "./catalogo";
import inventario from "./inventario";
import carrito from "./carrito";
import ReporteConteoInventario from "../inventario/almacen/ReporteConteoInventario";
import RegistroInventarios from "../inventario/almacen/RegistroInventarios";



export default SPage.combinePages("productos",
    {
        "": root,
        catalogo,
        "carrito":carrito,
        // "reporte_conteo_inventario":RegistroInventarios,
        "reporte_conteo_inventario":ReporteConteoInventario,
        ...producto,
        ...marca,
        ...modelo,
        ...inventario_dato,
        ...inventario,
        ...tipo_producto


    }
)