import { SPage } from "servisofts-component";

import root from "./root";
import detail from "./detail";
import Cuotas from "./Cuotas";
import Tabla from "./Tabla";
import TodaslasCajas from "./TodaslasCajas";
 
export default SPage.combinePages("caja",
    {
        "": root,
        detail,
        "cuotas": Cuotas,
        "tabla": TodaslasCajas,
        "tabla2": Tabla,
    }
)