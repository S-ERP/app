import { SPage } from "servisofts-component";

import root from "./root";
import dato from "./dato";
import multa from "./multa";
import label from "./label";
export default SPage.combinePages("ajustes",
    {
        "": root,
        ...dato,
        ...multa,
        ...label,
    }
)