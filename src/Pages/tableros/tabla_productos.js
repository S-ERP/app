import React from "react";
import { SPage, SView, SText, SHr, STheme } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import SCharts from "servisofts-charts";

export default class tabla_productos extends React.Component {
    state = {
        dataProductosMasVendidos: [],
        dataProductosMayorBeneficio: [],
        loadingProductosMasVendidos: true,
        loadingProductosMayorBeneficio: true,
    };

    componentDidMount() {
        this._mounted = true;
        this.loadAllData();
    }

    loadAllData = async () => {
        const waitForSelect = async (timeout = 3000, interval = 200) => {
            const start = Date.now();
            while (!MDL.empresa.select && Date.now() - start < timeout) {
                await new Promise(res => setTimeout(res, interval));
            }
            return MDL.empresa.select;
        }

        const selected = MDL.empresa.select || await waitForSelect();
        if (!selected) {
            if (this._mounted) this.setState({
                loadingProductosMasVendidos: false,
                loadingProductosMayorBeneficio: false
            });
            return;
        }

        await Promise.all([
            this.loadProductosMasVendidos(selected.key),
            this.loadProductosMayorBeneficio(selected.key)
        ]);
    };

    loadProductosMasVendidos = async (keyEmpresa) => {
        try {

            const sucursal = await MDL.empresa.getAllSucursales();
            const res = await MDL.compra_venta.execute_function("productos_mas_vendidos2", [keyEmpresa, 'venta', '2026-03-01', '2026-03-23']);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                key_modelo: item.key_modelo ?? "",
                producto: item.producto ?? "Sin nombre",
                cantidad_total_vendida: item.cantidad_total_vendida ?? 0,
                total_bs_ganado: item.total_bs_ganado ?? 0,
                sucursales: (item.sucursales || []).map(id => {
                    const suc = sucursal.find(s => s.key === id);
                    return { key: id, descripcion: suc?.descripcion ?? "Sin descripción" };
                })
            }));
            console.clear();
            console.log("%c" + JSON.stringify(data, null, 2), "color: #0314ff; font-weight: bold;");
            if (this._mounted) this.setState({ dataProductosMasVendidos: data, loadingProductosMasVendidos: false });
        } catch (e) {
            console.error("Error en productos_mas_vendidos:", e);
            if (this._mounted) this.setState({ loadingProductosMasVendidos: false });
        }
    };

    loadProductosMayorBeneficio = async (keyEmpresa) => {
        try {
            // const res = await MDL.compra_venta.execute_function("productos_mayor_beneficio", [keyEmpresa]);
            const res = await MDL.compra_venta.execute_function("productos_mayor_beneficio2", [keyEmpresa, '2026-03-09', '2026-03-23']);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                producto: item.producto ?? "Sin nombre",
                precio_venta_promedio: item.precio_venta_promedio ?? 0,
                precio_compra_promedio: item.precio_compra_promedio ?? 0,
                beneficio_promedio: item.beneficio_promedio ?? 0
            }));
            if (this._mounted) this.setState({ dataProductosMayorBeneficio: data, loadingProductosMayorBeneficio: false });
        } catch (e) {
            console.error("Error en productos_mayor_beneficio:", e);
            if (this._mounted) this.setState({ loadingProductosMayorBeneficio: false });
        }
    };

    formatFecha = (fechaISO) => {
        if (!fechaISO) return "N/A";
        if (typeof fechaISO === 'string' && !fechaISO.includes('T')) {
            return fechaISO;
        }
        if (typeof fechaISO === 'string' && fechaISO.includes('T')) {
            return fechaISO.split('T')[0];
        }
        if (fechaISO instanceof Date) {
            return fechaISO.toISOString().split('T')[0];
        }
        return "N/A";
    };

    formatCurrency = (amount) => {
        return "Bs. " + (parseFloat(amount) || 0).toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // CORRECCIÓN: Función específica para transformar datos de productos con mayor beneficio
    transformDataForProductosChart = (data) => {
        if (!data || !Array.isArray(data)) return {};

        return data.reduce((acc, item) => {
            const producto = (item.producto || "Sin nombre").substring(0, 15); // Limitar longitud del nombre
            acc[producto] = item.beneficio_promedio || 0;
            return acc;
        }, {});
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    render() {
        const {
            dataProductosMasVendidos,
            dataProductosMayorBeneficio,
            loadingProductosMasVendidos,
            loadingProductosMayorBeneficio
        } = this.state;

        const size = 80;
        const cellstyle = { padding: 4 };

        // CORRECCIÓN: Usar la función correcta para transformar los datos
        const chartData = this.transformDataForProductosChart(dataProductosMayorBeneficio);
        return (
            <SPage title="Estadísticas de Productos">
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Estadísticas de Productos</SText>
                        <SHr />

                        {/* Tabla de Productos Más Vendidos */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Productos Más Vendidos</SText>
                            <SHr />
                            {loadingProductosMasVendidos ? (
                                <SText>Cargando...</SText>
                            ) : dataProductosMasVendidos.length === 0 ? (
                                <SText>No hay datos disponibles</SText>
                            ) : (
                                <DinamicTable
                                    language={"es"}
                                    hiddenMenu
                                    textTitleStyle={{ fontSize: 12, lineHeight: 14 }}
                                    colors={{ header: "#2E86AB", textHeader: "white" }}
                                    cellStyle={{ padding: 4 }}
                                    textStyle={{ fontSize: 10 }}
                                    loadData={async () => {
                                        return dataProductosMasVendidos.sort((a, b) => b.cantidad_total_vendida - a.cantidad_total_vendida);
                                    }}
                                >
                                    <DinamicTable.Col
                                        key="producto"
                                        label='Producto'
                                        width={150}
                                        data={e => e.row.producto}
                                        footerComponent={(e) => {
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{"Total"}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="cantidad_total_vendida"
                                        label='Cant. Vendida'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => e.row.cantidad_total_vendida.toLocaleString('es-ES')}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.cantidad_total_vendida || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{total.toLocaleString('es-ES')}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="total_bs_ganado"
                                        label='Total Ganado'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => this.formatCurrency(e.row.total_bs_ganado)}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.total_bs_ganado || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{this.formatCurrency(total)}</SText>
                                            </SView>
                                        }}
                                    />


                                    <DinamicTable.Col
                                        key="sucursales"
                                        label="Sucursales"
                                        width={150}
                                        data={e => (e.row?.sucursales ?? []).map(p => p.key).join(", ")}
                                        customComponent={e => (
                                            <SView row wrap>
                                                {(e.row?.sucursales ?? []).map(item => (
                                                    <SView height={18} key={item.key} center row style={{
                                                        backgroundColor: "#eea6a6", borderRadius: 4, borderWidth: 1, borderColor: "#7ae202",
                                                        marginRight: 4, marginBottom: 2, paddingHorizontal: 2,
                                                    }}>
                                                        <SText style={{ fontSize: 10 }}>{item.descripcion}</SText>
                                                    </SView>


                                                ))}
                                            </SView>
                                        )}
                                    />

                                </DinamicTable>

                            )}
                        </SView>

                        <SHr />

                        {/* CORRECCIÓN: Cambiar título y usar gráfico de barras para productos */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Productos con Mayor Beneficio</SText>
                            <SHr />
                            {loadingProductosMayorBeneficio ? (
                                <SText>Cargando...</SText>
                            ) : Object.keys(chartData).length === 0 ? (
                                <SText>No hay datos disponibles</SText>
                            ) : (
                                <SCharts
                                    type='Bar'  // Cambiar a Bar para mejor visualización de productos
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

                    </SView>
                </ScrollView>
            </SPage>
        );
    }
}