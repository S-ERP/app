import React from "react";
import { SPage, SView, SText, SHr } from "servisofts-component";
import DinamicTable from "../../Components/DinamicTable";
import MDL from "../../MDL";

export default class tabla_valor_stock extends React.Component {
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

            this.loadValorInventario(selected.key)
        ]);
    };


    loadValorInventario = async (keyEmpresa) => {
        try {
            // Cambiar por el nombre correcto de la función que creamos
            const res = await MDL.inventario.execute_function("calcular_valor_stock", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                key_modelo: item.key_modelo ?? "",
                modelo: item.modelo ?? "Sin nombre",
                stock_actual: item.stock_actual ?? 0,
                precio_compra_unitario: item.precio_compra_unitario ?? 0,
                valor_inventario: item.valor_inventario ?? 0
            }));
            if (this._mounted) this.setState({ dataValorInventario: data, loadingValorInventario: false });
        } catch (e) {
            console.error("Error en fn_calcular_valor_inventario_json:", e);
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
            <SPage title="Valor del Stock">


                {/* Versión para móviles (una debajo de otra) */}
                <SView hide={["md", "lg", "xl"]}>

                    {this.renderTabla(
                        "Valor del Inventario por Modelo",
                        dataValorInventario,
                        loadingValorInventario,
                        [
                            { key: "modelo", label: "Modelo" },
                            { key: "stock_actual", label: "Stock" },
                            { key: "precio_compra_unitario", label: "Precio Unitario" },
                            { key: "valor_inventario", label: "Valor Total" },
                        ],
                        {
                            precio_compra_unitario: (value) => this.formatCurrency(value),
                            valor_inventario: (value) => this.formatCurrency(value)
                        }
                    )}
                </SView>


            </SPage >
        );
    }
}