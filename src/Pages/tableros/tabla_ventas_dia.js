import React from "react";
import { SPage, SView, SText, SHr, SMath, STheme } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import FechaFullFilter2 from "../../Components/FechaFullFilter2";
import SCharts from "servisofts-charts";

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
                fecha: fechaActual.toISOString().split('T')[0] // YYYY-MM-DD
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

            // Mantener array de dias tal cual
            const dataVentasPorDia = raw.map(v => ({
                key_sucursal: v.key_sucursal,
                descripcion: sucursalesFiltradas.find(s => s.key === v.key_sucursal)?.descripcion ?? "N/A",
                dias: v.dias || [],
            }));

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

        // Generar chartData: cada sucursal tendrá su total por día
        const chartData = {};
        dataVentasPorDia.forEach(item => {
            chartData[item.descripcion] = item.dias.reduce((acc, d) => acc + (d.cantidad_ventas || 0), 0);
        });

        return (
            <SPage title={tipo_modulo === "compra" ? "Estadísticas de Compras por Día" : "Estadísticas de Ventas por Día"}>
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>
                            Estadísticas de {tipo_modulo === "compra" ? "Compras" : "Ventas"}
                        </SText>
                        <SHr />

                        {/* Selector de fechas */}
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

                        <SView padding={8}>
                            <SText>
                                📅 Inicio: {fecha_inicio ?? "N/A"} {"\n"}
                                📅 Fin: {fecha_fin ?? "N/A"} {"\n"}
                            </SText>
                        </SView>

                        <SView col={"xs-12"} row>

                            <SView col={"xs-6"} padding={8}>
                                <SText fontSize={16} bold>Gráfico {tipo_modulo == "compra" ? "Compras" : "Ventas"} por Sucursales</SText>

                                <SHr />
                                {loadingVentasPorDia ? (
                                    <SText>Cargando...</SText>
                                ) : Object.keys(chartData).length === 0 ? (
                                    <SText>No hay datos disponibles</SText>
                                ) : (
                                    <SCharts
                                        type='Line'
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

                            {/* Tabla de Ventas por Día */}
                            <SView col={"xs-6"} padding={8}>
                                <SText fontSize={16} bold>
                                    {tipo_modulo === "compra" ? "Compras" : "Ventas"} por dia
                                </SText>
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
                                        {/* Columna de sucursal */}
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

                                        {/* Columnas por cada día */}
                                        {...dias.map(d => (
                                            <DinamicTable.Col
                                                key={`dia-${d.dia}`}
                                                label={`Día ${d.dia}`}
                                                width={80}
                                                data={e => {
                                                    const diaObj = e.row.dias.find(x => x.dia === d.dia);
                                                    return diaObj ? diaObj.monto_total : 0;
                                                }}
                                                customComponent={(e) => {
                                                    const diaObj = e.row.dias.find(x => x.dia === d.dia);
                                                    const value = diaObj?.monto_total || 0;
                                                    const cantidad = diaObj?.cantidad_ventas || 0;
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            {value > 0 ? (
                                                                <>
                                                                    <SText fontSize={10}>{`${cantidad} ventas`}</SText>
                                                                    <SText fontSize={10}>{`Bs. ${SMath.formatMoney(value)}`}</SText>
                                                                </>
                                                            ) : null}
                                                        </SView>
                                                    );
                                                }}
                                                // footerComponent={() => {
                                                //     const total = dataVentasPorDia.reduce((acc, row) => {
                                                //         const diaObj = row.dias.find(x => x.dia === d.dia);
                                                //         return acc + (diaObj?.monto_total || 0);
                                                //     }, 0);
                                                //     return (
                                                //         <SView style={{ alignItems: "center" }}>
                                                //             {total > 0 ? <SText fontSize={10}>{`Bs. ${SMath.formatMoney(total)}`}</SText> : null}
                                                //         </SView>
                                                //     );
                                                // }}
                                                footerComponent={() => {
                                                    const totalCantidad = dataVentasPorDia.reduce((acc, row) => {
                                                        const diaObj = row.dias.find(x => x.dia === d.dia);
                                                        return acc + (diaObj?.cantidad_ventas || 0);
                                                    }, 0);
                                                    const totalMonto = dataVentasPorDia.reduce((acc, row) => {
                                                        const diaObj = row.dias.find(x => x.dia === d.dia);
                                                        return acc + (diaObj?.monto_total || 0);
                                                    }, 0);
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
                                            />
                                        ))}

                                        {/* Columna total por sucursal */}
                                        <DinamicTable.Col
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
                                        // customComponent={(e) => {
                                        //     const total = e.row.dias.reduce((acc, d) => acc + (d.monto_total || 0), 0);
                                        //     return (
                                        //         <SView style={{ alignItems: "center" }}>
                                        //             {total > 0 ? <SText fontSize={10}>{`Bs. ${SMath.formatMoney(total)}`}</SText> : null}
                                        //         </SView>
                                        //     );
                                        // }}
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