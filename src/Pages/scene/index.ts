import { SPage, SPageListProps } from 'servisofts-component';
import root from './root';
import _new from "./new";
import list from "./list";
import editar from "./editar"
export const Parent = {
    name: "scene",
    path: `/scene`,
}
export default SPage.combinePages(Parent.name, {
    "": root,
    "new": _new,
    list,
    editar
});