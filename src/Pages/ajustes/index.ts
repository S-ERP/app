import { SPage } from "servisofts-component";

import root from "./root";
import dato from "./dato";
import multa from "./multa";
export default SPage.combinePages("ajustes",
    {
        "": root,
        ...dato,
        ...multa

    }
)