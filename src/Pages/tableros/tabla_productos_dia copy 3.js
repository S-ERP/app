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
        dias: [],
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
            const diaDescripcion = fechaActual.toLocaleDateString("es-ES", { weekday: "long" });
            dias.push({
                dia: fechaActual.getDate(),
                fecha: fechaActual.toISOString().split('T')[0],
                dia_descripcion: diaDescripcion
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
                ventas_total_cantidad: producto.ventas_total_cantidad || 0,
                ventas_total_ganancia: producto.ventas_total_ganancia || 0,
                compras_total_cantidad: producto.compras_total_cantidad || 0,
                compras_total_ganancia: producto.compras_total_ganancia || 0,
                dias: (producto.dias || []).map(d => ({
                    dia: d.dia,
                    dia_descripcion: d.dia_descripcion || "",
                    ventas_cantidad: d.ventas_cantidad || 0,
                    ventas_ganancia: d.ventas_ganancia || 0,
                    compras_cantidad: d.compras_cantidad || 0,
                    compras_ganancia: d.compras_ganancia || 0,
                    monto_total: (d.ventas_ganancia || 0) + (d.compras_ganancia || 0),
                    cantidad_ventas: d.ventas_cantidad || 0
                }))
            }));

            // Ordenar por mayor cantidad total (ventas + compras)
            dataVentasPorDia.sort((a, b) => {
                const totalA = (a.ventas_total_cantidad || 0) + (a.compras_total_cantidad || 0);
                const totalB = (b.ventas_total_cantidad || 0) + (b.compras_total_cantidad || 0);
                return totalB - totalA;
            });

            
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
        const { dataVentasPorDia, loadingVentasPorDia, fecha_inicio, fecha_fin, dias } = this.state;

        // 🔹 Cálculos de KPIs seguros
        const totalVentas = dataVentasPorDia.reduce((acc, p) => acc + (p.ventas_total_ganancia || 0), 0);
        const totalCompras = dataVentasPorDia.reduce((acc, p) => acc + (p.compras_total_ganancia || 0), 0);

        const ventasPorDia = dias.map(d => ({
            dia: d.dia,
            descripcion: d.dia_descripcion,
            total: dataVentasPorDia.reduce((acc, p) => {
                const diaObj = p.dias.find(x => x.dia === d.dia);
                return acc + ((diaObj?.ventas_ganancia || 0) + (diaObj?.compras_ganancia || 0));
            }, 0)
        }));

        const diaMasVentas = ventasPorDia.reduce(
            (a, b) => (b.total > a.total ? b : a),
            { total: 0, descripcion: "N/A" }
        );

        const productoMasVendido = dataVentasPorDia.reduce(
            (a, b) => (b.ventas_total_cantidad > a.ventas_total_cantidad ? b : a),
            { producto: "N/A", ventas_total_cantidad: 0 }
        );

        return (
            <SPage title={"Reporte de Totales de Ventas y Compras por Producto"}>
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Resumen de Ventas y Compras por Producto por día</SText>
                        <SHr />

                        {/* 🔹 KPIs */}
                        <SView col={"xs-12"} row style={{ gap: 20, marginBottom: 20 }}>
                            <SView col={"xs-12 sm-3"} style={{ backgroundColor: "#0ba7f0", padding: 12, borderRadius: 8 }}>
                                <SText bold>Total Compras</SText>
                                <SText fontSize={18}>Bs. {SMath.formatMoney(totalCompras)}</SText>
                            </SView>
                            <SView col={"xs-12 sm-3"} style={{ backgroundColor: "#00fd15", padding: 12, borderRadius: 8 }}>
                                <SText bold>Total Ventas</SText>
                                <SText fontSize={18}>Bs. {SMath.formatMoney(totalVentas)}</SText>
                            </SView>
                            <SView col={"xs-12 sm-3"} style={{ backgroundColor: "#f09709", padding: 12, borderRadius: 8 }}>
                                <SText bold>Día con más ventas</SText>
                                <SText fontSize={18}>{diaMasVentas.descripcion} ({SMath.formatMoney(diaMasVentas.total)})</SText>
                            </SView>
                            <SView col={"xs-12 sm-3"} style={{ backgroundColor: "#e90954", padding: 12, borderRadius: 8 }}>
                                <SText bold>Producto más vendido</SText>
                                <SText fontSize={18}>{productoMasVendido.producto} ({productoMasVendido.ventas_total_cantidad})</SText>
                            </SView>
                        </SView>

                        <SHr />

                        {/* 🔹 Selector de fechas */}
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

                        {/* 🔹 Tabla */}
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
                                            key={`dia-${d.dia}-ventas`}
                                            label={`${d.dia} - ventas`}
                                            width={70}
                                            data={e => e.row.dias.find(x => x.dia === d.dia)?.ventas_cantidad || 0}
                                            customComponent={e => {
                                                const cantidad_v = e.row.dias.find(x => x.dia === d.dia)?.ventas_cantidad || 0;
                                                return <SView style={{ alignItems: "center" }}><SText fontSize={10} color={cantidad_v < 1 ? color_bajito : STheme.color.text}>{cantidad_v}</SText></SView>;
                                            }}
                                            footerComponent={() => {
                                                const total = dataVentasPorDia.reduce((acc, row) => acc + (row.dias.find(x => x.dia === d.dia)?.ventas_cantidad || 0), 0);
                                                return <SView style={{ alignItems: "center" }}><SText fontSize={10} bold color={total < 1 ? color_bajito : STheme.color.text}>{total}</SText></SView>;
                                            }}
                                        />,
                                        <DinamicTable.Col
                                            key={`dia-${d.dia}-compras`}
                                            label={`${d.dia} - compras`}
                                            width={90}
                                            data={e => e.row.dias.find(x => x.dia === d.dia)?.compras_cantidad || 0}
                                            customComponent={e => {
                                                const cantidad_c = e.row.dias.find(x => x.dia === d.dia)?.compras_cantidad || 0;
                                                return <SView style={{ alignItems: "center" }}><SText fontSize={10} color={cantidad_c < 1 ? color_bajito : STheme.color.text}>{cantidad_c}</SText></SView>;
                                            }}
                                            footerComponent={() => {
                                                const total = dataVentasPorDia.reduce((acc, row) => acc + (row.dias.find(x => x.dia === d.dia)?.compras_cantidad || 0), 0);
                                                return <SView style={{ alignItems: "center" }}><SText fontSize={10} bold color={total < 1 ? color_bajito : STheme.color.text}>{total}</SText></SView>;
                                            }}
                                        />
                                    ])}

                                    {/* Total general por producto */}
                                    <DinamicTable.Col
                                        key="total_producto"
                                        label="Total"
                                        width={100}
                                        data={e => e.row.dias.reduce((acc, d) => acc + (d.ventas_ganancia || 0), 0)}
                                        customComponent={e => {
                                            const totalVentasProducto = e.row.dias.reduce((acc, d) => acc + (d.ventas_cantidad || 0), 0);
                                            const totalComprasProducto = e.row.dias.reduce((acc, d) => acc + (d.compras_cantidad || 0), 0);
                                            return <SView style={{ alignItems: "center" }}>
                                                {totalVentasProducto > 0 || totalComprasProducto > 0 ? (
                                                    <>
                                                        <SText fontSize={10}>{`${totalVentasProducto} ventas`}</SText>
                                                        <SText fontSize={10}>{`${totalComprasProducto} compras`}</SText>
                                                    </>
                                                ) : null}
                                            </SView>;
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