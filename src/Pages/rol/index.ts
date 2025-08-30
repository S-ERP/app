import { SPage } from "servisofts-component";
import Model from "../../Model";
import list from "./list";
import table from "./table";
import _new from "./new";
import profile from "./profile/index";
import edit from "./edit";
import _delete from "./delete";
import permiso from "./permiso";

const model = Model.rol;

// model.Columns['index'] = {
//     type: "integer",
//     editable: true
// }

model.Columns['tipo'] = {
    type: "text",
    editable: true
}

model.Columns['observacion'] = {
    type: "text",
    editable: true
}
model.Columns['color'] = {
    type: "text",
    editable: true
}

export const Parent = {
    name: "rol",
    path: `/rol`,
    model
}
export default SPage.combinePages(Parent.name, {
    "": table,
    "list": list,
    "table": table,
    "new": _new,
    ...profile,
    "edit": edit,
    permiso,
    "delete": _delete
})
