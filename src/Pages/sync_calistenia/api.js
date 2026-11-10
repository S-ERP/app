import SSocket from 'servisofts-socket';
import Model from '../../Model';

// Sincronización con el sistema antiguo de Calistenia: componente "sync_calistenia" del server serp
// (permisos de /sync_calistenia: ver | configurar).
const sync = (type, extra = {}, timeout = 120000) => SSocket.sendPromise({
    component: "sync_calistenia", type, estado: "cargando",
    key_empresa: Model.empresa.Action.getKey(),
    key_usuario: Model.usuario.Action.getKey(),
    ...extra,
}, timeout);

export const URL = "/sync_calistenia";

export const getEstado = async () => (await sync("estado")).data ?? {};
export const guardarConfig = async (data) => (await sync("config_guardar", { data })).data ?? {};
export const correrPasada = async () => (await sync("pasada", {}, 300000)).data ?? {};
export const getEventos = async (state = "") => (await sync("eventos", { state })).data ?? [];
export const reprocesarEvento = async (key) => (await sync("evento_reprocesar", { key }, 180000)).data;
export const omitirEvento = (key, motivo) => sync("evento_omitir", { key, motivo });
export const getSucursales = async () => (await sync("sucursales")).data ?? [];
export const guardarSucursal = async (data) => (await sync("sucursal_guardar", { data })).data ?? [];
export const getPaquetes = async () => (await sync("paquetes")).data ?? [];
export const getTiposPago = async () => (await sync("tipos_pago")).data ?? [];
export const getClientes = async () => (await sync("clientes")).data ?? [];
export const getConciliacion = async (fecha) => (await sync("conciliacion", { fecha }, 180000)).data ?? [];

export const ESTADOS = {
    PENDIENTE: { label: "Pendiente", color: "warning" },
    HECHO: { label: "Hecho", color: "success" },
    ERROR: { label: "Error (se reintenta)", color: "danger" },
    REVISAR: { label: "Revisar", color: "danger" },
    OMITIDO: { label: "Omitido", color: "lightGray" },
};
export const est = (k) => ESTADOS[k] ?? { label: k ?? "", color: "text" };

export const TIPOS = { venta: "Venta", anulacion: "Anulación", acceso: "Acceso / prórroga", paquete: "Plan" };
export const ORIGENES = { calistenia: "Calistenia → S-ERP", serp: "S-ERP → Calistenia" };
export const TIPOS_PAGO_CAL = { "1": "Efectivo", "2": "Tarjeta", "3": "Transferencia", "4": "Cheque", "5": "QR" };

export const moneda = (m) => `Bs ${Number(m ?? 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fecha = (f) => f ? String(f).replace("T", " ").slice(0, 16) : "";
export const corto = (k) => String(k ?? "").slice(0, 8).toUpperCase();
