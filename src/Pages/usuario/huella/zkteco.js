import SSocket from 'servisofts-socket';
import Model from '../../../Model';

// Integracion con el microservicio zkteco (mismo protocolo que CalisteniaBolivia-SRL/app-administracion).
// Se usa SSocket.sendPromise para que las respuestas NO pasen por redux:
// S-ERP ya tiene modelos "punto_venta" y "sucursal" y SModel enruta solo por component.
const SERVICE = "zkteco";

// Componentes cuyos mensajes nos interesan escuchar / loguear.
export const ZK_COMPONENTS = ["lector_huella", "usuario_huella", "dispositivo", "punto_venta", "zkteco"];

export const isZkMessage = (obj) => {
    if (!obj) return false;
    if (obj.service == SERVICE) return true;
    return ZK_COMPONENTS.includes(obj.component);
}

export default class ZKTeco {
    // El microservicio no filtra por usuario: getAll trae todas las huellas del servicio.
    static getHuellas() {
        return SSocket.sendPromise({
            service: SERVICE,
            component: "usuario_huella",
            type: "getAll",
            estado: "cargando",
            key_usuario: "",
        }, 15000).then(e => Object.values(e.data ?? {}).filter((x) => x.estado > 0));
    }

    static getHuellasByKeyUsuario(key_usuario) {
        return ZKTeco.getHuellas().then(arr => arr.filter((x) => x.key_usuario == key_usuario));
    }

    // { key_usuario: huella } para el codigo dado (2 = derecha).
    static getHuellasPorUsuario(codigo = 2) {
        return ZKTeco.getHuellas().then(arr => {
            const map = {};
            arr.forEach((x) => { if (x.codigo == codigo) map[x.key_usuario] = x; });
            return map;
        });
    }

    static eliminarHuella(huella) {
        return SSocket.sendPromise({
            service: SERVICE,
            component: "usuario_huella",
            type: "editar",
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            data: { ...huella, estado: 0 }
        }, 15000)
    }

    // data: { key?, key_usuario, key_sucursal, codigo }
    // Si data.key existe el microservicio edita la huella, si no crea una nueva.
    static solicitudRegistroHuella(data) {
        return SSocket.sendPromise({
            service: SERVICE,
            component: "lector_huella",
            type: "solicitud_registro_huella",
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            data: data
        }, 15000)
    }

    // key_sucursal de la caja abierta del usuario logueado (o null si no tiene caja abierta).
    static getSucursalCajaActiva() {
        return SSocket.sendPromise({
            service: "caja",
            component: "caja",
            type: "getActiva",
            estado: "cargando",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }, 5000).then(e => {
            if (e.data?.key_sucursal) return e.data.key_sucursal;
            const caja = Object.values(e.data ?? {}).find((c) => c?.key_sucursal);
            return caja?.key_sucursal ?? null;
        }).catch(() => null);
    }

    // Puntos de venta (huelleros) de este servicio en zkteco.
    static getPuntosVenta() {
        return SSocket.sendPromise({
            service: SERVICE,
            component: "punto_venta",
            type: "getAll",
            estado: "cargando",
            key_usuario: "",
        }, 15000).then(e => Object.values(e.data ?? {}).filter((x) => x.estado > 0));
    }
}
