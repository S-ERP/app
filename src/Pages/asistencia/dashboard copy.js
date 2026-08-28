import React from "react";
import { SPage, SHr, SText, STheme, SView, SLoad } from "servisofts-component";
import { ScrollView } from "react-native-gesture-handler";
import SCharts from "servisofts-charts";
import MDL from "../../MDL";

const CHART_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#B39DDB", "#F48FB1"];

export default class Dashboard extends React.Component {
    state = {
        loading: true,
        suscriptoresActivos: 0,
        suscripcionesActivas: 0,
        vencenHoy: 0,
        porSucursal: {},   // { descripcion: cantidad }
        porDia: {},        // { "dd/MM": cantidad }
    };

    _mounted = false;

    componentDidMount() {
        this._mounted = true;
        this.loadData();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    // La suscripcion no tiene key_empresa: se filtra por producto.key_empresa.
    // Vigente = estado > 0 AND fecha_inicio <= now() AND (fecha_fin IS NULL OR fecha_fin >= now())
    loadData = async () => {
        const keyEmpresa = MDL.empresa.select?.key;
        if (!keyEmpresa) return;
        this.setState({ loading: true });
        try {
            // rep_dashboard_suscripciones vive en servisofts.inventario (ver rep_dashboard_suscripciones.sql).
            // Los nombres de sucursal estan en otra base (empresa) -> se traen aparte y se mapean por key.
            const [sucursales, resp] = await Promise.all([
                MDL.empresa.getAllSucursales(),
                MDL.inventario.execute_function("rep_dashboard_suscripciones", [keyEmpresa]),
            ]);

            let raw = Array.isArray(resp) ? resp[0] : resp;
            if (raw && typeof raw === "object" && "rep_dashboard_suscripciones" in raw) {
                raw = raw.rep_dashboard_suscripciones;
            }
            let rep = (typeof raw === "string" ? JSON.parse(raw || "{}") : raw) || {};

            // Fallback: si la funcion no esta desplegada, resolver con SQL crudo.
            if (!("suscriptores_activos" in rep)) {
                const r = await MDL.inventario.exec(
                    `SELECT public.rep_dashboard_suscripciones('${keyEmpresa}') AS rep`
                );
                rep = r?.[0]?.rep || {};
            }

            const sucursalNombre = {};
            (sucursales || []).forEach(su => { sucursalNombre[su.key] = su.descripcion; });

            const porSucursalChart = {};
            (rep.por_sucursal || []).forEach(r => {
                const nombre = (!r.key_sucursal || r.key_sucursal === "sin")
                    ? "Sin sucursal"
                    : (sucursalNombre[r.key_sucursal] || "Sucursal ?");
                porSucursalChart[nombre] = Number(r.suscriptores || 0);
            });

            const porDiaChart = {};
            (rep.por_dia || []).forEach(r => {
                const [, mm, dd] = String(r.dia).split("-");
                porDiaChart[`${dd}/${mm}`] = Number(r.nuevas || 0);
            });

            if (!this._mounted) return;
            this.setState({
                loading: false,
                suscriptoresActivos: Number(rep.suscriptores_activos || 0),
                suscripcionesActivas: Number(rep.suscripciones_activas || 0),
                vencenHoy: Number(rep.vencen_hoy || 0),
                porSucursal: porSucursalChart,
                porDia: porDiaChart,
            });
        } catch (e) {
            console.error("Error cargando dashboard de suscripciones:", e);
            if (this._mounted) this.setState({ loading: false });
        }
    };

    renderKpi(label, value, color) {
        return (
            <SView col={"xs-12 sm-6 md-4"} padding={6}>
                <SView
                    col={"xs-12"}
                    padding={16}
                    style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        backgroundColor: STheme.color.background,
                    }}
                >
                    <SText fontSize={12} color={STheme.color.lightGray}>{label}</SText>
                    <SHr height={6} />
                    <SText fontSize={30} bold color={color || STheme.color.text}>{value}</SText>
                </SView>
            </SView>
        );
    }

    renderChartBox(titulo, data, type) {
        const vacio = !data || Object.keys(data).length === 0;
        return (
            <SView col={"xs-12 lg-6"} padding={6}>
                <SView
                    col={"xs-12"}
                    padding={12}
                    style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        backgroundColor: STheme.color.background,
                    }}
                >
                    <SText fontSize={15} bold>{titulo}</SText>
                    <SHr />
                    {vacio ? (
                        <SView center padding={24}>
                            <SText color={STheme.color.lightGray}>Sin datos</SText>
                        </SView>
                    ) : (
                        <SView height={320}>
                            <SCharts
                                type={type}
                                showControl={false}
                                strokeWidth={1}
                                space={0.2}
                                padding={0.6}
                                showLabel={true}
                                showGuide={true}
                                showValue={true}
                                textColor={STheme.color.text}
                                colors={CHART_COLORS}
                                data={data}
                            />
                        </SView>
                    )}
                </SView>
            </SView>
        );
    }

    render() {
        const {
            loading, suscriptoresActivos, suscripcionesActivas,
            vencenHoy, porSucursal, porDia,
        } = this.state;

        return (
            <SPage title={"Dashboard de Asistencias"}>
                <ScrollView>
                        <SView col={"xs-12"} padding={16}>
                            <SText fontSize={18} bold>Dashboard de Suscripciones</SText>
                            <SHr />

                            {loading ? (
                                <SView center padding={40}>
                                    <SLoad />
                                    <SText color={STheme.color.lightGray}>Cargando...</SText>
                                </SView>
                            ) : (
                                <>
                                    <SView col={"xs-12"} row style={{ flexWrap: "wrap" }}>
                                        {this.renderKpi("Suscriptores activos", suscriptoresActivos, STheme.color.success)}
                                        {this.renderKpi("Suscripciones activas", suscripcionesActivas)}
                                        {this.renderKpi("Vencen hoy", vencenHoy, STheme.color.warning)}
                                    </SView>

                                    <SHr />

                                    <SView col={"xs-12"} row style={{ flexWrap: "wrap" }}>
                                        {this.renderChartBox("Suscriptores activos por sucursal", porSucursal, "Bar")}
                                        {this.renderChartBox("Suscriptores nuevos por día (últimos 30 días)", porDia, "Line")}
                                    </SView>
                                </>
                            )}
                        </SView>
                </ScrollView>
            </SPage>
        );
    }
}
