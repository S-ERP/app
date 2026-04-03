import React from "react";
import { SHr, SInput, SMath, SNavigation, SNotification, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
import SelectTipoPago from "../../Pages/caja2/components/SelectTipoPago";
import FiltroMoneda from "../../Pages/puntoventa/Components/FiltroMoneda";
// import ComprobanteRollo from "../PDF/compra/ComprobanteRollo";
import ComprobanteRollo from "../PDF/venta/ReciboSmall";

export type PopupCarritoConfirmarResumenProps = {
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
    inputCliente = null;
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
    componentWillUnmount(): void {
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
            this.forceUpdate(); // recalcula subtotal en render
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
            // Desestructuramos props
            const { porcentajeDescuento = 0, cliente, factura, almacen, descuentoSeleccionado } = this.props;
            // Validamos datos críticos
            if (!cliente) {
                console.warn("Cliente no definido");
                // return;
            }
            if (!factura) {
                console.warn("Factura no definida");
                // return;
            }
            if (!almacen) {
                console.warn("Almacén no definido");
                // return;
            }
            // Validamos caja activa
            const keyPuntoVenta = MDL.caja.activa?.key_punto_venta;
            if (!keyPuntoVenta) {
                console.warn("No hay caja activa");
                // return;
            }
            // Calculamos subtotal y descuentos
            const subtotal = this.calcularSubtotal();
            const totalDescuento = subtotal * (porcentajeDescuento || 0);
            const total = subtotal - totalDescuento;

            // Validamos moneda y tipo de cambio
            // const selectedMoneda = MDL.carrito.selectedMoneda;

            let selectedMoneda = this.state.moneda || MDL.compra_venta.getMonedaSeleccionada();
            if (!selectedMoneda) {
                const monedas = await MDL.empresa.getMonedas().catch(() => []);
                selectedMoneda = (monedas || []).find(m => m.tipo === "base") || (monedas || [])[0] || null;
                if (selectedMoneda) {
                    MDL.compra_venta.setMonedaSeleccionada(selectedMoneda);
                    MDL.compra_venta.dispatchEvent({ type: "moneda_seleccionada" });
                }
            }
            // if (!selectedMoneda || !selectedMoneda.tipo_cambio) {
            //     console.clear();

            //     console.warn("Moneda o tipo de cambio no definido");
            //     // return;
            // }

            const montoMaximo = total * (selectedMoneda.tipo_cambio || 1);

            // Abrimos popup de selección de tipo de pago
            SelectTipoPago.openPopup({
                key_punto_venta: keyPuntoVenta,
                montoMaximo,
                key_moneda: selectedMoneda.key,
                onSelect: (tipos_pago: any[]) =>
                    this.handleSubmit(
                        tipos_pago,
                        cliente,
                        factura,
                        almacen,
                        porcentajeDescuento,
                        descuentoSeleccionado
                    ),
                solo_para_caja: false,
                venta: true,
            });
        } catch (error) {
            // Manejo seguro de errores
            const mensaje = error instanceof Error ? error.message : JSON.stringify(error);
            SNotification.send({
                key: "venta_rapida",
                title: "Error al realizar la ventass",
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
                <SView col="xs-11 md-4" backgroundColor={STheme.color.background} padding={24} style={{ borderRadius: 16, maxWidth: "100%", alignItems: "center" }} >
                    {/* Icono de éxito */}
                    <SView width={80} height={80} borderRadius={40} backgroundColor={STheme.color.success} center style={{ marginBottom: 16 }} > <SText fontSize={36} color="white">✔</SText> </SView>

                    {/* Título */}
                    <SText bold fontSize={20} center style={{ marginBottom: 8 }}> ¡Venta realizada con éxito! </SText>

                    {/* Subtítulo */}
                    <SText fontSize={14} center style={{ color: STheme.color.text, marginBottom: 24 }}> Tu transacción se ha completado correctamente. Gracias por tu compra. </SText>

                    {/* Botones */}
                    <SView row col="xs-12 md-11" style={{ justifyContent: "space-between", gap: 16, width: "100%", flexWrap: "nowrap" }} >
                        {/* Salir */}
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.text} onPress={() => SPopup.close("popup-venta-completada")} > <SText color={STheme.color.background} center>Salir</SText> </SView>

                        {/* Ver venta */}
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.success} onPress={() => { SPopup.close("popup-venta-completada"); SNavigation.navigate("/venta/profile2", { pk: key_venta }); }} > <SText color={STheme.color.text} center>Ver venta</SText> </SView>

                        {/* Imprimir rollo */}
                        <SView flex height={40} borderRadius={8} center backgroundColor={STheme.color.card} border={STheme.color.success} onPress={() => {
                            // SPopup.close("popup-venta-completada");
                            ComprobanteRollo.imprimir(key_venta)
                        }} > <SText color={STheme.color.text} center>Imprimir rollo</SText> </SView>
                    </SView>
                </SView>
            )
        });
    }

    handleSubmit = async (tipos_pago: any, key_moneda: string, cliente: any, factura: boolean, almacen_: any, porcentajeDescuento: any, descuentoSeleccionado: any) => {
        try {
            const monedaActual = MDL.carrito.selectedMoneda;
            const almacen = this.props.almacen;
            const keyPago = Object.values(tipos_pago)[0]?.tipo_pago?.key;
            const clientefull = this.props.cliente;
            if (keyPago === "credito" && !clientefull) {
                this.props.onTipoPagoChange(true);
                SelectTipoPago.closePopup();
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
                return {
                    "cantidad": ci.cantidad,
                    "precio_unitario": ci?.precio ?? 0,
                    "precio_unitario_base": ci.modelo?.precio_venta_moneda ?? 0,
                    "detalle": "",
                    "descripcion": ci.modelo.descripcion,
                    "key_modelo": ci.modelo.key,
                    "costos": costos,
                }
            })


            // console.clear();
            console.log("%c" + JSON.stringify(detalle, null, 2), "color: #2ECC40; font-weight: bold;");

            // console.clear();
            // console.log("%c" + ingresar_texto, `color: #2ECC40; font-weight: bold;`);
            const data = {
                "descripcion": this.props.descripcion || "",
                "observacion": "Observación",
                "facturar": this.props.factura,
                "facturar_luego": this.props.factura,
                cliente: {
                    nit: this.props.cliente?.nit || "",
                    razon_social: this.props.cliente?.razon_social || ""
                },
                descuentos: this.props.descuentoSeleccionado || [],
                // descuentos: descuentoSeleccionado || [],
                "key_cliente": this.props.cliente?.key,
                // "key_cliente": cliente?.key,
                "key_usuario": MDL.usuario.session?.key,
                "key_caja": MDL.caja.activa?.key,
                "key_almacen": almacen.key,
                "key_moneda": monedaActual.key,
                "detalle": detalle,
                tipos_pago: tipos_pago,
            }

            // console.clear();
            // console.log("%c" + "venta", `color: #2ECC40; font-weight: bold;`);
            // console.log(JSON.stringify(data))
            // return;


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
            SelectTipoPago.closePopup();
            SNotification.remove("venta_rapida");
            SPopup.close("PopupCarritoConfirmar");
            SPopup.close("PopupCarritoConfirmarResumen");
            SPopup.close("PopupCarrito");
            MDL.carrito.limpiarCarritoVentas();
            MDL.carrito.limpiarCarritoCompras();

            this.showVentaPopup(compraResp?.data?.key_compra_venta);

            // SPopup.confirm({
            //     title: "¡Venta realizada con éxito!",
            //     message: "¿Deseas ir a la venta ahora?",
            //     onPress: () => {
            //         SNavigation.navigate("/venta/profile2", { pk: compraResp?.data?.key_compra_venta });
            //     }
            // });
            MDL.caja.dispatchEvent({ type: "onDetalleChange" });
        } catch (error: any) {

            const mensaje = error instanceof Error ? error.message : JSON.stringify(error);
            SNotification.send({
                key: "venta_rapidas",
                title: "Error al realizarsssssssssssss la ventass",
                body: mensaje,
                color: STheme.color.danger,
                time: 4000,
            });

            // console.error("Error al realizdddsdar la venta:", error);
            // SNotification.send({
            //     key: "venta_rapida",
            //     title: "Error al rsdsdealizar la venta",
            //     body: error?.error || JSON.stringify(error),
            //     color: STheme.color.danger,
            //     time: 4000,
            // });
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
                            <FiltroMoneda
                                onSelect={(moneda) => {
                                    this.setState({ selectedMoneda: moneda });
                                    MDL.compra_venta.setMonedaSeleccionada(moneda);
                                    MDL.carrito.calcularValoresCarritDeVentas();
                                }}
                            />
                        </SView>
                        <SText col={"xs-6"} color={STheme.color.lightGray}>{"Datos del Cliente"}</SText>
                        <SHr />
                        <SView col={"xs-12"} row >
                            <SText color={STheme.color.lightGray}>Nombre:</SText>
                            <SView width={8} />
                            <SText>{cliente?.nombres}</SText>
                        </SView>
                        <SHr h={20} />
                        {factura && <SView col={"xs-12"} row >
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
                        <SView col={"xs-12"} row >
                            <SText color={STheme.color.lightGray}>Almacen:</SText>
                            <SView width={8} />
                            <SText>{almacen?.descripcion}</SText>
                        </SView>
                        <SHr h={10} />
                        <SView col={"xs-12"} row >
                            <SText color={STheme.color.lightGray}>Descuento:</SText>
                            <SView width={8} />
                            <SText>{porcentajeDescuento}</SText>
                        </SView>
                        <SHr h={20} />
                        <SView
                            col={"xs-12"}
                            border={STheme.color.card}
                            style={{ borderRadius: 8, padding: 8, borderWidth: 2 }}
                            height={100}
                        >
                            <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                                <SText fontSize={13} color={STheme.color.text}>Subtotal:</SText>
                                <SText fontSize={13} bold color={STheme.color.text}>
                                    {monedaActual.observacion} {SMath.formatMoney(subtotal2, 2)}
                                </SText>
                            </SView>
                            <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                <SText fontSize={12} color={STheme.color.text}>Descuentos:</SText>
                                <SText fontSize={13} color={STheme.color.text}>
                                    - {monedaActual.observacion} {SMath.formatMoney((totalDescuento) || 0, 2)}
                                </SText>
                            </SView>
                            <SHr height={3} />
                            <SView col={"xs-12"} style={{ borderColor: STheme.color.gray, borderBottomWidth: 2 }} />
                            <SHr height={5} />
                            <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4, padding: 3 }}>
                                <SText fontSize={18} color={STheme.color.text}>Total:</SText>
                                <SText fontSize={18} bold color={STheme.color.text}>
                                    {monedaActual.observacion} {SMath.formatMoney(total, 2)}
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
                    <SText>{"Confirmar la venta"}</SText>
                </SView>
            </SView>
        </SView >
    }
}