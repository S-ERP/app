import React from "react";
import { SPage, SView, SText, SHr, STheme, SMath } from "servisofts-component";
import { ScrollView } from "react-native-gesture-handler";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import FechaFullFilter from "../../Components/FechaFullFilter";
import BarraRechartsBd from "../recharts/Components/BarraRechartsBd";
import LineaRechartsBd from "../recharts/Components/LineaRechartsBd";
import CircularRechartsBd from "../recharts/Components/CircularRechartsBd";

export default class cajas extends React.Component {
    state = {
        loading: false,
        fecha_inicio: null,
        fecha_fin: null,
        data: [],
        resumen: {
            total_efectivo: 0,
            total_transferencias: 0,
            total_recaudado: 0,
            total_egresos: 0,
            neto: 0,
            shiftChartData: [],
            paymentChartData: [],
            dailyTrendData: [],
        },
    };

    componentDidMount() {
        this._mounted = true;
        this.initDashboard();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    getToday = () => new Date();

    formatDate = (date) => {
        if (!date) return "";
        const d = date instanceof Date ? date : new Date(date);
        if (Number.isNaN(d.getTime())) return "";
        const pad = (n) => n.toString().padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    parseDate = (date) => {
        const d = date instanceof Date ? date : new Date(date);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    getTurno = (fechaOn, fechaCierre) => {
        const parseMinutes = (value) => {
            const date = this.parseDate(value);
            if (!date) return null;
            return date.getHours() * 60 + date.getMinutes();
        };
        const getPeriodo = (minutes) => {
            if (minutes === null) return null;
            if (minutes >= 360 && minutes <= 720) return "Mañana"; //de 6:00 a 12:00
            if (minutes >= 721 && minutes <= 1080) return "Tarde"; //de 12:01 a 18:00
            if (minutes >= 1081 && minutes <= 1439) return "Noche"; //de 18:01 a 22:00
            return "Otros";
        };
        const inicio = getPeriodo(parseMinutes(fechaOn));
        const cierre = getPeriodo(parseMinutes(fechaCierre));
        if (inicio && cierre) return inicio === cierre ? inicio : `${inicio} - ${cierre}`;
        return inicio || cierre || "Otros";
    };

    getPaymentKey = (mov) => {
        let pago = "";
        if (mov.tag_tipo_pago) pago = mov.tag_tipo_pago;
        else if (mov.tipo_pago) pago = mov.tipo_pago;
        else if (mov.empresa_tipo_pago) {
            const tipo = mov.empresa_tipo_pago;
            if (typeof tipo === "string") pago = tipo;
            else pago = tipo?.descripcion || tipo?.name || "";
        }
        return pago.toString().toLowerCase();
    };

    isEfectivo = (key) => key.includes("efect");
    isTransferencia = (key) => key.includes("transfer") || key.includes("qr");
    isEgreso = (tipo, monto) => {
        const esEgresoTipo = ["compra", "egreso", "retiro", "anulacion_venta", "anulacion_compra"];
        return monto < 0 || esEgresoTipo.includes(tipo);
    };

    initDashboard = async () => {
        const hoy = this.getToday();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const fecha_inicio = this.formatDate(inicioMes);
        const fecha_fin = this.formatDate(hoy);
        this.setState({ fecha_inicio, fecha_fin });
        await this.loadDashboardData({ fecha_inicio, fecha_fin });
    };

    loadDashboardData = async ({ fecha_inicio, fecha_fin }) => {
        const empresaKey = MDL.empresa.select?.key;
        if (!empresaKey) return;
        this.setState({ loading: true, fecha_inicio, fecha_fin });
        console.log("FECHA INICIO:", fecha_inicio, "FECHA FIN:", fecha_fin);
        try {
            const movimientos = await MDL.caja.getAllMovimientosCajasByEmpresa(empresaKey, fecha_inicio, fecha_fin);
            const data = Array.isArray(movimientos) ? movimientos : [];
            const resumen = this.buildResumen(data);
            if (this._mounted) this.setState({ data, resumen, loading: false });
        } catch (error) {
            console.error("Error cargando datos de cajas:", error);
            if (this._mounted) this.setState({ data: [], resumen: this.buildResumen([]), loading: false });
        }
    };

    // buildResumen = (data) => {
    //     const totals = {
    //         total_efectivo: 0,
    //         total_transferencias: 0,
    //         total_recaudado: 0,
    //         total_egresos: 0,
    //         neto: 0,
    //         shifts: { Mañana: 0, Tarde: 0, Noche: 0, Otros: 0 },
    //         payments: { Efectivo: 0, "Transferencias / QR": 0, Otros: 0 },
    //         daily: {},
    //     };

    //     data.forEach((mov) => {
    //         console.log("movimientos:", mov);
    //         const monto = Number(mov.monto ?? mov.monto_total ?? mov.monto_base ?? 0) || 0;
    //         const tipoLower = (mov.tipo || "").toString().toLowerCase();
    //         const pagoKey = this.getPaymentKey(mov);
    //         const turno = this.getTurno(mov.caja_fecha_on || mov.fecha_on || mov.fecha, mov.caja_fecha_cierre || mov.fecha_cierre || mov.fecha);
    //         const fecha = this.formatDate(mov.caja_fecha_on || mov.fecha_on || mov.fecha || mov.created_at);
    //         const valor = Math.abs(monto);

    //         if (this.isEfectivo(pagoKey)) {
    //             totals.total_efectivo += valor;
    //             totals.payments.Efectivo += valor;
    //             //  totals.total_efectivo += (mov.tag_tipo_pago === "Efectivo") ? valor : 0;
    //             // totals.payments.Efectivo += (mov.tag_tipo_pago === "Efectivo") ? valor : 0;
    //         } else if (this.isTransferencia(pagoKey)) {
    //             totals.total_transferencias += valor;
    //             totals.payments["Transferencias / QR"] += valor;
    //         } else {
    //             totals.payments.Otros += valor;
    //         }

    //         if (this.isEgreso(tipoLower, monto)) {
    //             totals.total_egresos += valor;
    //         } else {
    //             totals.total_recaudado += valor;
    //         }

    //         totals.shifts[turno] = (totals.shifts[turno] || 0) + valor;
    //         if (fecha) totals.daily[fecha] = (totals.daily[fecha] || 0) + valor;
    //     });

    //     totals.neto = totals.total_recaudado - totals.total_egresos;

    //     const shiftChartData = Object.entries(totals.shifts).map(([name, total]) => ({ name, total }));
    //     const paymentChartData = Object.entries(totals.payments).map(([name, value]) => ({ name, value }));
    //     const dailyTrendData = Object.entries(totals.daily)
    //         .filter(([date]) => date)
    //         .sort(([a], [b]) => new Date(a) - new Date(b))
    //         .map(([date, total]) => ({ date, total }));

    //     return {
    //         total_efectivo: totals.total_efectivo,
    //         total_transferencias: totals.total_transferencias,
    //         total_recaudado: totals.total_recaudado,
    //         total_egresos: totals.total_egresos,
    //         neto: totals.neto,
    //         shiftChartData,
    //         paymentChartData,
    //         dailyTrendData,
    //     };
    // };

    buildResumen = (data) => {
        const totals = {
            total_efectivo: 0,
            total_transferencias: 0,
            total_credito: 0,
            total_recaudado: 0,
            total_egresos: 0,
            neto: 0,
            shifts: { Mañana: 0, Tarde: 0, Noche: 0, Otros: 0 },
            payments: { Efectivo: 0, "Transferencias / QR": 0, "Crédito": 0, Otros: 0 },
            daily: {},
        };
        console.log("DATAAA:", data);

        data.forEach((mov) => {
            // console.log("movimientos:", mov);

            const monto = Number(mov.monto ?? mov.monto_total ?? mov.monto_base ?? 0) || 0;
            const valor = Math.abs(monto);

            const tagMovimiento = (mov.tag_movimiento || "").trim().toLowerCase();
            const tagTipoPago = (mov.tag_tipo_pago || "").trim().toLowerCase();
            const tipo = (mov.tipo || "").trim().toLowerCase();

            const turno = this.getTurno(
                mov.caja_fecha_on || mov.fecha_on || mov.fecha,
                mov.caja_fecha_cierre || mov.fecha_cierre || mov.fecha
            );

            const fecha = this.formatDate(
                mov.caja_fecha_on || mov.fecha_on || mov.fecha || mov.created_at
            );

            // ============================
            // INGRESOS
            // ============================
            if (tagMovimiento === "ingreso" && tipo === "venta" || tipo === "traspaso") {

                totals.total_recaudado += valor;

                if (tagTipoPago === "efectivo") {
                    totals.total_efectivo += valor;
                    totals.payments.Efectivo += valor;

                } else if (tagTipoPago === "transferencia") {
                    totals.total_transferencias += valor;
                    totals.payments["Transferencias / QR"] += valor;

                } else if (tagTipoPago === "crédito") {
                    console.log("CREDITO:", mov);
                    totals.total_credito += valor;
                    totals.payments["Crédito"] += valor;

                } else {
                    console.log("OTRO TIPO DE PAGO:", mov);
                    totals.payments.Otros += valor;
                }
            }

            if (tipo === "anulacion_venta" && tagTipoPago === "crédito") {
                totals.total_credito -= valor;
                 totals.total_recaudado -= valor;
            }

            // ============================
            // EGRESOS
            // ============================

            // if(tipo !== "anulacion_venta" && tipo !== "anulacion_compra" && (tagMovimiento === "egreso" || tipo === "compra" || tipo === "retiro")) {
            //     totals.total_egresos += valor;
            // }
            if (tipo !== "anulacion_venta") {
                if (tagMovimiento === "egreso") {
                    totals.total_egresos += valor;
                }
            }


            // ============================
            // GRÁFICOS
            // ============================
            totals.shifts[turno] = (totals.shifts[turno] || 0) + valor;

            if (fecha) {
                totals.daily[fecha] = (totals.daily[fecha] || 0) + valor;
            }
        });

        totals.neto = totals.total_recaudado - totals.total_egresos;

        const shiftChartData = Object.entries(totals.shifts).map(([name, total]) => ({
            name,
            total,
        }));

        const paymentChartData = Object.entries(totals.payments).map(([name, value]) => ({
            name,
            value,
        }));

        const dailyTrendData = Object.entries(totals.daily)
            .filter(([date]) => date)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, total]) => ({
                date,
                total,
            }));

        return {
            total_efectivo: totals.total_efectivo,
            total_transferencias: totals.total_transferencias,
            total_credito: totals.total_credito,
            total_recaudado: totals.total_recaudado,
            total_egresos: totals.total_egresos,
            neto: totals.neto,
            shiftChartData,
            paymentChartData,
            dailyTrendData,
        };
    };

    handleFilterChange = (filter) => {
        if (!filter) return;
        this.loadDashboardData({ fecha_inicio: filter.fecha_inicio, fecha_fin: filter.fecha_fin });
    };

    renderDetalleTabla = () => {
        const { data, loading } = this.state;
        return (
            <SView
                col="xs-12"
                card
                style={{
                    padding: 16,
                    marginTop: 16,
                    borderRadius: 10,
                    backgroundColor: STheme.color.card,
                    borderWidth: 1,
                    borderColor: STheme.color.lightGray + "40",
                }}
            >
                <SText fontSize={16} bold>Detalle de movimientos</SText>
                <SHr height={12} />
                {loading ? (
                    <SText>Cargando detalles...</SText>
                ) : data.length === 0 ? (
                    <SText>No hay movimientos para mostrar.</SText>
                ) : (
                    <DinamicTable
                        data={data}
                        key="id"
                        keyExtractor={e => e?.key}
                        language="es"
                        center
                        selectType="single"
                        {...Config.table.applyTheme({ cellStyle: { minHeight: 30 } })}
                    >
                        <DinamicTable.Col key="index" label="N°" width={40} data={e => e.index + 1} />
                        <DinamicTable.Col
                            key="fecha"
                            label="Fecha"
                            width={120}
                            data={e => e.row?.caja_fecha_on || e.row?.fecha_on || e.row?.fecha || ""}
                        />
                        <DinamicTable.Col
                            key="turno"
                            label="Turno"
                            width={100}
                            data={e => this.getTurno(e.row?.caja_fecha_on || e.row?.fecha_on || e.row?.fecha, e.row?.caja_fecha_cierre || e.row?.fecha_cierre || e.row?.fecha)}
                        />
                        <DinamicTable.Col key="tipo" label="Tipo" width={110} data={e => e.row?.tipo || ""} />
                        <DinamicTable.Col key="detalle" label="Detalle" width={240} data={e => e.row?.descripcion || e.row?.detalle || "-"} />
                        <DinamicTable.Col
                            key="monto"
                            label="Monto"
                            width={110}
                            data={e => Number(e.row?.monto ?? e.row?.monto_total ?? e.row?.monto_base ?? 0)}
                            dataType="number"
                            cellStyle={e => ({ alignItems: "flex-end" })}
                            format={e => `Bs ${SMath.formatMoney(e.data)}`}
                        />
                        <DinamicTable.Col key="tipo_pago" label="Tipo pago" width={120} data={e => this.getPaymentKey(e.row) || ""} />
                        <DinamicTable.Col key="sucursal" label="Sucursal" width={140} data={e => e.row?.sucursal?.descripcion || e.row?.sucursal || ""} />
                        <DinamicTable.Col key="usuario" label="Usuario" width={140} data={e => e.row?.usuario?.Nombres || e.row?.usuario?.nombres || e.row?.usuario || ""} />
                    </DinamicTable>
                )}
            </SView>
        );
    };

    renderTotalCard = (title, amount, subtitle, color) => {
        return (
            <SView
                col="xs-12 sm-6 md-2.4"
                style={{ padding: 7 }}
            >
                <SView

                    card
                    style={{
                        padding: 16,
                        // margin: 8,
                        borderRadius: 10,
                        backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.lightGray + "40",
                        minHeight: 120,
                    }}
                >
                    <SText fontSize={14} bold color={STheme.color.lightGray}>{title}</SText>
                    <SHr height={10} />
                    <SText fontSize={22} bold color={color || STheme.color.text}>{`Bs ${SMath.formatMoney(amount)}`}</SText>
                    {/* {subtitle ? <SText fontSize={12} color={STheme.color.textGray}>{subtitle}</SText> : null} */}
                </SView>
            </SView>
        );
    };

    render() {
        let permiso = MDL.rolesPermisos.getPermiso({ url: "/dashboard", permiso: 'ver' })
        if (!permiso) {
            return (
                <SPage title="Dashboard Caja" center>
                    <SView col="xs-12" center>
                        <SText fontSize={16} color={STheme.color.danger}>No tienes permiso para ver este contenido.</SText>
                    </SView>
                </SPage>
            );
        }

        const { resumen } = this.state;

        return (
            <SPage title="Dashboard Caja">
                <ScrollView>
                    <SView col="xs-12" padding={16}>
                        <SText fontSize={18} bold>Dashboard Movimientos en Cajas</SText>
                        <SHr height={16} />
                        <SView col="xs-12" row>
                            <SView col="xs-6"></SView>
                            <SView col="xs-6">
                                <FechaFullFilter key_opciones="este_mes" onChange={this.handleFilterChange} />
                            </SView>
                        </SView>

                        <SHr height={16} />

                        <SView row>
                            {this.renderTotalCard("Total Efectivo", resumen.total_efectivo, "", STheme.color.success)}
                            {this.renderTotalCard("Total Transferencias / QR", resumen.total_transferencias, "", STheme.color.text)}
                            {this.renderTotalCard("Total Crédito", resumen.total_credito, "", "#ffe600")} {/* Color naranja para crédito */}
                            {this.renderTotalCard("Total Recaudado", resumen.total_recaudado, "", STheme.color.warning)}
                            {this.renderTotalCard("Total Egresos", resumen.total_egresos, "", STheme.color.danger)}
                        </SView>

                        <SHr height={16} />

                        <SView row>
                            <SView col="xs-12 md-7" style={{ padding: 8 }}>
                                <SView card style={{ padding: 16, borderRadius: 10, backgroundColor: STheme.color.card, borderWidth: 1, borderColor: STheme.color.lightGray + "40" }}>
                                    <SText bold>Recaudación por turnos</SText>
                                    <SHr height={12} />
                                    <BarraRechartsBd
                                        data={resumen.shiftChartData}
                                        nameKey="name"
                                        valueKey="total"
                                        valueKey2="count"
                                        height={260}
                                    />
                                </SView>
                            </SView>
                            <SView col="xs-12 md-5" style={{ padding: 8 }}>
                                <SView card style={{ padding: 16, borderRadius: 10, backgroundColor: STheme.color.card, borderWidth: 1, borderColor: STheme.color.lightGray + "40" }}>
                                    <SText bold>Distribución por tipo de pago</SText>
                                    <SHr height={12} />
                                    <CircularRechartsBd
                                        data={resumen.paymentChartData.filter(item => item.value > 0)}
                                        nameKey="name"
                                        valueKey="value"
                                        height={260}
                                    />
                                </SView>
                            </SView>
                        </SView>

                        <SHr height={16} />

                        <SView card style={{ padding: 16, borderRadius: 10, backgroundColor: STheme.color.card, borderWidth: 1, borderColor: STheme.color.lightGray + "40" }}>
                            <SText bold>Recaudación diaria</SText>
                            <SHr height={12} />
                            <LineaRechartsBd
                                data={resumen.dailyTrendData}
                                nameKey="date"
                                valueKey="total"
                                height={320}
                            />
                        </SView>

                        {this.renderDetalleTabla()}
                    </SView>
                </ScrollView>
            </SPage>
        );
    }
}