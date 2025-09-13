import { SPage } from "servisofts-component";

import root from "./root";
import Cuotas from "./Cuotas";
 
export default SPage.combinePages("caja",
    {
        "": root,
        "cuotas": Cuotas,
    }
)