import { SPage } from 'servisofts-component';

import Model from '../../Model';

import root from './root';
import send from "./send"
import list from './list';
import _default from './default';
const model = Model.notification;

export const Parent = {
    name: "notification",
    path: "/notification",
    model
}
export default SPage.combinePages(Parent.name, {
    // "": root,
    "": list,
    "list": list,
    send,
    ..._default

});