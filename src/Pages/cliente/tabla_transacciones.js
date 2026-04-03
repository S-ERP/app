import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification, SLoad } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import Config from '../../Config';
import MDL from '../../MDL';
import FechaFullFilter2 from '../../Components/FechaFullFilter2';

export default class TablaTransacciones extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
            moneda: null,
            cliente: null,
            ventasEnriquecidas: null,
        };
        this.key = SNavigation.getParam("key");
    }

    RowWithImage = ({ keyEntity, label, srcPrefix, styleText }) => {
        if (!keyEntity) return null;
        return (
            <SView col={"xs-12"} center row>
                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                    <SImage src={`${srcPrefix}${keyEntity}?date=${new Date().getTime()}`} style={{ resizeMode: "cover" }} />
                </SView>
                <SView width={5} />
                <SText flex numberOfLines={1} style={styleText}>{label}</SText>
            </SView>
        );
    }

    componentDidMount() {
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            const keyEmpresa = await MDL?.empresa?.select?.key;
            const keyCliente = this.key;
            const fecha_inicio = this.state.fecha_inicio;
            const fecha_fin = this.state.fecha_fin;

            console.clear();
            console.log("%c" + "entro a loadInitialData", `color: #cc4e2e; font-weight: bold;`);
            if (!keyEmpresa || !keyCliente) return [];
            const ventas = await MDL.compra_venta.execute_function("_get_detalles_bycliente2", [keyEmpresa, keyCliente, fecha_inicio, fecha_fin]);

            const cliente =  await MDL.crm.cliente.getByKey(keyCliente);
            console.log("%c" + "entro a loadInitialData", `color: #ccaf2e; font-weight: bold;`);

            // Si no hay ventas, igual cargamos datos del cliente para mostrar su información.
            if (!ventas || ventas.length === 0) {
                this.setState({ cliente: cliente || {}, moneda: null });
                return [];
            }
            const [empresa, usuarios = [], almacenes = []] = await Promise.all([
                MDL.empresa.getFull(),
                MDL.usuario.getByKeys([...new Set(ventas.map(v => v?.key_usuario).filter(Boolean))]),
                MDL.inventario.getAllAlmacen(),
            ]);

            const sucursalesMap = Object.fromEntries((empresa?.sucursales || []).map(s => [s.key, s]));
            const monedasMap = Object.fromEntries((empresa?.monedas || []).map(m => [m.key, m]));
            const usuariosMap = Object.fromEntries((usuarios || []).map(u => [u.key, u]));
            const almacenesMap = Object.fromEntries((almacenes || []).map(a => [a.key, a]));

            console.log("%c" + "entro a loadInitialData", `color: #0a7700; font-weight: bold;`);

            const ventasEnriquecidas = ventas.map(v => ({
                ...v,
                moneda: monedasMap[v?.key_moneda] || {},
                sucursal: sucursalesMap[v?.key_sucursal] || {},
                usuario: usuariosMap[v?.key_usuario] || {},
                almacen: almacenesMap[v?.key_almacen] || {},
                cliente: cliente || {},
            }));
            const first = ventasEnriquecidas[0];
            const last = ventasEnriquecidas[ventasEnriquecidas.length - 1];
            console.log("%c" + "entro a sss", `color: #2ECC40; font-weight: bold;`);

            console.log("%c" + JSON.stringify(cliente, null, 2), "color: #2ECC40; font-weight: bold;");

            this.state.moneda = first?.moneda;
            // this.state.cliente = cliente || {};
            this.setState({ cliente: cliente || {} });
            return ventasEnriquecidas;
        } catch (error) {
            console.error("Error en loadInitialData:", error);
            SPopup.alert("Error al cargar los datos.");
            return [];
        }
    }

    mostrarTabla() {
        // const data = this.state.ventasEnriquecidas || [];
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={this.loadInitialData.bind(this)}
                key="id"
                language="es"
                center
                {...Config.table.applyTheme()}
                selectType="single"
                keyExtractor={(e) => e?.key}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={(e) => (e?.index ?? 0) + 1} />
                <DinamicTable.Col key="fecha" label="Fecha" width={140} data={e => e?.row?.fecha_on ? new SDate(e.row.fecha_on).toString("dd/MM/yyyy") : ""} />
                <DinamicTable.Col key="tipo" label="Tipo" width={100} data={(e) => e?.row?.tipo || "-"} />
                <DinamicTable.Col key="detalle" label="Detalle" width={200} data={(e) => e?.row?.descripcion || "-"}
                    footerComponent={() => (
                        <SView style={{ alignItems: "flex-end", paddingRight: 8 }}>
                            <SText bold>Total</SText>
                        </SView>
                    )}
                />
                <DinamicTable.Col
                    key="debe"
                    label="Debe"
                    width={100}
                    data={(e) => e?.row?.debe ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.data ? `${SMath.formatMoney(e.data || 0)}` : ""}
                    footerComponent={(e) => {
                        let total = 0;
                        e.dinamicTable.data.map(a => {
                            total += a.debe || 0
                        })
                        return <SView style={{ alignItems: "center" }}>
                            <SText >{`${SMath.formatMoney(total || 0)}`}</SText>
                        </SView>
                    }}
                />
                <DinamicTable.Col
                    key="haber"
                    label="Haber"
                    width={100}
                    data={(e) => e?.row?.haber ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => e.data ? `${SMath.formatMoney(e.data || 0)}` : ""}
                    footerComponent={(e) => {
                        let total = 0;
                        e.dinamicTable.data.map(a => {
                            total += a.haber || 0
                        })
                        return <SView style={{ alignItems: "center" }}>
                            <SText> {`${SMath.formatMoney(total || 0)}`} </SText>
                        </SView>
                    }}
                />
                <DinamicTable.Col
                    key="saldo"
                    label="Saldo"
                    width={120}
                    data={(e) => e?.row?.saldo ?? 0}
                    cellStyle={{ alignItems: "flex-end" }}
                    format={(e) => `${SMath.formatMoney(e.data || 0)}`}
                    footerComponent={(e) => {
                        const lastRow = e.dinamicTable.data[e.dinamicTable.data.length - 1];
                        const totalSaldo = lastRow?.saldo || 0;
                        return (
                            <SView style={{ alignItems: "flex-end", paddingRight: 8 }}>
                                <SText>{`${SMath.formatMoney(totalSaldo)}`}</SText>
                            </SView>
                        );
                    }}
                />
            </DinamicTable>
        );
    }

    render() {
        const { cliente, moneda, fecha_inicio, fecha_fin } = this.state;

        // if (!cliente) return <SLoad />;

        return (
            <SPage title="Kardex Individual" disableScroll>
                <SView row col={"xs-12"}>
                    <SHr />
                    <SHr />
                    <SView col={"xs-12"} row center style={{ flexWrap: "wrap", gap: 12 }}>
                        <SView col={"xs-12 sm-7.5"} row center>
                            <FechaFullFilter2
                                label="fecha"
                                key_opciones="hoy"
                                onChange={e => {
                                    this.state.fecha_inicio = e.fecha_inicio;
                                    this.state.fecha_fin = e.fecha_fin;
                                    this.DinamicTable.loadData()
                                }}
                            />
                        </SView>
                    </SView>
                    <SHr />
                    <SHr height={10} />
                    <SView col={"xs-12"} row>
                        <SText fontSize={15}>Cliente: {cliente?.nombres + " " + cliente?.apellidos || "-"}</SText>
                    </SView>
                </SView>
                <SHr height={10} />
                {this.mostrarTabla()}
                <SHr height={20} />
            </SPage>
        );
    }
}