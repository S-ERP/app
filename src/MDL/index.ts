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
import caja from "./caja";
import pizarra from "./pizarra";
import erp from "./erp";
import carrito from "./carrito"
// import punto_venta from "../Model/empresa/punto_venta";
export const MDL = {
  usuario: new usuario(),
  empresa: new empresa(),
  factura: new factura(),
  crm: new crm(),
  whatsapp: new whatsapp(),
  rolesPermisos: new RolesPermisos(),
  qr_reader: new qr_reader(),
  inventario: new inventario(),
  compra_venta: new compra_venta(),
  contabilidad: new contabilidad(),
  punto_venta: new punto_venta(),
  caja: new caja(),
  pizarra: new pizarra(),
  erp: new erp(),
  carrito: new carrito()
};

export const componentDidMount = async () => {
  // await Promise.all(MDL.map(mdl => mdl.componentDidMount()));
  // for (const key in Object.keys(MDL)) {
  //   if (MDL[key].componentDidMount) {
  //     await MDL[key].componentDidMount();
  //   }
  // }

  for (const key in MDL) {
    if ((MDL as any)[key].componentDidMount) {
      await (MDL as any)[key].componentDidMount();
    }
  }

}

export default MDL;
