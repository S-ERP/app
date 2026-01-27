import React from "react";
import { SHr, SImage, SInput, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
import SelectTipoPago from "../../Pages/caja2/components/SelectTipoPago";
type PopupCarritoConfirmarResumenProps = {
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

    async componentDidMount() {
        try {
            const clientes = await MDL.crm.cliente.getAll(); // tu método de listar
            this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => {
                this.cargarSubtotal();
            });

            this.setState({ clientes: clientes || [] });
            await SSocket.sendPromise({
                service: "compra_venta",
                component: "descuento",
                type: "getAll",
                key_empresa: MDL.empresa?.select?.key
            }).then(e => {
                const descuentos = Object.values(e.data)
                this.setState({ descuentos: descuentos })
            })

            this.cargarSubtotal();

        } catch (e) {
            console.error("Error cargando clientes", e);
        }
    }


    cargarSubtotal() {
        const monedaActual = MDL.compra_venta.getMonedaSeleccionada();
        const carritoItems = MDL.carrito.carrito_venta.items;
        const subtotal = carritoItems.reduce((acc, item) => {
            const precio = monedaActual
                ? item.modelo.precio_venta_moneda / (monedaActual.tipo_cambio || 1)
                : item.modelo.precio_venta_moneda;
            return acc + precio * item.cantidad;
        }, 0);
        this.setState({ subtotal: subtotal || 0 });
    }

    componentWillUnmount(): void {
        // Eliminar listener de carrito
        MDL.carrito.removeEventListener(this.handleChange);

        // Eliminar listener de moneda
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
    }
    handleOnPress = async () => {
        try {

            // console.log("%c" + "-------------- handleOnPress", `color: #2ECC40; font-weight: bold;`);
            // const monedaActual = MDL.compra_venta.getMonedaSeleccionada();

            const { montoMaximo, key_moneda, porcentajeDescuento, solo_para_caja, cliente, factura, almacen, descuentoSeleccionado } = this.props;


            // Moneda actual
            const monedaActual = MDL.compra_venta.getMonedaSeleccionada();

            // Subtotal calculado dinámicamente con la moneda actual
            // const carritoItems = MDL.carrito.carrito_venta.items;
            // const subtotal = carritoItems.reduce((acc, item) => {
            //     const precio = monedaActual
            //         ? item.modelo.precio_venta_moneda / (monedaActual.tipo_cambio || 1)
            //         : item.modelo.precio_venta_moneda;
            //     return acc + precio * item.cantidad;
            // }, 0);

            // const totalDescuento = subtotal * (porcentajeDescuento || 0);
            // const total = subtotal - totalDescuento;

            const subtotal = this.state.subtotal || 0;
            const totalDescuento = subtotal * (porcentajeDescuento || 0);
            const total = subtotal - totalDescuento;

            SelectTipoPago.openPopup({
                key_punto_venta: MDL.caja.activa?.key_punto_venta as any,
                montoMaximo: total,
                // montoMaximo: montoMaximo,
                key_moneda: key_moneda,
                onSelect: (tipos_pago: any) => this.handleSubmit(tipos_pago, key_moneda, cliente, factura, almacen, porcentajeDescuento, descuentoSeleccionado),
                solo_para_caja: solo_para_caja,
            });
        } catch (error: any) {
            SNotification.send({
                key: "venta_rapida",
                title: "Error al realizar la compra",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }
    // 0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣
    // Se realizó el cambio debido a que el sistema no estaba capturando correctamente el valor del precio según el tipo de pago, lo que ocasionaba un error
    handleSubmit = async (tipos_pago: any, key_moneda: string, cliente: any, factura: boolean, almacen_: any, porcentajeDescuento: any, descuentoSeleccionado: any) => {
        console.log("%c" + "-------------- handleSubmit", `color: #rgb(204, 117, 46) font-weight: bold;`);

        try {
            const monedaActual = MDL.compra_venta.getMonedaSeleccionada();
            const almacen = almacen_;
            if (!almacen) {
                throw "Debe seleccionar un almacen"
            }
            // aqui creo que tengo que recalcula en carrito


            const detalle = MDL.carrito.carrito_venta.items.map((ci) => {
                return {
                    "cantidad": ci.cantidad,
                    "precio_unitario": ci.precio,
                    // "precio_unitario_base": ci.modelo.precio_venta_moneda,
                    "precio_unitario_base": monedaActual ? ci.modelo.precio_venta_moneda / (monedaActual.tipo_cambio || 1) : ci.modelo.precio_venta_moneda,

                    "detalle": "",
                    "descripcion": ci.modelo.descripcion,
                    "key_modelo": ci.modelo.key,
                    "modelo": ci.modelo,
                }
            })
            const data = {
                "descripcion": "Venta De Prueba Ricky",
                "observacion": "Observacion de la venta de prueba ricky",
                "facturar": factura ? true : false,
                cliente: {
                    nit: cliente?.nit || "",
                    razon_social: cliente?.razon_social || ""
                },
                descuentos: descuentoSeleccionado || [],
                "key_cliente": cliente?.key,
                "key_usuario": MDL.usuario.session?.key,
                "facturar_luego": false,
                "key_caja": MDL.caja.activa?.key,
                "key_almacen": almacen.key,
                "key_moneda": key_moneda,
                "detalle": detalle,
                tipos_pago: tipos_pago,
            }

            // console.log("%c" + "gatoooo volador", `color: #2ECC40; font-weight: bold;`);
            // console.log("%c" + JSON.stringify(data), `color: #2ECC40; font-weight: bold;`);

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
            SelectTipoPago.closePopup();
            SNotification.remove("venta_rapida");
            SPopup.close("PopupCarritoConfirmar");
            SPopup.close("PopupCarritoConfirmarResumen");
            SPopup.close("PopupCarrito");
            MDL.carrito.limpiarCarritoVentas();
            MDL.carrito.limpiarCarritoCompras();//este esta limpinado el carrito lateral..... pronto se borrara
            SPopup.confirm({
                title: "¡Venta realizada con éxito!",
                message: "¿Deseas ir a la venta ahora?",
                onPress: () => {
                    SNavigation.navigate("/venta/profile2", { pk: compraResp?.data?.key_compra_venta });
                }
            });
            MDL.caja.dispatchEvent({ type: "onDetalleChange" });
        } catch (error: any) {
            console.error("Error al realizar la venta:", error);
            SNotification.send({
                key: "venta_rapida",
                title: "Error al realizar la ventasssssssssssssssss",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }
    render() {
        console.log("PROPS EN RESUMEN resumen RENDER", this.props)
        const { montoMaximo, key_moneda, porcentajeDescuento, solo_para_caja, cliente, factura, moneda, almacen, subtotal, descuentoSeleccionado } = this.props;
        const monedaActual = MDL.compra_venta.getMonedaSeleccionada();


        const subtotal2 = this.state.subtotal || 0;
        const totalDescuento = this.state.subtotal * (porcentajeDescuento || 0);
        const total = this.state.subtotal - totalDescuento;


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
                                    {monedaActual.observacion} {SMath.formatMoney(this.state.subtotal, 2)}
                                    {/* {moneda.observacion} {SMath.formatMoney(subtotal, 2)} */}
                                </SText>
                            </SView>
                            <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                <SText fontSize={12} color={STheme.color.text}>Descuentosssssss:</SText>
                                <SText fontSize={13} color={STheme.color.text}>
                                    - {monedaActual.observacion} {SMath.formatMoney((subtotal * porcentajeDescuento) || 0, 2)}
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