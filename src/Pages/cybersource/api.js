import SSocket from 'servisofts-socket';
import Model from '../../Model';

// Cobro con tarjeta (Cybersource / Linkser) de la empresa: componente "cybersource" del server serp,
// que revisa los permisos de /cybersource y habla con el microservicio por la red interna.
const cs = (type, extra = {}) => SSocket.sendPromise({
    component: "cybersource", type, estado: "cargando",
    key_empresa: Model.empresa.Action.getKey(),
    key_usuario: Model.usuario.Action.getKey(),
    ...extra,
});

export const URL = "/cybersource";

export const getEstado = async () => (await cs("estado")).data ?? {};
export const getPagos = async ({ desde = "", hasta = "", state = "" } = {}) =>
    Object.values((await cs("pagos", { desde, hasta, state })).data ?? {});
export const crearLink = async (data) => (await cs("link_registro", { data })).data;
export const anularLink = (key) => cs("link_anular", { key });
export const getConfig = async () => (await cs("config_get")).data ?? {};
export const guardarConfig = async (data) => (await cs("config_guardar", { data })).data;
export const probarConfig = async () => (await cs("config_probar")).data ?? {};

// Estados del link de pago (columna state del microservicio).
export const ESTADOS = {
    CREADA: { label: "Pendiente", color: "warning" },
    SETUP: { label: "En proceso", color: "warning" },
    PENDING_AUTHENTICATION: { label: "Verificando banco", color: "warning" },
    AUTHORIZED: { label: "Pagado", color: "success" },
    AUTHORIZED_PENDING_REVIEW: { label: "En revisión", color: "warning" },
    DECLINED: { label: "Rechazado", color: "danger" },
    ERROR: { label: "Error", color: "danger" },
    ANULADA: { label: "Anulado", color: "lightGray" },
    REEMBOLSADA: { label: "Reembolsado", color: "lightGray" },
};

export const moneda = (m, cod = "BOB") => `${cod == "BOB" ? "Bs" : cod} ${Number(m ?? 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fecha = (f) => f ? String(f).replace("T", " ").slice(0, 16) : "";
