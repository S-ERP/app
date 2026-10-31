import SSocket from 'servisofts-socket';
import Model from '../../Model';
import MDL from '../../MDL';

// Datos de los molinetes (dispositivos zkteco) de la empresa.
// zkteco es compartido con Calistenia: punto_venta/getAll ya filtra por el servicio (serp)
// y ademas aqui se filtra por las sucursales de la empresa seleccionada.
const zk = (component, type, extra = {}, timeout = 20000) => SSocket.sendPromise({
    service: "zkteco", component, type, estado: "cargando", key_usuario: "", ...extra,
}, timeout);

const vals = (d) => Object.values(d ?? {});

// Codigos de dispositivo_historico.data.EventType que no son marcaciones.
export const EVENTOS = {
    "300": { label: "Conectado", tipo: "conexion" },
    "301": { label: "Desconectado", tipo: "conexion" },
    "302": { label: "Sincronizacion exitosa", tipo: "sincronizacion" },
    "303": { label: "Sincronizacion con error", tipo: "sincronizacion" },
};

export const fechaEvento = (h) => h?.data?.Fecha ?? h?.fecha_on ?? "";

// Resume el historial: ultima conexion/desconexion, ultima sincronizacion y ultima marcacion.
export function resumirHistorial(historial) {
    const orden = [...historial].sort((a, b) => fechaEvento(b).localeCompare(fechaEvento(a)));
    const res = { conexion: null, sincronizacion: null, marcacion: null, total: historial.length };
    for (const h of orden) {
        const ev = EVENTOS[h?.data?.EventType];
        const tipo = ev ? ev.tipo : "marcacion";
        if (!res[tipo]) res[tipo] = h;
        if (res.conexion && res.sincronizacion && res.marcacion) break;
    }
    return res;
}

export async function getSucursalesEmpresa() {
    const resp = await SSocket.sendPromise({
        service: "empresa", component: "sucursal", type: "getByKeyEmpresa", estado: "cargando",
        key_empresa: Model.empresa.Action.getKey(), key_usuario: Model.usuario.Action.getKey(),
    }, 15000);
    const map = {};
    vals(resp.data).forEach(s => map[s.key] = s);
    return map;
}

export async function getHistorial(key_dispositivo) {
    const resp = await zk("dispositivo_historico", "getAll", { key_dispositivo });
    return vals(resp.data);
}

// Una fila por dispositivo, con su punto de venta, sucursal, tipo y resumen del historial.
export async function getMolinetes() {
    const [sucursales, puntos, tipos] = await Promise.all([
        getSucursalesEmpresa(),
        zk("punto_venta", "getAll").then(e => vals(e.data)),
        zk("tipo_dispositivo", "getAll").then(e => e.data ?? {}).catch(() => ({})),
    ]);
    const puntosEmpresa = puntos.filter(p => p.estado > 0 && sucursales[p.key_sucursal]);
    const porPunto = await Promise.all(puntosEmpresa.map(p =>
        zk("dispositivo", "getAll", { key_punto_venta: p.key }).then(e => vals(e.data).filter(d => d.estado > 0))
    ));
    const filas = [];
    puntosEmpresa.forEach((p, i) => porPunto[i].forEach(d => filas.push({
        ...d,
        punto_venta: p,
        sucursal: sucursales[p.key_sucursal],
        tipo: tipos[d.key_tipo_dispositivo] ?? null,
    })));
    // El historial guarda conexiones, sincronizaciones y marcaciones: si falla, la fila queda sin resumen.
    await Promise.all(filas.map(f => getHistorial(f.key)
        .then(h => { f.historial = resumirHistorial(h); })
        .catch(() => { f.historial = null; })));
    return filas;
}

// Pregunta en vivo al punto de venta si el dispositivo responde.
// Va por el server serp (zkteco/testConnection): la respuesta directa de zkteco llega con noSend:true y se perderia.
export function probarConexion(dispositivo) {
    return SSocket.sendPromise({
        component: "zkteco", type: "testConnection", estado: "cargando",
        key_dispositivo: dispositivo.key,
        key_punto_venta: dispositivo.key_punto_venta,
    }, 30000);
}

// Quienes tienen acceso hoy a la sucursal, con detalle (clientes / personal / keys).
export async function getAccesos(key_sucursal) {
    const resp = await SSocket.sendPromise({ component: "zkteco", type: "accesos", estado: "cargando", key_sucursal }, 60000);
    return resp.data;
}

// Carga la lista de accesos en todos los molinetes de la sucursal (server serp: zkteco/sincronizarMolinete).
// delete_all: saca del molinete a quien ya no tiene acceso. Devuelve el resultado por dispositivo.
export async function sincronizarSucursal(key_sucursal) {
    const resp = await SSocket.sendPromise({ component: "zkteco", type: "sincronizarMolinete", estado: "cargando", key_sucursal }, 15 * 60 * 1000);
    return Array.isArray(resp.data) ? resp.data : vals(resp.data);
}

export const TIPO_INBIO = "607b087c-6a92-4d8a-b311-e5c105cefd08";
export const TIPO_RASPBERRY = "54bda087-a12c-4641-92d6-45dc5d327362";

// Abre (o cierra) una puerta del dispositivo. Mismos parametros que Calistenia (Pull SDK ControlDevice):
// operID 1 = salida de puerta, outputAddrType 1 = puerta, doorAction = segundos abierta (0 = cerrar).
// La Raspberry solo lee doorOrAuxoutID y abre con un pulso (arduino-door); no tiene "cerrar".
export function accionPuerta(dispositivo, puerta, cerrar = false) {
    const { punto_venta, sucursal, tipo, historial, ...d } = dispositivo;
    return zk("dispositivo", "open", {
        key_dispositivo: d.key,
        dispositivo: d,
        key_usuario: Model.usuario.Action.getKey(),
        parameters: { operID: 1, doorOrAuxoutID: puerta, outputAddrType: 1, doorAction: cerrar ? 0 : 3 },
    }, 20000);
}

// Personas cargadas en el dispositivo (usuario_dispositivo), con su Pin (codigo) y sus huellas (sin plantilla).
// key_usuario puede ser la key de un cliente (crm) o de un usuario del ERP.
export async function getUsuariosDispositivo(key_dispositivo) {
    const resp = await zk("dispositivo", "getUsuariosActivos", { key_dispositivo }, 60000);
    return (Array.isArray(resp.data) ? resp.data : vals(resp.data)).filter(u => u.estado > 0);
}

// Sucursales de la empresa que tienen al menos un punto de venta zkteco (para la pantalla de ingresos).
export async function getSucursalesConMolinete() {
    const [sucursales, puntos] = await Promise.all([
        getSucursalesEmpresa(),
        zk("punto_venta", "getAll").then(e => vals(e.data)),
    ]);
    const keys = new Set(puntos.filter(p => p.estado > 0).map(p => p.key_sucursal));
    return Object.values(sucursales).filter(s => keys.has(s.key));
}

// La pantalla de ingresos se suscribe a su sucursal; el server serp le manda zkteco/ingreso por cada marcacion
// (ver ZKTecoIngresos). La suscripcion vive en la sesion del socket: hay que repetirla si se reconecta.
export function suscribirIngresos(key_sucursal) {
    return SSocket.sendPromise({ component: "zkteco", type: "suscribirIngresos", estado: "cargando", key_sucursal }, 15000);
}

// Como se muestra a una persona en la pantalla de ingresos: solo el primer nombre y la inicial del apellido.
const persona = (nombres, apellidos, extra) => {
    const n = (nombres ?? "").trim().split(/\s+/)[0] ?? "";
    const a = (apellidos ?? "").trim();
    return {
        nombre: [nombres, apellidos].filter(Boolean).join(" "),
        corto: (n + (a ? " " + a[0] + "." : "")).trim(),
        iniciales: ((n[0] ?? "") + (a[0] ?? "")).toUpperCase(),
        ...extra,
    };
};

// Datos para mostrar a quien ingreso: nombre, y si es cliente, el plan de su suscripcion.
export async function getPersonaIngreso(ingreso) {
    const key = ingreso.key_usuario;
    if (ingreso.tipo != "personal") {
        const cliente = await MDL.crm.cliente.getByKey(key).catch(() => null);
        if (cliente?.key) {
            let plan = null;
            const key_susc = ingreso.suscripcion?.key_suscripcion;
            if (key_susc) {
                const susc = await MDL.inventario.getSuscripcionesByCliente(key).catch(() => []);
                // producto viene como objeto (descripcion, nombre, ...), no como texto.
                const producto = susc.find(s => s.key == key_susc)?.producto;
                plan = typeof producto == "string" ? producto : (producto?.descripcion || producto?.nombre || null);
            }
            if (!cliente.nombres && !cliente.apellidos) return persona(cliente.razon_social || "Cliente", "", { tipo: "cliente", plan });
            return persona(cliente.nombres, cliente.apellidos, { tipo: "cliente", plan });
        }
    }
    const usuarios = await MDL.usuario.getByKeys([key]).catch(() => []);
    const u = (Array.isArray(usuarios) ? usuarios : Object.values(usuarios ?? {}))[0];
    if (!u) return persona("Pin " + ingreso.pin, "", { tipo: ingreso.tipo });
    return persona(u.Nombres, u.Apellidos, { tipo: "personal" });
}

// Keys de quienes deberian tener acceso hoy a la sucursal (consulta del server serp, ver ZKTecoAccesos).
export async function getAccesosSucursal(key_sucursal) {
    return new Set((await getAccesos(key_sucursal))?.keys ?? []);
}
