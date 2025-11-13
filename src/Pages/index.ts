import { SPage, SPageListProps } from "servisofts-component";

import Root from "./root";
import start from "./start";
import login from "./login/index";
import registro from "./registro";
import profile from "./profile";
import usuario from "./usuario";
import empresa from "./empresa";
import rol from "./rol";
import contabilidad from "./contabilidad";
import conta from "./conta";
import cliente from "./cliente";
import sucursal from "./sucursal";
import inventario from "./inventario";
import ajustes from "./ajustes";
import banco from "./banco";
import productos from "./productos";
import test from "./test";
import test2 from "./test2";
import wiki from "./wiki";
import compra from "./compra";
import compra2 from "./compra2";
import compra3 from "./compra3";
import venta from "./venta";
import caja from "./caja";
import caja2 from "./caja2";
import cobranza from "./cobranza";
import notification from "./notification";
import reporte from "./reporte";
import bots from "./bots";
import t2 from "./t2";
import temp from "./temp";
import tarea from "./tarea";
import menu from "./menu";
import home from "./home";
import home2 from "./home2";
import home3 from "./home3";
import facturacion from "./facturacion";
import loby from "./loby";
import lobyRoot from "./loby/root";
import nota from "./nota";
import chat from "./chat";
import { Example } from "servisofts-charts";
import publicacion from "./publicacion";

import invitation from "./invitation";
import invitacion from "./invitacion";
import terminos from "./terminos";
import anim1 from "./anim1";
import widget from "./widget";
import cafe from "./cafe";
// import upload from "./upload"
import solicitud_qr from "./solicitud_qr";
import charts from "./charts";
import mapa from "./mapa";
import uploadv2 from "./uploadv2";
import drive from "./drive";
import drive2 from "./drive2";
import qr_reader from "./qr_reader";
import pasarela from "./pasarela";
// Three js
// import three from './three';
// import mesh from './mesh';
// import scene from './scene';

import lote from "./lote";

import restaurante from "./restaurante";
import whatsapp from "./whatsapp";

import testTable from "./testTable";
import icons from "./icons";

import factura from "../Components/PDF/factura";

import ricky from "./ricky";
import crm from "./crm";
import plantilla from "./crm/plantilla";
import server from "./server"
// import turno from "./Turnos";
// import Proveedor from "../Components/compra_venta/Proveedor";
// import RegistroInventario from "./inventario/almacen/RegistroInventarios";
// import ReporteConteoInventario from "./inventario/almacen/ReporteConteoInventario";
import testpuntoventa from "./testpuntoventa";
import Main from "./puntoventa/Main";
import alvaro from "./alvaro";
import proveedor from "./proveedor";
import puntoventa from "./puntoventa";
import Turnos from "./Turnos";
import widgets from "./widgets";
import IconosAlvaro from "./IconosAlvaro";
import social_media from "./social_media";
import pizarra2 from "../Components/Pizarra2/testPage"
import contactos from "./contactos";
import descuento from "./descuento";
import excel from "./excel";
import tag from "./tag";
import test3 from "./test3";

export default SPage.combinePages("/", {
  // "":Example,
  // "":three,
  // "": test,
  // "": test,
  "": lobyRoot,
  ...restaurante,
  pizarra2,
  // "": lobyRoot,
  root: Root,
  ricky,
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
  widgets,
  test: test,
  test2: test2,
  test3: test3,
  start: start,
  wiki: wiki,

  // upload,
  uploadv2,
  t2,
  ...profile,
  ...usuario,
  ...empresa,
  ...rol,
  ...chat,
  ...sucursal,
  ...contabilidad,
  ...conta,
  ...inventario,
  ...ajustes,
  ...banco,
  ...cliente,
  ...descuento,
  ...productos,
  ...compra,
  ...compra2,
  ...compra3,
  ...venta,
  ...caja,
  ...caja2,
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
  ...excel,
  invitation,
  invitacion: invitacion,
  terminos,
  ...charts,
  ...mapa,
  ...drive,
  drive2,
  // ...scene,
  // ...mesh,
  // ...three,
  ...lote,
  ...whatsapp,
  testTable,
  icons,
  ...crm,
  "pdf/factura": factura,
  plantilla,
  Turnos,
  ...server,
  ...proveedor,
  ...tag,
  ...qr_reader,
  ...puntoventa,
  "iconosss":IconosAlvaro,
  alvaro,
  ...social_media,
  ...pasarela,
  ...contactos
});
