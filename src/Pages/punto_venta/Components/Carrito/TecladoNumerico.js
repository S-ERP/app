import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread } from 'servisofts-component';
import FotoCliente from '../Foto/FotoCliente';
import Model from '../../../../Model';
import MDL from '../../../../MDL';
import SIconApp from '../../../../Assets/SIconApp';
import PButtom from '../../../../Components/PButtom';
import PButtom3 from '../../../../Components/PButtom3';
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
        setTimeout(() => {
            this.hanldeEditTelefono();
        }, 100); // o usar await, si el form carga datos antes
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

    // seleccionarCliente2() {
    //     SNavigation.navigate("/cliente", {
    //         onSelect: (obj) => {
    //             var cliente = {
    //                 key: obj.key,
    //                 nombres: obj.nombres ?? "",
    //                 apellidos: obj.apellidos ?? "",
    //                 telefono: obj.telefono ?? "",
    //                 nombre_completo: `${obj.nombres ?? ""} ${obj.apellidos ?? ""}`.trim()
    //             }
    //             this.data.cliente = cliente;
    //             this.forceUpdate();
    //         }
    //     })
    // }
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
        // const { defaultData } = this.props;

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
                    {}

                    <SForm row ref={(ref: any) => this.form = ref}
                        style={{ justifyContent: "space-between" }}
                        inputs={{
                            nit: {
                                col: "xs-12",
                                label: "Nit",
                                type: 'number',
                                backgroundColor: "red",
                                background: "blue",
                                borderColor:"red",
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
                                disabled:true,
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

                    {}

                    {/* <SView row center>
                        <SView
                            style={{
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                backgroundColor: STheme.color.gray,
                                borderRadius: 6,
                                marginRight: 12,
                            }}
                            onPress={() => {
                                SPopup.close("PopupClienteManual");
                            }}
                        >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SView>

                        <SView
                            style={{
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                backgroundColor: STheme.color.success,
                                borderRadius: 6,
                            }}
                            onPress={() => {
                                const data = this.clienteDataCompleto;
                                // const data = this.form?.getValues();
                                if (!data) return;

                                const cliente = {
                                    key: data.key ?? "",
                                    nombres: data.nombres ?? "",
                                    telefono: data.telefono ?? "",
                                    correo: data.correo ?? "",
                                    nit: data.nit ?? "",
                                    razon_social: data.razon_social ?? "",
                                };

                                // this.data.cliente = cliente;
                                this.data.cliente = this.clienteDataCompleto;
                                console.log("indstal " + JSON.stringify(cliente))
                                this.forceUpdate();
                                SPopup.close("PopupClienteManual");
                            }}
                        >
                            <SText color={STheme.color.text}>Guardar</SText>
                        </SView>
                    </SView> */}
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

        const clienteFormateado = cliente;
        // const clienteFormateado = cliente ? {
        //     key: cliente.key ?? null,
        //     nombre_completo: cliente.nombre_completo ?? `${cliente.nombres ?? ""} ${cliente.apellidos ?? ""}`.trim(),
        //     telefono: cliente.telefono ?? null,
        // } : null;
        const vendedorFormateado = vendedor;

        // const vendedorFormateado = vendedor ? {
        //     key: vendedor.key ?? null,
        //     nombre_completo: `${vendedor.Nombres ?? ""} ${vendedor.Apellidos ?? ""}`.trim(),
        //     correo: vendedor.Correo ?? null,
        //     telefono: vendedor.Telefono ?? null,
        // } : null;
        return {
            carrito: carritoFormateado,
            cliente: clienteFormateado,
            vendedor: vendedorFormateado,
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
        const { subtotal, totalImpuesto, totalDescuento, totalFinal, conFactura } = this.props;
        let monto_recibido_number = parseFloat(this._recibido);
        if (isNaN(monto_recibido_number)) monto_recibido_number = 0;
        if (!this._recibido) this._recibido = "";
        if (!this._devolvido) this._devolvido = 0;
        return SPopup.open({
            key: "PopupCrearMoneda",
            type: 2,
            content: <SView style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <SView
                    width={400}
                    height={320}
                    backgroundColor={STheme.color.background}
                    style={{
                        borderRadius: 12,
                        padding: 24,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 6,
                    }}
                >
                    <SText fontSize={20} bold center>Confirmar Pago</SText>
                    <SView height={20} />
                    <SView row style={{ justifyContent: "space-between", marginBottom: 12 }}>
                        <SText fontSize={16} color={STheme.color.text}>Total a Pagar:</SText>
                        <SText fontSize={18} bold color={STheme.color.warning}>
                            Bs {SMath.formatMoney(totalFinal, 2)}
                        </SText>
                    </SView>
                    <SView row    >
                        <SText fontSize={18} color={STheme.color.text}>Monto Recibido:</SText>
                        <SInput
                            ref={(ref) => (this._olvidado = ref)}
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
                                backgroundColor: "transparent"
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
                        <SView center style={{ backgroundColor: STheme.color.gray, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 4, width: 150 }}
                            onPress={() => {
                                this.showPaymentModal = false;
                                this._recibido = "";
                                this.forceUpdate();
                            }}
                        >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SView>
                        <SView flex />
                        <SView center border={STheme.color.text} style={{ backgroundColor: STheme.color.background, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 4, width: 150 }}
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

                                // console.log("pinta " + JSON.stringify(this.props.carrito))
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
                                    cliente: this.data?.cliente,
                                    vendedor: Model.usuario.Action.getUsuarioLog()
                                });
                                console.log("🧾 Venta Formateada:");
                                console.log(JSON.stringify(datos, null, 2));
                                this.showPaymentModal = false;
                                this._recibido = "";
                                this.props.onReload();
                                this.forceUpdate();
                                SPopup.close("PopupCrearMoneda");
                            }}
                        >
                            <SText color={STheme.color.text}>Confirmar Pago</SText>
                        </SView>
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
                        <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
                            <SView col={"xs-12 md-12"} row center onPress={() => this.seleccionarCliente()}>
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
                            </SView>
                        </SView>
                        <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {
                            this.renderPopudPago()
                        }}>
                            <SText style={{ ...style_text, textTransform: 'uppercase' }}>Pagar</SText>
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
                }}>
                    <SText style={{ ...style_text, textTransform: 'uppercase' }}>Procesar Pago</SText>
                </SView>
                    : null}
            </>
        );
    };
    render() {

        return <>
            {}
            {this.renderTecladoNumerico()}
            { }
        </>
    }
}
