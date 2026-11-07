import React, { Component } from 'react';
import { SIcon, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import SCopy from '../../Components/SCopy';
import Nav from './Nav';
import { ESTADOS_ORDEN, URL, est, fecha, getOrdenes, moneda, nombreCliente, reprocesarOrden } from './api';

const puede = (permiso) => !!MDL.rolesPermisos.getPermiso({ url: URL, permiso });

// Órdenes de la página web: cada compra, su pago y la venta que generó. Las que quedaron en error se reprocesan.
export default class ordenes extends Component {
    state = { rows: [] };

    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: URL, permiso: "ver" }).then(e => { if (!e) return SNavigation.goBack(); this.forceUpdate(); });
    }

    async loadData() {
        try {
            const rows = await getOrdenes({});
            this.setState({ rows });
            return rows;
        } catch (e) {
            SNotification.send({ title: "Error", body: e?.error ?? "No se pudo cargar las órdenes.", color: STheme.color.danger, time: 4000 });
            return [];
        }
    }

    reprocesar(o) {
        SPopup.confirm({
            title: "Reintentar registrar la venta", message: "Se vuelve a intentar registrar la venta de esta orden (no se cobra de nuevo).",
            onPress: () => reprocesarOrden(o.key).then(r => {
                SNotification.send({ title: r?.state == "VENTA" ? "Venta registrada" : "Sigue sin registrarse", body: r?.error ?? "", color: r?.state == "VENTA" ? STheme.color.success : STheme.color.warning, time: 5000 });
                this.table?.loadData();
            }).catch(e => SNotification.send({ title: "No se pudo", body: e?.error ?? "", color: STheme.color.danger, time: 5000 }))
        });
    }

    render() {
        return <SPage title={"Tienda web · Órdenes"} disableScroll>
            <Nav activo="/ordenes" />
            <DinamicTable
                ref={ref => this.table = ref}
                selectType="single"
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'
                loadData={this.loadData.bind(this)}
                onSelect={(e) => {
                    const o = e.row, options = [];
                    if (o.key_compra_venta) options.push({ label: "Ver venta", icon: <SIcon name="Eyes" fill={STheme.color.text} />, onPress: () => SNavigation.navigate("/venta/profile2", { pk: o.key_compra_venta }) });
                    if (o.key_contrato) options.push({ label: "Ver contrato", icon: <SIcon name="Eyes" fill={STheme.color.text} />, onPress: () => SNavigation.navigate(URL + "/contrato", { pk: o.key_contrato }) });
                    if (["PAGADA", "ERROR"].includes(o.state) && puede("configurar")) options.push({ label: "Reintentar registrar la venta", icon: <SIcon name="Reload" fill={STheme.color.text} />, onPress: () => this.reprocesar(o) });
                    if (o.url_pago) options.push({ label: "Copiar link de pago", icon: <SIcon name="Paper" fill={STheme.color.text} />, onPress: () => SCopy.copy(o.url_pago) });
                    FloatMenu.open({ e: e.evt, label: nombreCliente(o.cliente), options });
                }}
            >
                <DinamicTable.Col key='index' textStyle={{ fontSize: 10, color: STheme.color.lightGray }} data={e => e.index + 1} width={30} />
                <DinamicTable.Col key='fecha_on' label='Fecha' data={e => fecha(e.row.fecha_on)} width={130} />
                <DinamicTable.Col key='cliente' label='Cliente' data={e => nombreCliente(e.row.cliente)} width={170} />
                <DinamicTable.Col key='ci' label='CI' data={e => e.row.cliente?.ci ?? ""} width={90} />
                <DinamicTable.Col key='plan' label='Plan' data={e => e.row.descripcion} width={130} />
                <DinamicTable.Col key='modalidad' label='Modalidad' data={e => e.row.modalidad == "cuotas" ? "Cuotas" : "Pago único"} width={90} />
                <DinamicTable.Col key='monto' label='Pagado' data={e => Number(e.row.monto)} width={90} customComponent={e => <SText>{moneda(e.row.monto)}</SText>} />
                <DinamicTable.Col key='state' label='Estado' width={150} data={e => est(ESTADOS_ORDEN, e.row.state).label}
                    customComponent={e => { const s = est(ESTADOS_ORDEN, e.row.state); return <SText color={STheme.color[s.color]}>{s.label}</SText> }} />
                <DinamicTable.Col key='venta' label='Venta' data={e => String(e.row.key_compra_venta ?? "").slice(0, 8).toUpperCase()} width={90} />
                <DinamicTable.Col key='error' label='Detalle' data={e => e.row.error ?? ""} width={260} />
                <DinamicTable.Col key='origen' label='Origen' data={e => e.row.origen ?? ""} width={170} />
            </DinamicTable>
        </SPage>
    }
}
