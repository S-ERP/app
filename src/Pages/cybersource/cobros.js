import React, { Component } from 'react';
import { SIcon, SInput, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import Nav from './Nav';
import DateTimeBetween from '../../Components/DateTimeBetween';
import { ESTADOS_COBRO, URL, dia, est, fecha, getCobros, moneda, nombreCliente } from './api';

// Mismo rango inicial que DateTimeBetween en modo "mes" (la tabla carga antes de que el selector avise).
const mesActual = () => { const n = new Date(), f = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; return [f(new Date(n.getFullYear(), n.getMonth(), 1)), f(new Date(n.getFullYear(), n.getMonth() + 1, 0))]; };

// Cobros de cuotas por fecha de vencimiento: lo cobrado, lo que falta y los rechazados (para seguimiento).
export default class cobros extends Component {
    state = { desde: mesActual()[0], hasta: mesActual()[1], filtro: "", rows: [] };

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
        const Dato = ({ label, valor, color }) => <SView style={{ marginRight: 16 }}>
            <SText fontSize={10} color={STheme.color.gray}>{label}</SText>
            <SText fontSize={14} bold color={color}>{valor}</SText>
        </SView>;
        return <SPage title={"Tienda web · Cobros de cuotas"} disableScroll>
            <Nav activo="/cobros" />
            <SView row style={{ paddingHorizontal: 8, paddingVertical: 6, alignItems: "center", flexWrap: "wrap" }}>
                <SView width={260}>
                    <DateTimeBetween fecha_inicio={s.desde} fecha_fin={s.hasta} onChange={({ fecha_inicio, fecha_fin }) => {
                        const primero = !this._periodoListo; this._periodoListo = true;
                        this.setState({ desde: fecha_inicio, hasta: fecha_fin }, () => { if (!primero) this.table?.loadData(); });
                    }} />
                </SView>
                <SView width={8} />
                <SView width={170}>
                    <SInput type="select" defaultValue="" style={{ height: 38, borderRadius: 6 }}
                        options={[{ key: "", content: "Todos los estados" }, { key: "PAGADO", content: "Pagados" }, { key: "PENDIENTE", content: "Pendientes" }, { key: "REINTENTO", content: "Reintentando" }, { key: "MORA", content: "En mora" }, { key: "INCIERTO", content: "Revisar" }, { key: "ANULADO", content: "Anulados" }]}
                        onChangeText={(v) => this.recargar({ filtro: v })} />
                </SView>
                <SView width={16} />
                <Dato label="Cobrado" valor={moneda(suma(x => x.state == "PAGADO"))} color={STheme.color.success} />
                <Dato label="Por cobrar" valor={moneda(suma(x => ["PENDIENTE", "REINTENTO", "COBRADO"].includes(x.state)))} />
                <Dato label="En mora" valor={moneda(suma(x => ["MORA", "INCIERTO"].includes(x.state)))} color={STheme.color.danger} />
                <Dato label="Reintentando" valor={r.filter(x => x.state == "REINTENTO").length} color={STheme.color.warning} />
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
