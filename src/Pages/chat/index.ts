import { SPage } from 'servisofts-component';
import profile from './profile';

import root from './root';
import list from "./list"
export const Parent = {
    name: "chat",
    path: "/chat"
}
export default SPage.combinePages(Parent.name, {
    "": list,
    "chat": root,
    "profile": profile,
    list
});