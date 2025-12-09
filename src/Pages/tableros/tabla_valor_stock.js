import React from "react";
import { SPage, SView, SText, SHr } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";

export default class tabla_valor_stock extends React.Component {
    state = {
        dataValorInventario: [],
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
                loadingValorInventario: false
            });
            return;
        }

        await this.loadValorInventario(selected.key);
    };

    loadValorInventario = async (keyEmpresa) => {
        try {
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
            console.error("Error en calcular_valor_stock:", e);
            if (this._mounted) this.setState({ loadingValorInventario: false });
        }
    };

    formatCurrency = (amount) => {
        return "Bs. " + (parseFloat(amount) || 0).toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

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
            dataValorInventario,
            loadingValorInventario
        } = this.state;

        const totalInventario = this.calcularTotalInventario();
        const totalProductos = this.calcularTotalProductos();
        const totalUnidades = this.calcularTotalUnidades();

        const size = 80;
        const cellstyle = { padding: 4 };

        return (
            <SPage title="Valor del Stock">
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Valor del Stock</SText>
                        <SHr />



                        <SHr />

                        {/* Tabla de Valor del Inventario por Modelo */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Valor del Inventario por Modelo</SText>
                            <SHr />
                            {loadingValorInventario ? (
                                <SText>Cargando...</SText>
                            ) : dataValorInventario.length === 0 ? (
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
                                        return dataValorInventario.sort((a, b) => b.valor_inventario - a.valor_inventario);
                                    }}
                                >
                                    <DinamicTable.Col
                                        key="modelo"
                                        label='Modelo'
                                        width={200}
                                        data={e => e.row.modelo}
                                        footerComponent={(e) => {
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{"Total"}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="stock_actual"
                                        label='Stock'
                                        width={60}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => e.row.stock_actual.toLocaleString('es-ES')}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.stock_actual || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{total.toLocaleString('es-ES')}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="precio_compra_unitario"
                                        label='Precio Unitario'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => this.formatCurrency(e.row.precio_compra_unitario)}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            let count = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.precio_compra_unitario || 0;
                                                count++;
                                            })
                                            const promedio = count > 0 ? total / count : 0;
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{this.formatCurrency(promedio)}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="valor_inventario"
                                        label='Valor Total'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => this.formatCurrency(e.row.valor_inventario)}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.valor_inventario || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{this.formatCurrency(total)}</SText>
                                            </SView>
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