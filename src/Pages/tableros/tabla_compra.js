import React from "react";
import { SPage, SView, SText, SHr } from "servisofts-component";
import DinamicTable from "../../Components/DinamicTable";
import MDL from "../../MDL";

export default class tabla_compra extends React.Component {
    state = {
        dataUltimasCompras: [],
        dataComprasPorMes: [],
        loadingUltimasCompras: true,
        loadingComprasPorMes: true,
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
                loadingUltimasCompras: false,
                loadingComprasPorMes: false
            });
            return;
        }

        // Cargar las dos funciones en paralelo
        await Promise.all([
            this.loadUltimasCompras(selected.key),
            this.loadComprasPorMes(selected.key)
        ]);
    };

    loadUltimasCompras = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("ultimas_10_compras", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                key: item.key,
                descripcion: item.descripcion ?? "Sin descripción",
                fecha_on: this.formatFecha(item.fecha_on),
                estado: item.estado,
                estado_descripcion: this.getEstadoDescripcion(item.estado),
                key_proveedor: item.key_proveedor,
                tipo_pago: item.tipo_pago ?? "No especificado",
                total_bs: item.total_bs ?? 0
            }));
            if (this._mounted) this.setState({ dataUltimasCompras: data, loadingUltimasCompras: false });
        } catch (e) {
            console.error("Error en ultimas_10_compras:", e);
            if (this._mounted) this.setState({ loadingUltimasCompras: false });
        }
    };

    loadComprasPorMes = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("compras_totales_por_mes", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                mes: this.formatFecha(item.mes),
                mes_formateado: item.mes_formateado ?? "N/A",
                cantidad_compras: item.cantidad_compras ?? 0,
                total_bs: item.total_bs ?? 0
            }));
            if (this._mounted) this.setState({ dataComprasPorMes: data, loadingComprasPorMes: false });
        } catch (e) {
            console.error("Error en compras_totales_por_mes:", e);
            if (this._mounted) this.setState({ loadingComprasPorMes: false });
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

    getEstadoDescripcion = (estado) => {
        const estados = {
            1: "Activo",
            0: "Inactivo",
            2: "Cancelado"
        };
        return estados[estado] || "Desconocido";
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
            dataUltimasCompras,
            dataComprasPorMes,
            loadingUltimasCompras,
            loadingComprasPorMes
        } = this.state;

        return (
            <SPage title="Estadísticas de Compras">
                <SView col={"xs-12"} padding={16}>
                    <SText fontSize={18} bold>Estadísticas de Compras</SText>
                    <SHr />



                    {/* Versión para móviles (una debajo de otra) */}
                    <SView hide={["md", "lg", "xl"]}>
                        {this.renderTabla(
                            "Últimas 10 Compras",
                            dataUltimasCompras,
                            loadingUltimasCompras,
                            [
                                { key: "fecha_on", label: "Fecha" },
                                { key: "descripcion", label: "Descripción" },

                                { key: "total_bs", label: "Total (Bs.)" },
                            ]
                        )}

                        {this.renderTabla(
                            "Compras por Mes",
                            dataComprasPorMes,
                            loadingComprasPorMes,
                            [
                                { key: "mes_formateado", label: "Mes" },
                                { key: "cantidad_compras", label: "Cantidad Compras" },
                                { key: "total_bs", label: "Total (Bs.)" },
                            ]
                        )}
                    </SView>
                </SView>
            </SPage>
        );
    }
}