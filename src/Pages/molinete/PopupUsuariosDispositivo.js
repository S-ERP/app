import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SHr, SInput, SLoad, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../MDL';
import SIconApp from '../../Assets/SIconApp';
import { getAccesosSucursal, getUsuariosDispositivo } from './api';
import { formatFecha } from './PopupHistorial';

const KEY = "PopupUsuariosDispositivo";
const DEDO = { 1: "Izquierda", 2: "Derecha" };

// Personas cargadas en un dispositivo, con sus huellas, y si deberian tener acceso hoy segun zkteco/accesos.
export default class PopupUsuariosDispositivo extends Component {
    static open(props) {
        SPopup.open({
            key: KEY,
            content: <SView style={{
                width: "100%", height: 600, maxHeight: "100%", maxWidth: 560,
                borderRadius: 12, borderColor: STheme.color.card, borderWidth: 1,
                backgroundColor: STheme.color.background, overflow: "hidden",
            }} withoutFeedback>
                <PopupUsuariosDispositivo {...props} />
            </SView>
        });
    }

    state = { usuarios: null, error: null, search: "", accesos: null };

    componentDidMount() {
        this.load();
    }

    async load() {
        const d = this.props.dispositivo;
        try {
            console.log("[molinete] usuarios del dispositivo: cargando", d.key);
            const [usuarios, clientes, accesos] = await Promise.all([
                getUsuariosDispositivo(d.key),
                MDL.crm.cliente.getAll().catch(() => []),
                d.sucursal?.key ? getAccesosSucursal(d.sucursal.key).catch(() => null) : null,
            ]);
            console.log("[molinete] getUsuariosActivos", usuarios?.length, usuarios, "clientes", clientes?.length, "accesos", accesos);
            const mapClientes = {};
            (clientes ?? []).forEach(c => mapClientes[c.key] = c);
            const keysUsuarios = usuarios.map(u => u.key_usuario).filter(k => k && !mapClientes[k]);
            const personal = keysUsuarios.length ? await MDL.usuario.getByKeys(keysUsuarios).catch(() => []) : [];
            const mapPersonal = {};
            (Array.isArray(personal) ? personal : Object.values(personal ?? {})).forEach(u => mapPersonal[u.key] = u);

            const filas = usuarios.map(u => {
                const c = mapClientes[u.key_usuario], p = mapPersonal[u.key_usuario];
                return {
                    ...u,
                    tipo: c ? "Cliente" : p ? "Usuario" : "Sin registro",
                    nombre: c ? ([c.nombres, c.apellidos].filter(Boolean).join(" ") || c.razon_social)
                        : p ? [p.Nombres, p.Apellidos].filter(Boolean).join(" ") : u.key_usuario,
                    dedos: (Array.isArray(u.huellas) ? u.huellas : Object.values(u.huellas ?? {})).filter(h => h && h.estado > 0).map(h => DEDO[h.codigo] ?? ("Dedo " + h.codigo)),
                    habilitado: accesos ? accesos.has(u.key_usuario) : null,
                };
            }).sort((a, b) => (a.codigo ?? 0) - (b.codigo ?? 0));
            console.log("[molinete] filas", filas);
            this.setState({ usuarios: filas, accesos });
        } catch (e) {
            console.error("[molinete] error usuarios del dispositivo", e);
            this.setState({ usuarios: [], error: "No se pudo cargar los usuarios del dispositivo: " + (e?.error ?? e?.message ?? JSON.stringify(e)) });
        }
    }

    getLista() {
        const q = this.state.search.trim().toLowerCase();
        return (this.state.usuarios ?? []).filter(u => !q || `${u.codigo} ${u.nombre} ${u.tipo}`.toLowerCase().includes(q));
    }

    renderItem = ({ item }) => {
        const sinHuella = !item.dedos.length;
        return <SView col={"xs-12"} row center style={{ paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderColor: STheme.color.card }}>
            <SView width={44}><SText fontSize={11} color={STheme.color.gray}>#{item.codigo}</SText></SView>
            <SView flex>
                <SText bold numberOfLines={1}>{item.nombre}</SText>
                <SText fontSize={11} color={STheme.color.gray}>{item.tipo} · cargado {formatFecha(item.fecha_on)}</SText>
            </SView>
            <SView width={90} row center style={{ justifyContent: "flex-start" }}>
                <SView width={12} height={12}><SIconApp name={"Fp"} fill={sinHuella ? STheme.color.danger : STheme.color.success} /></SView>
                <SView width={4} />
                <SText fontSize={10} color={sinHuella ? STheme.color.danger : STheme.color.text}>{sinHuella ? "Sin huella" : item.dedos.join(", ")}</SText>
            </SView>
            {item.habilitado === null ? null : <SView style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: (item.habilitado ? STheme.color.success : STheme.color.warning) + "33" }}>
                <SText fontSize={10}>{item.habilitado ? "Con acceso" : "Sin acceso hoy"}</SText>
            </SView>}
        </SView>
    }

    render() {
        const d = this.props.dispositivo;
        const lista = this.getLista();
        const total = this.state.usuarios?.length ?? 0;
        const conHuella = (this.state.usuarios ?? []).filter(u => u.dedos.length).length;
        const sinAcceso = (this.state.usuarios ?? []).filter(u => u.habilitado === false).length;
        return <SView col={"xs-12"} flex style={{ height: "100%" }}>
            <SView col={"xs-12"} style={{ padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: STheme.color.card }}>
                <SView col={"xs-12"} row center>
                    <SView flex>
                        <SText fontSize={16} bold>Usuarios · {d.descripcion}</SText>
                        <SText fontSize={12} color={STheme.color.gray}>
                            {!this.state.usuarios ? "Cargando..." : `${total} cargados · ${conHuella} con huella${this.state.accesos ? ` · ${sinAcceso} sin acceso hoy` : ""}`}
                        </SText>
                    </SView>
                    <SView width={32} height={32} center onPress={() => SPopup.close(KEY)}>
                        <SText fontSize={18} color={STheme.color.gray}>✕</SText>
                    </SView>
                </SView>
                <SHr height={12} />
                <SInput
                    icon={<SIconApp fill={"#b8b9b9"} name="Search" height={16} />}
                    placeholder="Buscar por pin, nombre o tipo..."
                    value={this.state.search}
                    style={{ height: 38, borderRadius: 8 }}
                    onChangeText={text => this.setState({ search: text })}
                />
            </SView>
            {!this.state.usuarios ? <SView flex center><SLoad /></SView>
                : !lista.length ? <SView flex center><SText color={STheme.color.gray}>{this.state.error ?? (this.state.search ? "Nadie coincide con la busqueda" : "No hay usuarios cargados en este dispositivo")}</SText></SView>
                    : <FlatList style={{ flex: 1, width: "100%" }} data={lista} keyExtractor={i => i.key} renderItem={this.renderItem} />}
        </SView>
    }
}
