import {SPage} from "servisofts-component";
import tabla from "./tabla";
import pipeline from "./pipeline"
export default SPage.combinePages("habilidad",
    {
    "tabla": tabla,
    pipeline
        

    }
)