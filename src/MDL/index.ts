import empresa from "./empresa";
import factura from "./factura";
import crm from "./crm";
import whatsapp from "./whatsapp";
import usuario from "./usuario"
export default {
  empresa: new empresa(),
  factura: new factura(),
  crm: new crm(),
  whatsapp: new whatsapp(),
  usuario: new usuario()
};
