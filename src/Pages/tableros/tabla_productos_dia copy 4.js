import React from "react";
import { SPage, SView, SText, SHr, SMath, STheme, SDate } from "servisofts-component";
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

    // Función para formatear fecha en formato yyyy-mm-dd local
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Función para parsear string yyyy-mm-dd a fecha local (sin desfase)
    const parseLocalDate = (str) => {
        const [year, month, day] = str.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // Inicializamos fechas correctamente
    let fechaActual = parseLocalDate(this.state.fecha_inicio);
    const fechaFin = parseLocalDate(this.state.fecha_fin);

    // Si quieres sumar un día para iniciar desde el día siguiente:
    // fechaActual.setDate(fechaActual.getDate() + 1);

    
    console.log("%cDddddddddddddddddddd", "color: #2ECC40; font-weight: bold;");
    console.log("%c" + fechaActual, "color: #2ECC40; font-weight: bold;");
    console.log("%c" + fechaFin, "color: #2ECC40; font-weight: bold;");

    // Generar array de días
    while (fechaActual <= fechaFin) {
        dias.push({
            dia: fechaActual.getDate(),
            fecha: formatLocalDate(fechaActual)
        });
        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    this.setState({ dias });
};

 

    loadVentasPorFecha = async () => {
        try {
            const { fecha_inicio, fecha_fin } = this.state;

            const keyEmpresa = await MDL.empresa.select.key;

            // 🔹 Traer ventas y modelos en paralelo
            const [resVentas, modelos] = await Promise.all([
                MDL.compra_venta.execute_function(
                    "productos_por_fecha",
                    [keyEmpresa, fecha_inicio, fecha_fin]
                ),
                MDL.inventario.getAllModeloStock("", "")
            ]);

            const raw = Array.isArray(resVentas)
                ? resVentas
                : (resVentas?.data ?? resVentas?.result ?? []);

            // 🔹 Indexar ventas por modelo
            const ventasByModelo = Object.fromEntries(
                (raw ?? []).map(p => [p.key_modelo, p])
            );

            // 🔹 Construir data completa con todos los modelos
            let dataVentasPorDia = (modelos ?? []).map(modelo => {
                const venta = ventasByModelo[modelo.key] || {};

                const diasArray = Array.isArray(venta.dias) ? venta.dias : [];

                return {
                    key_modelo: modelo.key,
                    producto: modelo.descripcion || modelo.nombre || "Sin nombre",

                    ventas_total_cantidad: venta.ventas_total_cantidad || 0,
                    ventas_total_ganancia: venta.ventas_total_ganancia || 0,
                    compras_total_cantidad: venta.compras_total_cantidad || 0,
                    compras_total_ganancia: venta.compras_total_ganancia || 0,

                    dias: diasArray.map(d => ({
                        dia: d.dia,
                        ventas_cantidad: d.ventas_cantidad || 0,
                        ventas_ganancia: d.ventas_ganancia || 0,
                        compras_cantidad: d.compras_cantidad || 0,
                        compras_ganancia: d.compras_ganancia || 0,
                        monto_total: (d.ventas_ganancia || 0) + (d.compras_ganancia || 0),
                        cantidad_ventas: d.ventas_cantidad || 0
                    })),

                    // 🔹 Optimizado para acceder directo
                    dias_map: Object.fromEntries(
                        diasArray.map(d => [
                            d.dia,
                            {
                                dia: d.dia,
                                ventas_cantidad: d.ventas_cantidad || 0,
                                ventas_ganancia: d.ventas_ganancia || 0,
                                compras_cantidad: d.compras_cantidad || 0,
                                compras_ganancia: d.compras_ganancia || 0,
                                monto_total: (d.ventas_ganancia || 0) + (d.compras_ganancia || 0),
                                cantidad_ventas: d.ventas_cantidad || 0
                            }
                        ])
                    )
                };
            });

            // 🔹 Ordenar por mayor movimiento (ventas + compras)
            dataVentasPorDia.sort((a, b) => {
                const totalA = (a.ventas_total_cantidad || 0) + (a.compras_total_cantidad || 0);
                const totalB = (b.ventas_total_cantidad || 0) + (b.compras_total_cantidad || 0);
                return totalB - totalA;
            });

            // 
            // console.log(
            //     "%c" + JSON.stringify(dataVentasPorDia, null, 2),
            //     "color: #2ECC40; font-weight: bold;"
            // );

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

        // 
        console.log("%c" + fecha_inicio,`color: #2ECC40; font-weight: bold;`);
        return (
            <SPage title={"Reporte de Totales de Ventas y Compras por Producto"}>
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Resumen de Ventas y Compras por Producto por día</SText>
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
                                        {...dias.flatMap(d => [
                                            <DinamicTable.Col
                                                key={`dia-${d.dia}-ventas`}
                                                label={`${d.dia} - ventas`}
                                                width={70}
                                                data={e => e.row.dias_map?.[d.dia]?.ventas_cantidad || 0}
                                                customComponent={(e) => {
                                                    const cantidad_v = e.row.dias_map?.[d.dia]?.ventas_cantidad || 0;
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={10} color={cantidad_v < 1 ? color_bajito : STheme.color.text}>{cantidad_v}</SText>
                                                        </SView>
                                                    );
                                                }}
                                                footerComponent={() => {
                                                    const totalCantidad = dataVentasPorDia.reduce((acc, row) => {
                                                        return acc + (row.dias_map?.[d.dia]?.ventas_cantidad || 0);
                                                    }, 0);
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={10} bold color={totalCantidad < 1 ? color_bajito : STheme.color.text}>{totalCantidad}</SText>
                                                        </SView>
                                                    );
                                                }}
                                            />,
                                            <DinamicTable.Col
                                                key={`dia-${d.dia}-compras`}
                                                label={`${d.dia} - compras`}
                                                width={90}
                                                data={e => e.row.dias_map?.[d.dia]?.compras_cantidad || 0}
                                                customComponent={(e) => {
                                                    const cantidad_c = e.row.dias_map?.[d.dia]?.compras_cantidad || 0;
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={10} color={cantidad_c < 1 ? color_bajito : STheme.color.text}>{cantidad_c}</SText>
                                                        </SView>
                                                    );
                                                }}
                                                footerComponent={() => {
                                                    const totalCantidad_compras = dataVentasPorDia.reduce((acc, row) => {
                                                        return acc + (row.dias_map?.[d.dia]?.compras_cantidad || 0);
                                                    }, 0);
                                                    return (
                                                        <SView style={{ alignItems: "center" }}>
                                                            <SText fontSize={10} bold color={totalCantidad_compras < 1 ? color_bajito : STheme.color.text}>{totalCantidad_compras}</SText>
                                                        </SView>
                                                    );
                                                }}
                                            />
                                        ])}

                                        {/* Total general por producto */}
                                        <DinamicTable.Col
                                            key="total_producto_ventas"
                                            label="Total Ventas"
                                            width={100}
                                            data={e => e.row.dias.reduce((acc, d) => acc + (d.ventas_ganancia || 0), 0)}
                                            customComponent={(e) => {
                                                const dias = e.row.dias || [];
                                                const totalCantidadVentas = dias.reduce((acc, d) => acc + (d.ventas_cantidad || 0), 0);
                                                const totalCantidadCompras = dias.reduce((acc, d) => acc + (d.compras_cantidad || 0), 0);
                                                // const totalMonto = dias.reduce((acc, d) => acc + ((d.ventas_ganancia || 0) + (d.compras_ganancia || 0)), 0);

                                                return (
                                                    <SView style={{ alignItems: "center" }}>
                                                        {totalCantidadVentas > 0 || totalCantidadCompras > 0 ? (
                                                            <>
                                                                <SText fontSize={10} color={totalCantidadVentas < 1 ? color_bajito : STheme.color.text}>{`${totalCantidadVentas} ventas`}</SText>
                                                                {/* <SText fontSize={10}>{`${totalCantidadCompras} compras`}</SText> */}
                                                                {/* <SText fontSize={10}>{`Bs. ${SMath.formatMoney(totalMonto)}`}</SText> */}
                                                            </>
                                                        ) : null}
                                                    </SView>
                                                );
                                            }}
                                        />
                                        <DinamicTable.Col
                                            key="total_producto_compras"
                                            label="Total"
                                            width={100}
                                            data={e => e.row.dias.reduce((acc, d) => acc + (d.ventas_ganancia || 0), 0)}
                                            customComponent={(e) => {
                                                const dias = e.row.dias || [];
                                                const totalCantidadVentas = dias.reduce((acc, d) => acc + (d.ventas_cantidad || 0), 0);
                                                const totalCantidadCompras = dias.reduce((acc, d) => acc + (d.compras_cantidad || 0), 0);
                                                // const totalMonto = dias.reduce((acc, d) => acc + ((d.ventas_ganancia || 0) + (d.compras_ganancia || 0)), 0);

                                                return (
                                                    <SView style={{ alignItems: "center" }}>
                                                        {totalCantidadVentas > 0 || totalCantidadCompras > 0 ? (
                                                            <>
                                                                {/* <SText fontSize={10}>{`${totalCantidadVentas} ventas`}</SText> */}
                                                                <SText fontSize={10} color={totalCantidadCompras < 1 ? color_bajito : STheme.color.text}>{`${totalCantidadCompras} compras`}</SText>
                                                                {/* <SText fontSize={10}>{`Bs. ${SMath.formatMoney(totalMonto)}`}</SText> */}
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