import React from "react";
import { SPage, SView, SText, SHr } from "servisofts-component";
import DinamicTable from "../../Components/DinamicTable";
import MDL from "../../MDL";

export default class tabla_inventario extends React.Component {
    state = {
        dataProductosMayorStock: [],
        dataValorInventario: [],
        loadingProductosMayorStock: true,
        loadingValorInventario: true,
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
                loadingProductosMayorStock: false,
                loadingValorInventario: false
            });
            return;
        }

        // Cargar las dos funciones en paralelo
        await Promise.all([
            this.loadProductosMayorStock(selected.key),
            this.loadValorInventario(selected.key)
        ]);
    };

    loadProductosMayorStock = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("productos_mayor_stock_compra_venta", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                producto: item.producto ?? "Sin nombre",
                stock_actual: item.stock_actual ?? 0
            }));
            if (this._mounted) this.setState({ dataProductosMayorStock: data, loadingProductosMayorStock: false });
        } catch (e) {
            console.error("Error en productos_mayor_stock:", e);
            if (this._mounted) this.setState({ loadingProductosMayorStock: false });
        }
    };

    loadValorInventario = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("valor_compra_venta", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                producto: item.producto ?? "Sin nombre",
                stock_actual: item.stock_actual ?? 0,
                precio_compra: item.precio_compra ?? 0,
                valor_inventario: item.valor_inventario ?? 0
            }));
            if (this._mounted) this.setState({ dataValorInventario: data, loadingValorInventario: false });
        } catch (e) {
            console.error("Error en valor_inventario:", e);
            if (this._mounted) this.setState({ loadingValorInventario: false });
        }
    };

    formatCurrency = (amount) => {
        return "Bs. " + (parseFloat(amount) || 0).toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    renderTabla(titulo, data, loading, headers, formatters = {}) {
        if (loading) {
            return (
                <SView col={"xs-12"} padding={8}>
                    <SText fontSize={16} bold>{titulo}</SText>
                    <SHr />
                    <SText>Cargando...</SText>
                </SView>
            );
        }

        if (data.length === 0) {
            return (
                <SView col={"xs-12"} padding={8}>
                    <SText fontSize={16} bold>{titulo}</SText>
                    <SHr />
                    <SText>No hay datos disponibles</SText>
                </SView>
            );
        }

        return (
            <SView col={"xs-12"} padding={8}>
                <SText fontSize={16} bold>{titulo}</SText>
                <SHr />
                <DinamicTable
                    data={data}
                    header={headers}
                    formatters={formatters}
                />
            </SView>
        );
    }

    calcularTotalInventario() {
        const { dataValorInventario } = this.state;
        return dataValorInventario.reduce((total, item) => total + (item.valor_inventario || 0), 0);
    }

    calcularTotalProductos() {
        const { dataValorInventario } = this.state;
        return dataValorInventario.length;
    }

    calcularTotalUnidades() {
        const { dataValorInventario } = this.state;
        return dataValorInventario.reduce((total, item) => total + (item.stock_actual || 0), 0);
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    render() {
        const {
            dataProductosMayorStock,
            dataValorInventario,
            loadingProductosMayorStock,
            loadingValorInventario
        } = this.state;

        const totalInventario = this.calcularTotalInventario();
        const totalProductos = this.calcularTotalProductos();
        const totalUnidades = this.calcularTotalUnidades();

        return (
            <SPage title="Tablero de Inventario">
                <SView col={"xs-12"} padding={16}>
                    <SText fontSize={18} bold>Tablero de Inventario</SText>
                    <SHr />

                    {/* Resumen General */}
                    {!loadingValorInventario && dataValorInventario.length > 0 && (
                        <SView style={{
                            padding: 16,
                            backgroundColor: '#e8f5e8',
                            borderRadius: 8,
                            marginBottom: 16,
                            border: '1px solid #c8e6c9'
                        }}>
                            <SText fontSize={16} bold color="#2e7d32" style={{ marginBottom: 8 }}>
                                Resumen del Inventario
                            </SText>
                            <SView row>
                                <SView col={"xs-4"} center>
                                    <SText fontSize={14} bold>{totalProductos}</SText>
                                    <SText fontSize={12} color="#666">Productos</SText>
                                </SView>
                                <SView col={"xs-4"} center>
                                    <SText fontSize={14} bold>{totalUnidades}</SText>
                                    <SText fontSize={12} color="#666">Unidades</SText>
                                </SView>
                                <SView col={"xs-4"} center>
                                    <SText fontSize={14} bold>{this.formatCurrency(totalInventario)}</SText>
                                    <SText fontSize={12} color="#666">Valor Total</SText>
                                </SView>
                            </SView>
                        </SView>
                    )}


                    {/* Versión para móviles (una debajo de otra) */}
                    <SView hide={["md", "lg", "xl"]}>
                        {this.renderTabla(
                            "Productos con Mayor Stock",
                            dataProductosMayorStock,
                            loadingProductosMayorStock,
                            [
                                { key: "producto", label: "Producto" },
                                { key: "stock_actual", label: "Stock Actual" },
                            ]
                        )}

                        {this.renderTabla(
                            "Valor del Inventario",
                            dataValorInventario,
                            loadingValorInventario,
                            [
                                { key: "producto", label: "Producto" },
                                { key: "stock_actual", label: "Stock" },
                                { key: "precio_compra", label: "Precio Compra" },
                                { key: "valor_inventario", label: "Valor Total" },
                            ],
                            {
                                precio_compra: (value) => this.formatCurrency(value),
                                valor_inventario: (value) => this.formatCurrency(value)
                            }
                        )}
                    </SView>

                </SView>
            </SPage>
        );
    }
}