import { SPage } from "servisofts-component";
import lista from "./lista";
import pantalla from "./pantalla";

export default SPage.combinePages("molinete", {
    "": lista,
    "pantalla": pantalla,
});
