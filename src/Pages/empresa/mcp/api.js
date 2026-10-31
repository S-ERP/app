import SSocket from 'servisofts-socket';
import Model from '../../../Model';

// Tokens de acceso al MCP de S-ERP (componente mcp_token del server serp).
// Cada token es de UNA empresa y actua con los permisos del usuario que lo creo.
const mcp = (type, extra = {}) => SSocket.sendPromise({
    component: "mcp_token", type, estado: "cargando",
    key_empresa: Model.empresa.Action.getKey(),
    key_usuario: Model.usuario.Action.getKey(),
    ...extra,
});

export const getTokens = async () => Object.values((await mcp("getAll")).data ?? {});
export const crearToken = async (data) => (await mcp("registro", { data })).data;
export const anularToken = (key) => mcp("anular", { key });
