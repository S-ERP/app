import React from "react";
import { SHr, SImage, SInput, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
import SelectTipoPago from "../../Pages/caja2/components/SelectTipoPago";
import SelectorMoneda from "../Selectores/SelectorMoneda";
import PopupCarritoConfirmarResumen from "./PopupCarritoConfirmarResumen";
type PopupCarritoConfirmarProps = {
    tipoCostosSeleccionados:any
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
                maxHeight: "100%",
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
    inputCliente = null;
    descuentoSeleccionado = null;
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
        }
    async componentDidMount() {
        try {
            const clientes = await MDL.crm.cliente.getAll(); // tu método de listar
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
        } catch (e) {
            console.error("Error cargando clientes", e);
        }
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
            let subtotal = MDL.carrito.carrito_venta.monto_total
            let montoTotal_MN = parseFloat(subtotal.toFixed(2));
            let porcentajeDescuento = 0;
            let descuentos = [];
            if (this.descuentoSeleccionado) {
                if (this.descuentoSeleccionado?.porcentaje) {
                    porcentajeDescuento = this.descuentoSeleccionado?.porcentaje;
                    montoTotal_MN -= Math.round((montoTotal_MN * porcentajeDescuento) * 100) / 100;
                }
                descuentos = [this.descuentoSeleccionado];
            }
            const descripcionVenta = this.inputDescripcionVenta?.getValue?.() || "";

            PopupCarritoConfirmarResumen.open({
                subtotal: subtotal,
                montoMaximo: montoTotal_MN,
                key_moneda: key_moneda,
                porcentajeDescuento: porcentajeDescuento,
                descuentoSeleccionado: descuentos,
                solo_para_caja: false,
                cliente: this.proveedor,
                factura: this.state.factura,
                moneda: this.state.moneda,
                almacen: almacen,
                descripcion: descripcionVenta, // 👈 AQUI
            })
        } catch (error: any) {
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                key: "venta_rapida",
                title: "Error al realizar la compra",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }
    handleSubmit = async (tipos_pago: any, key_moneda: string) => {
        try {
            const almacen = this.state.almacen;
            if (!almacen) {
                throw "Debe seleccionar un almacen"
            }
            const detalle = MDL.carrito.carrito_venta.items.map((ci) => {
                return {
                    "cantidad": ci.cantidad,
                    "precio_unitario": ci.precio,
                    "precio_unitario_base": ci.precio,
                    "detalle": "",
                    "descuento": 0,
                    "descripcion": ci.modelo.descripcion,
                    "key_modelo": ci.modelo.key,
                    "moneda": key_moneda,
                    "key_modelo_cliente": ci?.key_modelo_cliente
                }
            })
            const data = {
                "descripcion": "Venta De Prueba Ricky",
                "observacion": "Observacion de la venta de prueba ricky",
                "facturar": this.state.factura ? true : false,
                cliente: { nit: this.inputNit?.getValue() || "", razon_social: this.inputRazonSocial?.getValue() || "" },
                "descripcion2": this.inputDescripcionVenta?.getValue() || "",
                "key_cliente": this.proveedor?.key,
                "key_usuario": MDL.usuario.session?.key,
                "facturar_luego": false,
                "key_caja": MDL.caja.activa?.key,
                "key_almacen": almacen.key,
                "key_moneda": key_moneda,
                "detalle": detalle,
                tipos_pago: tipos_pago,
            }
            console.clear();
            console.log("%c" + data, `color: #2ECC40; font-weight: bold;`);
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
                title: "Error al realizar la venta",
                body: error?.error || JSON.stringify(error),
                color: STheme.color.danger,
                time: 4000,
            });
        }
    }
    render() {
        return <SView col={"xs-12"} height>
            < SHr />
            <SText center color={STheme.color.lightGray} bold>{"Confirmar la venta"}</SText>
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
            <SHr />
            <SView flex>
                <SView padding={8}>
                    <SView row col={"xs-12"}>
                        <SText col={"xs-6"} color={STheme.color.lightGray}>{"Datos del Cliente:"}</SText>
                        <SView col={"xs-6"} row style={{ alignItems: "flex-end", justifyContent: "flex-end", alignContent: "flex-start" }}>
                            <SInput height={20} style={{ marginTop: 0 }} labelStyle={{ left: 12 }}
                                label={"Con factura"}
                                type="checkBox"
                                onChangeText={(val) => {
                                    this.setState({ factura: val }, () => {
                                        if (val && this.proveedor) {
                                            this.inputRazonSocial?.setValue(this.proveedor.razon_social || "");
                                            this.inputNit?.setValue(this.proveedor.nit || "");
                                        }
                                    });
                                }}
                            />
                        </SView>
                        <SHr />
                    </SView>
                    <SView row>
                        <SInput
                            ref={ref => this.inputCliente = ref}
                            icon={<SText color={STheme.color.lightGray} bold>{"Cliente:"}</SText>}
                            placeholder={"Escriba el nombre del cliente"}
                            height={40}
                            type="select2"
                            options={this.state.clientes.map(c => (c?.razon_social || c?.nombres || "").trim()).filter(a => !!a)}
                            onChangeText={(text) => {
                                const t = (text || "").trim();
                                const encontrado = (this.state.clientes || []).find(c =>
                                    ((c?.razon_social || c?.nombres || "").trim().toLowerCase() === t.toLowerCase())
                                );
                                if (encontrado) {
                                    this.proveedor = encontrado;
                                    this.setState({
                                        key_cliente: encontrado.key,
                                        cliente_texto: t,
                                    });
                                    this.inputRazonSocial?.setValue?.(encontrado?.razon_social || encontrado?.nombres || "");
                                    this.inputNit?.setValue?.(encontrado?.nit || "");
                                } else {
                                    this.proveedor = null;
                                    this.setState({
                                        key_cliente: null,
                                        cliente_texto: t,
                                    });
                                }
                            }}
                            iconR={
                                (!this.state.key_cliente && !!this.state.cliente_texto) ? (
                                    <SView
                                        center
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 6,
                                            backgroundColor: STheme.color.card,
                                        }}
                                        onPress={() => {
                                            const nombre = (this.state.cliente_texto || "").trim();
                                            if (!nombre) return;
                                            MDL.crm.cliente.registrar({
                                                razon_social: nombre,
                                                nombres: nombre,
                                                nit: this.inputNit?.getValue?.() || "",
                                                key_empresa: MDL.empresa.select?.key,
                                            }).then((resp) => {
                                                this.proveedor = resp;
                                                this.setState(prev => ({
                                                    clientes: [...(prev.clientes || []), resp],
                                                    key_cliente: resp.key,
                                                    cliente_texto: (resp?.razon_social || resp?.nombres || nombre),
                                                }), () => {
                                                    this.inputCliente?.setValue?.(resp?.razon_social || resp?.nombres || nombre);
                                                });
                                                this.inputRazonSocial?.setValue?.(resp?.razon_social || resp?.nombres || nombre);
                                                this.inputNit?.setValue?.(resp?.nit || "");
                                                SNotification.send({
                                                    title: "Cliente creado",
                                                    body: "Se registró el cliente correctamente.",
                                                    time: 2500,
                                                    color: STheme.color.success,
                                                });
                                            }).catch((err) => {
                                                console.error("Error al registrar cliente:", err);
                                                SNotification.send({
                                                    title: "Error, no se pudo crear el cliente",
                                                    body: err.error,
                                                    color: STheme.color.error,
                                                    time: 5000,
                                                });
                                            });
                                        }}
                                    >
                                        <SIconApp name="Add" />
                                    </SView>
                                ) : (
                                    <SView
                                        center
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 6,
                                            backgroundColor: STheme.color.card,
                                        }}
                                        onPress={() => {
                                            SNavigation.navigate("/cliente", {
                                                onSelect: (cliente) => {
                                                    this.proveedor = cliente;
                                                    this.setState(prev => ({
                                                        clientes: prev.clientes.some(c => c.key === cliente.key) ? prev.clientes : [...prev.clientes, cliente],
                                                        key_cliente: cliente.key,
                                                        cliente_texto: cliente?.razon_social || cliente?.nombres || "",
                                                    }), () => {
                                                        this.inputCliente?.setValue?.(cliente?.razon_social || cliente?.nombres || "");
                                                    });
                                                    this.inputRazonSocial?.setValue?.(cliente?.razon_social || cliente?.nombres || "");
                                                    this.inputNit?.setValue?.(cliente?.nit || "");
                                                    SNavigation.goBack();
                                                }
                                            });
                                        }}
                                    >
                                        <SIconApp name="Search" />
                                    </SView>
                                )
                            }
                        />
                    </SView>
                    {(this.state.factura) ? <>
                        <SHr h={10} />
                        <SView row>
                            <SInput ref={ref => this.inputRazonSocial = ref} icon={<SText color={STheme.color.lightGray} bold>{"Razón Social:"}</SText>} placeholder={"Razón Social"} />
                        </SView>
                        <SHr h={10} />
                        <SView row>
                            <SInput icon={<SText color={STheme.color.lightGray} bold>{"# NIT:"}</SText>} placeholder={"Escriba el nit"}
                                ref={ref => this.inputNit = ref}
                                onChangeText={(e) => {
                                    MDL.crm.cliente.buscar_nit(e).then(proveedor => {
                                        this.proveedor = proveedor;
                                        if (this.inputCliente) {
                                            this.inputCliente.setSelect(proveedor);
                                            this.inputRazonSocial.setValue(proveedor?.razon_social || "");
                                        }
                                    }).catch(error => {
                                        console.error(error);
                                    })
                                }}
                                onSubmitEditing={() => {
                                }}
                                iconR={<SView
                                    card style={{
                                        width: 40, height: 40
                                    }} onPress={() => {
                                        SNavigation.navigate("/cliente", {
                                            onSelect: (proveedor: any) => {
                                                this.proveedor = proveedor;
                                                if (this.inputCliente) {
                                                    this.inputCliente.setSelect(proveedor);
                                                    this.inputRazonSocial?.setValue(proveedor?.razon_social || "");
                                                    this.inputNit?.setValue(proveedor?.nit || "");
                                                }
                                                this.forceUpdate(); // <-- fuerza el re-render para que los cambios se reflejen
                                                SNavigation.goBack();
                                            }
                                        })
                                    }}>
                                    <SIconApp name="Search" />
                                </SView>}
                            />
                        </SView>
                        <SHr h={4} />
                    </> : null}
                    <SHr height={20} />
                    <SView row col={"xs-12"}>
                        <SText col={"xs-12"} color={STheme.color.lightGray}>{"Seleccione si hay descuento:"}</SText>
                        <SView col={"xs-12"} row style={{ alignItems: "flex-end", justifyContent: "flex-end", alignContent: "flex-start" }}>
                            {/* <SelecionarDescuento onSelect={(descuento) => {
if (descuento != this.descuentoSeleccionado) {
this.descuentoSeleccionado = descuento;
this.forceUpdate();
}
}} /> */}
                            <SInput
                                ref={ref => this.inputDescuento = ref}
                                icon={<SText color={STheme.color.lightGray} bold>{"Descuento:"}</SText>}
                                placeholder={"Seleccione descuento"}
                                height={40}
                                type="select2"
                                options={this.state.descuentos.map(c => `${(c?.descripcion || "").trim()} - ${c?.porcentaje ?? 0}%`).filter(a => !!a)}
                                onChangeText={(text) => {
                                    const t = (text || "").trim();
                                    const encontradoD = (this.state.descuentos || []).find(c =>
                                        ((`${(c?.descripcion || "").trim()} - ${c?.porcentaje ?? 0}%`).trim().toLowerCase() === t.toLowerCase())
                                    );
                                    if (encontradoD) {
                                        this.descuentoSeleccionado = encontradoD;
                                    } else {
                                        this.descuentoSeleccionado = null;
                                    }
                                }}
                            />
                        </SView>
                    </SView>
                </SView>
                <SHr />
                <SView style={{ padding: 10, paddingBottom: 5, paddingTop: 5 }}>
                    <SText color={STheme.color.lightGray}>{"Seleccione el almacén"}</SText>
                    <SelectorAlmacen
                        selectFirst
                        icon={<SText color={STheme.color.lightGray} bold>{"Almacén:"}</SText>}
                        placeholder={"Escriba el nombre del almacén"}
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
                        // value={"Alvaro Full stack"}
                        placeholder={"Descripción de la venta"}
                        style={{ minHeight: 20, height: 50, borderWidth: 1, borderColor: STheme.color.gray, marginVertical: 4 }}
                    />
                </SView>

                <SHr />

                <SText>{JSON.stringify(this.props.tipoCostosSeleccionados)}</SText>



            </SView>
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
                    <SText>{"Confirmar la venta"}</SText>
                </SView>
            </SView>
        </SView >
    }
}
