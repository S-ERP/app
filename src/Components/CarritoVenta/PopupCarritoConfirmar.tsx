import React from "react";
import { SHr, SImage, SInput, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import { FlatList } from "react-native";
import SelectorAlmacen from "../Selectores/SelectorAlmacen";
import SelectTipoPago from "../../Pages/caja2/components/SelectTipoPago";
import SelectorMoneda from "../Selectores/SelectorMoneda";
import SelectorCliente from "../Selectores/SelectorCliente";
import { cli } from "webpack";

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
                maxHeight: "100%",
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: STheme.color.card,
                // @ts-ignore
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
    state: { almacen: any, moneda: any, factura: boolean, razon_social: string, nit: string } = {
        almacen: null,
        moneda: null,
        factura: false,
        razon_social: "",
        nit: ""
    }

    componentDidMount(): void {

    }

    handleOnPress = async () => {
        try {
            // const monedas = await MDL.empresa.getMonedas();
            // const moneda = monedas.find((m: any) => m.tipo == "base");
            // const key_moneda = "2f6b73df-8004-41c1-aa5f-1a81d79d1a8f"
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
                montoMaximo: MDL.carrito.carrito_venta.monto_total,
                key_moneda: key_moneda,
                onSelect: (tipos_pago: any) => this.handleSubmit(tipos_pago, key_moneda),
                solo_para_caja: false,

            });
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
                    "moneda": key_moneda
                }
            })
            const data = {
                "descripcion": "Venta De Prueba Ricky",
                "observacion": "Observacion de la venta de prueba ricky",
                "key_cliente": this.proveedor?.key,
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
            MDL.carrito.limpiarCarritoCompras();
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
        // const items = MDL.carrito.carrito_compra.items;
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
                        <SHr />
                    </SView>

                    <SView row>
                        <SelectorCliente
                            ref={ref => this.inputCliente = ref}
                            icon={<SText color={STheme.color.lightGray} bold>{"Cliente:"}</SText>}
                            onChangeSelect={(cliente) => {
                                console.log("✅ Cliente seleccionado:", cliente);
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
                            <SInput icon={<SText color={STheme.color.lightGray} bold>{"# NIT:"}</SText>} placeholder={"Escriba el nit"}
                                ref={ref => this.inputNit = ref}
                                onChangeText={(e) => {
                                    MDL.crm.cliente.buscar_nit(e).then(proveedor => {
                                        this.proveedor = proveedor;
                                        // if (this.inputNombre) {
                                        //     this.inputNombre.setValue(proveedor.razon_social ?? proveedor.nombres)
                                        // }
                                        if (this.inputCliente) {
                                            this.inputCliente.setSelect(proveedor);
                                        }
                                    }).catch(error => {
                                        console.error(error);
                                    })
                                }}
                                onSubmitEditing={() => {
                                    // if (this.inputNombre) this.inputNombre.focus()
                                }}
                                iconR={<SView
                                    card style={{
                                        width: 40, height: 40
                                    }} onPress={() => {
                                        SNavigation.navigate("/cliente", {
                                            onSelect: (proveedor: any) => {
                                                if (this.inputNombre && proveedor) {
                                                    this.proveedor = proveedor;
                                                    this.inputNombre.setValue(proveedor.razon_social ?? proveedor.nombres)
                                                }
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



                </SView>
                <SHr />
                <SView style={{padding:10, paddingBottom:5, paddingTop:5}}>
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
                            console.log("Entro al onchageselect", e)
                            this.state.almacen = e;
                        }}
                    />

                </SView>
                <SView style={{padding:10, paddingBottom:5, paddingTop:5}}>
                    <SelectorMoneda
                        findInitialSelect={(arr) => {
                            return arr.find(a => a.tipo == "base")
                        }}
                        // defaultValueTypeKey={this.state.moneda?.key}
                        icon={<SText color={STheme.color.lightGray} bold>{"Moneda:"}</SText>}
                        placeholder={"Moneda"}
                        onChangeSelect={e => {
                            console.log("Entro al onchageselect", e)
                            this.state.moneda = e;
                        }}
                    />

                </SView>
                <SHr />
                {/* <SView padding={8}> */}
                {/* <SText color={STheme.color.lightGray}>{"Con Factura?"}</SText> */}
                {/* </SView> */}
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SView col={"xs-12"} row center height={40}>
                <SView padding={8} card onPress={() => {
                    if (this.state.factura) {
                        if ((this.proveedor.razon_social != this.inputRazonSocial?.getValue()) || (this.proveedor.nit != this.inputNit?.getValue())) {
                            this.proveedor.razon_social = this.inputRazonSocial.getValue();
                            this.proveedor.nit = this.inputNit.getValue();
                            console.log("CAMBIOS CLIENTE", this.proveedor)
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
                            console.log("modificar cliente")
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
