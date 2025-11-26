import React from "react";
import { SPage, SView, SText, SHr } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";

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

        const size = 80;
        const cellstyle = { padding: 4 };

        return (
            <SPage title="Estadísticas de Compras">
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Estadísticas de Compras</SText>
                        <SHr />

                        {/* Tabla de Últimas 10 Compras */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Últimas 10 Compras</SText>
                            <SHr />
                            {loadingUltimasCompras ? (
                                <SText>Cargando...</SText>
                            ) : dataUltimasCompras.length === 0 ? (
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
                                        return dataUltimasCompras.sort((a, b) => new Date(b.fecha_on) - new Date(a.fecha_on));
                                    }}
                                >
                                    <DinamicTable.Col
                                        key="fecha_on"
                                        label='Fecha'
                                        width={100}
                                        data={e => e.row.fecha_on}
                                        footerComponent={(e) => {
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{"Total"}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="descripcion"
                                        label='Descripción'
                                        width={150}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => e.row.descripcion}
                                        footerComponent={(e) => {
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{"-"}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="tipo_pago"
                                        label='Tipo Pago'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => e.row.tipo_pago}
                                        footerComponent={(e) => {
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{"-"}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="total_bs"
                                        label='Total (Bs.)'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => `Bs. ${Number(e.row.total_bs).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.total_bs || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{`Bs. ${Number(total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}</SText>
                                            </SView>
                                        }}
                                    />
                                </DinamicTable>
                            )}
                        </SView>

                        <SHr />

                        {/* Tabla de Compras por Mes */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Compras por Mes</SText>
                            <SHr />
                            {loadingComprasPorMes ? (
                                <SText>Cargando...</SText>
                            ) : dataComprasPorMes.length === 0 ? (
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
                                        return dataComprasPorMes.sort((a, b) => new Date(b.mes) - new Date(a.mes));
                                    }}
                                >
                                    <DinamicTable.Col
                                        key="mes_formateado"
                                        label='Mes'
                                        width={120}
                                        data={e => e.row.mes_formateado}
                                        footerComponent={(e) => {
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{"Total"}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="cantidad_compras"
                                        label='Cant. Compras'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => e.row.cantidad_compras}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.cantidad_compras || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{total}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="total_bs"
                                        label='Total (Bs.)'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => `Bs. ${Number(e.row.total_bs).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.total_bs || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{`Bs. ${Number(total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}</SText>
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