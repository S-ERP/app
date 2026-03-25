import React from "react";
import { SPage, SView, SText, SHr, STheme } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import FechaFullFilter2 from "../../Components/FechaFullFilter2";

export default class TablaAlvaro extends React.Component {
    state = {
        loadingVentasPorDia: true,
        dataVentasPorDia: [],
        fecha_inicio: '2026-03-24',
        fecha_fin: '2026-03-24',
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
                [keyEmpresa, 'venta', fecha_inicio, fecha_fin]
            );

            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);

            // Crear mapa para acceso rápido por key_sucursal
            const ventasMap = raw.reduce((acc, v) => { acc[v.key_sucursal] = v; return acc; }, {});

            // Combinar sucursales con ventas
            const sucursalesConMonto = sucursalesFiltradas.map(s => {
                const venta = ventasMap[s.key] || {};
                return {
                    ...s,
                    cantidad_ventas: venta.cantidad_ventas || 0,
                    monto_total: venta.monto_total || 0
                };
            }).sort((a, b) => b.cantidad_ventas - a.cantidad_ventas); // ✅ Orden descendente

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
        const { dataVentasPorDia, loadingVentasPorDia, fecha_inicio, fecha_fin } = this.state;
        const size = 80;
        const cellstyle = { padding: 4 };

        return (
            <SPage title="Estadísticas de Ventas">
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Estadísticas de Ventas</SText>
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

                        <SView padding={8}>
                            <SText>
                                📅 Inicio: {fecha_inicio ?? "N/A"} {"\n"}
                                📅 Fin: {fecha_fin ?? "N/A"} {"\n"}
                            </SText>
                        </SView>

                        {/* Tabla de Ventas por Día */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Ventas por Sucursales</SText>
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
                                    loadData={async () => dataVentasPorDia}
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
                                            const total = e.dinamicTable.data.reduce((acc, a) => acc + (a.cantidad_ventas || 0), 0);
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
                                        data={e => e.row.monto_total}
                                        customComponent={(e) => {
                                            console.clear();
                                            // console.log("%c" + e,`color: #2ECC40; font-weight: bold;`);
                                            console.log(e.row.monto_total)


                                            return <SView style={{ alignItems: "center" }}>
                                                <SText fontSize={9} color={e.row.monto_total < 2 ? STheme.color.gray : STheme.color.text}>{`Bs.` + e.row.monto_total}</SText>
                                            </SView>
                                        }}

                                        footerComponent={(e) => {
                                            const total = e.dinamicTable.data.reduce((acc, a) => acc + (a.monto_total || 0), 0);
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText  >{`Bs. ${Number(total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}</SText>
                                            </SView>
                                        }}
                                    />
                                </DinamicTable>
                            )}
                        </SView>

                    </SView>
                </ScrollView>
            </SPage>
        );
    }
}