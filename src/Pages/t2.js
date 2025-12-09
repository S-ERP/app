import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SHr, SIcon, SImage, SPage, SSPiner, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import MDL from '../MDL';
import SCharts from 'servisofts-charts';

class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            chartData: {},
            selectedFunction: "ventas_por_dia",
            functions: [
                { key: "ventas_por_dia", label: "Ventas por Día" },
                { key: "ventas_por_mes", label: "Ventas por Mes" },
                { key: "ventas_por_metodo_pago", label: "Ventas por Método Pago" },
                { key: "productos_mas_vendidos", label: "Productos Más Vendidos" },
                { key: "productos_mayor_beneficio", label: "Productos Mayor Beneficio" }
            ]
        };
    }

    componentDidMount() {
        this.loadChartData();
    }

    loadChartData = async () => {
        this.setState({ loading: true });

        try {
            // Esperar selección de empresa
            await new Promise(resolve => setTimeout(resolve, 100));
            const selected = MDL.empresa.select;
            if (!selected) {
                this.setState({ loading: false, chartData: {} });
                return;
            }

            const data = await this.executeFunction(this.state.selectedFunction, selected.key);
            const chartData = this.transformDataForChart(data, this.state.selectedFunction);

            this.setState({ chartData, loading: false });
        } catch (error) {
            console.error("Error cargando datos:", error);
            this.setState({ loading: false, chartData: {} });
        }
    };

    executeFunction = async (functionName, keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function(functionName, [keyEmpresa]);
            return Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
        } catch (e) {
            console.error(`Error en ${functionName}:`, e);
            return [];
        }
    };

    transformDataForChart = (data, functionType) => {
        if (!data || data.length === 0) return {};

        const limitedData = data.slice(0, 5); // Máximo 5 elementos

        switch (functionType) {
            case "ventas_por_dia":
                return limitedData.reduce((acc, item) => {
                    const fecha = item.fecha?.split('T')[0]?.split('-').reverse().join('/') || "Sin fecha";
                    acc[fecha] = item.total_ventas ?? item.cantidad ?? 0;
                    return acc;
                }, {});

            case "ventas_por_mes":
                return limitedData.reduce((acc, item) => {
                    const mes = item.mes_formateado ?? item.mes?.split('-')[1] + '/' + item.mes?.split('-')[0] ?? "Sin mes";
                    acc[mes] = item.cantidad_ventas ?? item.total_ventas ?? 0;
                    return acc;
                }, {});

            case "ventas_por_metodo_pago":
                return limitedData.reduce((acc, item) => {
                    const metodo = (item.metodo_pago ?? "Sin método").substring(0, 12);
                    acc[metodo] = item.total_ventas ?? item.cantidad ?? 0;
                    return acc;
                }, {});

            case "productos_mas_vendidos":
                return limitedData.reduce((acc, item) => {
                    const producto = (item.producto ?? "Sin nombre").substring(0, 12);
                    acc[producto] = item.cantidad_total_vendida ?? 0;
                    return acc;
                }, {});

            case "productos_mayor_beneficio":
                return limitedData.reduce((acc, item) => {
                    const producto = (item.producto ?? "Sin nombre").substring(0, 12);
                    acc[producto] = item.beneficio_promedio ?? 0;
                    return acc;
                }, {});

            default:
                return {};
        }
    };

    handleFunctionChange = (functionKey) => {
        this.setState({ selectedFunction: functionKey }, this.loadChartData);
    };

    render() {
        const { loading, chartData, selectedFunction, functions } = this.state;

        return (
            <SView flex backgroundColor={STheme.color.background}>
                {/* Header fijo */}
                <SView height={60} backgroundColor={STheme.color.primary} center>
                    <SText bold color='white' fontSize={18}>Gráficos de Datos</SText>
                </SView>

                {/* Selector de funciones */}
                <SView padding={8}>
                    <SText bold fontSize={14} center>Seleccionar Función:</SText>
                    <SHr />
                    <SView row center wrap>
                        {functions.map((func) => (
                            <SButtom key={func.key}
                                onPress={() => this.handleFunctionChange(func.key)}
                                style={{
                                    margin: 2,
                                    padding: 6,
                                    backgroundColor: selectedFunction === func.key ? STheme.color.primary : "#E0E0E0",
                                    borderRadius: 4,
                                }}
                            >
                                <SText color={selectedFunction === func.key ? "white" : "#333"} fontSize={10}>
                                    {func.label}
                                </SText>
                            </SButtom>
                        ))}
                    </SView>
                </SView>

                <SHr />

                {/* Gráfico */}
                <SView flex center padding={8}>
                    {loading ? (
                        <SView center>
                            <SSPiner />
                            <SText>Cargando...</SText>
                        </SView>
                    ) : Object.keys(chartData).length === 0 ? (
                        <SText>No hay datos</SText>
                    ) : (
                        <SView width={800} height={450}>
                            <SText bold center fontSize={14} margin={4}>
                                {functions.find(f => f.key === selectedFunction)?.label}
                            </SText>
                            <SCharts
                                type='Line'
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
                        </SView>
                    )}
                </SView>


            </SView>
        );
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Test);