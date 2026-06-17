import React from "react";
import { SHr, SInput, SMath, SNavigation, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
// import SelectTipoPago from "../../Pages/caja2/components/SelectTipoPagoVenta";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";
import ComprobanteRollo from "../PDF/venta/ReciboSmall";
import SelectTipoPagoVenta from "../../Pages/caja2/components/SelectTipoPagoVenta";

interface ClienteType {
    key?: string;
    nit?: string;
    razon_social?: string;
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
            content: <SView style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: "100%",
                maxWidth: 300,
                height: 500,
                maxHeight: "100%",
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: STheme.color.card,
                cursor: "default",
                userSelect: "text"
            }} withoutFeedback>
                <PopupCarritoConfirmarResumen {...props} />
            </SView>
        })
    }
    inputNombre: SInput | null = null;
    inputAlmacen: SelectorAlmacen | undefined;
    proveedor: any;
    inputCliente: SInput | null = null;
    evento: any;

    handleChange = () => { };
    state: {
        almacen: any,
        moneda: any,
        factura: boolean,
        razon_social: string,
        nit: string,
        clientes: any[],
        key_cliente: string | null,
        cliente_texto: string,
        descuentos: any[],
        subtotal: any,
    } = {
            almacen: null,
            moneda: null,
            factura: false,
            razon_social: "",
            nit: "",
            clientes: [],
            key_cliente: null,
            cliente_texto: "",
            descuentos: [],
            subtotal: null,
        }

    componentDidMount() {
        this.cargarClientes();
        this.cargarDescuentos();
        this.escucharCambioMoneda();
    }

    componentWillUnmount() {
        MDL.carrito.removeEventListener(this.handleChange);
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
    }

    async cargarClientes() {
        try {
            const clientes = await MDL.crm.cliente.getAll();
            this.setState({ clientes: clientes || [] });
        } catch (error) {
            console.error("Error cargando clientes:", error);
        }
    }

    async cargarDescuentos() {
        try {
            const response = await SSocket.sendPromise({
                service: "compra_venta",
                component: "descuento",
                type: "getAll",
                key_empresa: MDL.empresa?.select?.key
            });
            const descuentos = Object.values(response.data || {});
            this.setState({ descuentos });
        } catch (error) {
            console.error("Error cargando descuentos:", error);
        }
    }

    escucharCambioMoneda() {
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => {
            this.forceUpdate();
        });
    }

    calcularSubtotal() {
        const monedaActual = MDL.compra_venta.getMonedaSeleccionada();
        const carritoItems = MDL.carrito.carrito_venta.items;
        return carritoItems.reduce((acc, item) => {
            const precio = monedaActual
                ? item.modelo.precio_venta_moneda / (monedaActual.tipo_cambio || 1)
                : item.modelo.precio_venta_moneda;
            return acc + precio * item.cantidad;
        }, 0);
    }

    handleOnPress = async () => {
        try {
            const { porcentajeDescuento = 0, cliente, factura, almacen, descuentoSeleccionado, moneda } = this.props;
            if (!cliente) {
                console.error("Cliente no definido");
            }
            if (!factura) {
                console.error("Factura no definida");
            }
            if (!almacen) {
                console.error("Almacén no definido");
            }
            const keyPuntoVenta = MDL.caja.activa?.key_punto_venta;
            if (!keyPuntoVenta) {
                console.warn("No hay caja activa");
            }
            const subtotal = this.calcularSubtotal();
            const totalDescuento = subtotal * (porcentajeDescuento || 0);
            const total = subtotal - totalDescuento;
            const selectedMoneda = MDL.carrito.selectedMoneda || moneda;
            if (!selectedMoneda?.key) {
                SNotification.send({
                    key: "venta_rapida",
                    title: "Moneda no seleccionada",
                    body: "Debe seleccionar una moneda antes de continuar.",
                    color: STheme.color.danger,
                    time: 4000,
                });
                return;
            }
            if (!selectedMoneda?.tipo_cambio) {
                console.warn("Moneda o tipo de cambio no definido");
            }

            const montoMaximo = total * (selectedMoneda?.tipo_cambio || 1);

            SelectTipoPagoVenta.openPopup({
                key_punto_venta: keyPuntoVenta,
                montoMaximo,
                key_moneda: selectedMoneda.key,
                onSelect: (tipos_pago: any[]) => {
                    this.handleSubmit(
                        tipos_pago,
                        selectedMoneda.key,
                        cliente,
                        factura,
                        almacen,
                        porcentajeDescuento,
                        descuentoSeleccionado
                    );
                },
                solo_para_caja: false,
                venta: true,
            });
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : JSON.stringify(error);
            SNotification.send({
                key: "venta_rapida",
                title: "Error al realizar la venta",
                body: mensaje,
                color: STheme.color.danger,
                time: 4000,
            });
        }
    };

    showVentaPopup(key_venta: String) {
        SPopup.open({
            key: "popup-venta-completada",
            content: (
                <SView col="xs-11 md-4" backgroundColor={STheme.color.background} padding={24} style={{ borderRadius: 16, maxWidth: "100%", alignItems: "center" }}>
                    <SView width={80} height={80} borderRadius={40} backgroundColor={STheme.color.success} center style={{ marginBottom: 16 }}> <SText fontSize={36} color="white">✔</SText> </SView>
                    <SText bold fontSize={20} center style={{ marginBottom: 8 }}> ¡Venta realizada con éxito! </SText>
                    <SText fontSize={14} center style={{ color: STheme.color.text, marginBottom: 24 }}> Tu transacción se ha completado correctamente. Gracias por tu compra. </SText>
                    <SView row col="xs-12 md-11" style={{ justifyContent: "space-between", gap: 16, width: "100%", flexWrap: "nowrap" }}>
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.text} onPress={() => SPopup.close("popup-venta-completada")}> <SText color={STheme.color.background} center>Salir</SText> </SView>
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.success} onPress={() => { SPopup.close("popup-venta-completada"); SNavigation.navigate("/venta/profile2", { pk: key_venta }); }}> <SText color={STheme.color.text} center>Ver venta</SText> </SView>
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.card} border={STheme.color.success} onPress={() => {
                            ComprobanteRollo.imprimir(key_venta)
                        }}> <SText color={STheme.color.text} center>Imprimir rollo</SText> </SView>
                    </SView>
                </SView>
            )
        });
    }

    generateRandomCode(length = 6) {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        const res = Math.floor(min + Math.random() * (max - min + 1)).toString();
        return "F-" + res;
    }

    handleSubmit = async (tipos_pago: any, key_moneda: string, cliente: any, factura: boolean, almacen_: any, porcentajeDescuento: any, descuentoSeleccionado: any) => {
        try {
            const monedaActual = MDL.carrito.selectedMoneda || this.props.moneda || { key: key_moneda };

            if (!monedaActual?.key) {
                console.error("Moneda no seleccionada para completar la venta");
            }
            const almacen = this.props.almacen || almacen_;
            if (!almacen?.key) {
                SPopup.alert("Debe seleccionar un almacén antes de completar la venta.");
                return;
            }

            console.clear();
            console.log("%c" + JSON.stringify(cliente), `color: #ccc92e; font-weight: bold;`);
            const sucursalKey = MDL.caja.activa ? MDL.caja.activa.key_sucursal : null;

            const keyPago = Object.values(tipos_pago)[0]?.tipo_pago?.key;
            const esCredito = Object.values(tipos_pago).some((tp: any) =>
                tp?.tipo_pago?.key === "credito" ||
                tp?.tipo_pago?.descripcion?.toLowerCase() === "credito"
            );
            const clientefull = this.props.cliente || {};

            console.log("%c" + JSON.stringify(clientefull), `color: rgb(27, 210, 235); font-weight: bold;`);

            if (esCredito && !clientefull?.key) {
                this.props.onTipoPagoChange(true);
                SelectTipoPagoVenta.closePopup();
                SPopup.close("PopupCarritoConfirmarResumen");
                SNotification.send({
                    key: "venta_rapida",
                    title: "Cliente requerido para venta a crédito ",
                    body: "Para registrar una venta a crédito, debe seleccionar un cliente.",
                    color: STheme.color.danger,
                    time: 7000,
                });
                return;
            } else {
                this.props.onTipoPagoChange(false);
            }
            if (!almacen) {
                SPopup.alert("Debe seleccionar un almacen");
            }
            const detalle = MDL.carrito.carrito_venta.items.map((ci) => {
                console.log("%c" + JSON.stringify(ci), `color: #e22b2b; font-weight: bold;`);
                const costos: any = []
                const tcostos = ci?.modelo?.tipoCostos;
                if (tcostos) {
                    tcostos.map((tc: any) => {
                        if (!tc.key_modelo_cliente) return;
                        costos.push({
                            "key_tipo_costo": tc.key_tipo_costo,
                            key_modelo_cliente: tc.key_modelo_cliente,
                            "monto": tc.monto || 0,
                            "descripcion": tc.__descripcion || (tc.descripcion || "Costo"),
                        })
                    })
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
                return {
                    "cantidad": ci.cantidad,
                    "precio_unitario": ci?.precio ?? 0,
                    "precio_unitario_base": ci.modelo?.precio_venta_moneda ?? 0,
                    "detalle": "",
                    "descripcion": ci.modelo.descripcion,
                    "data": {
                        "tipo_producto": ci.modelo?.tipo_producto?.tipo,
                        "cupos_disponibles": (ci.modelo?.cantidad_suscriptores * ci.cantidad || 0),
                        "cupos_suscritos": suscriptores.length,
                    },
                    "key_modelo": ci.modelo.key,
                    "costos": costos,
                    suscriptores,
                }
            })

            const suscripciones = detalle
                .flatMap((item: any) => (Array.isArray(item.suscriptores) ? item.suscriptores.map((suscripcion: any) => ({
                    ...suscripcion,
                })) : []));
            const data = {
                descripcion: this.props.descripcion || "",
                observacion: "Observación",
                facturar: this.props.factura,
                factura: this.props.factura
                    ? {
                        nro_factura: this.generateRandomCode(),
                        cuf: "212E5B3D5BBF8FB31CCF8BE464EE98640C7F9CB6615194573A17DAF74",
                        nit: clientefull?.nit || "",
                        razon_social: clientefull?.razon_social || clientefull?.nombres || "",
                        detalle_factura: detalle.map((d: any) => `${d.descripcion} x${d.cantidad}`).join(", "),
                        leyenda: "alvaro es probando la leyenda",
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
            console.log("%c" + JSON.stringify(data), `color: #2ECC40; font-weight: bold;`);
            SNotification.send({
                key: "venta_rapida",
                title: "Cargando",
                type: "loading",
            });
            const compraResp = await SSocket.sendPromise({
                "service": "caja",
                "component": "caja_detalle",
                "type": "venta",
                "estado": "cargando",
                "data": data
            })
            MDL.compra_venta.dispatchEvent({ type: "venta_realizada" });
            SelectTipoPagoVenta.closePopup();
            SNotification.remove("venta_rapida");
            SPopup.close("PopupCarritoConfirmar");
            SPopup.close("PopupCarritoConfirmarResumen");
            SPopup.close("PopupCarrito");
            MDL.carrito.limpiarCarritoVentas();
            MDL.carrito.limpiarCarritoCompras();
            this.showVentaPopup(compraResp?.data?.key_compra_venta);
            MDL.caja.dispatchEvent({ type: "onDetalleChange" });
        } catch (error: any) {
            const mensaje = error instanceof Error ? error.message : JSON.stringify(error);
            console.error("Error al realizar la venta:", error);
            SNotification.send({
                key: "venta_rapida",
                title: "Error al realizar la venta",
                body: mensaje,
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }

    render() {
        const { porcentajeDescuento, cliente, factura, almacen, descuentoSeleccionado } = this.props;
        const monedaActual = MDL.compra_venta.getMonedaSeleccionada();
        const subtotal2 = this.calcularSubtotal();
        const totalDescuento = subtotal2 * (porcentajeDescuento || 0);
        const total = subtotal2 - totalDescuento;
        return <SView col={"xs-12"} height>
            < SHr />
            <SText center color={STheme.color.lightGray} bold>{"Confirmar la venta resumen"}</SText>
            <SView style={{
                padding: 4,
                width: 33, height: 33,
                position: "absolute",
                left: 0,
                top: 0,
            }} onPress={() => {
                SPopup.close("PopupCarritoConfirmarResumen")
            }}>
                <SIconApp name="Arrow" fill={STheme.color.text} />
            </SView>
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <SHr />
            <SView flex>
                <SView padding={8}>
                    <SView row col={"xs-12"}>
                        <SView row col={"xs-12"} style={{ paddingVertical: 8 }}>
                            <FiltroMoneda onSelect={(moneda) => {
                                this.setState({ selectedMoneda: moneda });
                                MDL.compra_venta.setMonedaSeleccionada(moneda);
                                MDL.carrito.calcularValoresCarritDeVentas();
                            }}
                            />
                        </SView>
                        <SText col={"xs-6"} color={STheme.color.lightGray}>{"Datos del Cliente"}</SText>
                        <SHr />
                        <SView col={"xs-12"} row>
                            <SText color={STheme.color.lightGray}>Nombrssse:</SText>
                            <SView width={8} />
                            <SText>{cliente?.nombres}</SText>
                        </SView>
                        <SHr h={20} />
                        {factura && <SView col={"xs-12"} row>
                            <SText color={STheme.color.lightGray}>Datos Factura</SText>
                            <SHr />
                            <SText color={STheme.color.lightGray}>Razón Social:</SText>
                            <SView width={8} />
                            <SText>{cliente?.razon_social}</SText>
                            <SHr />
                            <SText color={STheme.color.lightGray}>NIT:</SText>
                            <SView width={8} />
                            <SText>{cliente?.nit}</SText>
                            <SHr h={20} />
                        </SView>}
                        <SView col={"xs-12"} row>
                            <SText color={STheme.color.lightGray}>Almacen:</SText>
                            <SView width={8} />
                            <SText>{almacen?.descripcion}</SText>
                        </SView>
                        <SHr h={10} />
                        <SView col={"xs-12"} row>
                            <SText color={STheme.color.lightGray}>Descuento:</SText>
                            <SView width={8} />
                            <SText>{porcentajeDescuento}</SText>
                        </SView>
                        <SHr h={20} />
                        <SView
                            col={"xs-12"}
                            border={STheme.color.card}
                            style={{
                                borderRadius: 8,
                                padding: 8,
                                borderWidth: 2
                            }}
                            height={100}>
                            <SView col={"xs-12"} row style={{
                                justifyContent: "space-between",
                                marginBottom: 4
                            }}>
                                <SText fontSize={13} color={STheme.color.text}>Subtotal:</SText>
                                <SText fontSize={13} bold color={STheme.color.text}>
                                    {monedaActual?.observacion ?? "Bs"} {SMath.formatMoney(subtotal2, 2)}
                                </SText>
                            </SView>
                            <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                <SText fontSize={12} color={STheme.color.text}>Descuentos:</SText>
                                <SText fontSize={13} color={STheme.color.text}>
                                    - {monedaActual?.observacion ?? "Bs"} {SMath.formatMoney((totalDescuento) || 0, 2)}
                                </SText>
                            </SView>
                            <SHr height={3} />
                            <SView col={"xs-12"} style={{ borderColor: STheme.color.gray, borderBottomWidth: 2 }} />
                            <SHr height={5} />
                            <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4, padding: 3 }}>
                                <SText fontSize={18} color={STheme.color.text}>Total:</SText>
                                <SText fontSize={18} bold color={STheme.color.text}>
                                    {monedaActual?.observacion ?? "Bs"} {SMath.formatMoney(total, 2)}
                                </SText>
                            </SView>
                        </SView>
                    </SView>
                </SView>
                <SHr />
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SView col={"xs-12"} row center height={40}>
                <SView padding={8} card onPress={() => {
                    this.handleOnPress();
                }}>
                    <SText>{"Confirmar lasssss venta"}</SText>
                </SView>
            </SView>
        </SView>
    }
}