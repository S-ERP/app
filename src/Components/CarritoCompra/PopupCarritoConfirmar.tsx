import React from "react";
import { SHr, SImage, SInput, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
import SelectTipoPago from "../../Pages/caja2/components/SelectTipoPago";
import SelectTipoPago2 from "../../Pages/caja2/components/SelectTipoPago2";
import SelectorMoneda from "../Selectores/SelectorMoneda";
import SelectorCliente from "../Selectores/SelectorCliente";
type PopupCarritoConfirmarProps = {
}
export default class PopupCarritoConfirmar extends React.Component<PopupCarritoConfirmarProps> {
    static open(props: PopupCarritoConfirmarProps) {
        SPopup.open({
            key: "PopupCarritoConfirmar",
            type: "3",
            content: <SView style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: "100%",
                maxWidth: 300,
                height: 500,
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: STheme.color.card,
                cursor: "default",
                userSelect: "text"
            }} withoutFeedback>
                <PopupCarritoConfirmar {...props} />
            </SView>
        })
    }
    inputNombre: SInput | null = null;
    inputAlmacen: SelectorAlmacen | undefined;
    proveedor: any;
    state: { almacen: any, moneda: any, factura: boolean, esCredito: boolean, subtotal: any, } = {
        almacen: null,
        moneda: MDL.carrito.selectedMoneda,
        factura: false,
        esCredito: false, // 👈 bandera
        subtotal: null,
    }
    componentDidMount(): void {
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => {
            this.cargarSubtotal();
        });
        this.cargarSubtotal();
    }
    cargarSubtotal() {
        const monedaActual = MDL.compra_venta.getMonedaSeleccionada();
        const carritoItems = MDL.carrito.carrito_compra.items;
        const subtotal = carritoItems.reduce((acc, item) => {
            const precio = monedaActual
                ? item.modelo.precio_compra_moneda / (monedaActual.tipo_cambio || 1)
                : item.modelo.precio_compra_moneda;
            return acc + precio * item.cantidad;
        }, 0);
        this.setState({ subtotal: subtotal || 0 });
    }
    handleOnPress = async () => {
        try {
            const key_moneda = this.state.moneda.key
            const almacen = this.state.almacen;
            if (!almacen) {
                throw "Debe seleccionar un almacen"
            }
            if (!key_moneda) {
                throw "Debe seleccionar una moneda"
            }
            SelectTipoPago.openPopup({
                key_punto_venta: MDL.caja.activa?.key_punto_venta as any,
                montoMaximo: MDL.carrito.carrito_compra.monto_total,
                key_moneda: key_moneda,
                onSelect: (tipos_pago: any) => this.handleSubmit(tipos_pago, key_moneda),
                solo_para_caja: false,
                compra: true
            });
        } catch (error: any) {
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                key: "compra_rapida",
                title: "Error al realizar la compra",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }
    handleOnPress2 = async () => {
        try {

            // const monedas = await MDL.empresa.getMonedas();
            // const monedaActual = MDL.carrito.selectedMoneda;
            // const mierda = this.state.subtotal;
            const key_moneda = this.state.moneda.key
            // const montotottaaaaaaaaa = monedaActual ? MDL.carrito.carrito_compra.monto_total / (monedaActual.tipo_cambio || 1) : MDL.carrito.carrito_compra.monto_total;
            const almacen = this.state.almacen;
            if (!almacen) {
                throw "Debe seleccionar un almacen"
            }
            if (!key_moneda) {
                throw "Debe seleccionar una moneda"
            }
            const subtotal = this.state.subtotal || 0;
            const total = subtotal * MDL.carrito.selectedMoneda.tipo_cambio; SelectTipoPago2.openPopup({
                key_punto_venta: MDL.caja.activa?.key_punto_venta as any,

                montoMaximo: total,
                key_moneda: MDL.carrito.selectedMoneda.key,

                onSelect: (tipos_pago: any) => this.handleSubmit(tipos_pago, key_moneda),
                solo_para_caja: false,
                compra: true

            });
        } catch (error: any) {
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                key: "compra_rapida",
                title: "Error al realizar la compra",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }
    handleSubmit = async (tipos_pago: any, key_moneda: string) => {
        try {
            const proveedor = this.proveedor;
            const keyPago = Object.values(tipos_pago)[0]?.tipo_pago?.key;
            // const monedaActual = MDL.carrito.selectedMoneda;
            const descripcionVenta = this.inputDescripcionVenta?.getValue?.() || ""; if (keyPago === "credito" && !proveedor) {
                this.setState({ esCredito: true });
                SelectTipoPago2.closePopup();

                SNotification.send({
                    key: "compra_rapida",
                    title: "Proveedor requerido",
                    body: "Para registrar una compra a crédito, debe seleccionar un proveedor.",
                    color: STheme.color.danger,
                    time: 7000,
                });
                return;
            } else {
                this.setState({ esCredito: false });
            }
            const almacen = this.state.almacen;
            if (!almacen) {
                throw "Debe seleccionar un almacen"
            }
            const detalle = MDL.carrito.carrito_compra.items.map((ci) => {
                return {
                    "cantidad": ci.cantidad,
                    "precio_unitario": ci.precio,
                    "precio_unitario_base": ci.modelo.precio_compra_moneda,
                    "detalle": "",
                    "descuento": 0,
                    "descripcion": ci.modelo.descripcion,
                    "key_modelo": ci.modelo.key,
                    "moneda": key_moneda
                }
            })
            const data = {
                "descripcion": descripcionVenta,
                "observacion": "Observacion compras",
                "key_proveedor": this.proveedor?.key,
                "key_usuario": MDL.usuario.session?.key,
                "facturar": false,
                "facturar_luego": false,
                "key_caja": MDL.caja.activa?.key,
                "key_almacen": almacen.key,
                "key_moneda": key_moneda,
                "detalle": detalle,
                tipos_pago: tipos_pago,
            }
            SNotification.send({
                key: "compra_rapida",
                title: "Cargando",
                type: "loading",
            });
            const compraResp = await SSocket.sendPromise({
                "service": "caja",
                "component": "caja_detalle",
                "type": "compra",
                "estado": "cargando",
                "data": data
            })
            SelectTipoPago.closePopup();
            SNotification.remove("compra_rapida");
            SPopup.close("PopupCarritoConfirmar");
            SPopup.close("PopupCarrito");
            MDL.carrito.limpiarCarritoCompras();
            MDL.compra_venta.dispatchEvent({ type: "venta_realizada" });
            SPopup.confirm({
                title: "¡Compras realizada con éxito!",
                message: "¿Deseas ir a la compra ahora?",
                onPress: () => {
                    SNavigation.navigate("/venta/profile2", { pk: compraResp?.data?.key_compra_venta });
                }
            });
            MDL.caja.dispatchEvent({ type: "onDetalleChange" });
        } catch (error: any) {
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                key: "compra_rapida",
                title: "Error al realizar la compra",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }
    render() {

        return <SView col={"xs-12"} height>
            < SHr />
            <SText center color={STheme.color.lightGray} bold>{"Confirmar la compra"}</SText>
            <SView style={{
                padding: 4,
                width: 33, height: 33,
                position: "absolute",
                left: 0,
                top: 0,
            }} onPress={() => {
                SPopup.close("PopupCarritoConfirmar")
            }}>
                <SIconApp name="Arrow" fill={STheme.color.text} />
            </SView>
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <SView flex>
                <SView padding={8}>
                    <SView row col={"xs-12"}>
                        <SText col={"xs-6"} color={STheme.color.lightGray}>{"Datos del proveedor:"}</SText>
                        <SView col={"xs-6"} row style={{ alignItems: "flex-end", justifyContent: "flex-end", alignContent: "flex-start" }}>
                            <SInput
                                height={30}
                                style={{
                                    marginTop: 0
                                }}
                                label={"Con factura"}
                                type="checkBox"
                                labelStyle={{ left: 12 }}
                                onChangeText={(val) => {
                                    this.setState({ factura: val })
                                    this.forceUpdate();
                                }}
                            />
                        </SView>
                    </SView>
                    <SHr />
                    <SView row>
                        <SelectorCliente
                            inputStyle={this.state.esCredito ? { borderColor: STheme.color.danger, borderWidth: 1 } : undefined}
                            icon={<SText color={STheme.color.lightGray} bold>{"Proveedor: "}</SText>}
                            placeholder={"Escriba el nombre del proveedor"}
                            onChangeSelect={(cliente) => {
                                if (this.inputNit && cliente) {
                                    if (this.proveedor?.nit !== cliente.nit) {
                                        this.inputNit.setValue(cliente?.nit || "");
                                        this.inputRazonSocial.setValue(cliente?.razon_social || "");
                                    }
                                }
                                this.proveedor = cliente;
                            }}
                        />
                    </SView>
                    {(this.state.factura) ? <>
                        <SHr h={10} />
                        <SView row>
                            <SInput ref={ref => this.inputRazonSocial = ref} icon={<SText color={STheme.color.lightGray} bold>{"Razón Social:"}</SText>} placeholder={"Razón Social"} />
                        </SView>
                        <SHr h={10} />
                        <SView row>
                            <SInput ref={ref => this.inputNit = ref} icon={<SText color={STheme.color.lightGray} bold>{"NIT:"}</SText>} placeholder={"NIT"} />
                        </SView>
                    </> : null}
                </SView>
                <SHr />
                <SView style={{ padding: 10, paddingBottom: 5, paddingTop: 5 }}>
                    <SText color={STheme.color.lightGray}>{"Seleccione el almacen"}</SText>
                    <SelectorAlmacen
                        selectFirst
                        icon={<SText color={STheme.color.lightGray} bold>{"Almacen:"}</SText>}
                        placeholder={"Escriba el nombre del almacen"}
                        filterData={(e) => {
                            if (e.key_sucursal == MDL.caja.activa?.key_sucursal) return true;
                            return false;
                        }}
                        onChangeSelect={e => {
                            this.state.almacen = e;
                        }}
                    />
                </SView>
                <SView style={{ padding: 10, paddingBottom: 5, paddingTop: 5 }}>
                    <SelectorMoneda
                        findInitialSelect={(arr) => {
                            return arr.find(a => a.tipo == "base")
                        }}

                        icon={<SText color={STheme.color.lightGray} bold>{"Moneda:"}</SText>}
                        placeholder={"Moneda"}
                        onChangeSelect={e => {
                            this.state.moneda = e;
                        }}
                    />
                </SView>
                <SHr />
                <SView style={{ padding: 10, paddingBottom: 5, paddingTop: 5 }}>
                    <SText color={STheme.color.lightGray}>{"Descripcion"}</SText>
                    <SInput
                        type="textArea"
                        ref={ref => this.inputDescripcionVenta = ref}
                        placeholder={"Descripción de la venta"}
                        style={{ minHeight: 20, height: 50, borderWidth: 1, borderColor: STheme.color.gray, marginVertical: 4 }}
                    />
                </SView>
                <SHr /></SView>
            <SHr h={1} color={STheme.color.card} />
            <SView col={"xs-12"} row center height={40}>
                <SView padding={8} card onPress={() => {
                    if (this.state.factura) {
                        if ((this.proveedor.razon_social != this.inputRazonSocial?.getValue()) || (this.proveedor.nit != this.inputNit?.getValue())) {
                            this.proveedor.razon_social = this.inputRazonSocial.getValue();
                            this.proveedor.nit = this.inputNit.getValue();
                            MDL.crm.cliente.editar(this.proveedor).then((resp: any) => {
                            }).catch((e: any) => {
                                console.error("Error al guardar el cliente:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el cliente.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            })
                        }
                    }
                    this.handleOnPress();
                }}>
                    <SText>{"Confirmar la compra"}</SText>
                </SView>
                <SView width={5} />
                <SView padding={8} card onPress={() => {
                    if (this.state.factura) {
                        if ((this.proveedor.razon_social != this.inputRazonSocial?.getValue()) || (this.proveedor.nit != this.inputNit?.getValue())) {
                            this.proveedor.razon_social = this.inputRazonSocial.getValue();
                            this.proveedor.nit = this.inputNit.getValue();
                            MDL.crm.cliente.editar(this.proveedor).then((resp: any) => {
                            }).catch((e: any) => {
                                console.error("Error al guardar el cliente:", e);
                                SNotification.send({
                                    title: "Error",
                                    body: "No se pudo guardar el cliente.",
                                    time: 3000,
                                    color: STheme.color.danger,
                                });
                            })
                        }
                    }
                    this.handleOnPress2();
                }}>
                    <SText>{"Confirmar 2"}</SText>
                </SView>
            </SView>
        </SView >
    }
}
