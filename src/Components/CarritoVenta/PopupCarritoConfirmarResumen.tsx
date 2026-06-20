import React from "react";
import { SHr, SMath, SNavigation, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import FiltroMoneda from "../FiltroMoneda";
import ComprobanteRollo from "../PDF/venta/ReciboSmall";
import SelectTipoPagoVenta from "../../Pages/caja2/components/SelectTipoPagoVenta";
const HEADER_COLOR = "#198754";

interface ClienteType {
    key?: string;
    nit?: string;
    razon_social?: string;
    nombres?: string;
}
export interface PopupCarritoConfirmarResumenProps {
    descripcion?: string;
    factura?: boolean;
    cliente?: ClienteType;
    descuentoSeleccionado?: any[];
    subtotal?: number;
    montoMaximo?: number;
    key_moneda?: string;
    porcentajeDescuento?: number;
    solo_para_caja?: boolean;
    moneda?: any;
    almacen?: any;
    onTipoPagoChange: (esCredito: boolean) => void;
}
export default class PopupCarritoConfirmarResumen extends React.Component<PopupCarritoConfirmarResumenProps> {
    static open(props: PopupCarritoConfirmarResumenProps) {
        SPopup.open({
            key: "PopupCarritoConfirmarResumen",
            type: "3",
            content: <SView style={{ position: "absolute", top: 8, right: 8, width: "100%", maxWidth: 300, height: "95%", maxHeight: 620, backgroundColor: STheme.color.background, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, cursor: "default", userSelect: "text", overflow: "hidden", }} withoutFeedback>
                <PopupCarritoConfirmarResumen {...props} />
            </SView>
        })
    }
    evento: any;
    handleKeyDown = (e: any) => {
        if (e.key === "Escape") SPopup.close("PopupCarritoConfirmarResumen");
    }
    componentDidMount() {
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => this.forceUpdate());
        (globalThis as any).document?.addEventListener("keydown", this.handleKeyDown);
    }
    componentWillUnmount() {
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
        (globalThis as any).document?.removeEventListener("keydown", this.handleKeyDown);
    }
    calcularSubtotal() {
        const monedaActual = MDL.compra_venta.getMonedaSeleccionada();
        const carritoItems = MDL.carrito.carrito_venta.items;
        return carritoItems.reduce((acc, item) => {
            const precio = monedaActual ? item.modelo.precio_venta_moneda / (monedaActual.tipo_cambio || 1) : item.modelo.precio_venta_moneda;

            return acc + precio * item.cantidad;
        }, 0);
    }

    handleOnPress = async () => {
        try {
            const { porcentajeDescuento = 0, cliente, factura, almacen, descuentoSeleccionado, moneda } = this.props;
            const keyPuntoVenta = MDL.caja.activa?.key_punto_venta;
            if (!keyPuntoVenta) {
                SNotification.send({ key: "venta_rapida", title: "Sin caja activa", body: "No hay caja activa seleccionada.", color: STheme.color.danger, time: 4000 });
                return;
            }
            const subtotal = this.calcularSubtotal();
            const totalDescuento = subtotal * (porcentajeDescuento || 0);
            const total = subtotal - totalDescuento;
            const selectedMoneda = MDL.carrito.selectedMoneda || moneda;
            if (!selectedMoneda?.key) {
                SNotification.send({ key: "venta_rapida", title: "Moneda no seleccionada", body: "Debe seleccionar una moneda antes de continuar.", color: STheme.color.danger, time: 4000 });
                return;
            }
            const montoMaximo = total * (selectedMoneda?.tipo_cambio || 1);
            SelectTipoPagoVenta.openPopup({
                key_punto_venta: keyPuntoVenta,
                montoMaximo,
                key_moneda: selectedMoneda.key,
                onSelect: (tipos_pago: any[]) => {
                    this.handleSubmit(tipos_pago, selectedMoneda.key, cliente, factura, almacen, porcentajeDescuento, descuentoSeleccionado);
                },
                solo_para_caja: false,
                venta: true,
            });
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : JSON.stringify(error);
            SNotification.send({ key: "venta_rapida", title: "Error al realizar la venta", body: mensaje, color: STheme.color.danger, time: 4000 });
        }
    };

    showVentaPopup(key_venta: string) {
        SPopup.open({
            key: "popup-venta-completada",
            content: (
                <SView col="xs-11 md-4" backgroundColor={STheme.color.background} padding={24}
                    style={{ borderRadius: 16, maxWidth: "100%", alignItems: "center" }}>
                    <SView width={80} height={80} borderRadius={40} backgroundColor={"#198754"} center style={{ marginBottom: 16 }}> <SText fontSize={36} color="white">✔</SText> </SView>
                    <SText bold fontSize={20} center style={{ marginBottom: 8 }}>¡Venta realizada con éxito!</SText>
                    <SText fontSize={14} center style={{ color: STheme.color.text, marginBottom: 24 }}> Tu transacción se ha completado correctamente. </SText>
                    <SView row col="xs-12 md-11" style={{ justifyContent: "space-between", gap: 16, width: "100%", flexWrap: "nowrap" }}>
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.text}
                            onPress={() => SPopup.close("popup-venta-completada")}>
                            <SText color={STheme.color.background} center>Salir</SText>
                        </SView>
                        <SView flex height={40} borderRadius={8} center backgroundColor={"#198754"}
                            onPress={() => { SPopup.close("popup-venta-completada"); SNavigation.navigate("/venta/profile2", { pk: key_venta }); }}>
                            <SText color={STheme.color.text} center>Ver venta</SText>
                        </SView>
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.card}
                            style={{ borderWidth: 1, borderColor: "#198754" }}
                            onPress={() => { ComprobanteRollo.imprimir(key_venta); }}>
                            <SText color={STheme.color.text} center>Imprimir rollo</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    }

    generateRandomCode() {
        return "F-" + Date.now();
    }

    handleSubmit = async (tipos_pago: any, key_moneda: string, cliente: any, factura: boolean | undefined, almacen_: any, porcentajeDescuento: any, descuentoSeleccionado: any) => {
        try {
            const monedaActual = MDL.carrito.selectedMoneda || this.props.moneda || { key: key_moneda };
            const almacen = this.props.almacen || almacen_;
            if (!almacen?.key) {
                SNotification.send({ key: "venta_rapida", title: "Almacén requerido", body: "Debe seleccionar un almacén antes de completar la venta.", color: STheme.color.danger, time: 4000 });
                return;
            }
            const sucursalKey = MDL.caja.activa?.key_sucursal ?? null;
            const esCredito = Object.values(tipos_pago).some((tp: any) =>
                tp?.tipo_pago?.key === "credito" ||
                tp?.tipo_pago?.descripcion?.toLowerCase() === "credito"
            );
            const clientefull = this.props.cliente || {};
            if (esCredito && !clientefull?.key) {
                this.props.onTipoPagoChange(true);
                SelectTipoPagoVenta.closePopup();
                SPopup.close("PopupCarritoConfirmarResumen");
                SNotification.send({
                    key: "venta_rapida",
                    title: "Cliente requerido para venta a crédito",
                    body: "Para registrar una venta a crédito, debe seleccionar un cliente.",
                    color: STheme.color.danger,
                    time: 7000,
                });
                return;
            }
            this.props.onTipoPagoChange(false);
            const carritoItems = MDL.carrito.carrito_venta?.items || [];
            if (carritoItems.length === 0) {
                SNotification.send({ key: "venta_rapida", title: "Carrito vacío", body: "No hay productos en el carrito.", color: STheme.color.danger, time: 3000 });
                return;
            }
            const detalle = carritoItems.map((ci: any) => {
                const costos: any[] = [];
                const tcostos = ci?.modelo?.tipoCostos;
                if (tcostos) {
                    tcostos.map((tc: any) => {
                        if (!tc.key_modelo_cliente) return;
                        costos.push({
                            key_tipo_costo: tc.key_tipo_costo,
                            key_modelo_cliente: tc.key_modelo_cliente,
                            monto: tc.monto || 0,
                            descripcion: tc.__descripcion || (tc.descripcion || "Costo"),
                        });
                    });
                }
                const suscriptoresRaw = Array.isArray(ci.modelo?.suscriptores)
                    ? ci.modelo.suscriptores
                    : Array.isArray(ci.modelo?.Suscritores)
                        ? ci.modelo.Suscritores
                        : [];
                const suscriptores = suscriptoresRaw.map((suscriptor: any) => ({
                    key_cliente: suscriptor.key_cliente || suscriptor?.cliente?.key || suscriptor?.cliente?.value || null,
                    fecha_inicio: suscriptor.fecha_inicio,
                    fecha_fin: suscriptor.fecha_fin,
                    key_producto: "",
                    key_sucursal: sucursalKey,
                }));
                if (!Array.isArray(ci.modelo?.suscriptores)) {
                    ci.modelo.suscriptores = suscriptoresRaw;
                }
                const modeloAny = ci.modelo as any;
                return {
                    cantidad: ci.cantidad,
                    precio_unitario: ci?.precio ?? 0,
                    precio_unitario_base: modeloAny?.precio_venta_moneda ?? 0,
                    detalle: "",
                    descripcion: ci.modelo.descripcion,
                    data: {
                        tipo_producto: modeloAny?.tipo_producto?.tipo,
                        cupos_disponibles: (modeloAny?.cantidad_suscriptores * ci.cantidad || 0),
                        cupos_suscritos: suscriptores.length,
                    },
                    key_modelo: ci.modelo.key,
                    costos,
                    suscriptores,
                };
            });
            const suscripciones = detalle.flatMap((item: any) =>
                Array.isArray(item.suscriptores) ? item.suscriptores : []
            );
            const descripcion = this.props.descripcion || "";
            const data = {
                // descripcion,
                descripcion: "",
                observacion: descripcion,
                facturar: this.props.factura,
                factura: this.props.factura
                    ? {
                        nro_factura: this.generateRandomCode(),
                        cuf: "212E5B3D5BBF8FB31CCF8BE464EE98640C7F9CB6615194573A17DAF74",
                        nit: clientefull?.nit || "",
                        razon_social: clientefull?.razon_social || clientefull?.nombres || "",
                        detalle_factura: detalle.map((d: any) => `${d.descripcion} x${d.cantidad}`).join(", "),
                        leyenda: "",
                        factura_seleccionada: "Factura SIAT",
                    }
                    : null,
                tipo_pago: esCredito ? "credito" : "contado",
                facturar_luego: this.props.factura,
                cliente: {
                    key: clientefull?.key || null,
                    nit: clientefull?.nit || "",
                    razon_social: clientefull?.razon_social || clientefull?.nombres || "",
                },
                descuentos: this.props.descuentoSeleccionado || [],
                key_cliente: clientefull?.key || null,
                key_usuario: MDL.usuario.session?.key || null,
                key_caja: MDL.caja.activa?.key || null,
                key_almacen: almacen?.key || null,
                key_moneda: monedaActual?.key || null,
                detalle,
                suscripciones,
                tipos_pago,
            };
            SNotification.send({ key: "venta_rapida", title: "Cargando", type: "loading" });
            const ventaResp = await SSocket.sendPromise({
                service: "caja",
                component: "caja_detalle",
                type: "venta",
                estado: "cargando",
                data,
            });
            const keyVenta = (ventaResp as any)?.data?.key_compra_venta;
            if (!keyVenta) throw new Error("El servidor no devolvió la clave de la venta.");
            MDL.compra_venta.dispatchEvent({ type: "venta_realizada" });
            SelectTipoPagoVenta.closePopup();
            SNotification.remove("venta_rapida");
            SPopup.close("PopupCarritoConfirmarResumen");
            SPopup.close("PopupCarritoConfirmar");
            SPopup.close("PopupCarrito");
            this.showVentaPopup(keyVenta);
            MDL.caja.dispatchEvent({ type: "onDetalleChange" });
        } catch (error: any) {
            const mensaje = error instanceof Error ? error.message : JSON.stringify(error);
            console.error("Error al realizar la venta:", error);
            SNotification.send({ key: "venta_rapida", title: "Error al realizar la venta", body: mensaje, color: STheme.color.danger, time: 4000 });
        }
    }

    render() {
        const { porcentajeDescuento, cliente, factura, almacen } = this.props;
        const monedaActual = MDL.compra_venta.getMonedaSeleccionada();
        const subtotal2 = this.calcularSubtotal();
        const totalDescuento = subtotal2 * (porcentajeDescuento || 0);
        const total = subtotal2 - totalDescuento;
        return (
            <SView col={"xs-12"} height>
                <SView row style={{ backgroundColor: HEADER_COLOR, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" }}>
                    <SView style={{ width: 28, height: 28, justifyContent: "center", alignItems: "center", marginRight: 8 }}
                        onPress={() => SPopup.close("PopupCarritoConfirmarResumen")}>
                        <SIconApp name="Arrow" fill={STheme.color.text} />
                    </SView>
                    <SText fontSize={16} bold color={STheme.color.text}>{"Resumen de Venta"}</SText>
                    <SView flex />
                    <SView style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: STheme.color.danger, justifyContent: "center", alignItems: "center" }}
                        onPress={() => SPopup.close("PopupCarritoConfirmarResumen")}>
                        <SText fontSize={10} bold color={STheme.color.text}>{"✕"}</SText>
                    </SView>
                </SView>
                <SView flex>
                    <SView padding={8}>
                        <SView style={{ paddingVertical: 8 }}>
                            <FiltroMoneda onSelect={(moneda) => {
                                MDL.compra_venta.setMonedaSeleccionada(moneda);
                                MDL.carrito.calcularValoresCarritDeVentas();
                            }} />
                        </SView>
                        <SHr />
                        <SText color={STheme.color.lightGray} bold>{"Datos del Cliente"}</SText>
                        <SHr h={6} />
                        <SView row>
                            <SText color={STheme.color.lightGray}>{"Nombre:"}</SText>
                            <SView width={8} />
                            <SText>{cliente?.nombres || cliente?.razon_social}</SText>
                        </SView>
                        {factura && <>
                            <SHr h={12} />
                            <SText color={STheme.color.lightGray} bold>{"Datos Factura"}</SText>
                            <SHr h={6} />
                            <SView row>
                                <SText color={STheme.color.lightGray}>{"Razón Social:"}</SText>
                                <SView width={8} />
                                <SText>{cliente?.razon_social}</SText>
                            </SView>
                            <SHr h={4} />
                            <SView row>
                                <SText color={STheme.color.lightGray}>{"NIT:"}</SText>
                                <SView width={8} />
                                <SText>{cliente?.nit}</SText>
                            </SView>
                        </>}
                        <SHr h={12} />
                        <SView row>
                            <SText color={STheme.color.lightGray}>{"Almacén:"}</SText>
                            <SView width={8} />
                            <SText>{almacen?.descripcion}</SText>
                        </SView>
                        <SHr h={20} />
                        <SView style={{ borderRadius: 8, padding: 12, borderWidth: 2, borderColor: STheme.color.card }}>
                            <SView row style={{ justifyContent: "space-between", marginBottom: 6 }}>
                                <SText fontSize={13} color={STheme.color.text}>{"Subtotal:"}</SText>
                                <SText fontSize={13} bold color={STheme.color.text}>
                                    {monedaActual?.observacion ?? "Bs"}{" "}{SMath.formatMoney(subtotal2, 2)}
                                </SText>
                            </SView>
                            <SView row style={{ justifyContent: "space-between", marginBottom: 6 }}>
                                <SText fontSize={12} color={STheme.color.text}>{"Descuento:"}</SText>
                                <SText fontSize={13} color={STheme.color.text}>
                                    {"- "}{monedaActual?.observacion ?? "Bs"}{" "}{SMath.formatMoney(totalDescuento || 0, 2)}
                                </SText>
                            </SView>
                            <SView style={{ borderColor: STheme.color.gray, borderBottomWidth: 2, marginBottom: 6 }} />
                            <SView row style={{ justifyContent: "space-between", alignItems: "center" }}>
                                <SText fontSize={18} color={STheme.color.text}>{"Total:"}</SText>
                                <SView style={{ flex: 1, alignItems: "flex-end" }}>
                                    <SText fontSize={18} bold color={STheme.color.text} numberOfLines={1} adjustsFontSizeToFit>
                                        {monedaActual?.observacion ?? "Bs"}{" "}{SMath.formatMoney(total, 2)}
                                    </SText>
                                </SView>
                            </SView>
                        </SView>
                    </SView>
                </SView>
                <SView style={{ backgroundColor: STheme.color.card, borderTopWidth: 1, borderTopColor: STheme.color.gray, paddingHorizontal: 14, paddingVertical: 10 }}>
                    <SView style={{ backgroundColor: HEADER_COLOR, borderRadius: 4, paddingVertical: 10, alignItems: "center", justifyContent: "center" }}
                        onPress={() => this.handleOnPress()}>
                        <SText fontSize={14} bold color={STheme.color.text}>{"Confirmar venta"}</SText>
                    </SView>
                </SView>
            </SView>
        );
    }
}
