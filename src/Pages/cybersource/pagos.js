import React, { Component } from 'react';
import { Linking } from 'react-native';
import { SIcon, SInput, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import SCopy from '../../Components/SCopy';
import { ESTADOS, URL, anularLink, fecha, getEstado, getPagos, moneda } from './api';
import PopupNuevoLink from './PopupNuevoLink';
import Nav from './Nav';
import DateTimeBetween from '../../Components/DateTimeBetween';
import FiltroSelect from './FiltroSelect';

const puede = (permiso) => !!MDL.rolesPermisos.getPermiso({ url: URL, permiso });
// Mismo rango inicial que DateTimeBetween en modo "mes" (la tabla carga antes de que el selector avise).
const mesActual = () => { const n = new Date(), f = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; return [f(new Date(n.getFullYear(), n.getMonth(), 1)), f(new Date(n.getFullYear(), n.getMonth() + 1, 0))]; };
const estado = (row) => ESTADOS[row.state] ?? { label: row.state, color: "gray" };



// Reporte de pagos con tarjeta de la empresa (links de pago Cybersource).
export default class pagos extends Component {
    state = { desde: mesActual()[0], hasta: mesActual()[1], filtroEstado: "", rows: [], estadoComercio: null };

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "ver" }).then(e => {
            if (!e) return SNavigation.goBack();
            this.forceUpdate();
            getEstado().then(estadoComercio => this.setState({ estadoComercio })).catch(() => { });
        })
    }

    async loadData() {
        try {
            const rows = await getPagos({ desde: this.state.desde, hasta: this.state.hasta, state: this.state.filtroEstado });
            rows.sort((a, b) => String(b.fecha_on).localeCompare(String(a.fecha_on)));
            this.setState({ rows });
            return rows;
        } catch (e) {
            SNotification.send({ title: "Error", body: e?.error ?? "No se pudo cargar los pagos.", color: STheme.color.danger, time: 4000 });
            return [];
        }
    }

    recargar = (cambios) => this.setState(cambios, () => this.table?.loadData());

    anular(row) {
        SPopup.confirm({
            title: "Anular link de pago",
            message: `¿Anular el link de ${moneda(row.monto, row.moneda)} (${row.descripcion})? El cliente ya no podrá pagarlo.`,
            onPress: () => anularLink(row.key).then(() => {
                SNotification.send({ title: "Link anulado", body: row.descripcion, color: STheme.color.success, time: 3000 });
                this.table?.loadData();
            }).catch(e => SNotification.send({ title: "No se pudo anular", body: e?.error ?? "", color: STheme.color.danger, time: 5000 }))
        })
    }

    renderAviso() {
        const c = this.state.estadoComercio;
        if (!c || (c.configurado && c.activo)) return c?.ambiente == "test"
            ? <SView style={{ padding: 8, paddingHorizontal: 12, marginHorizontal: 8, borderRadius: 8, backgroundColor: STheme.color.warning + "33" }}>
                <SText fontSize={12}>Ambiente de PRUEBAS: los cobros no son reales. Usa las tarjetas de prueba de Linkser.</SText>
            </SView> : null;
        return <SView style={{ padding: 10, margin: 8, borderRadius: 8, backgroundColor: STheme.color.danger + "22" }}
            onPress={puede("configurar") ? () => SNavigation.navigate(URL + "/configuracion") : null}>
            <SText>{c.configurado ? "El cobro con tarjeta está desactivado." : "La empresa no tiene configurado el cobro con tarjeta."}
                {puede("configurar") ? " Toca aquí para configurarlo." : " Pídeselo al administrador."}</SText>
        </SView>
    }

    // Una sola barra compacta: período estándar del sistema, estado, totales y nuevo link (la tabla usa el resto).
    renderBarra() {
        const s = this.state, r = s.rows;
        const pagados = r.filter(x => x.state == "AUTHORIZED");
        const pendientes = r.filter(x => ["CREADA", "SETUP", "PENDING_AUTHENTICATION", "AUTHORIZED_PENDING_REVIEW"].includes(x.state)).length;
        const rechazados = r.filter(x => ["DECLINED", "ERROR"].includes(x.state)).length;
        const Dato = ({ label, valor, color }) => <SView style={{ marginRight: 16 }}>
            <SText fontSize={10} color={STheme.color.gray}>{label}</SText>
            <SText fontSize={14} bold color={color}>{valor}</SText>
        </SView>;
        return <SView row style={{ paddingHorizontal: 8, paddingVertical: 6, alignItems: "center", flexWrap: "wrap" }}>
            <SView width={350}>
                <DateTimeBetween fecha_inicio={s.desde} fecha_fin={s.hasta} onChange={({ fecha_inicio, fecha_fin }) => {
                    const primero = !this._periodoListo; this._periodoListo = true;
                    this.setState({ desde: fecha_inicio, hasta: fecha_fin }, () => { if (!primero) this.table?.loadData(); });
                }} />
            </SView>
            <SView width={8} />
            <FiltroSelect label="Estado" options={[["", "Todos los estados"], ["AUTHORIZED", "Pagados"], ["CREADA", "Pendientes"], ["DECLINED", "Rechazados"], ["ANULADA", "Anulados"], ["REEMBOLSADA", "Reembolsados"]]} onChange={(v) => this.setState({ filtroEstado: v }, () => this.table?.loadData())} />
            <SView width={16} />
            <Dato label="Cobrado" valor={moneda(pagados.reduce((a, x) => a + Number(x.monto ?? 0), 0))} color={STheme.color.success} />
            <Dato label="Aprobados" valor={pagados.length} />
            <Dato label="Pendientes" valor={pendientes} color={STheme.color.warning} />
            <Dato label="Rechazados" valor={rechazados} color={STheme.color.danger} />
            <SView flex />
            {!puede("new") ? null : <SView card center onPress={() => PopupNuevoLink.open({ onCreate: () => this.table?.loadData() })}
                style={{ height: 34, paddingHorizontal: 14, borderRadius: 8, backgroundColor: STheme.color.success }}>
                <SText color={"#fff"} bold>+ Nuevo link de pago</SText>
            </SView>}
        </SView>
    }

    render() {
        return <SPage title={"Cybersource · Pagos con tarjeta"} disableScroll>
            <Nav activo="" />
            {this.renderAviso()}
            {this.renderBarra()}
            <DinamicTable
                ref={ref => this.table = ref}
                selectType="single"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'
                loadData={this.loadData.bind(this)}
                onSelect={(e) => {
                    const row = e.row, options = [];
                    const abierto = !["AUTHORIZED", "ANULADA"].includes(row.state);
                    options.push({ label: "Copiar link", icon: <SIcon name="Paper" fill={STheme.color.text} />, onPress: () => SCopy.copy(row.url) });
                    options.push({ label: "Abrir página de pago", icon: <SIcon name="Eyes" fill={STheme.color.text} />, onPress: () => Linking.openURL(row.url) });
                    if (row.cybs_id) options.push({ label: "Copiar referencia Cybersource", icon: <SIcon name="Paper" fill={STheme.color.text} />, onPress: () => SCopy.copy(row.cybs_id) });
                    if (abierto && puede("delete")) options.push({ label: "Anular link", icon: <SIcon name="Delete" fill={STheme.color.text} />, onPress: () => this.anular(row) });
                    FloatMenu.open({ e: e.evt, label: row.descripcion, options })
                }}
            >
                <DinamicTable.Col key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }} data={e => e.index + 1} width={30} />
                <DinamicTable.Col key='fecha_on' label='Creado' data={e => fecha(e.row.fecha_on)} width={130} />
                <DinamicTable.Col key='descripcion' label='Concepto' data={e => e.row.descripcion} width={220} />
                <DinamicTable.Col key='cliente' label='Cliente' data={e => e.row.cliente?.nombre || e.row.cliente?.email || ""} width={160} />
                <DinamicTable.Col key='monto' label='Monto' data={e => Number(e.row.monto ?? 0)} width={100}
                    customComponent={e => <SText>{moneda(e.row.monto, e.row.moneda)}</SText>} />
                <DinamicTable.Col key='state' label='Estado' width={120} data={e => estado(e.row).label}
                    customComponent={e => { const s = estado(e.row); return <SText color={STheme.color[s.color] ?? STheme.color.text}>{s.label}</SText> }} />
                <DinamicTable.Col key='fecha_pago' label='Pagado' data={e => fecha(e.row.fecha_pago)} width={130} />
                <DinamicTable.Col key='tarjeta' label='Tarjeta' data={e => e.row.tarjeta ?? ""} width={90} />
                <DinamicTable.Col key='aprobacion' label='Autorización' data={e => e.row.aprobacion ?? ""} width={100} />
                <DinamicTable.Col key='cybs_id' label='Referencia Cybersource' data={e => e.row.cybs_id ?? ""} width={190} />
                <DinamicTable.Col key='mensaje' label='Detalle' data={e => e.row.state == "AUTHORIZED" ? "" : (e.row.mensaje ?? "")} width={220} />
            </DinamicTable>
        </SPage>
    }
}
