import React, { Component } from 'react';
import { SIcon, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import {
    ORIGENES, TIPOS, TIPOS_PAGO_CAL, URL, corto, correrPasada, est, fecha, getClientes, getConciliacion, getEstado, getEventos, getPaquetes,
    getSucursales, getTiposPago, guardarConfig, guardarSucursal, moneda, omitirEvento, reprocesarEvento
} from './api';

const puede = (permiso) => !!MDL.rolesPermisos.getPermiso({ url: URL, permiso });
const aviso = (title, body, color = STheme.color.danger) => SNotification.send({ title, body, color, time: 5000 });
const hoy = () => new Date(Date.now() - 4 * 3600 * 1000).toISOString().slice(0, 10);

const TABS = [["estado", "Estado"], ["eventos", "Eventos"], ["sucursales", "Sucursales"], ["planes", "Planes"], ["pagos", "Tipos de pago"], ["clientes", "Clientes"]];

const Boton = ({ label, onPress, color }) => <SView center onPress={onPress}
    style={{ height: 32, paddingHorizontal: 14, marginRight: 6, marginBottom: 6, borderRadius: 8, backgroundColor: color ?? STheme.color.card }}>
    <SText fontSize={13}>{label}</SText>
</SView>;

const Tarjeta = ({ titulo, valor, color }) => <SView style={{ padding: 12, marginRight: 8, marginBottom: 8, borderRadius: 8, backgroundColor: STheme.color.card, minWidth: 140 }}>
    <SText fontSize={11} color={STheme.color.lightGray}>{titulo}</SText>
    <SText fontSize={20} bold color={color ?? STheme.color.text}>{valor}</SText>
</SView>;

const Tabla = ({ load, children, onSelect, refTabla }) => <DinamicTable ref={refTabla} selectType="single" colors={Config.table.colors()}
    cellStyle={Config.table.cellStyle()} textStyle={Config.table.textStyle()} language='es' loadData={load} onSelect={onSelect}>
    {children}
</DinamicTable>;

// Panel de la sincronización con el sistema antiguo de Calistenia: estado de la tarea, conciliación del día,
// eventos (con reintento), interruptor por sucursal y los mapeos de planes, tipos de pago y clientes.
export default class root extends Component {
    state = { tab: "estado", estado: null, fecha: hoy(), conciliacion: null };

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "ver" }).then(e => { if (!e) return SNavigation.goBack(); this.cargarEstado(); });
    }

    cargarEstado() {
        getEstado().then(estado => this.setState({ estado })).catch(e => aviso("Error", e?.error ?? "No se pudo leer el estado"));
        getConciliacion(this.state.fecha).then(conciliacion => this.setState({ conciliacion })).catch(e => this.setState({ conciliacion: { error: e?.error ?? "No se pudo conciliar" } }));
    }

    async cargar(fn) {
        try {
            return await fn();
        } catch (e) {
            aviso("Error", e?.error ?? "No se pudo cargar");
            return [];
        }
    }

    encender(activo) {
        SPopup.confirm({
            title: activo ? "Encender la sincronización" : "Apagar la sincronización",
            message: activo ? "Desde ahora se copian las ventas de las sucursales activas en los dos sentidos." : "Se dejan de copiar ventas. Lo pendiente queda en espera.",
            onPress: () => guardarConfig({ activo }).then(estado => this.setState({ estado })).catch(e => aviso("No se pudo", e?.error))
        });
    }

    pasada() {
        correrPasada().then(r => {
            aviso(r?.error ? "Sin correr" : "Pasada terminada", r?.error ?? `${r?.procesados ?? 0} procesados, ${r?.errores ?? 0} con error${r?.ultimo_error ? ": " + r.ultimo_error : ""}`,
                r?.errores || r?.error ? STheme.color.warning : STheme.color.success);
            this.cargarEstado();
        }).catch(e => aviso("No se pudo", e?.error));
    }

    renderEstado() {
        const e = this.state.estado;
        if (!e) return <SText>Cargando…</SText>;
        if (!e.configurada) return <SText>Esta empresa no tiene configurada la sincronización con Calistenia.</SText>;
        const c = e.config ?? {}, t = e.tarea ?? {}, ev = e.eventos ?? {}, tot = e.totales ?? {};
        const conc = this.state.conciliacion;
        return <SView col={"xs-12"}>
            <SView row style={{ flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                <SText fontSize={16} bold color={c.activo ? STheme.color.success : STheme.color.lightGray}>{c.activo ? "● Sincronización encendida" : "○ Sincronización apagada"}</SText>
                <SView width={12} />
                <SText fontSize={12} color={STheme.color.lightGray}>Base de Calistenia: {c.db_name} ({c.db_host})</SText>
            </SView>
            {c.observacion ? <SText fontSize={12} color={STheme.color.warning}>{c.observacion}</SText> : null}
            <SView height={8} />
            {puede("configurar") ? <SView row style={{ flexWrap: "wrap" }}>
                <Boton label={c.activo ? "Apagar" : "Encender"} onPress={() => this.encender(!c.activo)} color={c.activo ? STheme.color.danger + "55" : STheme.color.success + "55"} />
                <Boton label="Correr ahora" onPress={() => this.pasada()} />
                <Boton label="Actualizar" onPress={() => this.cargarEstado()} />
            </SView> : null}
            {t.atrasada && c.activo ? <SView style={{ padding: 8, marginBottom: 8, borderRadius: 8, backgroundColor: STheme.color.danger + "33" }}>
                <SText fontSize={12}>La tarea no corre desde {fecha(t.fecha_fin)}. Revisá el servidor serp.</SText>
            </SView> : null}
            <SView row style={{ flexWrap: "wrap" }}>
                <Tarjeta titulo="Última pasada" valor={t.fecha_fin ? fecha(t.fecha_fin).slice(11) : "—"} />
                <Tarjeta titulo="Pendientes" valor={ev.PENDIENTE ?? 0} color={STheme.color.warning} />
                <Tarjeta titulo="Hechos" valor={ev.HECHO ?? 0} color={STheme.color.success} />
                <Tarjeta titulo="Con error" valor={(ev.ERROR ?? 0)} color={(ev.ERROR ?? 0) ? STheme.color.danger : null} />
                <Tarjeta titulo="A revisar" valor={(ev.REVISAR ?? 0)} color={(ev.REVISAR ?? 0) ? STheme.color.danger : null} />
                <Tarjeta titulo="Omitidos" valor={ev.OMITIDO ?? 0} />
                <Tarjeta titulo="Sucursales activas" valor={`${tot.sucursales_activas ?? 0} / ${tot.sucursales ?? 0}`} />
                <Tarjeta titulo="Planes enlazados" valor={tot.paquetes ?? 0} />
                <Tarjeta titulo="Clientes enlazados" valor={tot.clientes ?? 0} />
                <Tarjeta titulo="Accesos enlazados" valor={tot.accesos ?? 0} />
            </SView>
            {t.errores > 0 ? <SText fontSize={12} color={STheme.color.warning}>Último error: {t.error}</SText> : null}
            <SView height={16} />
            <SView row style={{ alignItems: "center" }}>
                <SText fontSize={15} bold>Conciliación del día</SText>
                <SView width={12} />
                <SView width={130}><SInput type="date" defaultValue={this.state.fecha} onChangeText={f => this.setState({ fecha: f })} /></SView>
                <SView width={8} />
                <Boton label="Ver" onPress={() => { this.setState({ conciliacion: null }); getConciliacion(this.state.fecha).then(conciliacion => this.setState({ conciliacion })).catch(err => this.setState({ conciliacion: { error: err?.error } })); }} />
            </SView>
            <SText fontSize={11} color={STheme.color.lightGray}>Lo vendido en las cajas de Calistenia tiene que aparecer en S-ERP (punto de venta "sistema antiguo") y lo vendido en S-ERP en la caja "S-ERP" de Calistenia.</SText>
            <SView height={6} />
            {!conc ? <SText>Cargando…</SText> : conc.error ? <SText color={STheme.color.danger}>{conc.error}</SText> :
                <SView col={"xs-12"}>
                    <SView row style={{ paddingVertical: 4, borderBottomWidth: 1, borderColor: STheme.color.card }}>
                        {["Sucursal", "Calistenia (cajas)", "En S-ERP", "S-ERP (planes)", "En Calistenia", ""].map((h, i) =>
                            <SView key={i} flex={i == 0 ? 2 : 1}><SText fontSize={11} bold color={STheme.color.lightGray}>{h}</SText></SView>)}
                    </SView>
                    {conc.filter(f => f.activo || f.cal_propias || f.serp_propias || f.cal_desde_serp || f.serp_desde_cal).map(f => {
                        const ok = Math.abs(f.cal_propias - f.serp_desde_cal) < 0.01 && Math.abs(f.serp_propias - f.cal_desde_serp) < 0.01;
                        return <SView key={f.key_sucursal_cal} row style={{ paddingVertical: 4, borderBottomWidth: 1, borderColor: STheme.color.card }}>
                            <SView flex={2}><SText fontSize={12}>{f.sucursal ?? corto(f.key_sucursal_cal)}{f.activo ? "" : " (inactiva)"}</SText></SView>
                            <SView flex={1}><SText fontSize={12}>{moneda(f.cal_propias)}</SText></SView>
                            <SView flex={1}><SText fontSize={12}>{moneda(f.serp_desde_cal)}</SText></SView>
                            <SView flex={1}><SText fontSize={12}>{moneda(f.serp_propias)}</SText></SView>
                            <SView flex={1}><SText fontSize={12}>{moneda(f.cal_desde_serp)}</SText></SView>
                            <SView flex={1}><SText fontSize={12} bold color={ok ? STheme.color.success : STheme.color.danger}>{ok ? "Cuadra" : "No cuadra"}</SText></SView>
                        </SView>
                    })}
                </SView>}
        </SView>
    }

    renderEventos() {
        return <Tabla refTabla={r => this.tabla = r} load={() => this.cargar(() => getEventos(""))} onSelect={(e) => {
            const o = e.row, options = [];
            if (["ERROR", "REVISAR", "PENDIENTE", "OMITIDO"].includes(o.state) && puede("configurar")) options.push({
                label: "Reintentar ahora", icon: <SIcon name="Reload" fill={STheme.color.text} />, onPress: () => reprocesarEvento(o.key).then(r => {
                    aviso(est(r?.state).label, r?.error ?? "", r?.state == "HECHO" ? STheme.color.success : STheme.color.warning); this.tabla?.loadData();
                }).catch(err => aviso("No se pudo", err?.error))
            });
            if (["ERROR", "REVISAR", "PENDIENTE"].includes(o.state) && puede("configurar")) options.push({
                label: "Omitir (no sincronizar)", icon: <SIcon name="Delete" fill={STheme.color.text} />, onPress: () => SPopup.confirm({
                    title: "Omitir este evento", message: "No se va a copiar al otro sistema. Usalo solo si ya lo resolviste a mano.",
                    onPress: () => omitirEvento(o.key, "desde el panel").then(() => this.tabla?.loadData())
                })
            });
            if (o.origen == "calistenia" && o.tipo == "venta" && o.key_destino) options.push({ label: "Ver venta en S-ERP", icon: <SIcon name="Eyes" fill={STheme.color.text} />, onPress: () => SNavigation.navigate("/venta/profile2", { pk: o.key_destino }) });
            if (o.origen == "serp" && o.tipo == "venta") options.push({ label: "Ver venta en S-ERP", icon: <SIcon name="Eyes" fill={STheme.color.text} />, onPress: () => SNavigation.navigate("/venta/profile2", { pk: o.key_origen }) });
            if (options.length) FloatMenu.open({ e: e.evt, label: `${TIPOS[o.tipo] ?? o.tipo} ${corto(o.key_origen)}`, options });
        }}>
            <DinamicTable.Col key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }} data={e => e.index + 1} width={30} />
            <DinamicTable.Col key='fecha_on' label='Fecha' data={e => fecha(e.row.fecha_on)} width={130} />
            <DinamicTable.Col key='origen' label='Sentido' data={e => ORIGENES[e.row.origen] ?? e.row.origen} width={150} />
            <DinamicTable.Col key='tipo' label='Tipo' data={e => TIPOS[e.row.tipo] ?? e.row.tipo} width={120} />
            <DinamicTable.Col key='key_origen' label='Origen' data={e => corto(e.row.key_origen)} width={90} />
            <DinamicTable.Col key='key_destino' label='Destino' data={e => corto(e.row.key_destino)} width={90} />
            <DinamicTable.Col key='state' label='Estado' width={150} data={e => est(e.row.state).label}
                customComponent={e => { const s = est(e.row.state); return <SText color={STheme.color[s.color]}>{s.label}</SText> }} />
            <DinamicTable.Col key='intentos' label='Intentos' data={e => e.row.intentos ?? 0} width={70} />
            <DinamicTable.Col key='error' label='Detalle' data={e => e.row.error ?? ""} width={360} />
        </Tabla>
    }

    renderSucursales() {
        const editar = (s, data, titulo, mensaje) => SPopup.confirm({
            title: titulo, message: mensaje,
            onPress: () => guardarSucursal({ key: s.key, ...data }).then(() => this.tabla?.loadData()).catch(e => aviso("No se pudo", e?.error))
        });
        return <Tabla refTabla={r => this.tabla = r} load={() => this.cargar(getSucursales)} onSelect={(e) => {
            const s = e.row;
            if (!puede("configurar")) return;
            FloatMenu.open({
                e: e.evt, label: s.sucursal, options: [
                    {
                        label: s.activo ? "Apagar la sincronización de esta sucursal" : "Activar la sincronización de esta sucursal", icon: <SIcon name="Reload" fill={STheme.color.text} />,
                        onPress: () => editar(s, { activo: !s.activo }, s.activo ? "Apagar " + s.sucursal : "Activar " + s.sucursal,
                            s.activo ? "Las ventas nuevas de esta sucursal dejan de copiarse." : "Las ventas de esta sucursal se copian desde ahora (las anteriores no).")
                    },
                    {
                        label: s.molinete == "serp" ? "Molinete: pasar a Calistenia" : "Molinete: pasar a S-ERP", icon: <SIcon name="Ajustes" fill={STheme.color.text} />,
                        onPress: () => editar(s, { molinete: s.molinete == "serp" ? "calistenia" : "serp" }, "Dueño del molinete",
                            "Solo un sistema debe cargar los clientes en el molinete de la sucursal.")
                    },
                ]
            });
        }}>
            <DinamicTable.Col key='sucursal' label='Sucursal S-ERP' data={e => e.row.sucursal} width={170} />
            <DinamicTable.Col key='sucursal_cal' label='Sucursal Calistenia' data={e => e.row.sucursal_cal} width={170} />
            <DinamicTable.Col key='activo' label='Sincroniza' width={100} data={e => e.row.activo ? "Sí" : "No"}
                customComponent={e => <SText bold color={e.row.activo ? STheme.color.success : STheme.color.lightGray}>{e.row.activo ? "Sí" : "No"}</SText>} />
            <DinamicTable.Col key='fecha_desde' label='Desde' data={e => fecha(e.row.fecha_desde)} width={130} />
            <DinamicTable.Col key='molinete' label='Molinete' data={e => e.row.molinete == "serp" ? "S-ERP" : "Calistenia"} width={100} />
            <DinamicTable.Col key='pv' label='Punto de venta' data={e => e.row.key_punto_venta ? "Calistenia (sistema antiguo)" : "—"} width={190} />
        </Tabla>
    }

    renderPlanes() {
        return <Tabla refTabla={r => this.tabla = r} load={() => this.cargar(getPaquetes)}>
            <DinamicTable.Col key='cal' label='Plan en Calistenia' data={e => e.row.cal?.descripcion ?? ""} width={200} />
            <DinamicTable.Col key='cal_precio' label='Precio' data={e => moneda(e.row.cal?.precio)} width={90} />
            <DinamicTable.Col key='cal_dias' label='Días' data={e => e.row.cal?.dias ?? ""} width={60} />
            <DinamicTable.Col key='serp' label='Plan en S-ERP' data={e => e.row.serp?.descripcion ?? ""} width={200} />
            <DinamicTable.Col key='serp_precio' label='Precio' data={e => moneda(e.row.serp?.precio_venta)} width={90} />
            <DinamicTable.Col key='serp_dias' label='Duración' data={e => `${e.row.serp?.duracion ?? ""} ${e.row.serp?.duracion_medida ?? ""}`} width={90} />
            <DinamicTable.Col key='caja' label='Se vende en caja' data={e => e.row.serp?.venta_caja === false ? "No" : "Sí"} width={110} />
            <DinamicTable.Col key='origen' label='Manda' data={e => e.row.origen == "serp" ? "S-ERP" : "Calistenia"} width={90} />
            <DinamicTable.Col key='igual' label='¿Iguales?' width={90} data={e => {
                const c = e.row.cal ?? {}, s = e.row.serp ?? {};
                return c.descripcion == s.descripcion && Math.abs((c.precio ?? 0) - (s.precio_venta ?? 0)) < 0.01 ? "Sí" : "No";
            }} />
        </Tabla>
    }

    renderPagos() {
        return <Tabla refTabla={r => this.tabla = r} load={() => this.cargar(getTiposPago)}>
            <DinamicTable.Col key='cal' label='Calistenia' data={e => TIPOS_PAGO_CAL[e.row.key_tipo_pago_cal] ?? e.row.key_tipo_pago_cal} width={120} />
            <DinamicTable.Col key='suc' label='Sucursal' data={e => e.row.key_sucursal_cal ? "Solo una sucursal" : "Todas"} width={130} />
            <DinamicTable.Col key='sentido' label='Sentido' data={e => ({ ambos: "Ambos", cal_a_serp: "Calistenia → S-ERP", serp_a_cal: "S-ERP → Calistenia" })[e.row.sentido] ?? e.row.sentido} width={150} />
            <DinamicTable.Col key='etp' label='Tipo de pago S-ERP' data={e => corto(e.row.key_empresa_tipo_pago)} width={120} />
        </Tabla>
    }

    renderClientes() {
        return <Tabla refTabla={r => this.tabla = r} load={() => this.cargar(getClientes)} onSelect={(e) => SNavigation.navigate("/cliente/profile", { pk: e.row.key_cliente })}>
            <DinamicTable.Col key='fecha_on' label='Enlazado' data={e => fecha(e.row.fecha_on)} width={130} />
            <DinamicTable.Col key='ci' label='CI' data={e => e.row.ci ?? ""} width={110} />
            <DinamicTable.Col key='metodo' label='Cómo' data={e => ({ ci: "Mismo CI", creado_en_serp: "Creado en S-ERP", creado_en_cal: "Creado en Calistenia", manual: "Manual" })[e.row.metodo] ?? e.row.metodo} width={150} />
            <DinamicTable.Col key='key_cliente' label='Cliente S-ERP' data={e => corto(e.row.key_cliente)} width={110} />
            <DinamicTable.Col key='key_usuario_cal' label='Usuario Calistenia' data={e => corto(e.row.key_usuario_cal)} width={130} />
        </Tabla>
    }

    render() {
        const { tab } = this.state;
        const cuerpo = { estado: () => this.renderEstado(), eventos: () => this.renderEventos(), sucursales: () => this.renderSucursales(),
            planes: () => this.renderPlanes(), pagos: () => this.renderPagos(), clientes: () => this.renderClientes() }[tab]();
        return <SPage title={"Sync Calistenia"} disableScroll={tab != "estado"}>
            <SView row style={{ paddingHorizontal: 8, paddingTop: 8, flexWrap: "wrap" }}>
                {TABS.map(([k, label]) => {
                    const on = k == tab;
                    return <SView key={k} center onPress={on ? null : () => this.setState({ tab: k })}
                        style={{ height: 32, paddingHorizontal: 14, marginRight: 4, marginBottom: 4, borderRadius: 8, borderWidth: 1,
                            borderColor: on ? STheme.color.text : STheme.color.card, backgroundColor: on ? STheme.color.card : "transparent" }}>
                        <SText fontSize={13} bold={on}>{label}</SText>
                    </SView>
                })}
            </SView>
            {tab == "estado" ? <SView col={"xs-12"} style={{ padding: 12 }}>{cuerpo}</SView> : <SView col={"xs-12"} flex key={tab}>{cuerpo}</SView>}
        </SPage>
    }
}
