import { SPage } from 'servisofts-component';

import root from './root';
import add from './add';
import edit from   './edit';
import comments from './comments';
import likes from './likes';
export const Parent = {
    name: "publicacion",
    path: "/publicacion"
}
export default SPage.combinePages(Parent.name, {
    "": root,
    add,
    edit,
    comments,
    likes
});