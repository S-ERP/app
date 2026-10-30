import { SPage } from "servisofts-component";
import list from "./list";
import ver from "./ver";
import editar from "./editar";
import mios from "./mios";

export default SPage.combinePages("manual", {
    "": list,
    "ver": ver,
    "editar": editar,
    "mios": mios,
})
