import { SPage } from "servisofts-component";

import root from "./root";
import amortizaciones from "./amortizaciones/index";

export const Parent = {
    title: "Bots",
    name: "bots"
}
export default SPage.combinePages(Parent.name,
    {
        "": root,
        amortizaciones,
    }
)