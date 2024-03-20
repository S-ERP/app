import { SPage, SPageListProps } from 'servisofts-component';

import Root from './root';
import historial from "./historial"
export default SPage.combinePages("nota", {
    "": Root,
    historial
});