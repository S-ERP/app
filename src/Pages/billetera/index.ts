import { SPage, SPageListProps } from 'servisofts-component';

import Root from './root';
import cargar from './cargar';
import qr from './qr';
export default SPage.combinePages("billetera", {
    "": Root,
    "cargar": cargar,
    "qr": qr,
});