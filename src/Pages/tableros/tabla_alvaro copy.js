import React from "react";
import { SPage, SView, SText, SHr, STheme } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import FechaFullFilter2 from "../../Components/FechaFullFilter2";
import SCharts from "servisofts-charts";

export default class TablaAlvaro extends React.Component {
    state = {
        loadingVentasPorDia: true,
        dataVentasPorDia: [],
        fecha_inicio: '2026-03-24',
        fecha_fin: '2026-03-24',
        // tipo_modulo: 'venta',
        tipo_modulo: 'compra',
    };

    componentDidMount() {
        this.loadVentasPorFecha();
    }

    loadVentasPorFecha = async () => {
        try {
            const keyEmpresa = await MDL.empresa.select.key;
            const empresa = await MDL.empresa.getFull();

            // Sucursales activas
            const sucursalesFiltradas = (empresa.sucursales || [])
                .filter(s => s.estado > 0)
                .map(s => ({
                    key: s.key,
                    municipio: s.municipio,
                    descripcion: s.descripcion
                }));

            const { fecha_inicio, fecha_fin } = this.state;

            // Llamada a la función en la base de datos
            const res = await MDL.compra_venta.execute_function(
                "ventas_por_fecha",
                [keyEmpresa, 'compra', fecha_inicio, fecha_fin]
            );

            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);

            // Combinar sucursales con ventas sin reduce
            const sucursalesConMonto = sucursalesFiltradas.map(sucursal => {
                const venta = raw.find(v => v.key_sucursal === sucursal.key) || {};
                return {
                    ...sucursal,
                    cantidad_ventas: venta.cantidad_ventas || 0,
                    monto_total: venta.monto_total || 0
                };
            })
                .sort((a, b) => b.cantidad_ventas - a.cantidad_ventas); // Orden descendente

            this.setState({
                dataVentasPorDia: sucursalesConMonto,
                loadingVentasPorDia: false
            });

        } catch (e) {
            console.error("Error en loadVentasPorFecha:", e);
            this.setState({ loadingVentasPorDia: false });
        }
    };


    render() {
        const { dataVentasPorDia, loadingVentasPorDia, fecha_inicio, fecha_fin, tipo_modulo } = this.state;
        const size = 80;
        const cellstyle = { padding: 4 };

        // Transformar datos para SCharts (objeto {label: value})
        const chartData = {};
        (dataVentasPorDia || []).forEach(item => {
            chartData[item.descripcion] = item.cantidad_ventas || 0;
        });

        return (
            <SPage title={tipo_modulo == "compra" ? "Estadísticas de Compras" : "Estadísticas de Ventas"}>
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Estadísticas de {tipo_modulo == "compra" ? "Compras" : "Ventas"}</SText>
                        <SHr />
                        {/* Selector de fechas */}
                        <SView col={"xs-12"} row center style={{ flexWrap: "wrap", gap: 12 }}>
                            <SView col={"xs-12 sm-7.5"} row center>
                                <FechaFullFilter2
                                    label="fecha"
                                    key_opciones="este_mes"
                                    fecha_inicio={fecha_inicio}
                                    fecha_fin={fecha_fin}
                                    onChange={e => {
                                        this.setState({
                                            fecha_inicio: e.fecha_inicio,
                                            fecha_fin: e.fecha_fin,
                                            loadingVentasPorDia: true
                                        }, () => {
                                            this.loadVentasPorFecha();
                                        });
                                    }}
                                />
                            </SView>
                        </SView>

                        <SHr />

                        {/* Gráfico de Ventas por Día */}
                        <SView col={"xs-12"} row>
                            <SView col={"xs-6"} padding={8}>
                                <SText fontSize={16} bold>Gráfico {tipo_modulo == "compra" ? "Compras" : "Ventas"} por Sucursales</SText>

                                {/* <SText fontSize={16} bold>Ventas por Día</SText> */}
                                <SHr />
                                {loadingVentasPorDia ? (
                                    <SText>Cargando...</SText>
                                ) : Object.keys(chartData).length === 0 ? (
                                    <SText>No hay datos disponibles</SText>
                                ) : (
                                    // <SCharts
                                    //     type='Line'
                                    //     showControl={false}
                                    //     strokeWidth={1}
                                    //     space={0.2}
                                    //     padding={0.6}
                                    //     showLabel={true}
                                    //     showGuide={true}
                                    //     showValue={true}
                                    //     textColor={STheme.color.text}
                                    //     colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]}
                                    //     data={chartData}
                                    // />

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


                            {/* Tabla de Ventas por Sucursales */}
                            <SView col={"xs-6"} padding={8}>
                                <SText fontSize={16} bold>{tipo_modulo == "compra" ? "Compras" : "Ventas"} por Sucursales</SText>
                                <SHr />
                                {loadingVentasPorDia ? (
                                    <SText>Cargando...</SText>
                                ) : dataVentasPorDia.length === 0 ? (
                                    <SText>No hay datos disponibles</SText>
                                ) : (
                                    <DinamicTable
                                        language={"es"}
                                        hiddenMenu
                                        textTitleStyle={{ fontSize: 12, lineHeight: 14 }}
                                        colors={{ header: "#2E86AB", textHeader: "white" }}
                                        cellStyle={{ padding: 4 }}
                                        textStyle={{ fontSize: 10 }}
                                        loadData={async () => dataVentasPorDia.sort((a, b) => b.cantidad_ventas - a.cantidad_ventas)}
                                    >
                                        <DinamicTable.Col
                                            key="descripcion"
                                            label='Sucursal'
                                            width={150}
                                            data={e => e.row.descripcion}
                                            footerComponent={() => (
                                                <SView style={{ alignItems: "center" }}>
                                                    <SText>Total</SText>
                                                </SView>
                                            )}
                                        />

                                        <DinamicTable.Col
                                            key="cantidad_ventas"
                                            label='Cant. Ventas'
                                            width={size}
                                            wrap
                                            cellStyle={cellstyle}
                                            data={e => e.row.cantidad_ventas}
                                            footerComponent={(e) => {
                                                let total = 0;
                                                e.dinamicTable.data.forEach(a => total += a.cantidad_ventas || 0);
                                                return <SView style={{ alignItems: "center" }}>
                                                    <SText>{total}</SText>
                                                </SView>
                                            }}
                                        />

                                        <DinamicTable.Col
                                            key="monto_total"
                                            label='Monto Total (Bs)'
                                            width={120}
                                            wrap
                                            cellStyle={cellstyle}
                                            data={e => `Bs. ${Number(e.row.monto_total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                                            footerComponent={(e) => {
                                                let total = 0;
                                                e.dinamicTable.data.forEach(a => total += a.monto_total || 0);
                                                return <SView style={{ alignItems: "center" }}>
                                                    <SText>{`Bs. ${Number(total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}</SText>
                                                </SView>
                                            }}
                                        />
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