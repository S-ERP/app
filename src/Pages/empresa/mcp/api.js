import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import MDL from '../../../MDL';

// Tokens de acceso al MCP de S-ERP (componente mcp_token del server serp).
// Cada token es de UN usuario: el MCP actúa como él, con sus permisos, en esta empresa.
const mcp = (type, extra = {}) => SSocket.sendPromise({
    component: "mcp_token", type, estado: "cargando",
    key_empresa: Model.empresa.Action.getKey(),
    key_usuario: Model.usuario.Action.getKey(),
    ...extra,
});

export const getTokens = async () => Object.values((await mcp("getAll")).data ?? {});
export const crearToken = async (data) => (await mcp("registro", { data })).data;
export const verToken = async (key) => (await mcp("ver", { key })).data?.token;
export const anularToken = (key) => mcp("anular", { key });

export const nombreUsuario = (u) => [u?.Nombres, u?.Apellidos].filter(Boolean).join(" ") || u?.Correo || "";

// Usuarios activos de la empresa, con nombre: { key, nombre }.
export async function getUsuariosEmpresa() {
    const resp = await SSocket.sendPromise({
        service: "empresa", component: "empresa_usuario", type: "getAll", estado: "cargando",
        key_empresa: Model.empresa.Action.getKey(),
    });
    const keys = [...new Set(Object.values(resp.data ?? {}).filter(eu => (eu.estado ?? 1) > 0).map(eu => eu.key_usuario))];
    if (!keys.length) return [];
    const usuarios = await MDL.usuario.getByKeys(keys);
    return usuarios.filter(Boolean).map(u => ({ key: u.key, nombre: nombreUsuario(u) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
}
