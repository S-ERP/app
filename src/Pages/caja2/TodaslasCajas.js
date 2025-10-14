// import React, { Component } from 'react';
// import { SView, SPage, SText, SHr, SScrollView2, STheme, SDate, SMath, SIcon, SNavigation, SPopup, SImage } from 'servisofts-component';
// import PopupPagoCuota from './components/PopupPagoCuota';
// import MDL from '../../MDL';
// import SIconApp from '../../Assets/SIconApp';
// import { DinamicTable } from 'servisofts-table';
// import Config from '../../Config';
// import FloatMenu from '../../Components/FloatMenu';
// import SSocket from 'servisofts-socket';

import React, { Component } from 'react';
import {
    SView, SPage, SHr, SScrollView2, STheme, SDate, SText, SImage,
    SPopup,
    SMath
} from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';

import MDL from '../../MDL';
import Config from '../../Config';

export default class TodaslasCajas extends Component {
    state = {
        data: null,
        loading: true,
        error: null,
    };

    componentDidMount() {
        this.loadInitialData();
    }

    async loadInitialData() {
        try {
            console.log("📦 Cargando movimientos de caja...");

            const empresaKey = MDL.empresa.select?.key;
            if (!empresaKey) throw new Error("Empresa no seleccionada.");

            const movimientos = await MDL.caja.getAllCajasByEmpresa(empresaKey, "2025-09-01", "2025-10-30");
            if (!Array.isArray(movimientos)) return [];

            console.log("dcuentale " + JSON.stringify(movimientos))

            const empresa = await MDL.empresa.getFull();
            const sucursales = empresa?.sucursales ?? [];
            const puntos_ventas = sucursales.flatMap(s => s.puntos_venta || []);
            // Obtener usuarios únicos
            const usuarioKeys = [...new Set(movimientos.map(m => m.key_usuario).filter(Boolean))];
            const usuarios = await MDL.usuario.getByKeys(usuarioKeys) ?? [];
            const usuarioMap = Object.fromEntries(usuarios.map(u => [u.key, u]));
            // Enriquecer los datos
            return movimientos.map(mov => ({
                ...mov,
                usuario: usuarioMap[mov.key_usuario] ?? null,
                puntos_venta: puntos_ventas.find(pv => pv.key === mov.key_punto_venta) ?? null,
                sucursal: sucursales.find(s => s.key === mov.key_sucursal) ?? null,
            }));
        } catch (error) {
            console.error("❌ Error al cargar movimientos:", error);
            // SPopup.alert("Error al cargar los movimientos. Intenta nuevamente.");
            return [];
        }
    }

    renderTabla() {
        return (
            <DinamicTable
                ref={ref => (this.DinamicTable = ref)}
                loadData={() => this.loadInitialData()}
                key="id"
                keyExtractor={e => e.key}
                language="es"
                center
                selectType="single"
                loadInitialState={async () => ({
                    sorters: [{ key: "fecha_on", order: "asc", type: "date" }]
                })}
                {...Config.table.applyTheme()}
            >
                <DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />

                <DinamicTable.Col
                    key="sucursal"
                    label="SUCURSAL"
                    width={120}
                    data={e => e.row?.sucursal?.descripcion}
                    customComponent={e => {
                        const key = e.row?.key_sucursal;
                        const descripcion = e.row?.sucursal?.descripcion;
                        return key ? (
                            <SView col="xs-12" row center>
                                <SView style={{
                                    width: 24, height: 24, borderRadius: 100,
                                    overflow: "hidden", backgroundColor: STheme.color.card + "66"
                                }}>
                                    <SImage src={`${SSocket.api.empresa}sucursal/${key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={1} style={e.textStyle}>{descripcion}</SText>
                            </SView>
                        ) : null;
                    }}
                />

                <DinamicTable.Col key="punto" label="P.VENTA" width={50} data={e => e.row.puntos_venta.descripcion} />
                <DinamicTable.Col key="fecha" label="FECHA" width={80} dataType="date" data={e => new SDate(e.row?.fecha, "yyyy-MM-dd").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd" />

                <DinamicTable.Col
                    key="estado_caja"
                    label="ESTADO"
                    width={80}
                    data={e => e.row.estado_caja}
                    customComponent={e => {
                        return (
                            <SView col={"xs-12"} row center padding={8} >
                                <SView padding={4} center row style={{ backgroundColor: e.row.estado_caja == 'cerrada' ? "#503131ff" : "#2a533cff", borderColor: e.row.estado_caja == 'cerrada' ? "#ef4444" : "#22c45e", borderWidth: 1, borderRadius: 20 }}>
                                    <SView width={6} height={6} style={{ backgroundColor: e.row.estado_caja == 'cerrada' ? "#ef4545" : "#22c45e", borderRadius: 8 }} />
                                    <SText style={{ textTransform: "uppercase", fontSize: 10, color: e.row.estado_caja == 'cerrada' ? "#ef4444" : "#22c45e" }} > {e.row.estado_caja} </SText>
                                </SView>
                            </SView>
                        );
                    }}
                />

                <DinamicTable.Col key="fecha_on" label="F.APERTURA" width={110} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
                <DinamicTable.Col key="fecha_cierre" label="F.CIERRE" width={110} dataType="date" data={e => e.row.fecha_cierre ? new SDate(e.row.fecha_cierre, "yyyy-MM-ddThh:mm:ss").date : null} dateFormat="yyyy-MM-dd hh:mm" textStyle={{ fontSize: 12, color: STheme.color.text }} />




                <DinamicTable.Col
                    key="tiempos"
                    label="DURACIÓN"
                    width={90}
                    data={e => {
                        const { fecha_on, fecha_cierre } = e.row;
                        if (!fecha_on || !fecha_cierre) return <SText color='#2596be'>En curso</SText>;
                        return (new Date(fecha_cierre).getTime() - new Date(fecha_on).getTime());
                    }}
                    format={e => {
                        const { fecha_on, fecha_cierre } = e.row;
                        if (!fecha_on || !fecha_cierre) return <SText color='#2fc4faff'>En curso</SText>;
                        // if (!fecha_on || !fecha_cierre) return <SView col={"xs-12"} row    >
                        //     <SView padding={4} center row style={{ backgroundColor: "#e8eef0ff", borderColor: "#2596be", borderWidth: 1, borderRadius: 20 }}>
                        //         <SText style={{ textTransform: "uppercase", fontSize: 10, color: "#159ecfff" }} >En curso</SText>
                        //     </SView>
                        // </SView>

                        return (new SDate(fecha_on).timeSince(new SDate(fecha_cierre)));
                    }}
                    textStyle={{ fontSize: 12, color: STheme.color.text }}
                />

                <DinamicTable.Col
                    key="total_monto_apertura"
                    wrap
                    label="MONTO APERTURA"
                    width={60}
                    data={e => e.row?.total_monto_apertura}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#007bff33" }}
                    format={e => !e.data ? "" : SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col
                    key="total_monto_venta"
                    wrap
                    label="VENTAS TOTALES"
                    width={60}
                    data={e => e.row?.total_monto_venta}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#28a74566" }}
                    format={e => !e.data ? "" : SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col
                    key="total_monto_ingresos"
                    wrap
                    label="INGRESOS TOTALES"
                    width={60}
                    data={e => e.row?.total_monto_ingresos}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#28a74533" }}
                    format={e => !e.data ? "" : SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col
                    key="total_cantidad_ingresos"
                    wrap
                    label="CANT. DE INGRESOS"
                    width={60}
                    data={e => e.row?.total_cantidad_ingresos}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#28a74533" }}
                    format={e => !e.data ? "" : SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col
                    key="total_monto_compra"
                    wrap
                    label="MONTO COMPRAS"
                    width={60}
                    data={e => e.row?.total_monto_compra}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#ffc10766" }}
                    format={e => !e.data ? "" : SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col
                    key="total_monto_egresos"
                    wrap
                    label="EGRESOS TOTALES"
                    width={60}
                    data={e => e.row?.total_monto_egresos}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#ffc10733" }}
                    format={e => !e.data ? "" : SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col
                    key="total_cantidad_egresos"
                    wrap
                    label="CANT. DE EGRESOS"
                    width={60}
                    data={e => e.row?.total_cantidad_egresos}
                    cellStyle={{ alignItems: "flex-end", backgroundColor: "#ffc10733" }}
                    format={e => !e.data ? "" : SMath.formatMoney(e.data)}
                />

                <DinamicTable.Col
                    key="admin"
                    label="CAJERO"
                    width={120}
                    data={e => e.row?.usuario?.Nombres ?? ""}
                    customComponent={e => {
                        const key = e.row?.key_usuario;
                        const nombre = e.row?.usuario?.Nombres;
                        return key ? (
                            <SView col="xs-12" row center>
                                <SView style={{
                                    width: 24, height: 24, borderRadius: 100,
                                    overflow: "hidden", backgroundColor: STheme.color.card + "66"
                                }}>
                                    <SImage src={`${SSocket.api.root}usuario/${key}`} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={5} />
                                <SText flex numberOfLines={1} style={e.textStyle}>{nombre}</SText>
                            </SView>
                        ) : null;
                    }}
                />

            </DinamicTable>
        );
    }

    render() {
        return (
            <SPage title="Tabla de Caja" disableScroll>
                <SScrollView2 disableHorizontal>
                    <SView col="xs-12" center style={{ padding: 8 }}>
                        <SHr h={16} />
                        {this.renderTabla()}
                        <SHr h={16} />
                    </SView>
                </SScrollView2>
            </SPage>
        );
    }
}

