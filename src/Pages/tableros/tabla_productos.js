// import React from "react";
// import { SPage, SView, SText, SHr, STheme } from "servisofts-component";
// import { DinamicTable } from 'servisofts-table';
// import MDL from "../../MDL";
// import { ScrollView } from "react-native-gesture-handler";
// import SCharts from "servisofts-charts";
// import FechaFullFilter from "../../Components/FechaFullFilter";
// import FiltroSelector from "../productos/modelo/Components/FiltroSelector";


import React from "react";
import { SPage, SView, SText, SHr, STheme } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import SCharts from "servisofts-charts";
import FechaFullFilter from "../../Components/FechaFullFilter";
import FiltroSelector from "../productos/modelo/Components/FiltroSelector";

export default class tabla_productos extends React.Component {
    state = {
        dataProductosMasVendidos: [],
        dataProductosMayorBeneficio: [],
        loadingProductosMasVendidos: true,
        loadingProductosMayorBeneficio: true,
        selectedSucursal: null,
        fecha_inicio: null,
        fecha_fin: null,
    };

    dinamicTableRef = React.createRef();

    componentDidMount() {
        this._mounted = true;
        this.loadAllData();

        // 🎮 Agregar listener para tecla Escape
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        this._mounted = false;
        // 🎮 Remover listener para evitar memory leak
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (event) => {
        // Si presionan Escape, resetear sucursal a "Todos"

        defaultOption="todos"

        if (event.key === 'Escape') {
            console.log("⌨️ Escape presionado - Reseteando filtro de sucursal");
                    defaultOption="todos"

            this.resetSucursal();
        }
    }

    resetSucursal = () => {
      
        this.setState({ selectedSucursal: null }, () => {
            console.log("🔄 Sucursal reseteada a: Todos");
            this.loadAllData();
        });
    }

    loadAllData = async () => {
        console.log("📈 loadAllData llamado");
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
            const sucursalesAll = await MDL.empresa.getAllSucursales();
            let fecha_inicio = this.state.fecha_inicio || '2026-03-01';
            let fecha_fin = this.state.fecha_fin || '2026-03-23';

            const res = await MDL.compra_venta.execute_function(
                "productos_mas_vendidos2",
                [keyEmpresa, 'venta', fecha_inicio, fecha_fin]
            );

            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            let data = raw.map(item => ({
                key_modelo: item.key_modelo ?? "",
                producto: item.producto ?? "Sin nombre",
                cantidad_total_vendida: item.cantidad_total_vendida ?? 0,
                total_bs_ganado: item.total_bs_ganado ?? 0,
                sucursales: (item.sucursales || []).map(id => {
                    const suc = sucursalesAll.find(s => s.key === id);
                    return { key: id, descripcion: suc?.descripcion ?? "Sin descripción" };
                })
            }));

            console.log("🔵 Datos sin filtrar:", data.length, "| Sucursal seleccionada:", this.state.selectedSucursal);

            // ✅ Filtrar solo si se seleccionó una sucursal específica (no "Todos" que tiene key null)
            if (this.state.selectedSucursal?.key) {
                console.log("🟢 Filtrando por sucursal:", this.state.selectedSucursal.key);
                data = data
                    .map(d => ({
                        ...d,
                        sucursales: d.sucursales.filter(s => s.key === this.state.selectedSucursal.key)
                    }))
                    .filter(d => d.sucursales.length > 0);
                console.log("🔴 Datos después de filtrar:", data.length);
            } else {
                console.log("🟡 Sin filtro - mostrando todos");
            }

            if (this._mounted) {
                this.setState({
                    dataProductosMasVendidos: data,
                    loadingProductosMasVendidos: false
                }, () => {
                    // 🔄 Forzar que DinamicTable recargue los datos después de actualizar el state
                    console.log("🔄 Forzando carga en DinamicTable");
                    this.dinamicTableRef.current?.loadData?.();
                });
            }
        } catch (e) {
            console.error("Error en productos_mas_vendidos:", e);
            if (this._mounted) this.setState({ loadingProductosMasVendidos: false });
        }
    };


    loadProductosMayorBeneficio = async (keyEmpresa) => {
        try {
            const fecha_inicio = this.state.fecha_inicio || '2026-03-01';
            const fecha_fin = this.state.fecha_fin || '2026-03-23';

            const res = await MDL.compra_venta.execute_function(
                "productos_mayor_beneficio2",
                [keyEmpresa, fecha_inicio, fecha_fin]
            );

            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                producto: item.producto ?? "Sin nombre",
                precio_venta_promedio: item.precio_venta_promedio ?? 0,
                precio_compra_promedio: item.precio_compra_promedio ?? 0,
                beneficio_promedio: item.beneficio_promedio ?? 0
            }));

            if (this._mounted) this.setState({
                dataProductosMayorBeneficio: data,
                loadingProductosMayorBeneficio: false
            });
        } catch (e) {
            console.error("Error en productos_mayor_beneficio:", e);
            if (this._mounted) this.setState({ loadingProductosMayorBeneficio: false });
        }
    };

    formatCurrency = (amount) => {
        return "Bs. " + (parseFloat(amount) || 0).toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    transformDataForProductosChart = (data) => {
        if (!data || !Array.isArray(data)) return {};
        return data.reduce((acc, item) => {
            const producto = (item.producto || "Sin nombre").substring(0, 15);
            acc[producto] = item.beneficio_promedio || 0;
            return acc;
        }, {});
    }

    render() {
        const {
            dataProductosMasVendidos,
            dataProductosMayorBeneficio,
            loadingProductosMasVendidos,
            loadingProductosMayorBeneficio,
            selectedSucursal,
            fecha_inicio,
            fecha_fin
        } = this.state;

        const size = 80;
        const cellstyle = { padding: 4 };
        const chartData = this.transformDataForProductosChart(dataProductosMayorBeneficio);
        // this.filtroSucursalRefs?.reset(false);

        return (
            <SPage title="Estadísticas de Productos">
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Estadísticas de Productos</SText>
                        <SHr />
                        <SView col={"xs-12 sm-5 lg-1.6"} row center style={{ flexWrap: "wrap", gap: 12 }}>
                            <FiltroSelector
                                ref={ref => this.filtroSucursalRef = ref}
                                defaultOption="todos"

                                label="Sucursal"
                                loadData={MDL.empresa.getAllSucursales}
                                mapOption={a => ({ key: a.key, nombre: a.descripcion })}
                                onSelect={item => {
                                    console.log("🏢 Sucursal seleccionada:", item);
                                    this.setState({ selectedSucursal: item }, () => {
                                        console.log("📊 State actualizado, loadAllData:", this.state.selectedSucursal);
                                        this.loadAllData();
                                    });
                                }}
                            />
                        </SView>

                        <SView width={8} height={8} />

                        <SView col={"xs-12 sm-8.2 lg-3.3"} row center>+
                            <FechaFullFilter
                                key_opciones="este_mes"
                                fecha_inicio={this.state.fecha_inicio}
                                fecha_fin={this.state.fecha_fin}
                                onChange={e => {
                                    console.log("📅 Cambio fechas:", e);

                                    this.setState({
                                        fecha_inicio: e.fecha_inicio,
                                        fecha_fin: e.fecha_fin
                                    }, () => {
                                        console.log("📅 State actualizado:", this.state);
                                        this.loadAllData();
                                    });
                                }}
                            />
                        </SView>

                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={14} bold>Estado Actual:</SText>
                            <SText fontSize={12}>
                                Fecha Inicio: {fecha_inicio ?? "N/A"}{"\n"}
                                Fecha Fin: {fecha_fin ?? "N/A"}{"\n"}
                                Sucursal: {selectedSucursal?.nombre ?? "Todas"}
                            </SText>
                        </SView>

                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Productos Más Vendidos</SText>
                            <SHr />
                            {loadingProductosMasVendidos ? (
                                <SText>Cargando...</SText>
                            ) : dataProductosMasVendidos.length === 0 ? (
                                <SText>No hay datos disponibles</SText>
                            ) : (
                                <DinamicTable
                                    ref={this.dinamicTableRef}
                                    language={"es"}
                                    hiddenMenu
                                    textTitleStyle={{ fontSize: 12, lineHeight: 14 }}
                                    colors={{ header: "#2E86AB", textHeader: "white" }}
                                    cellStyle={{ padding: 4 }}
                                    textStyle={{ fontSize: 10 }}
                                    loadData={async () => dataProductosMasVendidos.sort((a, b) => b.cantidad_total_vendida - a.cantidad_total_vendida)}
                                >
                                    <DinamicTable.Col
                                        key="producto"
                                        label='Producto'
                                        width={150}
                                        data={e => e.row.producto}
                                        footerComponent={(e) => <SView style={{ alignItems: "center" }}><SText style={e.dinamicTable.textStyle}>Total</SText></SView>}
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
                                            e.dinamicTable.data.forEach(a => { total += a.cantidad_total_vendida || 0; });
                                            return <SView style={{ alignItems: "center" }}><SText style={e.dinamicTable.textStyle}>{total.toLocaleString('es-ES')}</SText></SView>;
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
                                            e.dinamicTable.data.forEach(a => { total += a.total_bs_ganado || 0; });
                                            return <SView style={{ alignItems: "center" }}><SText style={e.dinamicTable.textStyle}>{this.formatCurrency(total)}</SText></SView>;
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
                                                    <SView key={item.key} height={18} center row style={{
                                                        backgroundColor: "#eea6a6",
                                                        borderRadius: 4,
                                                        borderWidth: 1,
                                                        borderColor: "#7ae202",
                                                        marginRight: 4,
                                                        marginBottom: 2,
                                                        paddingHorizontal: 2,
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

                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Productos con Mayor Beneficio</SText>
                            <SHr />
                            {loadingProductosMayorBeneficio ? (
                                <SText>Cargando...</SText>
                            ) : Object.keys(chartData).length === 0 ? (
                                <SText>No hay datos disponibles</SText>
                            ) : (
                                <SCharts
                                    type='Bar'
                                    showControl={false}
                                    strokeWidth={1}
                                    space={0.2}
                                    padding={0.6}
                                    showLabel
                                    showGuide
                                    showValue
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