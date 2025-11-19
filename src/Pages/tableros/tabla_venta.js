import React from "react";
import { SPage, SView, SText, SHr } from "servisofts-component";
import DinamicTable from "../../Components/DinamicTable";
import MDL from "../../MDL";

export default class tabla_venta extends React.Component {
    state = {
        dataVentasPorDia: [],
        dataVentasPorMes: [],
        dataVentasPorMetodoPago: [],
        loadingVentasPorDia: true,
        loadingVentasPorMes: true,
        loadingVentasPorMetodoPago: true,
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
                loadingVentasPorDia: false,
                loadingVentasPorMes: false,
                loadingVentasPorMetodoPago: false
            });
            return;
        }

        // Cargar las tres funciones en paralelo
        await Promise.all([
            this.loadVentasPorDia(selected.key),
            this.loadVentasPorMes(selected.key),
            this.loadVentasPorMetodoPago(selected.key)
        ]);
    };

    loadVentasPorDia = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("ventas_por_dia", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                fecha: item.fecha,
                cantidad: item.total_ventas ?? item.cantidad ?? 0,
                total: item.total_bs ?? item.total ?? 0,
            }));
            if (this._mounted) this.setState({ dataVentasPorDia: data, loadingVentasPorDia: false });
        } catch (e) {
            console.error("Error en ventas_por_dia:", e);
            if (this._mounted) this.setState({ loadingVentasPorDia: false });
        }
    };

    formatFecha = (fechaISO) => {
        if (!fechaISO) return "N/A";

        // Si ya está formateada, retornar tal cual
        if (typeof fechaISO === 'string' && !fechaISO.includes('T')) {
            return fechaISO;
        }

        // Si es una fecha ISO, extraer solo la parte de la fecha
        if (typeof fechaISO === 'string' && fechaISO.includes('T')) {
            return fechaISO.split('T')[0];
        }

        // Si es un objeto Date
        if (fechaISO instanceof Date) {
            return fechaISO.toISOString().split('T')[0];
        }

        return "N/A";
    };

    loadVentasPorMes = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("ventas_por_mes", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                mes: this.formatFecha(item.mes ?? item.periodo),
                cantidad_ventas: item.cantidad_ventas ?? item.total_ventas ?? 0,
                total_bs: item.total_bs ?? item.total ?? 0,

            }));
            if (this._mounted) this.setState({ dataVentasPorMes: data, loadingVentasPorMes: false });
        } catch (e) {
            console.error("Error en ventas_por_mes:", e);
            if (this._mounted) this.setState({ loadingVentasPorMes: false });
        }
    };

    loadVentasPorMetodoPago = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("ventas_por_metodo_pago", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                metodo_pago: item.metodo_pago ?? item.tipo_pago ?? "N/A",
                total_ventas: item.total_ventas ?? item.cantidad ?? 0,
                total_bs: item.total_bs ?? item.total ?? 0,

            }));
            if (this._mounted) this.setState({ dataVentasPorMetodoPago: data, loadingVentasPorMetodoPago: false });
        } catch (e) {
            console.error("Error en ventas_por_metodo_pago:", e);
            if (this._mounted) this.setState({ loadingVentasPorMetodoPago: false });
        }
    };

    renderTabla(titulo, data, loading, headers) {
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
                />
            </SView>
        );
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    render() {
        const {
            dataVentasPorDia,
            dataVentasPorMes,
            dataVentasPorMetodoPago,
            loadingVentasPorDia,
            loadingVentasPorMes,
            loadingVentasPorMetodoPago
        } = this.state;

        return (
            <SPage title="Estadísticas de Ventas">
                <SView col={"xs-12"} padding={16}>
                    <SText fontSize={18} bold>Estadísticas de Ventas</SText>
                    <SHr />




                    <SView hide={["md", "lg", "xl"]}>
                        {this.renderTabla(
                            "Ventas por Día",
                            dataVentasPorDia,
                            loadingVentasPorDia,
                            [
                                { key: "fecha", label: "Fecha" },
                                { key: "cantidad", label: "Ventas" },
                                { key: "total", label: "Total (Bs.)" },
                            ]
                        )}

                        {this.renderTabla(
                            "Ventas por Mes",
                            dataVentasPorMes,
                            loadingVentasPorMes,
                            [
                                { key: "mes", label: "Mes" },
                                { key: "cantidad_ventas", label: "Cantidad de Ventas" },
                                { key: "total_bs", label: "Total (Bs.)" },

                            ]
                        )}

                        {this.renderTabla(
                            "Ventas por Método de Pago",
                            dataVentasPorMetodoPago,
                            loadingVentasPorMetodoPago,
                            [
                                { key: "metodo_pago", label: "Método de Pago" },
                                { key: "total_ventas", label: "Total Ventas" },
                                { key: "total_bs", label: "Total (Bs.)" },

                            ]
                        )}
                    </SView>
                </SView>
            </SPage>
        );
    }
}