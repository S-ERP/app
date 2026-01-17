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
import SelecionarDescuento from "../../Pages/venta/Components/SelecionarDescuento";


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
                // @ts-ignore
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
    descuentoSeleccionado = null;
    state: {
        almacen: any,
        moneda: any,
        factura: boolean,
        razon_social: string,
        nit: string,

        // ✅ nuevos
        clientes: any[],
        key_cliente: string | null,
        cliente_texto: string,
        descuentos: any[]
    } = {
            almacen: null,
            moneda: null,
            factura: false,
            razon_social: "",
            nit: "",

            // ✅ nuevos
            clientes: [],
            key_cliente: null,
            cliente_texto: "",
            descuentos: []
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
                //  this.props.onSelect && this.props.onSelect(descuentos[0]);
                console.log(descuentos)
                this.setState({ descuentos: descuentos })
            })
        } catch (e) {
            console.error("Error cargando clientes", e);
        }
    }

    handleOnPress = async () => {
        try {
            // const monedas = await MDL.empresa.getMonedas();
            // const moneda = monedas.find((m: any) => m.tipo == "base");
            // const key_moneda = "2f6b73df-8004-41c1-aa5f-1a81d79d1a8f"


            // const key_moneda = this.state.moneda.key
            // const almacen = this.state.almacen;
            // if (!almacen) {
            //     throw "Debe seleccionar un almacen"
            // }
            // if (!key_moneda) {
            //     throw "Debe seleccionar una moneda"
            // }
            // let subtotal = MDL.carrito.carrito_venta.monto_total
            // let montoTotal_MN = parseFloat(subtotal.toFixed(2));
            // let porcentajeDescuento = 0;
            // if (this.descuentoSeleccionado) {
            //     if (this.descuentoSeleccionado?.porcentaje) {
            //         console.log(this.descuentoSeleccionado?.porcentaje)
            //         porcentajeDescuento = this.descuentoSeleccionado?.porcentaje;
            //         montoTotal_MN -= Math.round((montoTotal_MN * porcentajeDescuento) * 100) / 100;
            //     }
            // }
            // console.log(montoTotal_MN)
           
             const { montoMaximo, key_moneda, porcentajeDescuento, solo_para_caja, cliente, factura, almacen } = this.props;
            SelectTipoPago.openPopup({
                key_punto_venta: MDL.caja.activa?.key_punto_venta as any,
                // montoMaximo: MDL.carrito.carrito_venta.monto_total,
                montoMaximo: montoMaximo,
                key_moneda: key_moneda,
                onSelect: (tipos_pago: any) => this.handleSubmit(tipos_pago, key_moneda),
                solo_para_caja: solo_para_caja,

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
            const almacen = this.props.almacen;
            // const almacen = this.state.almacen;
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
                    // @
                    "key_modelo_cliente": ci?.key_modelo_cliente
                }
            })
            const data = {
                "descripcion": "Venta De Prueba Ricky",
                "observacion": "Observacion de la venta de prueba ricky",
                "facturar": this.state.factura ? true : false,
                cliente: {
                    nit: this.inputNit?.getValue() || "",
                    razon_social: this.inputRazonSocial?.getValue() || ""
                },
                "key_cliente": this.proveedor?.key,
                "key_usuario": MDL.usuario.session?.key,
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

            console.clear();
            console.log("%c" + JSON.stringify(compraResp, null, 2), "color: #2ECC40; font-weight: bold;");

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
                    console.clear();
                    console.log("%c" + "ingresar_texto", `color: #2ECC40; font-weight: bold;`);
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
        // console.log(this.state.descuentos)
        // const items = MDL.carrito.carrito_compra.items;
        // const { (factura )} = this.props
        console.log("RENDER POPUP RESUMEN", this.props)
        // const { montoMaximo, key_moneda, porcentajeDescuento } = this.props;
        const { montoMaximo, key_moneda, porcentajeDescuento, solo_para_caja, cliente, factura } = this.props;
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
                        </SView>}
                         <SHr h={20} />
                        <SView col={"xs-12"} row >
                            <SText color={STheme.color.lightGray}>Descuento:</SText>
                            <SView width={8} />
                            <SText>{porcentajeDescuento}</SText>
                        </SView>
                         <SHr h={20} />
                        <SView col={"xs-12"} row >
                            <SText color={STheme.color.lightGray}>Monto total:</SText>
                            <SView width={8} />
                            <SText>{montoMaximo}</SText>
                        </SView>



                    </SView>








                </SView>



                <SHr />
                {/* <SView padding={8}> */}
                {/* <SText color={STheme.color.lightGray}>{"Con Factura?"}</SText> */}
                {/* </SView> */}
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SView col={"xs-12"} row center height={40}>
                <SView padding={8} card onPress={() => {
                    


                    // console.clear();
                    // console.log("%c" + JSON.stringify(this.proveedor, null, 2), "color: #2ECC40; font-weight: bold;");
                    this.handleOnPress();
                }}>
                    <SText>{"Confirmar la venta"}</SText>
                </SView>
            </SView>

        </SView >
    }
}