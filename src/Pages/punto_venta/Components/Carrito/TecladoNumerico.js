import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread } from 'servisofts-component';
import FotoCliente from '../Foto/FotoCliente';
import Model from '../../../../Model';
import MDL from '../../../../MDL';
import SIconApp from '../../../../Assets/SIconApp';
import PButtom from '../../../../Components/PButtom';
import PButtom3 from '../../../../Components/PButtom3';
import ResumenTotales from './ResumenTotales';
import ConfirmarPago from './ConfirmarPago';
import Galaxia from '../../Galaxia';
import FotoCliente2 from '../Foto/FotoCliente2';
export default class TecladoNumerico extends Component {
    constructor(props) {
        super(props);
        this.data = props.data;
        this.carrito = props.carrito;
        this.carritonuevo = props.carritonuevo;
        this.showPaymentModal = false;
        this._recibido = "";
        this._devolvido = "";
        this.descuentoManual = "";
    }

    componentDidMount() {
        this.inventarioChavalEventos = MDL.punto_venta.addEventListener("alvaroEventos", (e) => {
            this.cargarTabla();
            console.log("alvaroEventos", e);
        })

        setTimeout(() => {
            this.hanldeEditTelefono();
        }, 100);
    }



    handleCalculatorPress = (tecla) => {
        let val = this.descuentoManual || "";
        switch (tecla) {
            case "<": val = val.slice(0, -1); break;
            case "+/-": val = val.startsWith("-") ? val.slice(1) : "-" + val; break;
            case ".": if (!val.includes(".")) val += "."; break;
            case "Cant": case "% de desc.": case "Precio": return;
            default: if (/^\d$/.test(tecla)) val += tecla;
        }
        this.descuentoManual = val;
        this.forceUpdate();
    };
    seleccionarCliente2() {
        SNavigation.navigate("/cliente", {
            onSelect: (obj) => {
                var cliente = {
                    key: obj.key,
                    nombres: obj.nombres ?? "",
                    apellidos: obj.apellidos ?? "",
                    telefono: obj.telefono ?? "",
                    nombre_completo: `${obj.nombres ?? ""} ${obj.apellidos ?? ""}`.trim()
                }
                this.forceUpdate();
            }
        })
    }
    hanldeEditTelefono = () => {
        MDL.crm.cliente.buscar_nit(this.form?.getValues().nit).then(e => {
            this.clienteDataCompleto = e;
            this.form?.setValues({
                razon_social: e?.razon_social || "",
                correo: e?.correo || "",
                nombres: e?.nombres || "",
            })
            this.forceUpdate()
        }).catch(e => {
            this.form?.setValues({
                razon_social: "",
                correo: "",
                nombres: "",
            })
            console.log(e)
        })
    }
    form: SForm | null = null;
    seleccionarCliente() {
        let formRef;
        const defaultData = this.data?.cliente ?? {};
        SPopup.open({
            key: "PopupClienteManual",
            type: 1,
            content: (
                <SView
                    col="xs-11"
                    withoutFeedback
                    padding={24}
                    backgroundColor={STheme.color.background}
                    style={{
                        maxWidth: 320,
                        borderRadius: 12,
                        shadowColor: "#18181b",
                        shadowOffset: { width: 5, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 60,
                    }}
                >
                    <SText fontSize={18} bold center>Datos del Cliente</SText>
                    { }
                    <SForm row ref={(ref: any) => this.form = ref}
                        style={{ justifyContent: "space-between" }}
                        inputs={{
                            nit: {
                                col: "xs-12",
                                label: "Nit",
                                type: 'number',
                                backgroundColor: "red",
                                background: "blue",
                                borderColor: "red",
                                required: true,
                                autoFocus: true,
                                defaultValue: defaultData?.nit,
                                iconR: <SView width={30} height={30} center onPress={() => {
                                    this.hanldeEditTelefono();
                                }}>
                                    <SIconApp name='Search' fill={STheme.color.lightGray} />
                                </SView>,
                                onChangeText: (text: string) => {
                                    new SThread(2000, "buscar_nit", true).start(() => {
                                        this.hanldeEditTelefono();
                                    })
                                },
                                onSubmitEditing: () => {
                                    this.hanldeEditTelefono();
                                    this.form?.focus("razon_social")
                                }
                            },
                            razon_social: {
                                col: "xs-12",
                                disabled: true,
                                label: "razon social",
                                defaultValue: defaultData?.razon_social,
                                onSubmitEditing: () => this.form?.focus("correo"),
                            },
                            correo: {
                                col: "xs-12",
                                label: "Correo",
                                disabled: true,
                                defaultValue: defaultData?.correo,
                                onSubmitEditing: () => this.form?.focus("nombres"),
                            },
                            nombres: {
                                col: "xs-12",
                                disabled: true,
                                label: "Nombre completo",
                                defaultValue: defaultData?.nombres,
                            },
                        }} />
                    <SHr />
                    <SView row col={"xs-12"}>
                        <SView flex />
                        <SView center style={{ borderColor: STheme.color.card, borderWidth: 2, borderRadius: 4, width: 90, height: 32 }} >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SView>
                        <SView width={8} />
                        <SView center style={{ backgroundColor: "#18181b", borderColor: STheme.color.gray, borderWidth: 2, borderRadius: 4, width: 90, height: 32 }}
                            onPress={() => {
                                const data = this.clienteDataCompleto;
                                if (!data) return;
                                this.data.cliente = data;
                                this.clienteDataCompleto = null;


                                this.forceUpdate();
                                SPopup.close("PopupClienteManual");
                            }}
                        >
                            <SText color={STheme.color.background}>Aceptar</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    }
    dataFormateada({ carrito = [], cliente = null, caja = null, vendedor = null }) {
        const carritoFormateado = carrito.map(item => ({
            key: item.key,
            descripcion: item.descripcion,
            precio_compra: item.precio_compra ?? 0,
            precio_venta: item.precio_venta ?? 0,
            stock: item.stock ?? 0,
            cantidad: item.cantidad ?? 0,
            key_marca: item.key_marca ?? null,
            marca_descripcion: item.marca?.descripcion ?? null,
            key_tipo_producto: item.key_tipo_producto ?? null,
            tipo_producto: item.tipo_producto?.descripcion ?? null,
        }));
        const clienteFormateado = cliente?.key;
        const vendedorFormateado = vendedor?.key;
        return {
            carrito: carritoFormateado,
            key_cliente: clienteFormateado ?? null,
            key_vendedor: vendedorFormateado ?? null,
            caja: caja,
        };
    }
    dataSinFormateada({ carrito = [], cliente = null, vendedor = null }) {
        return {
            carrito,
            cliente,
            vendedor,
        };
    }
    renderPopudPago() {
        const { subtotal, totalImpuesto, totalDescuento, totalFinal, numeroIva, conFactura } = this.props;
        let monto_recibido_number = parseFloat(this._recibido);
        if (isNaN(monto_recibido_number)) monto_recibido_number = 0;
        if (!this._recibido) this._recibido = "";
        if (!this._devolvido) this._devolvido = 0;



        return SPopup.open({
            key: "PopupPago",
            type: 1,
            content: <SView
                col="xs-11"
                withoutFeedback
                padding={24}
                backgroundColor={STheme.color.background}
                style={{
                    maxWidth: 320,
                    borderRadius: 12,
                    shadowColor: "#18181b",
                    shadowOffset: { width: 5, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 60,
                }}>


                <SText fontSize={18} bold center>Confirmar Pago</SText>
                <SView height={8} />

                <ResumenTotales subtotal={subtotal} totalImpuesto={totalImpuesto} numeroIva={numeroIva} totalDescuento={totalDescuento} totalFinal={totalFinal}  ></ResumenTotales>


                <SView row    >

                    <SInput
                        label={"Monto Recibido:"}
                        defaultValue={this._recibido}
                        onChangeText={(text) => {
                            this._recibido = text;
                            const recibido = parseFloat(text);
                            const total = parseFloat(totalFinal);
                            if (!isNaN(recibido) && !isNaN(total)) {
                                this._devolvido = recibido - total;
                            } else {
                                this._devolvido = 0;
                            }
                            this.forceUpdate();
                        }}
                        border={STheme.color.card}
                        type='number'
                        placeholder="Ej. 100.00"
                        style={{
                            height: 48,
                            fontSize: 18,
                            textAlign: "center",
                            borderRadius: 4,
                            color: STheme.color.text,
                        }}
                    />
                </SView>
                <SView height={20} />
                <SView center row style={{ justifyContent: "space-between", marginBottom: 40 }}>
                    <SText fontSize={16} color={STheme.color.text}>Cambio:</SText>
                    <SText fontSize={18} bold color={totalFinal < this._recibido ? "green" : "red"}    >
                        Bs {SMath.formatMoney(this._devolvido, 2)}
                    </SText>
                </SView>
                <SView center row >

                    <SView center flex style={{ borderColor: STheme.color.card, borderWidth: 2, borderRadius: 4, height: 40 }}
                        onPress={() => {
                            this.showPaymentModal = false;
                            this._recibido = "";
                            this._devolvido = "";
                            this.data.cliente = "";
                            this.props.onReload();
                            this.forceUpdate();
                            SPopup.close("PopupPago");

                        }}
                    >
                        <SText color={STheme.color.text}>Cancelar</SText>
                    </SView>
                    <SView width={8} />


                    <SView center flex style={{ backgroundColor: "#18181b", borderColor: STheme.color.gray, borderWidth: 2, borderRadius: 4, height: 40 }}
                        onPress={() => {


                            if (!this._recibido || parseFloat(this._recibido) < totalFinal) {
                                SNotification.send({
                                    title: "Error",
                                    body: `Monto insuficiente para pagar`,
                                    type: "error",
                                    color: STheme.color.error,
                                    time: 5000,
                                });
                                return;
                            }
                            const carritoFormateado = this.carrito.map(item => ({
                                key: item.key,
                                descripcion: item.descripcion,
                                precio_compra: item.precio_compra ?? 0,
                                precio_venta: item.precio_venta ?? 0,
                                stock: item.stock ?? 0,
                                cantidad: item.cantidad ?? 0,
                                key_marca: item.key_marca ?? null,
                                marca_descripcion: item.marca?.descripcion ?? null,
                                key_tipo_producto: item.key_tipo_producto ?? null,
                                tipo_producto: item.tipo_producto?.descripcion ?? null,
                            }));
                            const datos = this.dataFormateada({
                                caja: {
                                    subtotal: SMath.formatMoney(subtotal, 2),
                                    IVA: SMath.formatMoney(totalImpuesto, 2),
                                    Descuento: SMath.formatMoney(totalDescuento, 2),
                                    totalFinal: SMath.formatMoney(totalFinal, 2),
                                    montoRecibido: SMath.formatMoney(this._recibido, 2),
                                    cambio: SMath.formatMoney((this._recibido - totalFinal), 2),
                                    conFactura: conFactura ? "si" : "no",
                                },

                                carrito: this.props.carrito,
                                cliente: this.data.cliente,
                                // cliente: this.props.data ? this.props.data?.cliente : this.data.cliente,
                                // cliente: this.data?.cliente,
                                vendedor: Model.usuario.Action.getUsuarioLog()
                            });


                            console.log("🧾 Venta Formateada:");
                            console.log(JSON.stringify(datos, null, 2));


                            this.showPaymentModal = false;
                            this._recibido = "";
                            this._devolvido = "";
                            this.data.cliente = "";
                            this.props.onReload();
                            this.forceUpdate();
                            SPopup.close("PopupPago");



                        }}
                    >
                        <SText color={STheme.color.background}>Confirmar Pago</SText>
                    </SView>



                </SView>

            </SView>
        })
    }

    renderTecladoNumerico = () => {
        const cliente = this.data.cliente ?? {};
        const { key, nombres, apellidos, telefono, nombre_completo } = cliente;
        const style_text = {
            color: STheme.color.text,
            fontSize: 12,
            fontWeight: "bold",
        };
        const teclas = [
            ["1", "2", "3", "Cant"],
            ["4", "5", "6", "% desc."],
            ["7", "8", "9", "Precio"],
            ["+/-", "0", ".", "<"]
        ];
        return (
            <>
                <SView col={"xs-0 sm-12"} row color={STheme.color.danger}>
                    <SView col={"xs-4"}>
                        onReload={() => { this.vaciarCarrito(); }}


                        <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
                            <FotoCliente2 onReload2={(cliente) => {

                                this.data.cliente = cliente;
                                this.forceUpdate();

                                console.log("mira " + JSON.stringify(cliente))
                            }}  ></FotoCliente2>
                            {/* <SView col={"xs-12 md-12"} row center onPress={() => this.seleccionarCliente()}>
                                <SView col={"xs-5 md-5"}    >
                                    <SView center backgroundColor={STheme.color.background} style={{
                                        minWidth: 10, width: 30, minHeight: 10, height: 30, borderRadius: 18, margin: 4,
                                        marginRight: (key ? 6 : 14), overflow: "hidden",
                                    }}>
                                        <FotoCliente data={cliente} />
                                    </SView>
                                </SView>
                                <SView flex  >
                                    <SText style={{ ...style_text, fontSize: 12 }}>{nombres || "Cliente"}</SText>
                                    {key ? <SText style={{ ...style_text, fontSize: 12, color: "#26e9aeff" }}>Cliente</SText> : null}
                                </SView>
                            </SView> */}
                        </SView>


                        <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {
                            this.renderPopudPago()

                            // <ConfirmarPago />
                        }}>
                            <SText style={{ ...style_text, textTransform: 'uppercase' }}>Pagaraaaa</SText>
                        </SView>
                    </SView>
                    <SView col={"xs-8"}>
                        {teclas.map((fila, i) => (
                            <SView key={i} row>
                                {fila.map((t, j) => (
                                    <SView key={j} flex center backgroundColor={STheme.color.darkGray} border={STheme.color.card}
                                        style={{ height: 44, borderRadius: 2, margin: 2 }}
                                        onPress={() => this.handleCalculatorPress(t)} >
                                        <SText style={style_text}>{t}</SText>
                                    </SView>
                                ))}
                            </SView>
                        ))}
                    </SView>
                </SView>
                {this.props.subtotal ? <SView col={"xs-12 md-0"} height={42} center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {
                    this.renderPopudPago()
                    // < ConfirmarPago ></ConfirmarPago >

                }}>
                    <SText style={{ ...style_text, textTransform: 'uppercase' }}>Procesar Pagosss</SText>
                </SView>
                    : null}
            </>
        );
    };
    render() {
        return <>
            { }
            {this.renderTecladoNumerico()}
            { }
        </>
    }
}
