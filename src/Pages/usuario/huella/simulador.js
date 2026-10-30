import SSocket from 'servisofts-socket';

// Simulador del registro de huella para trabajar la interfaz sin el lector.
// Reproduce los mensajes reales del flujo (cliente Windows SZKteco -> microservicio zkteco -> server serp):
//   - lector_huella/onEvent estado "exito" por cada lectura correcta (data.i = lecturas previas, solo i 0 y 1;
//     la 3ra lectura va directo al registro), estado "error" si no coincide con la anterior.
//   - usuario_huella/registro estado "exito" al final (el server serp renombra dispositivo -> usuario_huella).
// Los mensajes se inyectan con SSocket.triggerOnMessage, el mismo camino que usan los mensajes reales.
// No escribe nada en el servidor.

const KEY_PUNTO_VENTA = "5a042869-500e-485e-b848-0ab6fd3a30cb";
const KEY_TIPO_DISPOSITIVO = "096acabc-3aca-41f3-86e3-d47b0e1add17";

const lectura = (estado, i) => ({ delay: 1200, msg: (s) => ({
    component: "lector_huella", type: "onEvent", estado,
    key_punto_venta: KEY_PUNTO_VENTA, key_tipo_dispositivo: KEY_TIPO_DISPOSITIVO,
    key_sucursal: s.key_sucursal,
    data: { i, ret: 0 },
}) });

const registro = { delay: 1500, msg: (s) => ({
    component: "usuario_huella", type: "registro", estado: "exito", noSend: false,
    data: {
        key: s.key ?? "sim-" + Date.now(),
        key_usuario: s.key_usuario,
        key_sucursal: s.key_sucursal,
        codigo: s.codigo,
        estado: 1,
        fecha_on: "now()",
        fecha_edit: new Date().toISOString(),
    },
}) };

export const ESCENARIOS = {
    exito: {
        label: "Registro exitoso",
        solicitud: "exito",
        pasos: [lectura("exito", 0), lectura("exito", 1), registro],
    },
    con_errores: {
        label: "Con lecturas fallidas",
        solicitud: "exito",
        pasos: [lectura("exito", 0), lectura("error", 1), lectura("exito", 1), lectura("error", 2), registro],
    },
    reinicia: {
        label: "3 errores y reinicia",
        solicitud: "exito",
        pasos: [lectura("exito", 0), lectura("error", 1), lectura("error", 1), lectura("error", 1), lectura("exito", 0), lectura("exito", 1), registro],
    },
    sin_punto_venta: {
        label: "Sucursal sin lector",
        solicitud: "error",
        error: "No existe punto de venta",
        pasos: [],
    },
    timeout: {
        label: "Servidor no responde",
        solicitud: "timeout",
        pasos: [],
    },
    sin_dedo: {
        label: "Nunca ponen el dedo",
        solicitud: "exito",
        pasos: [],
    },
};

export default class Simulador {
    constructor(nombre) {
        this.escenario = ESCENARIOS[nombre] ?? ESCENARIOS.exito;
        this.timers = [];
    }

    detener() {
        this.timers.forEach(t => clearTimeout(t));
        this.timers = [];
    }

    solicitudRegistroHuella(solicitud) {
        const e = this.escenario;
        return new Promise((resolve, reject) => {
            if (e.solicitud == "timeout") {
                this.timers.push(setTimeout(() => reject({ estado: "error", error: "timeOut" }), 3000));
                return;
            }
            this.timers.push(setTimeout(() => {
                const resp = { component: "lector_huella", type: "solicitud_registro_huella", data: solicitud };
                if (e.solicitud == "error") return reject({ ...resp, estado: "error", error: e.error });
                resolve({ ...resp, estado: "exito" });
                let t = 0;
                e.pasos.forEach((p) => {
                    t += p.delay;
                    this.timers.push(setTimeout(() => SSocket.triggerOnMessage(p.msg(solicitud)), t));
                });
            }, 600));
        });
    }
}
