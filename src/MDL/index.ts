import empresa from "./empresa";
import factura from "./factura";
import crm from "./crm";
import whatsapp from "./whatsapp";
import usuario from "./usuario"
import RolesPermisos from "./RolesPermisos";
import qr_reader from "./qr_reader";
import inventario from "./inventario";
import compra_venta from "./compra_venta";
import contabilidad from "./contabilidad"
import punto_venta from "./punto_venta";
// import punto_venta from "../Model/empresa/punto_venta";
 export default {
   empresa: new empresa(),
   factura: new factura(),
   crm: new crm(),
   whatsapp: new whatsapp(),
   usuario: new usuario(),
   rolesPermisos: new RolesPermisos(),
   qr_reader: new qr_reader(),
   inventario: new inventario(),
   compra_venta: new compra_venta(),
   contabilidad: new contabilidad(),
   punto_venta: new punto_venta(),
 };
