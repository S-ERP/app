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
import pizarra from "./pizarra";
import RegistroInventarios from "../inventario/almacen/RegistroInventarios";
import tipo_costo from "./tipo_costo";
import tabla from "./tipo_costo/tabla";



export default SPage.combinePages("productos",
    {
        "": root,
        catalogo,
        "carrito":carrito,
        "tipo_costo":tabla,
        pizarra,
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