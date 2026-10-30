import { SNavigation } from 'servisofts-component';
import ZKTeco from './zkteco';
import PopupSucursalHuella from './PopupSucursalHuella';

// Abre la pantalla de registro de huella para una persona (usuario o cliente).
// zkteco guarda la huella con key_usuario = key de la persona: solo es un identificador.
// Con caja abierta usa directo su sucursal (se puede cambiar en la pantalla del sensor);
// sin caja se elige la sucursal en el popup.
// huella: registro actual en usuario_huella (opcional, para reemplazarla en vez de crear otra).
// nombre: lo que se muestra en la pantalla del sensor.
export default function iniciarRegistroHuella({ key_usuario, nombre, huella, codigo = 2 }) {
    const abrir = (key_sucursal) => {
        SNavigation.navigate("/usuario/profile/huella", {
            pk: key_usuario,
            key_sucursal: key_sucursal,
            codigo: codigo,
            ...(nombre ? { nombre } : {}),
            ...(huella?.key ? { key_huella: huella.key } : {}),
        });
    }
    return ZKTeco.getSucursalCajaActiva().then(key_sucursal => {
        if (key_sucursal) return abrir(key_sucursal);
        PopupSucursalHuella.open({ onSelect: (sucursal) => abrir(sucursal.key) });
    });
}
