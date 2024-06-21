import { SPage, SPageListProps } from 'servisofts-component';

import Root from './root';
import start from './start';
import login from './login/index';
import registro from './registro';
import profile from './profile';
import usuario from './usuario';
import empresa from './empresa';
import rol from './rol';
import contabilidad from './contabilidad';
import cliente from './cliente';
import sucursal from './sucursal';
import inventario from './inventario';
import ajustes from './ajustes';
import banco from './banco';
import productos from './productos';
import test from './test';
import wiki from './wiki';
import compra from './compra';
import venta from './venta';
import caja from './caja';
import cobranza from './cobranza';
import notification from './notification';
import reporte from './reporte';
import bots from './bots';
import t2 from './t2';
import temp from './temp';
import tarea from './tarea';
import menu from './menu';
import home from './home';
import home2 from './home2';
import home3 from './home3';
import facturacion from './facturacion';
import loby from './loby';
import lobyRoot from './loby/root';
import nota from './nota';
import chat from './chat';
import { Example } from 'servisofts-charts'
import publicacion from './publicacion'
import invitation from "./invitation";
import invitacion from './invitacion'
import terminos from './terminos'
import anim1 from "./anim1"
import widget from './widget';
import cafe from './cafe';
import upload from "./upload"
import solicitud_qr from './solicitud_qr';
import charts from './charts';
import mapa from './mapa';
export default SPage.combinePages("/", {
    // "":Example,
    "": test,
    // "": lobyRoot,
    "root": Root,
    anim1,
    home,
    home2,
    home3,
    // "": menu,
    menu,
    // "login": login,
    ...login,
    ...loby,
    ...registro,
    ...nota,
    "test": test,
    "start": start,
    "wiki": wiki,
    upload,
    t2,
    ...profile,
    ...usuario,
    ...empresa,
    ...rol,
    ...chat,
    ...sucursal,
    ...contabilidad,
    ...inventario,
    ...ajustes,
    ...banco,
    ...cliente,
    ...productos,
    ...compra,
    ...venta,
    ...caja,
    ...cobranza,
    ...notification,
    ...reporte,
    ...bots,
    ...temp,
    ...tarea,
    ...facturacion,
    ...widget,
    ...cafe,
    ...publicacion,
    ...solicitud_qr,
    invitation,
    "invitacion": invitacion,
    terminos,
    ...charts,
    ...mapa
})
