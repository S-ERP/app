import { SPage } from "servisofts-component";

import root from "./root";
import _new from "./new"
import edit from "./edit";
import personajes from "./personajes";
import personajes2 from "./personajes2";
import preview from "./preview";

export default SPage.combinePages("mesh",
    {
        "": root,
        "new": _new,
        edit,
        preview,
        personajes,
        personajes2
    }
)