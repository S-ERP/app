import { SPage } from "servisofts-component";
import root from "./root";
import ready from "./status/ready";
import qr from "./status/qr";

export const StatusComponents = {
    ready,
    qr
}


export default SPage.combinePages("chats", {
    "": root,

})
