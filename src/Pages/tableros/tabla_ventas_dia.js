import React from "react";
import { SPage, SView, SText, SHr, SMath, STheme } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import FechaFullFilter2 from "../../Components/FechaFullFilter2";
import SCharts from "servisofts-charts";

const color_bajito = "#8888887a";

export default class tabla_ventas_dia extends React.Component {
    state = {
        loadingVentasPorDia: true,
        dataVentasPorDia: [],
        fecha_inicio: '2026-03-24',
        fecha_fin: '2026-03-24',
        tipo_modulo: 'venta',
        dias: []
    };

    componentDidMount() {
        this.generateDias();
        this.loadVentasPorFecha();
    }

    generateDias = () => {
        const dias = [];
        let fechaActual = new Date(this.state.fecha_inicio);
        const fechaFin = new Date(this.state.fecha_fin);
        while (fechaActual <= fechaFin) {
            dias.push({
                dia: fechaActual.getDate(),
                fecha: fechaActual.toISOString().split('T')[0]
            });
            fechaActual.setDate(fechaActual.getDate() + 1);
        }
        this.setState({ dias });
    }

    loadVentasPorFecha = async () => {
        try {
            const keyEmpresa = await MDL.empresa.select.key;
            const empresa = await MDL.empresa.getFull();
            const sucursalesFiltradas = (empresa.sucursales || [])
                .filter(s => s.estado > 0)
                .map(s => ({
                    key: s.key,
                    municipio: s.municipio,
                    descripcion: s.descripcion
                }));
            const { fecha_inicio, fecha_fin, tipo_modulo } = this.state;
            const res = await MDL.compra_venta.execute_function(
                "ventas_por_dia2",
                [keyEmpresa, tipo_modulo, fecha_inicio, fecha_fin]
            );
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const ventasMap = raw.reduce((acc, v) => { acc[v.key_sucursal] = v; return acc; }, {});
            const dataVentasPorDia = sucursalesFiltradas.map(s => {
                const venta = ventasMap[s.key] || {};
                return {
                    key_sucursal: s.key,
                    descripcion: s.descripcion,
                    dias: venta.dias || []
                };
            }).sort((a, b) => {
                const cantidadA = (a.dias || []).reduce((acc, d) => acc + (d.cantidad_ventas || 0), 0);
                const cantidadB = (b.dias || []).reduce((acc, d) => acc + (d.cantidad_ventas || 0), 0);
                return cantidadB - cantidadA;
            });
            this.setState({
                dataVentasPorDia,
                loadingVentasPorDia: false
            });
        } catch (e) {
            console.error("Error en loadVentasPorFecha:", e);
            this.setState({ loadingVentasPorDia: false });
        }
    };

    render() {
        const { dataVentasPorDia, loadingVentasPorDia, fecha_inicio, fecha_fin, tipo_modulo, dias } = this.state;
        const chartData = {};
        (dataVentasPorDia || []).forEach(item => {
            const totalCantidad = (item.dias || []).reduce((acc, d) => acc + (d.cantidad_ventas || 0), 0);
            chartData[item.descripcion] = totalCantidad;
        });
        return (
            <SPage title={tipo_modulo === "compra" ? "Reporte de compras diarias" : "Reporte de ventas diarias"}>
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>
                            Resumen del período seleccionado {tipo_modulo === "compra" ? "Compras" : "Ventas"}
                        </SText>
                        <SHr />
                        <SView col={"xs-12"} row center style={{ flexWrap: "wrap", gap: 12 }}>
                            <SView col={"xs-12 sm-7.5"} row center>
                                <FechaFullFilter2
                                    label="fecha"
                                    key_opciones="esta_semana"
                                    fecha_inicio={fecha_inicio}
                                    fecha_fin={fecha_fin}
                                    onChange={e => {
                                        this.setState({
                                            fecha_inicio: e.fecha_inicio,
                                            fecha_fin: e.fecha_fin,
                                            loadingVentasPorDia: true
                                        }, () => {
                                            this.generateDias();
                                            this.loadVentasPorFecha();
                                        });
                                    }}
                                />
                            </SView>
                        </SView>
                        <SHr />
                        <SView padding={8} style={{ textAlign: "center" }}>
                            <SText>📅 Desde: {fecha_inicio ?? "N/A"}{"\n"}📅 Hasta: {fecha_fin ?? "N/A"}{"\n"}</SText>
                        </SView>
                        <SView col={"xs-12"} row>
                            <SView col={"xs-12 lg-6"} padding={8}>
                                <SText fontSize={16} bold>{tipo_modulo === "compra" ? "Compras" : "Ventas"} por Sucursales</SText>
                                <SHr />
                                {loadingVentasPorDia ? (
                                    <SView style={{ alignItems: "center", padding: 20 }}>
                                        <SText>⏳ Cargando datos...</SText>
                                    </SView>
                                ) : Object.keys(chartData).length === 0 ? (
                                    <SText>📊 No hay datos disponibles en este período</SText>
                                ) : (
                                    <SCharts
                                        type='Bar'
                                        showControl={false}
                                        strokeWidth={1}
                                        space={0.2}
                                        padding={0.6}
                                        showLabel={true}
                                        showGuide={true}
                                        showValue={true}
                                        textColor={STheme.color.text}
                                        colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]}
                                        data={chartData}
                                    />
                                )}
                            </SView>
                            <SView col={"xs-12 lg-6"} padding={8}>
                                <SText fontSize={16} bold>
                                  Desglose diario de {tipo_modulo === "compra" ? "Compras" : "Ventas"}
                                </SText>
                                <SHr />
                                {loadingVentasPorDia ? (
                                    <SView style={{ alignItems: "center", padding: 20 }}>
                                        <SText>⏳ Cargando datos...</SText>
                                    </SView>
                                ) : dataVentasPorDia.length === 0 ? (
                                    <SText>📊 No hay datos disponibles en este período</SText>
                                ) : (
                                    <DinamicTable
                                        language={"es"}
                                        hiddenMenu
                                        textTitleStyle={{ fontSize: 12, lineHeight: 14 }}
                                        colors={{ header: "#2E86AB", textHeader: "white" }}
                                        cellStyle={{ padding: 4 }}
                                        textStyle={{ fontSize: 10 }}
                                        loadData={async () => dataVentasPorDia}
                                    >
                                        {[<DinamicTable.Col
                                            key="descripcion"
                                            label='🏢 Sucursal'
                                            width={150}
                                            data={e => e.row.descripcion}
                                            footerComponent={() => (
                                                <SView style={{ alignItems: "center" }}>
                                                    <SText bold>Total</SText>
                                                </SView>
                                            )}
                                        />,
                                        ...dias.flatMap(d => [
                                            <DinamicTable.Col
                                                key={`dia-${d.dia}-cantidad`}
                                                label={`${d.dia} - Cant`}
                                                width={70}
                                                data={e => {
                                                    const diaObj = e.row.dias.find(x => x.dia === d.dia);
                                                    return diaObj ? diaObj.cantidad_ventas : 0;
                                                }}
                                                customComponent={(e) => {
                                                    const diaObj = e.row.dias.find(x => x.dia === d.dia);
                                                    const cantidad = diaObj?.cantidad_ventas || 0;
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={10} color={cantidad < 1 ? color_bajito : STheme.color.text}>{cantidad}</SText>
                                                        </SView>
                                                    );
                                                }}
                                                footerComponent={() => {
                                                    const totalCantidad = dataVentasPorDia.reduce((acc, row) => {
                                                        const diaObj = row.dias.find(x => x.dia === d.dia);
                                                        return acc + (diaObj?.cantidad_ventas || 0);
                                                    }, 0);
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={10} bold color={totalCantidad < 1 ? color_bajito : STheme.color.text}>{totalCantidad}</SText>
                                                        </SView>
                                                    );
                                                }}
                                            />,
                                            <DinamicTable.Col
                                                key={`dia-${d.dia}-monto`}
                                                label={`${d.dia} - Bs`}
                                                width={90}
                                                data={e => {
                                                    const diaObj = e.row.dias.find(x => x.dia === d.dia);
                                                    return diaObj ? diaObj.monto_total : 0;
                                                }}
                                                customComponent={(e) => {
                                                    const diaObj = e.row.dias.find(x => x.dia === d.dia);
                                                    const monto = diaObj?.monto_total || 0;
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={9} color={monto < 1 ? color_bajito : STheme.color.text}>{`Bs. ${SMath.formatMoney(monto)}`}</SText>
                                                        </SView>
                                                    );
                                                }}
                                                footerComponent={() => {
                                                    const totalMonto = dataVentasPorDia.reduce((acc, row) => {
                                                        const diaObj = row.dias.find(x => x.dia === d.dia);
                                                        return acc + (diaObj?.monto_total || 0);
                                                    }, 0);
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={9} bold color={totalMonto < 1 ? color_bajito : STheme.color.text}>{`Bs. ${SMath.formatMoney(totalMonto)}`}</SText>
                                                        </SView>
                                                    );
                                                }}
                                            />
                                        ])
                                        ,<DinamicTable.Col
                                            key="total_sucursal"
                                            label="Total"
                                            width={80}
                                            data={e => e.row.dias.reduce((acc, d) => acc + (d.monto_total || 0), 0)}
                                            customComponent={(e) => {
                                                const totalCantidad = e.row.dias.reduce((acc, d) => acc + (d.cantidad_ventas || 0), 0);
                                                const totalMonto = e.row.dias.reduce((acc, d) => acc + (d.monto_total || 0), 0);
                                                return (
                                                    <SView style={{ alignItems: "center" }}>
                                                        {totalCantidad > 0 || totalMonto > 0 ? (
                                                            <>
                                                                <SText fontSize={10}>{`${totalCantidad} ventas`}</SText>
                                                                <SText fontSize={10}>{`Bs. ${SMath.formatMoney(totalMonto)}`}</SText>
                                                            </>
                                                        ) : null}
                                                    </SView>
                                                );
                                            }}
                                        />]}
                                    </DinamicTable>
                                )}
                            </SView>
                        </SView>
                    </SView>
                </ScrollView>
            </SPage>
        );
    }
}