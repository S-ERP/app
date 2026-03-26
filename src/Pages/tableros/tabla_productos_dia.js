import React from "react";
import { SPage, SView, SText, SHr, SMath, STheme } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import FechaFullFilter2 from "../../Components/FechaFullFilter2";

const color_bajito = "#8888887a";

export default class tabla_productos_dia extends React.Component {
    state = {
        loadingVentasPorDia: true,
        dataVentasPorDia: [],
        fecha_inicio: '2026-03-24',
        fecha_fin: '2026-03-24',
        tipo_modulo: 'venta', // o "compra"
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
            const res = await MDL.compra_venta.execute_function(
                "productos_por_fecha",
                [keyEmpresa, this.state.fecha_inicio, this.state.fecha_fin]
            );
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);

            // Ajustamos los datos al formato que espera la tabla
            const dataVentasPorDia = raw.map(producto => ({
                key_modelo: producto.key_modelo,
                producto: producto.producto,
                ventas_total_cantidad: producto.ventas_total_cantidad,
                ventas_total_ganancia: producto.ventas_total_ganancia,
                compras_total_cantidad: producto.compras_total_cantidad,
                compras_total_ganancia: producto.compras_total_ganancia,
                dias: (producto.dias || []).map(d => ({
                    dia: d.dia,
                    ventas_cantidad: d.ventas_cantidad,
                    ventas_ganancia: d.ventas_ganancia,
                    compras_cantidad: d.compras_cantidad,
                    compras_ganancia: d.compras_ganancia,
                    // monto_total opcional para simplificar la columna Bs
                    monto_total: d.ventas_ganancia + d.compras_ganancia,
                    cantidad_ventas: d.ventas_cantidad
                }))
            }));


            console.clear();
            console.log("%c" + JSON.stringify(dataVentasPorDia, null, 2), "color: #2ECC40; font-weight: bold;");

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
        const { dataVentasPorDia, loadingVentasPorDia, fecha_inicio, fecha_fin, dias, tipo_modulo } = this.state;
        const chartData = {};
        (dataVentasPorDia || []).forEach(item => {
            const totalCantidad = (item.dias || []).reduce((acc, d) => acc + (d.cantidad_ventas || 0), 0);
            chartData[item.producto] = totalCantidad;
        });

        return (
            <SPage title={"Reporte de Totales de Ventas y Compras por Producto"}>
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold> Resumen de Ventas y Compras por Producto por dia </SText>
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
                            <SView col={"xs-12"} padding={8}>
                                <SText fontSize={16} bold>Desglose diario de compras y ventas</SText>
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
                                        {/* Columna de producto */}
                                        <DinamicTable.Col
                                            key="producto"
                                            label='Producto'
                                            width={180}
                                            data={e => e.row.producto}
                                            footerComponent={() => (
                                                <SView style={{ alignItems: "center" }}>
                                                    <SText bold>Total</SText>
                                                </SView>
                                            )}
                                        />

                                        {/* Columnas por día */}
                                        {dias.flatMap(d => [
                                            <DinamicTable.Col
                                                key={`dia-${d.dia}-cantidad`}
                                                label={`${d.dia} - Cant`}
                                                width={70}
                                                data={e => {
                                                    const diaObj = e.row.dias.find(x => x.dia === d.dia);
                                                    return diaObj ? diaObj.ventas_cantidad : 0;
                                                }}
                                                customComponent={(e) => {
                                                    const diaObj = e.row.dias.find(x => x.dia === d.dia);
                                                    const cantidad = diaObj?.ventas_cantidad || 0;
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={10} color={cantidad < 1 ? color_bajito : STheme.color.text}>{cantidad}</SText>
                                                        </SView>
                                                    );
                                                }}
                                                footerComponent={() => {
                                                    const totalCantidad = dataVentasPorDia.reduce((acc, row) => {
                                                        const diaObj = row.dias.find(x => x.dia === d.dia);
                                                        return acc + (diaObj?.ventas_cantidad || 0);
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
                                                    return diaObj ? diaObj.ventas_ganancia : 0;
                                                }}
                                                customComponent={(e) => {
                                                    const diaObj = e.row.dias.find(x => x.dia === d.dia);
                                                    const monto = diaObj?.ventas_ganancia || 0;
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={9} color={monto < 1 ? color_bajito : STheme.color.text}>{`Bs. ${SMath.formatMoney(monto)}`}</SText>
                                                        </SView>
                                                    );
                                                }}
                                                footerComponent={() => {
                                                    const totalMonto = dataVentasPorDia.reduce((acc, row) => {
                                                        const diaObj = row.dias.find(x => x.dia === d.dia);
                                                        return acc + (diaObj?.ventas_ganancia || 0);
                                                    }, 0);
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={9} bold color={totalMonto < 1 ? color_bajito : STheme.color.text}>{`Bs. ${SMath.formatMoney(totalMonto)}`}</SText>
                                                        </SView>
                                                    );
                                                }}
                                            />
                                        ])}

                                        {/* Total general por producto */}
                                        <DinamicTable.Col
                                            key="total_producto"
                                            label="Total"
                                            width={100}
                                            data={e => e.row.dias.reduce((acc, d) => acc + (d.ventas_ganancia || 0), 0)}
                                            customComponent={(e) => {
                                                const totalCantidad = e.row.dias.reduce((acc, d) => acc + (d.ventas_cantidad || 0), 0);
                                                const totalMonto = e.row.dias.reduce((acc, d) => acc + (d.ventas_ganancia || 0), 0);
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