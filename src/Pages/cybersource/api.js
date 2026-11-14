import SSocket from 'servisofts-socket';
import Model from '../../Model';

// Cobro con tarjeta (Cybersource / Linkser) de la empresa: componente "cybersource" del server serp,
// que revisa los permisos de /cybersource y habla con el microservicio por la red interna.
const cs = (type, extra = {}, timeout) => SSocket.sendPromise({
    component: "cybersource", type, estado: "cargando",
    key_empresa: Model.empresa.Action.getKey(),
    key_usuario: Model.usuario.Action.getKey(),
    ...extra,
}, timeout);

export const URL = "/cybersource";

export const getEstado = async () => (await cs("estado")).data ?? {};
export const getPagos = async ({ desde = "", hasta = "", state = "" } = {}) =>
    Object.values((await cs("pagos", { desde, hasta, state })).data ?? {});
export const crearLink = async (data) => (await cs("link_registro", { data })).data;
export const anularLink = (key) => cs("link_anular", { key });
export const cobrarTarjetaGuardada = async (key, monto, key_solicitud) => (await cs("link_cobrar_token", { key, monto, key_solicitud }, 120000)).data;
export const reembolsarPago = async (key) => (await cs("link_reembolsar", { key }, 120000)).data;
export const getConfig = async () => (await cs("config_get")).data ?? {};
export const guardarConfig = async (data) => (await cs("config_guardar", { data })).data;
export const probarConfig = async () => (await cs("config_probar")).data ?? {};

// ---- Liquidaciones de Linkser (conciliación de depósitos) ----
export const getPendientesLiquidar = async () => (await cs("liq_pendientes", {}, 60000)).data ?? {};
export const guardarConfigLiquidacion = async (data) => (await cs("liq_config_guardar", { data })).data ?? {};
export const getLiquidaciones = async () => (await cs("liq_lista")).data ?? [];
export const getLiquidacion = async (key) => (await cs("liq_detalle", { key })).data ?? {};
export const registrarLiquidacion = async (data) => (await cs("liq_registrar", { data }, 120000)).data;
export const anularLiquidacion = async (key, motivo) => (await cs("liq_anular", { key, motivo }, 120000)).data;

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
    PROCESANDO: { label: "Procesando", color: "warning" },
    INCIERTO: { label: "Revisar en Cybersource", color: "danger" },
};

export const moneda = (m, cod = "BOB") => `${cod == "BOB" ? "Bs" : cod} ${Number(m ?? 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fecha = (f) => f ? String(f).replace("T", " ").slice(0, 16) : "";

// ---- Tienda web: órdenes y contratos en cuotas (componente "tienda" del server serp, permisos de /cybersource) ----
const tienda = (type, extra = {}) => SSocket.sendPromise({
    component: "tienda", type, estado: "cargando",
    key_empresa: Model.empresa.Action.getKey(),
    key_usuario: Model.usuario.Action.getKey(),
    ...extra,
}, 120000);

export const getOrdenes = async ({ desde = "", hasta = "" } = {}) => (await tienda("ordenes", { desde, hasta })).data ?? [];
export const reprocesarOrden = async (key) => (await tienda("orden_reprocesar", { key })).data;
export const getContratos = async ({ state = "" } = {}) => (await tienda("contratos", { state })).data ?? [];
export const getContrato = async (key) => (await tienda("contrato", { key })).data ?? {};
export const getCobros = async ({ desde = "", hasta = "", state = "" } = {}) => (await tienda("cobros", { desde, hasta, state })).data ?? [];
export const cobrarCuota = async (key) => (await tienda("cobro_cobrar", { key })).data;
export const linkCuota = async (key) => (await tienda("cobro_link", { key })).data;
export const cancelarContrato = async (key, { anular_restantes, motivo }) => (await tienda("contrato_cancelar", { key, anular_restantes, motivo })).data;
export const getConfigTienda = async () => (await tienda("config_get")).data ?? {};
export const guardarConfigTienda = async (data) => (await tienda("config_guardar", { data })).data;

export const ESTADOS_ORDEN = {
    PENDIENTE_PAGO: { label: "Esperando pago", color: "warning" },
    PAGADA: { label: "Pagada (registrando)", color: "warning" },
    VENTA: { label: "Venta registrada", color: "success" },
    ERROR: { label: "Error", color: "danger" },
    ANULADA: { label: "Anulada", color: "lightGray" },
};
export const ESTADOS_CONTRATO = {
    ACTIVO: { label: "Activo", color: "success" },
    MOROSO: { label: "Moroso", color: "danger" },
    CANCELADO: { label: "Cancelado", color: "lightGray" },
    FINALIZADO: { label: "Finalizado", color: "gray" },
};
export const ESTADOS_COBRO = {
    PENDIENTE: { label: "Pendiente", color: "gray" },
    REINTENTO: { label: "Reintentando", color: "warning" },
    COBRADO: { label: "Cobrado (registrando)", color: "warning" },
    PAGADO: { label: "Pagado", color: "success" },
    MORA: { label: "En mora", color: "danger" },
    INCIERTO: { label: "Revisar en Cybersource", color: "danger" },
    ANULADO: { label: "Anulado", color: "lightGray" },
};
export const est = (mapa, s) => mapa[s] ?? { label: s, color: "gray" };
export const dia = (f) => f ? String(f).slice(0, 10) : "";
export const nombreCliente = (c) => c ? `${c.nombres ?? ""} ${c.apellidos ?? ""}`.trim() : "";
export const anularOrden = async (key, motivo) => (await tienda("orden_anular", { key, motivo })).data;
export const getEstadoTareas = async () => (await tienda("estado_tareas")).data ?? {};
