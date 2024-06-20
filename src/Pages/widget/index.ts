import { SPage } from "servisofts-component";

import root from "./root";
import widget from "./widget";
import pages from "./pages";
import custom from "./custom";

export default SPage.combinePages("widget",
    {
        "": root,
        "root": root,
        widget,
        pages,
        custom
     
    }
)