import React from "react";
import { SPage, SView, SText, SHr } from "servisofts-component";
import DinamicTable from "../../Components/DinamicTable";
import MDL from "../../MDL";

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

        // Cargar las dos funciones en paralelo
        await Promise.all([
            this.loadProductosMasVendidos(selected.key),
            this.loadProductosMayorBeneficio(selected.key)
        ]);
    };

    loadProductosMasVendidos = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("productos_mas_vendidos", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                producto: item.producto ?? "Sin nombre",
                cantidad_total_vendida: item.cantidad_total_vendida ?? 0,
                total_bs_ganado: item.total_bs_ganado ?? 0
            }));
            if (this._mounted) this.setState({ dataProductosMasVendidos: data, loadingProductosMasVendidos: false });
        } catch (e) {
            console.error("Error en productos_mas_vendidos:", e);
            if (this._mounted) this.setState({ loadingProductosMasVendidos: false });
        }
    };

    loadProductosMayorBeneficio = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("productos_mayor_beneficio", [keyEmpresa]);
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

        return (
            <SPage title="Estadísticas de Productos">
                <SView col={"xs-12"} padding={16}>
                    <SText fontSize={18} bold>Estadísticas de Productos</SText>
                    <SHr />

                    {/* Versión para móviles (una debajo de otra) */}
                    <SView hide={["md", "lg", "xl"]}>
                        {this.renderTabla(
                            "Productos Más Vendidos",
                            dataProductosMasVendidos,
                            loadingProductosMasVendidos,
                            [
                                { key: "producto", label: "Producto" },
                                { key: "cantidad_total_vendida", label: "Cantidad Vendida" },
                                { key: "total_bs_ganado", label: "Total Ganado (Bs.)" },
                            ],
                            {
                                total_bs_ganado: (value) => this.formatCurrency(value)
                            }
                        )}

                        {this.renderTabla(
                            "Productos con Mayor Beneficio",
                            dataProductosMayorBeneficio,
                            loadingProductosMayorBeneficio,
                            [
                                { key: "producto", label: "Producto" },
                                { key: "precio_compra_promedio", label: "Precio Compra" },
                                { key: "precio_venta_promedio", label: "Precio Venta" },
                                { key: "beneficio_promedio", label: "Beneficio" },
                            ],
                            {
                                precio_compra_promedio: (value) => this.formatCurrency(value),
                                precio_venta_promedio: (value) => this.formatCurrency(value),
                                beneficio_promedio: (value) => this.formatCurrency(value)
                            }
                        )}
                    </SView>

                </SView>
            </SPage>
        );
    }
}