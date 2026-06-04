import React from "react";
import { SPage, SView, SText, SHr, STheme, SButtom, SNavigation } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import FechaFullFilter from "../../Components/FechaFullFilter";
import BarraRechartsBd from "../recharts/Components/BarraRechartsBd";
import LineaRechartsBd from "../recharts/Components/LineaRechartsBd";
import CircularRechartsBd from "../recharts/Components/CircularRechartsBd";
import DetalleTabla from "./Components/DetalleTabla";
import Model from "../../Model";

export default class inventario extends React.Component {
    state = {
        empresaSeleccionada: null,
        almacenes: [],
        categorias: [],
        dataStockByCategoria: [],
        dataStockByAlmacen: [],
        dataProductosBajoStock: [],
        dataEvolucionInventario: [],
        dataDistribucionProductos: [],
        dataTiempoRotacion: [],
        loading: true,
        selectedAlmacen: null,
    };

    componentDidMount() {
        this._mounted = true;
        this.initDashboard();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    initDashboard = async () => {
        const waitForSelect = async (timeout = 3000, interval = 200) => {
            const start = Date.now();
            while (!MDL.empresa.select && Date.now() - start < timeout) {
                await new Promise((res) => setTimeout(res, interval));
            }
            return MDL.empresa.select;
        };

        const selected = MDL.empresa.select || await waitForSelect();
        if (!selected) {
            if (this._mounted) {
                this.setState({ loading: false });
            }
            return;
        }

        try {
            const almacenes = await MDL.inventario.getAllAlmacen?.() || [];
            const categorias = await MDL.inventario.getAllCategoria?.() || [];
            
            if (this._mounted) {
                this.setState({ 
                    empresaSeleccionada: selected, 
                    almacenes, 
                    categorias 
                }, this.loadDashboardData);
            }
        } catch (e) {
            console.error("Error inicializando dashboard:", e);
            if (this._mounted) {
                this.setState({ loading: false });
            }
        }
    };

    loadDashboardData = async () => {
        const { empresaSeleccionada } = this.state;
        if (!empresaSeleccionada) return;
        
        this.setState({ loading: true });
        
        try {
            await Promise.all([
                this.loadStockByCategoria(empresaSeleccionada.key),
                this.loadStockByAlmacen(empresaSeleccionada.key),
                this.loadProductosBajoStock(empresaSeleccionada.key),
                this.loadDistribucionProductos(empresaSeleccionada.key),
            ]);
        } catch (e) {
            console.error("Error cargando datos del dashboard:", e);
        } finally {
            if (this._mounted) {
                this.setState({ loading: false });
            }
        }
    };

    loadStockByCategoria = async (keyEmpresa) => {
        try {
            // Obtener todos los productos
            const productos = await MDL.inventario.getAllProducto?.() || [];
            
            // Agrupar por categoría y sumar stock
            const stockPorCategoria = {};
            
            productos.forEach(producto => {
                const categoria = producto.categoria || "Sin categoría";
                const stock = Number(producto.stock ?? producto.cantidad ?? 0);
                
                if (!stockPorCategoria[categoria]) {
                    stockPorCategoria[categoria] = 0;
                }
                stockPorCategoria[categoria] += stock;
            });

            const data = Object.entries(stockPorCategoria).map(([categoria, stock]) => ({
                name: categoria,
                pv: stock,
                total: stock,
            })).sort((a, b) => b.pv - a.pv);

            console.log("Stock por categoría:", data);

            if (this._mounted) {
                this.setState({ dataStockByCategoria: data });
            }
        } catch (e) {
            console.error("Error en loadStockByCategoria:", e);
            if (this._mounted) {
                this.setState({ dataStockByCategoria: [] });
            }
        }
    };

    loadStockByAlmacen = async (keyEmpresa) => {
        try {
            const almacenes = this.state.almacenes || [];
            const productos = await MDL.inventario.getAllProducto?.() || [];
            
            const stockPorAlmacen = {};
            
            almacenes.forEach(almacen => {
                stockPorAlmacen[almacen.key] = {
                    name: almacen.descripcion || almacen.nombre || "Almacén",
                    cantidad: 0,
                };
            });

            productos.forEach(producto => {
                const almacen = producto.key_almacen || producto.almacen;
                const stock = Number(producto.stock ?? producto.cantidad ?? 0);
                
                if (stockPorAlmacen[almacen]) {
                    stockPorAlmacen[almacen].cantidad += stock;
                }
            });

            const data = Object.values(stockPorAlmacen)
                .sort((a, b) => b.cantidad - a.cantidad)
                .map(item => ({
                    name: item.name,
                    value: item.cantidad,
                }));

            console.log("Stock por almacén:", data);

            if (this._mounted) {
                this.setState({ dataStockByAlmacen: data });
            }
        } catch (e) {
            console.error("Error en loadStockByAlmacen:", e);
            if (this._mounted) {
                this.setState({ dataStockByAlmacen: [] });
            }
        }
    };

    loadProductosBajoStock = async (keyEmpresa) => {
        try {
            const productos = await MDL.inventario.getAllProductos?.(keyEmpresa) || [];
            console.log("Productos obtenidos para bajo stock:", productos);
            // Productos con stock menor al 20% de su stock mínimo (o stock < 10 si no tienen mínimo)
            const bajoStock = productos
                .filter(p => {
                    const stock = Number(p.stock ?? p.cantidad ?? 0);
                    const stockMinimo = Number(p.stock_minimo ?? 10);
                    return stock <= (stockMinimo * 0.2);
                })
                .map(p => ({
                    producto: p.descripcion || p.nombre || "Producto",
                    stock_actual: Number(p.stock ?? p.cantidad ?? 0),
                    stock_minimo: Number(p.stock_minimo ?? 10),
                    porcentaje: Math.round((Number(p.stock ?? 0) / Number(p.stock_minimo ?? 1)) * 100),
                }))
                .sort((a, b) => a.stock_actual - b.stock_actual)
                .slice(0, 10);

            console.log("Productos bajo stock:", bajoStock);

            if (this._mounted) {
                this.setState({ dataProductosBajoStock: bajoStock });
            }
        } catch (e) {
            console.error("Error en loadProductosBajoStock:", e);
            if (this._mounted) {
                this.setState({ dataProductosBajoStock: [] });
            }
        }
    };

    loadDistribucionProductos = async (keyEmpresa) => {
        console.log("keyEmpresa:", keyEmpresa);
        try {
            const productos = await MDL.inventario.getAllProductos?.(keyEmpresa) || [];
            console.log("PRODUCTOS:", productos);
            // Agrupar por categoría con conteo
            const distribucion = {};
            
            productos.forEach(producto => {
                const categoria = producto.categoria || "Sin categoría";
                distribucion[categoria] = (distribucion[categoria] || 0) + 1;
            });

            const data = Object.entries(distribucion)
                .map(([name, value]) => ({
                    name,
                    value,
                }))
                .sort((a, b) => b.value - a.value);

            console.log("Distribución de productos:", data);

            if (this._mounted) {
                this.setState({ dataDistribucionProductos: data });
            }
        } catch (e) {
            console.error("Error en loadDistribucionProductos:", e);
            if (this._mounted) {
                this.setState({ dataDistribucionProductos: [] });
            }
        }
    };

    handleRefresh = () => {
        this.loadDashboardData();
    };

    render() {
        let permiso = MDL.rolesPermisos.getPermiso({ url: "/dashboard/inventario", permiso: 'ver' })
        if (!permiso) {
            return (
                <SPage title="Dashboard de Inventario" center>
                    <SView col="xs-12" center>
                        <SText fontSize={16} color={STheme.color.danger}>No tienes permiso para ver este contenido.</SText>
                    </SView>
                </SPage>
            );
        }

        const {
            dataStockByCategoria,
            dataStockByAlmacen,
            dataProductosBajoStock,
            dataDistribucionProductos,
            loading,
        } = this.state;

        return (
            <SPage title="Dashboard de Inventario">
                <ScrollView>
                    <SView col="xs-12" padding={16}>
                        {/* Encabezado */}
                        <SView col="xs-12" row style={{ marginBottom: 20 }}>
                            <SView col="xs-12 sm-6">
                                <SText fontSize={18} bold color={STheme.color.text}>
                                    Dashboard de Inventario
                                </SText>
                            </SView>
                            <SView col="xs-12 sm-6" style={{ justifyContent: "flex-end" }}>
                                <SButtom 
                                    color={STheme.color.info}
                                    onPress={this.handleRefresh}
                                    text="🔄 Actualizar"
                                    fontSize={12}
                                />
                            </SView>
                        </SView>

                        <SHr />

                        {/* Fila 1: Stock por Categoría y Stock por Almacén */}
                        <SView col="xs-12" row style={{ marginVertical: 20 }}>
                            {/* Gráfico de Barras: Stock por Categoría */}
                            <SView col="xs-12 md-6" style={{ paddingRight: 10, marginBottom: 20 }}>
                                <SText fontSize={16} bold style={{ marginBottom: 10 }}>
                                    📊 Stock por Categoría
                                </SText>
                                {loading ? (
                                    <SText>Cargando...</SText>
                                ) : dataStockByCategoria.length > 0 ? (
                                    <BarraRechartsBd 
                                        data={dataStockByCategoria}
                                        nameKey="name"
                                        valueKey="pv"
                                        height={300}
                                    />
                                ) : (
                                    <SText color={STheme.color.secondary}>No hay datos disponibles</SText>
                                )}
                            </SView>

                            {/* Gráfico Circular: Distribución de Productos */}
                            <SView col="xs-12 md-6" style={{ paddingLeft: 10, marginBottom: 20 }}>
                                <SText fontSize={16} bold style={{ marginBottom: 10 }}>
                                    🥧 Distribución de Productos
                                </SText>
                                {loading ? (
                                    <SText>Cargando...</SText>
                                ) : dataDistribucionProductos.length > 0 ? (
                                    <CircularRechartsBd 
                                        data={dataDistribucionProductos}
                                        height={300}
                                    />
                                ) : (
                                    <SText color={STheme.color.secondary}>No hay datos disponibles</SText>
                                )}
                            </SView>
                        </SView>

                        <SHr />

                        {/* Fila 2: Stock por Almacén */}
                        <SView col="xs-12" style={{ marginVertical: 20 }}>
                            <SText fontSize={16} bold style={{ marginBottom: 10 }}>
                                🏪 Stock por Almacén
                            </SText>
                            {loading ? (
                                <SText>Cargando...</SText>
                            ) : dataStockByAlmacen.length > 0 ? (
                                <CircularRechartsBd 
                                    data={dataStockByAlmacen}
                                    height={350}
                                />
                            ) : (
                                <SText color={STheme.color.secondary}>No hay almacenes disponibles</SText>
                            )}
                        </SView>

                        <SHr />

                        {/* Fila 3: Productos con Bajo Stock */}
                        <SView col="xs-12" style={{ marginVertical: 20 }}>
                            <SText fontSize={16} bold style={{ marginBottom: 10 }} color={STheme.color.danger}>
                                ⚠️ Productos con Bajo Stock
                            </SText>
                            {loading ? (
                                <SText>Cargando...</SText>
                            ) : dataProductosBajoStock.length > 0 ? (
                                <SView col="xs-12" style={{ backgroundColor: STheme.color.lightGray, borderRadius: 8, padding: 12 }}>
                                    {dataProductosBajoStock.map((item, index) => (
                                        <SView key={index} col="xs-12" row style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: STheme.color.disabled }}>
                                            <SView col="xs-6">
                                                <SText fontSize={12} bold>{item.producto}</SText>
                                                <SText fontSize={10} color={STheme.color.secondary}>
                                                    Stock: {item.stock_actual} / {item.stock_minimo}
                                                </SText>
                                            </SView>
                                            <SView col="xs-3" center>
                                                <SText 
                                                    fontSize={11} 
                                                    bold 
                                                    color={item.porcentaje < 50 ? STheme.color.danger : STheme.color.warning}
                                                >
                                                    {item.porcentaje}%
                                                </SText>
                                            </SView>
                                            <SView col="xs-3" style={{ justifyContent: "flex-end" }}>
                                                <SButtom 
                                                    color={STheme.color.danger}
                                                    text="Reabastecer"
                                                    fontSize={10}
                                                    style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                                                />
                                            </SView>
                                        </SView>
                                    ))}
                                </SView>
                            ) : (
                                <SText color={STheme.color.success}>✓ Todos los productos tienen stock suficiente</SText>
                            )}
                        </SView>

                        {/* Espacio final */}
                        <SView col="xs-12" style={{ marginVertical: 30 }} />
                    </SView>
                </ScrollView>
            </SPage>
        );
    }
}