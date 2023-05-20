import { SPage, SPageListProps } from 'servisofts-component';

import Root from './root';
import login from './login';
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
export default SPage.combinePages("/", {
    "": Root,
    "login": login,
    "test": test,
    "wiki": wiki,
    t2,
    ...profile,
    ...usuario,
    ...empresa,
    ...rol,
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
    ...bots

});