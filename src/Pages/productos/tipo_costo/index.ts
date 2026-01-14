import { SPage } from "servisofts-component";
import tabla from "./tabla";
// import table from "./table";


export const Parent = {
    name: "tipo_costo",
    path: `/productos/tipo_costo`,
}
export default SPage.combinePages(Parent.name, {
    "": tabla,
    // "table": table,
})

// http://localhost:3010/productos/tipo_costo