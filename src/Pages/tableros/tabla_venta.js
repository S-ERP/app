import React from "react";
import { SPage, SView, SText, SHr } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";

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

    loadVentasPorMes = async (keyEmpresa) => {
        try {
            const res = await MDL.compra_venta.execute_function("ventas_por_mes", [keyEmpresa]);
            const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
            const data = raw.map(item => ({
                mes: item.mes ?? item.periodo,
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

    render() {
        const {
            dataVentasPorDia,
            dataVentasPorMes,
            dataVentasPorMetodoPago,
            loadingVentasPorDia,
            loadingVentasPorMes,
            loadingVentasPorMetodoPago
        } = this.state;

        const size = 80;
        const cellstyle = { padding: 4 };

        return (
            <SPage title="Estadísticas de Ventas">
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Estadísticas de Ventas</SText>
                        <SHr />

                        {/* Tabla de Ventas por Día */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Ventas por Día</SText>
                            <SHr />
                            {loadingVentasPorDia ? (
                                <SText>Cargando...</SText>
                            ) : dataVentasPorDia.length === 0 ? (
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
                                        return dataVentasPorDia.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                                    }}
                                >
                                    <DinamicTable.Col
                                        key="fecha"
                                        label='Fecha'
                                        width={100}
                                        data={e => this.formatFecha(e.row.fecha)}
                                        footerComponent={(e) => {
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{"Total"}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="cantidad"
                                        label='Cant. Ventas'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => e.row.cantidad}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.cantidad || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{total}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="total"
                                        label='Monto Total'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => `Bs. ${Number(e.row.total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.total || 0
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

                        {/* Tabla de Ventas por Mes */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Ventas por Mes</SText>
                            <SHr />
                            {loadingVentasPorMes ? (
                                <SText>Cargando...</SText>
                            ) : dataVentasPorMes.length === 0 ? (
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
                                        return dataVentasPorMes.sort((a, b) => new Date(b.mes) - new Date(a.mes));
                                    }}
                                >
                                    <DinamicTable.Col
                                        key="mes"
                                        label='Mes'
                                        width={100}
                                        data={e => this.formatFecha(e.row.mes)}
                                        footerComponent={(e) => {
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{"Total"}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="cantidad_ventas"
                                        label='Cant. Ventas'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => e.row.cantidad_ventas}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.cantidad_ventas || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{total}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="total_bs"
                                        label='Monto Total'
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

                        {/* Tabla de Ventas por Método de Pago */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Ventas por Método de Pago</SText>
                            <SHr />
                            {loadingVentasPorMetodoPago ? (
                                <SText>Cargando...</SText>
                            ) : dataVentasPorMetodoPago.length === 0 ? (
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
                                        return dataVentasPorMetodoPago.sort((a, b) => b.total_bs - a.total_bs);
                                    }}
                                >
                                    <DinamicTable.Col
                                        key="metodo_pago"
                                        label='Método Pago'
                                        width={120}
                                        data={e => e.row.metodo_pago}
                                        footerComponent={(e) => {
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{"Total"}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="total_ventas"
                                        label='Cant. Ventas'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => e.row.total_ventas}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.map(a => {
                                                total += a.total_ventas || 0
                                            })
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText style={e.dinamicTable.textStyle}>{total}</SText>
                                            </SView>
                                        }}
                                    />
                                    <DinamicTable.Col
                                        key="total_bs"
                                        label='Monto Total'
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

    componentWillUnmount() {
        this._mounted = false;
    }
}