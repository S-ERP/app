import React, { Component } from 'react';
import { SIcon, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import SCopy from '../../Components/SCopy';
import Nav from './Nav';
import { ESTADOS_CONTRATO, ESTADOS_COBRO, URL, dia, est, getContratos, moneda, nombreCliente } from './api';

const Chip = ({ label, active, onPress }) => <SView card center onPress={onPress}
    style={{ height: 30, paddingHorizontal: 12, borderRadius: 15, marginRight: 6, backgroundColor: active ? STheme.color.primary : STheme.color.card }}>
    <SText fontSize={12} color={active ? "#fff" : STheme.color.text}>{label}</SText>
</SView>

const Kpi = ({ label, valor, color }) => <SView card style={{ padding: 12, borderRadius: 10, minWidth: 150, marginRight: 8, marginBottom: 8 }}>
    <SText fontSize={12} color={STheme.color.gray}>{label}</SText>
    <SText fontSize={20} bold color={color}>{valor}</SText>
</SView>

// Tarjeta que vence antes de la última cuota del contrato.
const tarjetaVence = (k) => {
    const m = String(k.tarjeta_vence ?? "").match(/^(\d{2})\/(\d{4})$/);
    if (!m) return false;
    const fin = new Date(k.fecha_inicio); fin.setMonth(fin.getMonth() + Number(k.cuotas) - 1);
    return new Date(Number(m[2]), Number(m[1]), 0) < fin;
};

// Contratos de planes con débito automático (Fidelidad / Total) de la tienda web.
export default class contratos extends Component {
    state = { filtro: "", rows: [] };

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "ver" }).then(e => { if (!e) return SNavigation.goBack(); this.forceUpdate(); });
    }

    async loadData() {
        try {
            const rows = await getContratos({ state: this.state.filtro });
            this.setState({ rows });
            return rows;
        } catch (e) {
            SNotification.send({ title: "Error", body: e?.error ?? "No se pudo cargar los contratos.", color: STheme.color.danger, time: 4000 });
            return [];
        }
    }

    renderResumen() {
        const r = this.state.rows;
        const activos = r.filter(x => x.contrato.state == "ACTIVO");
        const morosos = r.filter(x => x.contrato.state == "MOROSO");
        const mensual = activos.concat(morosos).reduce((a, x) => a + Number(x.contrato.monto_cuota ?? 0), 0);
        return <SView row style={{ paddingHorizontal: 8, paddingTop: 8, flexWrap: "wrap" }}>
            <Kpi label="Contratos activos" valor={activos.length} color={STheme.color.success} />
            <Kpi label="Morosos" valor={morosos.length} color={STheme.color.danger} />
            <Kpi label="Cobro mensual esperado" valor={moneda(mensual)} />
            <Kpi label="Tarjetas que vencen antes de terminar" valor={r.filter(x => ["ACTIVO", "MOROSO"].includes(x.contrato.state) && tarjetaVence(x.contrato)).length} color={STheme.color.warning} />
        </SView>
    }

    render() {
        return <SPage title={"Tienda web · Contratos en cuotas"} disableScroll>
            <Nav activo="/contratos" />
            {this.renderResumen()}
            <SView row style={{ padding: 8, flexWrap: "wrap" }}>
                {[["", "Todos"], ["ACTIVO", "Activos"], ["MOROSO", "Morosos"], ["FINALIZADO", "Finalizados"], ["CANCELADO", "Cancelados"]].map(([k, l]) =>
                    <Chip key={k} label={l} active={this.state.filtro == k} onPress={() => this.setState({ filtro: k }, () => this.table?.loadData())} />)}
            </SView>
            <DinamicTable
                ref={ref => this.table = ref}
                selectType="single"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'
                loadData={this.loadData.bind(this)}
                onSelect={(e) => {
                    const k = e.row.contrato;
                    FloatMenu.open({
                        e: e.evt, label: nombreCliente(k.cliente), options: [
                            { label: "Ver contrato y cuotas", icon: <SIcon name="Eyes" fill={STheme.color.text} />, onPress: () => SNavigation.navigate(URL + "/contrato", { pk: k.key }) },
                            { label: "Ver venta", icon: <SIcon name="Paper" fill={STheme.color.text} />, onPress: () => SNavigation.navigate("/venta/profile2", { pk: k.key_compra_venta }) },
                            { label: "Copiar CI", icon: <SIcon name="Paper" fill={STheme.color.text} />, onPress: () => SCopy.copy(k.cliente?.ci ?? "") },
                        ]
                    })
                }}
            >
                <DinamicTable.Col key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }} data={e => e.index + 1} width={30} />
                <DinamicTable.Col key='cliente' label='Cliente' data={e => nombreCliente(e.row.contrato.cliente)} width={170} />
                <DinamicTable.Col key='ci' label='CI' data={e => e.row.contrato.cliente?.ci ?? ""} width={90} />
                <DinamicTable.Col key='celular' label='Celular' data={e => e.row.contrato.cliente?.celular ?? ""} width={110} />
                <DinamicTable.Col key='plan' label='Plan' data={e => e.row.contrato.descripcion} width={130} />
                <DinamicTable.Col key='state' label='Estado' width={100} data={e => est(ESTADOS_CONTRATO, e.row.contrato.state).label}
                    customComponent={e => { const s = est(ESTADOS_CONTRATO, e.row.contrato.state); return <SText color={STheme.color[s.color]}>{s.label}</SText> }} />
                <DinamicTable.Col key='pagadas' label='Pagadas' data={e => `${e.row.pagadas}/${e.row.contrato.cuotas}`} width={70} />
                <DinamicTable.Col key='mora' label='En mora' data={e => e.row.en_mora} width={70}
                    customComponent={e => <SText color={e.row.en_mora > 0 ? STheme.color.danger : STheme.color.text}>{e.row.en_mora}</SText>} />
                <DinamicTable.Col key='cuota' label='Cuota' data={e => Number(e.row.contrato.monto_cuota)} width={90} customComponent={e => <SText>{moneda(e.row.contrato.monto_cuota)}</SText>} />
                <DinamicTable.Col key='proximo' label='Próximo cobro' data={e => dia(e.row.proximo?.fecha_vencimiento)} width={110} />
                <DinamicTable.Col key='proximo_estado' label='Estado próximo' data={e => e.row.proximo ? est(ESTADOS_COBRO, e.row.proximo.state).label : ""} width={140}
                    customComponent={e => { if (!e.row.proximo) return <SText />; const s = est(ESTADOS_COBRO, e.row.proximo.state); return <SText color={STheme.color[s.color]}>{s.label}</SText> }} />
                <DinamicTable.Col key='tarjeta' label='Tarjeta' data={e => `${e.row.contrato.tarjeta ?? ""} ${e.row.contrato.tarjeta_vence ?? ""}`} width={130}
                    customComponent={e => <SText color={tarjetaVence(e.row.contrato) ? STheme.color.warning : STheme.color.text}>{`${e.row.contrato.tarjeta ?? ""}  ${e.row.contrato.tarjeta_vence ?? ""}`}</SText>} />
                <DinamicTable.Col key='inicio' label='Inicio' data={e => dia(e.row.contrato.fecha_inicio)} width={95} />
                <DinamicTable.Col key='venta' label='Venta' data={e => String(e.row.contrato.key_compra_venta ?? "").slice(0, 8).toUpperCase()} width={90} />
            </DinamicTable>
        </SPage>
    }
}
