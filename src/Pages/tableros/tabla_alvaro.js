import React from "react";
import { SPage, SView, SText, SHr } from "servisofts-component";
import { DinamicTable } from 'servisofts-table';
import MDL from "../../MDL";
import { ScrollView } from "react-native-gesture-handler";
import FechaFullFilter2 from "../../Components/FechaFullFilter2";

export default class TablaAlvaro extends React.Component {
    state = {
        loadingVentasPorDia: true,
        dataVentasPorDia: [],
        fecha_inicio: '2026-03-24',
        fecha_fin: '2026-03-24',
    };

    componentDidMount() {
        this.loadVentasPorFecha();
    }


    
    loadVentasPorFecha = async () => {
    try {
        // 1️⃣ Obtener empresa y sucursales
        const keyEmpresa = await MDL.empresa.select.key;
        const empresa = await MDL.empresa.getFull();

        const sucursalesFiltradas = (empresa.sucursales || [])
            .filter(sucursal => sucursal.estado > 0) // solo activas
            .map(sucursal => ({
                key: sucursal.key,
                municipio: sucursal.municipio,
                descripcion: sucursal.descripcion
            }));

        // 2️⃣ Obtener rango de fechas
        const fecha_inicio = this.state.fecha_inicio;
        const fecha_fin = this.state.fecha_fin;

        // 3️⃣ Llamar a la función en la base de datos
        const res = await MDL.compra_venta.execute_function(
            "ventas_por_fecha",
            [keyEmpresa, 'venta', fecha_inicio, fecha_fin]
        );

        const raw = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);

        // 4️⃣ Combinar sucursales con ventas
        const sucursalesConMonto = sucursalesFiltradas.map(sucursal => {
            const venta = raw.find(r => r.key_sucursal === sucursal.key) || {};
            return {
                ...sucursal,
                cantidad_ventas: venta.cantidad_ventas || 0,
                monto_total: venta.monto_total || 0
            };
        });

        // 5️⃣ Mostrar en consola para debug
        console.clear();
        console.log("%cSucursales con ventas:", "color: #2ECC40; font-weight: bold;");
        console.table(sucursalesConMonto);

        // 6️⃣ Guardar en el estado
        this.setState({
            dataVentasPorDia: sucursalesConMonto,
            loadingVentasPorDia: false
        });

    } catch (e) {
        console.error("Error en loadVentasPorFecha:", e);
        this.setState({ loadingVentasPorDia: false });
    }
};

    transformDataForChart = (data) => {
        // Opcional: transformar datos si quieres graficarlos
        return data.map(e => ({
            label: e.key_sucursal,
            value: e.monto_total
        }));
    }

    render() {
        const { dataVentasPorDia, loadingVentasPorDia, fecha_inicio, fecha_fin } = this.state;
        const size = 80;
        const cellstyle = { padding: 4 };

        // console.clear();
        console.log("%c" + JSON.stringify(dataVentasPorDia, null, 2), "color: #2ECC40; font-weight: bold;");
        return (
            <SPage title="Estadísticas de Ventas">
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Estadísticas de Ventas</SText>
                        <SHr />

                        {/* Selector de fechas */}
                        <SView col={"xs-12"} row center style={{ flexWrap: "wrap", gap: 12 }}>
                            <SView col={"xs-12 sm-7.5"} row center>
                                <FechaFullFilter2
                                    label="fecha"
                                    key_opciones="este_mes"
                                    fecha_inicio={fecha_inicio}
                                    fecha_fin={fecha_fin}
                                    onChange={e => {
                                        this.setState({
                                            fecha_inicio: e.fecha_inicio,
                                            fecha_fin: e.fecha_fin,
                                            loadingVentasPorDia: true
                                        }, () => {
                                            this.loadVentasPorFecha();
                                        });
                                    }}
                                />
                            </SView>
                        </SView>

                        <SHr />

                        {/* Tabla de Ventas por Día */}
                        <SView col={"xs-12"} padding={8}>
                            <SText fontSize={16} bold>Ventas por Sucursales</SText>
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
                                    loadData={async () => dataVentasPorDia}
                                >
                                    <DinamicTable.Col
                                        key="key_sucursal"
                                        label='Sucursal'
                                        width={150}
                                        data={e => e.row.descripcion}
                                        footerComponent={() => (
                                            <SView style={{ alignItems: "center" }}>
                                                <SText>Total</SText>
                                            </SView>
                                        )}
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
                                            e.dinamicTable.data.forEach(a => total += a.cantidad_ventas || 0);
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText>{total}</SText>
                                            </SView>
                                        }}
                                    />

                                    <DinamicTable.Col
                                        key="monto_total"
                                        label='Monto Total (Bs)'
                                        width={size}
                                        wrap
                                        cellStyle={cellstyle}
                                        data={e => `Bs. ${Number(e.row.monto_total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                                        footerComponent={(e) => {
                                            let total = 0;
                                            e.dinamicTable.data.forEach(a => total += a.monto_total || 0);
                                            return <SView style={{ alignItems: "center" }}>
                                                <SText>{`Bs. ${Number(total).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}</SText>
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