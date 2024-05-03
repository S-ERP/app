import { SPage } from "servisofts-component";

import root from "./root";
import widget from "./widget";
import pages from "./pages";

export default SPage.combinePages("widget",
    {
        "": root,
        "root": root,
        widget,
        pages
     
    }
)