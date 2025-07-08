import empresa from "./empresa";
import factura from "./factura";
import crm from "./crm";
import whatsapp from "./whatsapp";
import usuario from "./usuario"
import RolesPermisos from "./RolesPermisos";
import qr_reader from "./qr_reader";
import inventario from "./inventario";
export default {
  empresa: new empresa(),
  factura: new factura(),
  crm: new crm(),
  whatsapp: new whatsapp(),
  usuario: new usuario(),
  rolesPermisos: new RolesPermisos(),
  qr_reader: new qr_reader(),
  inventario: new inventario(),
};
