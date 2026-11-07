import React, { Component } from 'react';
import { SIcon, SInput, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import Nav from './Nav';
import { ESTADOS_COBRO, URL, dia, est, fecha, getCobros, moneda, nombreCliente } from './api';

const ymd = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const PERIODOS = {
    hoy: () => { const d = ymd(new Date()); return [d, d]; },
    mes: () => { const n = new Date(); return [ymd(new Date(n.getFullYear(), n.getMonth(), 1)), ymd(new Date(n.getFullYear(), n.getMonth() + 1, 0))]; },
    proximo: () => { const n = new Date(); return [ymd(new Date(n.getFullYear(), n.getMonth() + 1, 1)), ymd(new Date(n.getFullYear(), n.getMonth() + 2, 0))]; },
    vencidos: () => ["", ymd(new Date())],
    todo: () => ["", ""],
};

const Chip = ({ label, active, onPress }) => <SView card center onPress={onPress}
    style={{ height: 30, paddingHorizontal: 12, borderRadius: 15, marginRight: 6, marginBottom: 4, backgroundColor: active ? STheme.color.primary : STheme.color.card }}>
    <SText fontSize={12} color={active ? "#fff" : STheme.color.text}>{label}</SText>
</SView>

const Kpi = ({ label, valor, color }) => <SView card style={{ padding: 12, borderRadius: 10, minWidth: 150, marginRight: 8, marginBottom: 8 }}>
    <SText fontSize={12} color={STheme.color.gray}>{label}</SText>
    <SText fontSize={20} bold color={color}>{valor}</SText>
</SView>

// Cobros de cuotas por fecha de vencimiento: lo cobrado, lo que falta y los rechazados (para seguimiento).
export default class cobros extends Component {
    state = { periodo: "mes", desde: PERIODOS.mes()[0], hasta: PERIODOS.mes()[1], filtro: "", rows: [] };

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "ver" }).then(e => { if (!e) return SNavigation.goBack(); this.forceUpdate(); });
    }

    async loadData() {
        try {
            const rows = await getCobros({ desde: this.state.desde, hasta: this.state.hasta, state: this.state.filtro });
            this.setState({ rows });
            return rows;
        } catch (e) {
            SNotification.send({ title: "Error", body: e?.error ?? "No se pudo cargar los cobros.", color: STheme.color.danger, time: 4000 });
            return [];
        }
    }

    recargar = (cambios) => this.setState(cambios, () => this.table?.loadData());

    render() {
        const s = this.state, r = s.rows;
        const suma = (f) => r.filter(f).reduce((a, x) => a + Number(x.monto ?? 0), 0);
        const fechaInput = (k) => <SInput placeholder="AAAA-MM-DD" value={s[k]} style={{ height: 30, width: 120, borderRadius: 6 }}
            onChangeText={(v) => { this.setState({ [k]: v, periodo: "" }); if (/^\d{4}-\d{2}-\d{2}$/.test(v) || v == "") this.recargar({ [k]: v }); }} />;
        return <SPage title={"Tienda web · Cobros de cuotas"} disableScroll>
            <Nav activo="/cobros" />
            <SView row style={{ paddingHorizontal: 8, paddingTop: 8, flexWrap: "wrap" }}>
                <Kpi label="Cobrado" valor={moneda(suma(x => x.state == "PAGADO"))} color={STheme.color.success} />
                <Kpi label="Por cobrar" valor={moneda(suma(x => ["PENDIENTE", "REINTENTO", "COBRADO"].includes(x.state)))} />
                <Kpi label="En mora" valor={moneda(suma(x => ["MORA", "INCIERTO"].includes(x.state)))} color={STheme.color.danger} />
                <Kpi label="Reintentando" valor={r.filter(x => x.state == "REINTENTO").length} color={STheme.color.warning} />
            </SView>
            <SView row style={{ padding: 8, alignItems: "center", flexWrap: "wrap" }}>
                {[["hoy", "Hoy"], ["mes", "Este mes"], ["proximo", "Mes próximo"], ["vencidos", "Hasta hoy"], ["todo", "Todo"]].map(([k, l]) =>
                    <Chip key={k} label={l} active={s.periodo == k} onPress={() => { const [desde, hasta] = PERIODOS[k](); this.recargar({ periodo: k, desde, hasta }); }} />)}
                <SView width={8} />
                {fechaInput("desde")}<SText>{"  a  "}</SText>{fechaInput("hasta")}
                <SView width={12} />
                {[["", "Todos"], ["PAGADO", "Pagados"], ["PENDIENTE", "Pendientes"], ["REINTENTO", "Reintentando"], ["MORA", "En mora"], ["INCIERTO", "Revisar"]].map(([k, l]) =>
                    <Chip key={"e" + k} label={l} active={s.filtro == k} onPress={() => this.recargar({ filtro: k })} />)}
            </SView>
            <DinamicTable
                ref={ref => this.table = ref}
                selectType="single"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'
                loadData={this.loadData.bind(this)}
                onSelect={(e) => FloatMenu.open({
                    e: e.evt, label: nombreCliente(e.row.cliente), options: [
                        { label: "Ver contrato", icon: <SIcon name="Eyes" fill={STheme.color.text} />, onPress: () => SNavigation.navigate(URL + "/contrato", { pk: e.row.key_contrato }) },
                    ]
                })}
            >
                <DinamicTable.Col key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }} data={e => e.index + 1} width={30} />
                <DinamicTable.Col key='vence' label='Vence' data={e => dia(e.row.fecha_vencimiento)} width={95} />
                <DinamicTable.Col key='cliente' label='Cliente' data={e => nombreCliente(e.row.cliente)} width={170} />
                <DinamicTable.Col key='celular' label='Celular' data={e => e.row.cliente?.celular ?? ""} width={110} />
                <DinamicTable.Col key='plan' label='Plan' data={e => e.row.contrato_descripcion} width={130} />
                <DinamicTable.Col key='numero' label='Cuota' data={e => `${e.row.numero}/${e.row.cuotas}`} width={60} />
                <DinamicTable.Col key='monto' label='Monto' data={e => Number(e.row.monto)} width={90} customComponent={e => <SText>{moneda(e.row.monto)}</SText>} />
                <DinamicTable.Col key='state' label='Estado' width={150} data={e => est(ESTADOS_COBRO, e.row.state).label}
                    customComponent={e => { const x = est(ESTADOS_COBRO, e.row.state); return <SText color={STheme.color[x.color]}>{x.label}</SText> }} />
                <DinamicTable.Col key='intentos' label='Intentos' data={e => e.row.intentos || ""} width={65} />
                <DinamicTable.Col key='pagado' label='Pagado' data={e => fecha(e.row.fecha_pago)} width={130} />
                <DinamicTable.Col key='tarjeta' label='Tarjeta' data={e => e.row.tarjeta ?? ""} width={90} />
                <DinamicTable.Col key='detalle' label='Detalle' data={e => e.row.error ?? ""} width={260} />
            </DinamicTable>
        </SPage>
    }
}
