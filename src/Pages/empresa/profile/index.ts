import { SPage } from "servisofts-component";
import Model from "../../../Model";
import sucursales from "./sucursales";
import monedas from "./monedas";
import root from "./root";
import usuarios from "./usuarios"

export default SPage.combinePages("profile", {
    "": root,
    "sucursales": sucursales,
    "monedas": monedas,
    usuarios
})
