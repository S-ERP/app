import { SPage } from "servisofts-component";
import Model from "../../../Model/";
import root from "./root";
import almacen from "./almacen";
import punto_venta from "./punto_venta";

export default SPage.combinePages("profile", {
    "": root,
    "almacen": almacen,
    "punto_venta": punto_venta
})
