import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SIcon, SMath, SNotification, SLoad, SInput } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../Config';
import MDL from '../../MDL';
import FechaFullFilter2 from '../../Components/FechaFullFilter2';

export default class tabla_transacciones3 extends Component {
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

    componentDidMount() {
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            const keyEmpresa = await MDL?.empresa?.select?.key;
            const keyCliente = this.key;
            const fecha_inicio_total = "2024-01-01";
            const fecha_inicio = this.state.fecha_inicio;
            const fecha_fin = this.state.fecha_fin;

            if (!keyEmpresa || !keyCliente) return [];

            const ventas = await MDL.compra_venta.execute_function("_get_cuotas_pendientes", [keyEmpresa, keyCliente]);
            
            const cliente = await MDL.crm.cliente.getByKey(keyCliente);

            if (!ventas || ventas.length === 0) {
                this.setState({ cliente: cliente || {}, moneda: null, ventasEnriquecidas: [] });
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

            let ventasEnriquecidas = ventas.map((v) => {
                const debe = v.debe || 0;
                const haber = v.haber || 0;
                return {
                    ...v,
                    moneda: monedasMap[v?.key_moneda] || {},
                    sucursal: sucursalesMap[v?.key_sucursal] || {},
                    usuario: usuariosMap[v?.key_usuario] || {},
                    almacen: almacenesMap[v?.key_almacen] || {},
                    cliente: cliente || {},
                };
            });

            let saldoAnterior = 0;
            ventasEnriquecidas.forEach(item => {
                const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
                if (fechaItem < fecha_inicio) {
                    saldoAnterior = item.saldo;
                }
            });

            this.setState({
                cliente: cliente || {},
                moneda: ventasEnriquecidas[0]?.moneda || null,
                ventasEnriquecidas,
            });
            return ventasEnriquecidas;
        } catch (error) {
            console.error("Error en loadInitialData:", error);
            SPopup.alert("Error al cargar los datos.");
            return [];
        }
    }

    mostrarTabla() {
        return (
            <SView col={'xs-12'} style={{ width: 950, alignSelf: 'center' }} flex>
                <DinamicTable
                    ref={ref => (this.DinamicTable = ref)}
                    loadData={this.loadInitialData.bind(this)}
                    key="id"
                    language="es"
                    center
                    {...Config.table.applyTheme()}
                    selectType="single"
                    keyExtractor={(e) => e?.key_compra_venta || e?.key_cuota}
                >
                    <DinamicTable.Col
                        key="index"
                        label="N°"
                        width={30}
                        data={(e) => (e?.index ?? 0) + 1}
                        cellStyle={(e) =>
                            e?.row?.descripcion === "Saldo anterior"
                                ? { backgroundColor: '#e8f4fd' }
                                : {}
                        }
                    />

                    <DinamicTable.Col
                        key="key_cuota"
                        label="key_cuota"
                        width={180}
                        data={(e) => e?.row?.key_cuota}
                    />

                    <DinamicTable.Col
                        key="fecha_on"
                        label="Fecha"
                        width={80}
                        data={(e) =>
                            e?.row?.fecha_on ? new SDate(e.row.fecha_on).toString("dd/MM/yyyy") : ""
                        }

                    />



                    <DinamicTable.Col
                        key="descripcion"
                        label="Descripción"
                        width={110}
                        data={(e) => e?.row?.descripcion}
                    />

                    <DinamicTable.Col
                        key="monto"
                        label="Monto"
                        width={120}
                        data={(e) => e?.row?.monto ?? 0}
                        cellStyle={{ alignItems: "flex-end" }}
                        format={(e) => `${SMath.formatMoney(e.data || 0)}`}
                        // footerComponent={(e) => {
                        //     const total = e.dinamicTable.data.reduce((sum, row) => sum + (row.monto || 0), 0);
                        //     return (
                        //         <SView>
                        //             <SText color={STheme.color.lightGray}>
                        //                 {SMath.formatMoney(total)}
                        //             </SText>
                        //         </SView>
                        //     );
                        // }}
                    />
                    <DinamicTable.Col
                        key="total_amortizado"
                        label="total_amortizado"
                        width={120}
                        data={(e) => e?.row?.total_amortizado ?? 0}
                        cellStyle={{ alignItems: "flex-end" }}
                        format={(e) => `${SMath.formatMoney(e.data || 0)}`}
                       
                    />


                    <DinamicTable.Col
                        key="fecha_pago"
                        label="fecha pago"
                        width={90}
                        data={(e) =>
                            e?.row?.fecha_on ? new SDate(e.row.fecha_pago).toString("dd/MM/yyyy") : ""
                        }

                    />

                </DinamicTable>
            </SView>
        );
    }


    render() {
        const { cliente } = this.state;
        return (
            <SPage title="Kardex Individual" disableScroll>
                <SView row col={"xs-12"}>
                    <SHr /><SHr />
                    <SView col={"xs-12"} row center style={{ flexWrap: "wrap", gap: 12 }} border={"transparent"} >
                        <SView col={"xs-12 sm-7.5"} row center>
                            <FechaFullFilter2
                                label="fecha"
                                key_opciones="hoy"
                                onChange={e => {
                                    this.state.fecha_inicio = e.fecha_inicio;
                                    this.state.fecha_fin = e.fecha_fin;
                                    this.DinamicTable.loadData();
                                }}
                            />
                        </SView>
                    </SView>
                    <SHr /><SHr height={10} />
                    <SView col={"xs-12"} row border={"transparent"}>
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