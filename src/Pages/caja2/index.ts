import { SPage } from "servisofts-component";

import root from "./root";
import Cuotas from "./Cuotas";
import Tabla from "./Tabla";
 
export default SPage.combinePages("caja",
    {
        "": root,
        "cuotas": Cuotas,
        "tabla": Tabla,
    }
)