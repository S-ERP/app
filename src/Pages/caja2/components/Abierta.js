import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SDate, SHr, SIcon, SNavigation, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import TotalTipoPago from './TotalTipoPago';
import DetalleItem from './DetalleItem';
import MenuAcciones from './MenuAcciones';
import Model from '../../../Model';
import DetalleItemVenta from './DetalleItemVenta';

export default class Abierta extends Component {
    state = {
        movimientos: [],
        detalle: [],
        ready: false,
        caja: null,
        loading: false,
        opcionSeleccionada: "movimientos",
    }

    getCaja() {
        return this.state.caja || this.props.caja;
    }

    componentDidMount() {
        this._mounted = true;
        this._loadingData = false;
        if (this.props.caja) {
            this.loadMovimientos();
        } else {
            this.loadCaja().then(() => this.loadMovimientos());
        }
        this.ondetallechange = MDL.caja.addEventListener("onDetalleChange", () => {
            this.loadMovimientos();
        });
        MDL.empresa.getFull().then(empresa => {
            if (this._mounted) this.setState({ empresa });
        }).catch(() => { });
    }

    componentWillUnmount() {
        this._mounted = false;
        MDL.caja.removeEventListener(this.ondetallechange);
    }

    async loadCaja() {


        try {
            const _key_caja = SNavigation.getParam("key");

            if (!_key_caja) return;

            const cajaCargada = await MDL.caja.getByKey(_key_caja);
            if (cajaCargada && this._mounted) {
                this.setState({ caja: cajaCargada });

            }


        } catch (e) { }
    }

    async loadMovimientos() {
        if (this._loadingData) return;
        this._loadingData = true;
        try {
            const caja = this.getCaja();
            if (!caja?.key) {
                if (this._mounted) this.setState({ ready: true });
                return;
            }
            const raw = await MDL.caja.getDetalle(caja.key);
            const movimientos = Array.isArray(raw) ? raw : Object.values(raw ?? {});
            const tipo_pago = await MDL.caja.tipo_pago_getAll();
            const empresa_tipo_pago = await MDL.caja.empresa_tipo_pago_getAll();
            movimientos.sort((a, b) => {
                const ta = a.fecha_on ? new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() : 0;
                const tb = b.fecha_on ? new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() : 0;
                return tb - ta;
            });
            movimientos.forEach((m) => {
                m.empresa_tipo_pago = empresa_tipo_pago?.[m.key_empresa_tipo_pago];
            });

            //DETALLE COMPRA VENTA
            const rawDetalle = await MDL.compra_venta.getCompraVentaDetalleCaja("venta", "2025-01-01", "2030-09-05", caja?.key);
            const detalle = Array.isArray(rawDetalle) ? rawDetalle : Object.values(rawDetalle ?? {});
            if (this._mounted) this.setState({ movimientos, tipo_pago, ready: true, detalle });
        } catch (e) {
            if (this._mounted) this.setState({ ready: true });
            SNotification.send({
                key: "abierta_load",
                title: "Error al cargar movimientos",
                body: e?.error ?? JSON.stringify(e),
                color: STheme.color.danger,
                time: 5000,
            });
        } finally {
            this._loadingData = false;
        }
    }

    cerrar_caja() {
        const caja = this.getCaja();
        if (!caja?.key) return;
        SNotification.send({ key: "caja_cerrar", title: "Cargando", type: "loading" });
        MDL.caja.cerrar({
            key: caja.key,
            key_punto_venta: caja.key_punto_venta,
        }).then(() => {
            SNotification.remove("caja_cerrar");
        }).catch(e => {
            SNotification.send({
                key: "caja_cerrar",
                title: "Error al cerrar caja",
                body: e?.error ?? JSON.stringify(e),
                color: STheme.color.danger,
                time: 5000,
            });
        });
    }

    mensaje() {
        const caja = this.getCaja();
        if (!caja) return null;
        const usuario = Model.usuario.Action.getByKey(caja.key_usuario);
        if (!usuario) return null;

        const sucursal = this.state.empresa?.sucursales?.find(s => s.key === caja.key_sucursal);
        const puntoVenta = sucursal?.puntos_venta?.find(pv => pv.key === caja.key_punto_venta);
        const nombreUsuario = [usuario?.Nombres, usuario?.Apellidos].filter(Boolean).join(" ") || "—";

        return <SView col={"xs-11 sm-10 md-8 lg-6"} center row>
            <SHr />
            <SView col={"xs-12"} padding={15} row style={{
                borderRadius: 8,
                backgroundColor: (caja.fecha_cierre ? STheme.color.danger : !SNavigation.getParam("key") ? STheme.color.success : STheme.color.warning) + "20",
                borderWidth: 1,
                borderColor: (caja.fecha_cierre ? STheme.color.danger : !SNavigation.getParam("key") ? STheme.color.success : STheme.color.warning) + "60",
            }}>
                {(() => {
                    const esCajaAjena = !!SNavigation.getParam("key") && !caja.fecha_cierre;
                    if (caja.fecha_cierre) return (
                        <SView col={"xs-12"} row style={{ justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                            <SText bold fontSize={14} color={STheme.color.text}>ESTADO CAJA</SText>
                            <SText fontSize={11} color={STheme.color.lightGray}>SOLO HISTORIAL 🔴</SText>
                        </SView>
                    );
                    if (esCajaAjena) return (
                        <SView col={"xs-12"} row style={{ justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                            <SText bold fontSize={14} color={STheme.color.text}>ESTADO CAJA</SText>
                            <SText fontSize={11} color={STheme.color.lightGray}>SOLO CONSULTA 🟡</SText>
                        </SView>
                    );
                    return (
                        <SView col={"xs-12"} row style={{ justifyContent: "space-between", alignItems: "center", paddingVertical: 4 }}>
                            <SText bold fontSize={14} color={STheme.color.text}>ESTADO CAJA</SText>
                            {/* <SText bold fontSize={14} color={STheme.color.success}>🟢 MI CAJA</SText> */}
                            <SText fontSize={11} color={STheme.color.lightGray}>Caja Abierta 🟢</SText>
                        </SView>
                    );
                })()}
                <SHr height={10} />
                <SView col={"xs-12"} style={{ borderBottomWidth: 0.5, borderColor: STheme.color.card }} height={5} />
                <SHr height={20} />
                <SView row col={"xs-12 xl-3"} center style={{ borderRightWidth: 1, borderColor: STheme.color.card }}>
                    {caja.fecha_cierre
                        ? <SView row center col={"xs-12"}>
                            <SView width={20} height={20} center style={{ borderRadius: 50, backgroundColor: STheme.color.danger + "50" }}>
                                <SView center style={{ width: 10, height: 10, backgroundColor: STheme.color.danger, borderRadius: 50 }} />
                            </SView>
                            <SView width={10} />
                            <SText color={STheme.color.danger} fontSize={18}>Caja cerrada</SText>
                            <SHr height={10} />
                            <SText col={"xs-12"} fontSize={12} center color={STheme.color.text}>
                                {new SDate(caja.fecha_cierre).toString("DAY, dd de MONTH del yyyy a las hh:mm")}
                            </SText>
                        </SView>
                        : <SView row center>
                            <SView width={20} height={20} center style={{ borderRadius: 50, backgroundColor: STheme.color.success + "50" }}>
                                <SView center style={{ width: 10, height: 10, backgroundColor: STheme.color.success, borderRadius: 50 }} />
                            </SView>
                            <SView width={10} />
                            <SText color={STheme.color.success} fontSize={18}>Caja Abierta</SText>
                        </SView>
                    }
                </SView>
                <SView row col={"xs-12 xl-5"} padding={10}>
                    <SText fontSize={16} color={STheme.color.lightGray}>Fecha de gestión:</SText>
                    <SView row width={10} />
                    <SText bold color={STheme.color.text} fontSize={16}>
                        {caja.fecha ? new SDate(caja.fecha, "yyyy-MM-dd").toString("yyyy-MM-dd") : "—"}
                    </SText>
                    <SHr />
                    <SText fontSize={12} color={STheme.color.lightGray}>Fecha de registro:</SText>
                    <SView row width={10} />
                    <SText color={STheme.color.text} fontSize={12}>
                        {caja.fecha_on ? new SDate(caja.fecha_on, "yyyy-MM-dd").toString("yyyy-MM-dd hh:mm") : "—"}
                    </SText>
                </SView>
                {!caja.fecha_cierre && <SView row col={"xs-12 xl-3"} center>
                    {(() => {
                        const esCajaAjena = !!SNavigation.getParam("key");
                        return (
                            <SView width={160} height={42} row center style={{
                                backgroundColor: STheme.color.card, borderWidth: 2, borderColor: STheme.color.card,
                                padding: 10, borderRadius: 8, opacity: esCajaAjena ? 0.35 : 1,
                            }}>
                                <SText color={esCajaAjena ? STheme.color.lightGray : undefined} onPress={esCajaAjena ? undefined : () => {
                                    SPopup.date("Selecciona la fecha", (a) => {
                                        Model.caja.Action.editar({
                                            data: { ...caja, fecha: a.fecha + "T00:00:00" },
                                            key_usuario: Model.usuario.Action.getKey(),
                                        }).then(() => { }).catch(e => {
                                            SNotification.send({
                                                key: "cambiar_fecha",
                                                title: "Error al cambiar fecha",
                                                body: e?.error ?? JSON.stringify(e),
                                                color: STheme.color.danger,
                                                time: 4000,
                                            });
                                        });
                                    });
                                }}>Cambiar fecha gestión</SText>
                            </SView>
                        );
                    })()}
                </SView>}
                <SHr height={10} />
                <SView col={"xs-12"} style={{ borderBottomWidth: 0.5, borderColor: STheme.color.card }} height={5} />
                <SHr height={10} />
                <SView row>
                    <SIcon name='Muser' width={12} height={12} fill={STheme.color.lightGray} />
                    <SView row width={5} />
                    <SText fontSize={12} color={STheme.color.lightGray}>Usuario:</SText>
                    <SView row width={10} />
                    <SText color={STheme.color.text} fontSize={12}>{nombreUsuario}</SText>
                </SView>
                <SView width={30} />
                <SView row>
                    <SIcon name='iconUbicacion' width={12} height={12} fill={STheme.color.lightGray} />
                    <SView row width={5} />
                    <SText fontSize={12} color={STheme.color.lightGray}>Sucursal:</SText>
                    <SView row width={10} />
                    <SText color={STheme.color.text} fontSize={12}>{sucursal?.descripcion ?? "—"} - {puntoVenta?.descripcion ?? "—"}</SText>
                </SView>
            </SView>
            <SHr />
        </SView>;
    }

    renderHeader = () => {
        const caja = this.getCaja();
        const { opcionSeleccionada } = this.state;
        const esCajaAjena = !!SNavigation.getParam("key") && !caja?.fecha_cierre;
        const soloLectura = esCajaAjena || !!caja?.fecha_cierre;
        const tiposMap = {
            venta: "cantidadVentas",
            compra: "cantidadCompras",
            apertura: "cantidadAperturas",
            anulacion_venta: "cantidadAnulacionesVenta",
            anulacion_compra: "cantidadAnulacionesCompra",
            amortizacion_compra: "cantidadAmortizaciones",
            amortizacion_venta: "cantidadAmortizaciones",
        };
        const agrupado = this.state.movimientos.reduce((acc, item) => {
            const key = item.key_compra_venta;
            if (!key) return acc;
            if (!acc[key]) acc[key] = { key_compra_venta: key, fecha_on: item.fecha_on, items: [], detalle: (this.state.detalle ?? []).find(det => det.key === key) };
            acc[key].items.push(item);
            const campo = tiposMap[item.tipo];
            if (campo) acc[key][campo] = 1;
            return acc;
        }, {});
        const totales = Object.values(agrupado).reduce((acc, item) => {
            acc.cantidadVentas += item.cantidadVentas || 0;
            acc.cantidadCompras += item.cantidadCompras || 0;
            acc.cantidadAnulacionesVenta += item.cantidadAnulacionesVenta || 0;
            acc.cantidadAnulacionesCompra += item.cantidadAnulacionesCompra || 0;
            acc.cantidadAmortizaciones += item.cantidadAmortizaciones || 0;
            acc.cantidadAperturas += item.cantidadAperturas || 0;
            return acc;
        }, { cantidadVentas: 0, cantidadCompras: 0, cantidadAnulacionesVenta: 0, cantidadAnulacionesCompra: 0, cantidadAmortizaciones: 0, cantidadAperturas: 0 });

        return <SView col={"xs-12"} center>
            <SHr h={20} />
            <SView col={"xs-11 sm-10 md-8 lg-6"}>
                <SText bold fontSize={16}>Cuentas y Saldos</SText>
            </SView>
            <SHr h={10} />
            <TotalTipoPago key_punto_venta={caja?.key_punto_venta} movimientos={this.state.movimientos} soloLectura={!!caja?.fecha_cierre} />
            <SHr h={32} />
            {esCajaAjena && (
                <SView col={"xs-11 sm-10 md-8 lg-6"} style={{ backgroundColor: STheme.color.warning + "20", borderWidth: 1, borderColor: STheme.color.warning, borderRadius: 8, padding: 12, marginBottom: 16 }}>
                    <SText bold fontSize={14} color={STheme.color.warning}>⚠ Esta caja pertenece a otro cajero.</SText>
                    <SText fontSize={12} color={STheme.color.lightGray}>No puedes realizar operaciones.</SText>
                </SView>
            )}
            <SView col={"xs-11 sm-10 md-8 lg-6"}>
                <SText bold fontSize={16}>Acciones Rápidas</SText>
                <SHr h={10} />
                <MenuAcciones caja={caja} movimientos={this.state.movimientos} key_punto_venta={caja?.key_punto_venta} soloLectura={soloLectura} />
                <SHr h={32} />
            </SView>
            {this.mensaje()}
            <SHr h={32} />
            {!this.state.ready && <SText color={STheme.color.lightGray}>Cargando movimientos...</SText>}
            {this.state.ready && this.state.movimientos.length <= 0 && <SText color={STheme.color.lightGray}>No hay movimientos</SText>}
            <SView col={"xs-12"} center row wrap>
                {totales.cantidadVentas > 0 && boxCant({ text: `${totales.cantidadVentas}`, color: STheme.color.success, subtitulo: "Ventas", icon: "ventaCarro" })}
                {totales.cantidadCompras > 0 && boxCant({ text: `${totales.cantidadCompras}`, color: STheme.color.warning, subtitulo: "Compras", icon: "compraCarro" })}
                {totales.cantidadAnulacionesVenta > 0 && boxCant({ text: `${totales.cantidadAnulacionesVenta}`, color: STheme.color.danger, subtitulo: "Anulaciones de venta", icon: "cancelado" })}
                {totales.cantidadAnulacionesCompra > 0 && boxCant({ text: `${totales.cantidadAnulacionesCompra}`, color: STheme.color.danger, subtitulo: "Anulaciones de compra", icon: "cancelado" })}
                {totales.cantidadAmortizaciones > 0 && boxCant({ text: `${totales.cantidadAmortizaciones}`, color: STheme.color.info, subtitulo: "Amortizaciones", icon: "Mamortizacion" })}
                {totales.cantidadAperturas > 0 && boxCant({ text: `${totales.cantidadAperturas}`, color: STheme.color.success, subtitulo: "Aperturas", icon: "Mapertura" })}
            </SView>
            <SHr h={20} />
            <SView col={"xs-11 sm-10 md-8 lg-6"} row style={{ borderBottomWidth: 1, borderColor: STheme.color.card }}>
                <SView flex height={44} center style={{
                    borderWidth: opcionSeleccionada === "movimientos" ? 1 : 0,
                    borderBottomWidth: opcionSeleccionada === "movimientos" ? 2 : 0,
                    borderColor: STheme.color.card,
                    backgroundColor: opcionSeleccionada === "movimientos" ? STheme.color.primary + "50" : "transparent",
                    borderTopLeftRadius: 8, borderTopRightRadius: 8,
                }} onPress={() => this.setState({ opcionSeleccionada: "movimientos" })}>
                    <SText bold={opcionSeleccionada === "movimientos"} color={opcionSeleccionada === "movimientos" ? STheme.color.text : STheme.color.lightGray}>Movimientos de caja</SText>
                </SView>
                <SView flex height={44} center style={{
                    borderWidth: opcionSeleccionada === "ventas" ? 1 : 0,
                    borderBottomWidth: opcionSeleccionada === "ventas" ? 2 : 0,
                    borderColor: STheme.color.card,
                    backgroundColor: opcionSeleccionada === "ventas" ? STheme.color.primary + "50" : "transparent",
                    borderTopLeftRadius: 8, borderTopRightRadius: 8,
                }} onPress={() => this.setState({ opcionSeleccionada: "ventas" })}>
                    <SText bold={opcionSeleccionada === "ventas"} color={opcionSeleccionada === "ventas" ? STheme.color.text : STheme.color.lightGray}>Ventas en caja</SText>
                </SView>
            </SView>
            {/* <SHr h={10} /> */}
        </SView>;
    }

    render() {
        const tiposMap = {
            venta: "cantidadVentas",
            compra: "cantidadCompras",
            apertura: "cantidadAperturas",
            anulacion_venta: "cantidadAnulacionesVenta",
            anulacion_compra: "cantidadAnulacionesCompra",
            amortizacion_compra: "cantidadAmortizaciones",
            amortizacion_venta: "cantidadAmortizaciones",
        };

        const agrupado = this.state.movimientos.reduce((acc, item) => {
            const key = item.key_compra_venta;
            const fecha_on = item.fecha_on;
            if (!key) return acc;
            if (!acc[key]) acc[key] = {
                key_compra_venta: key,
                fecha_on: fecha_on,
                items: [],
                detalle: (this.state.detalle ?? []).find(det => det.key === key),
            };
            acc[key].items.push(item);
            const campo = tiposMap[item.tipo];
            if (campo) acc[key][campo] = 1;
            return acc;
        }, {});

        const { opcionSeleccionada } = this.state;
        const esCajaAjena = !!SNavigation.getParam("key") && !this.getCaja()?.fecha_cierre;
        const cajaCerrada = !!this.getCaja()?.fecha_cierre;
        const soloLectura = esCajaAjena || cajaCerrada;
        const data = opcionSeleccionada === "movimientos" ? this.state.movimientos : Object.values(agrupado);
        console.log("DATA", data)
        return (
            <SView col={"xs-12"} center flex>
                <FlatList
                    style={{ flex: 1, width: "100%" }}
                    data={data}
                    ListHeaderComponent={this.renderHeader}
                    // ItemSeparatorComponent={a => <SHr h={8} />}
                    renderItem={opcionSeleccionada === "movimientos"
                        ? ({ item, index }) => (
                            <SView col={"xs-12"} center >
                                <SView col={"xs-11 sm-10 md-8 lg-6"} padding={5}>
                                    <DetalleItem item={item} index={this.state.movimientos.length - index} empresa={this.state.empresa} tipo_pago={this.state.tipo_pago} soloLectura={soloLectura} />
                                </SView>
                            </SView>
                        )
                        : ({ item, index }) => (
                            <SView col={"xs-12"} center>
                                <SView col={"xs-11 sm-10 md-8 lg-6"}>
                                    <DetalleItemVenta movimientos={item.items?.length ?? 0} index={this.state.detalle.length - index} empresa={this.state.empresa} item={item} data={this.state.detalle} soloLectura={soloLectura} />
                                </SView>
                            </SView>
                        )
                    }
                />
                <SHr h={20} />
            </SView>
        );
    }
}

const boxCant = (props) => (
    <SView col={"xs-4 md-2"} card row center backgroundColor={props.color || STheme.color.lightGray} style={{
        padding: 10, borderRadius: 4, borderWidth: 1,
        borderColor: STheme.color.card, marginRight: 10, marginBottom: 10,
    }}>
        <SIcon name={props.icon} width={24} height={24} fill={STheme.color.white} />
        <SView width={10} />
        <SText fontSize={20} bold>{props.text}</SText>
        <SHr />
        <SText fontSize={14} color={STheme.color.lightGray}>{props.subtitulo}</SText>
    </SView>
);
