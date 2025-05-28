import { SPage, SPageListProps } from 'servisofts-component';

import root from './root/index';
// import addmore from './addmore';
// import modificarHorario from './modificarHorario';
// import crearhorario from './crearhorario'
// import registro from "./registro"
// import edit from './edit';
import producto from './producto';
import categoria_producto from './categoria_producto';
import sub_producto from "./sub_producto"
import reserva from './reserva';
export const Parent = {
    name: "restaurante",
    path: `/restaurante`,
}
export default SPage.combinePages(Parent.name, {
    "": root,
    // "addmore": addmore,
    // "modificarHorario": modificarHorario,
    // crearhorario,
    // "registro": registro,
    // edit,
    sub_producto,
    reserva,
    ...producto,
    ...categoria_producto,
    
});