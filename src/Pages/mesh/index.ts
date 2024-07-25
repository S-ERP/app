import { SPage } from "servisofts-component";

import root from "./root";
import _new from "./new"
import edit from "./edit";

export default SPage.combinePages("mesh",
    {
        "": root,
        "new": _new,
        edit
    }
)