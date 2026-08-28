import React from "react";
import { SPage, SHr, SText, STheme, SView, SLoad } from "servisofts-component";
import { ScrollView } from "react-native-gesture-handler";
import MDL from "../../MDL";
import FechaFullFilter from "../../Components/FechaFullFilter";
import BarraRechartsBd from "../recharts/Components/BarraRechartsBd";
import LineaRechartsBd from "../recharts/Components/LineaRechartsBd";
import CircularRechartsBd from "../recharts/Components/CircularRechartsBd";

const cardStyle = {
    padding: 16,
    borderRadius: 10,
    backgroundColor: STheme.color.card,
    borderWidth: 1,
    borderColor: STheme.color.lightGray + "40",
};

export default class Dashboard extends React.Component {
    state = {
        loading: true,
        fecha_inicio: null,
        fecha_fin: null,
        kpi: { activos: 0, suscriptores: 0, nuevos: 0, vencen: 0, vencen_hoy: 0 },
        porSucursal: [],   // [{ name, total }]
        porPaquete: [],    // [{ name, value }]
        porDia: [],        // [{ dia, nuevas }]
    };

    _mounted = false;

    componentDidMount() {
        this._mounted = true;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    // FechaFullFilter dispara onChange al montar y en cada cambio -> aca se recarga todo.
    handleFilterChange = (filter) => {
        if (!filter || !filter.fecha_inicio || !filter.fecha_fin) return;
        this.loadData(filter.fecha_inicio, filter.fecha_fin);
    };

    // rep_dashboard_suscripciones_periodo vive en servisofts.inventario
    // (ver rep_dashboard_suscripciones_periodo.sql). Todas las metricas se filtran por el rango.
    // Los nombres de sucursal estan en otra base (empresa) -> se traen aparte y se mapean por key.
    loadData = async (fecha_inicio, fecha_fin) => {
        const keyEmpresa = MDL.empresa.select?.key;
        if (!keyEmpresa) return;
        this.setState({ loading: true, fecha_inicio, fecha_fin });
        try {
            const [sucursales, resp] = await Promise.all([
                MDL.empresa.getAllSucursales(),
                MDL.inventario.execute_function("rep_dashboard_suscripciones_periodo", [
                    keyEmpresa, fecha_inicio, fecha_fin,
                ]),
            ]);

            let raw = Array.isArray(resp) ? resp[0] : resp;
            if (raw && typeof raw === "object" && "rep_dashboard_suscripciones_periodo" in raw) {
                raw = raw.rep_dashboard_suscripciones_periodo;
            }
            const rep = (typeof raw === "string" ? JSON.parse(raw || "{}") : raw) || {};

            const sucursalNombre = {};
            (sucursales || []).forEach((su) => { sucursalNombre[su.key] = su.descripcion; });

            const porSucursal = (rep.por_sucursal || []).map((r) => ({
                name: (!r.key_sucursal || r.key_sucursal === "sin")
                    ? "Sin sucursal"
                    : (sucursalNombre[r.key_sucursal] || "Sucursal ?"),
                total: Number(r.suscriptores || 0),
            }));

            const porPaquete = (rep.por_paquete || []).map((r) => ({
                name: r.paquete || "Sin paquete",
                value: Number(r.suscriptores || 0),
            }));

            const porDia = (rep.por_dia || []).map((r) => {
                const [, mm, dd] = String(r.dia).split("-");
                return { dia: `${dd}/${mm}`, nuevas: Number(r.nuevas || 0) };
            });

            if (!this._mounted) return;
            this.setState({
                loading: false,
                kpi: {
                    activos: Number(rep.activos || 0),
                    suscriptores: Number(rep.suscriptores || 0),
                    nuevos: Number(rep.nuevos || 0),
                    vencen: Number(rep.vencen || 0),
                    vencen_hoy: Number(rep.vencen_hoy || 0),
                },
                porSucursal,
                porPaquete,
                porDia,
            });
        } catch (e) {
            console.error("Error cargando dashboard de suscripciones:", e);
            if (this._mounted) this.setState({ loading: false });
        }
    };

    renderKpi(label, value, color) {
        return (
            <SView col={"xs-12 sm-6 md-3"} padding={6}>
                <SView col={"xs-12"} style={{ ...cardStyle, minHeight: 110 }}>
                    <SText fontSize={14} bold color={STheme.color.lightGray}>{label}</SText>
                    <SHr height={8} />
                    <SText fontSize={28} bold color={color || STheme.color.text}>{value}</SText>
                </SView>
            </SView>
        );
    }

    render() {
        const {
            loading, fecha_inicio, fecha_fin, kpi,
            porSucursal, porPaquete, porDia,
        } = this.state;

        return (
            <SPage title={"Dashboard de Suscripciones"}>
                <ScrollView>
                    <SView col={"xs-12"} padding={16}>
                        <SText fontSize={18} bold>Dashboard de Suscripciones</SText>
                        <SHr height={12} />
                        <SView col={"xs-12 sm-8 md-6 lg-5"}>
                            <FechaFullFilter key_opciones="este_mes" onChange={this.handleFilterChange} />
                        </SView>
                        <SHr height={8} />
                        <SText fontSize={12} color={STheme.color.lightGray}>
                            {fecha_inicio && fecha_fin ? `Periodo: ${fecha_inicio} a ${fecha_fin}` : ""}
                        </SText>
                        <SHr height={16} />

                        {loading ? (
                            <SView center padding={40}>
                                <SLoad />
                                <SText color={STheme.color.lightGray}>Cargando...</SText>
                            </SView>
                        ) : (
                            <>
                                <SView col={"xs-12"} row style={{ flexWrap: "wrap" }}>
                                    {/* {this.renderKpi("Suscriptores activos", kpi.suscriptores, STheme.color.success)} */}
                                    {this.renderKpi("Suscripciones activas", kpi.activos)}
                                    {this.renderKpi("Nuevos en el período", kpi.nuevos, "#e5ff00")}
                                    {this.renderKpi("Vencen en el período", kpi.vencen, STheme.color.warning)}
                                    {this.renderKpi("Vencen hoy", kpi.vencen_hoy, STheme.color.danger)}
                                </SView>

                                <SHr height={16} />

                                <SView col={"xs-12"} row style={{ flexWrap: "wrap" }}>
                                    <SView col={"xs-12 md-7"} padding={8}>
                                        <SView style={cardStyle}>
                                            <SText bold fontSize={14}>Suscriptores activos por sucursal</SText>
                                            <SHr height={12} />
                                            <BarraRechartsBd
                                                data={porSucursal}
                                                nameKey="name"
                                                valueKey="total"
                                                valueKey2={null}
                                                height={280}
                                            />
                                        </SView>
                                    </SView>
                                    <SView col={"xs-12 md-5"} padding={8}>
                                        <SView style={cardStyle}>
                                            <SText bold>Distribución por paquete</SText>
                                            <SHr height={12} />
                                            <CircularRechartsBd
                                                data={porPaquete.filter((i) => i.value > 0)}
                                                nameKey="name"
                                                valueKey="value"
                                                height={280}
                                            />
                                        </SView>
                                    </SView>
                                </SView>

                                <SHr height={16} />

                                <SView col={"xs-12"} padding={8}>
                                    <SView style={cardStyle}>
                                        <SText bold>Nuevas suscripciones por día</SText>
                                        <SHr height={12} />
                                        <LineaRechartsBd
                                            data={porDia}
                                            nameKey="dia"
                                            valueKey="nuevas"
                                            height={320}
                                        />
                                    </SView>
                                </SView>
                            </>
                        )}
                    </SView>
                </ScrollView>
            </SPage>
        );
    }
}
