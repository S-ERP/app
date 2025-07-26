import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification } from 'servisofts-component';
import FotoCliente from '../Foto/FotoCliente';
import Model from '../../../../Model';
import MDL from '../../../../MDL';

export default class TecladoNumerico extends Component {
    constructor(props) {
        super(props);
        this.data = props.data;
        this.carrito = props.carrito;
        this.showPaymentModal = false;
        this._recibido = "";
        this._devolvido = "";
        this.descuentoManual = "";
    }


    componentDidMount() {

        this.alvaroEventos = MDL.punto_venta.addEventListener("alvaroEventos", (e) => {
            console.log("alvaroEventos", e);
        })
    }

    componentWillUnmount() {
        MDL.punto_venta.removeEventListener(this.alvaroEventos)
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

    seleccionarCliente() {
        SNavigation.navigate("/cliente", {
            onSelect: (obj) => {
                var cliente = {
                    key: obj.key,
                    nombres: obj.nombres ?? "",
                    apellidos: obj.apellidos ?? "",
                    telefono: obj.telefono ?? "",
                    nombre_completo: `${obj.nombres ?? ""} ${obj.apellidos ?? ""}`.trim()
                }
                this.data.cliente = cliente;
                this.forceUpdate();
            }
        })
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

        const clienteFormateado = cliente ? {
            key: cliente.key ?? null,
            nombre_completo: cliente.nombre_completo ?? `${cliente.nombres ?? ""} ${cliente.apellidos ?? ""}`.trim(),
            telefono: cliente.telefono ?? null,
        } : null;

        const vendedorFormateado = vendedor ? {
            key: vendedor.key ?? null,
            nombre_completo: `${vendedor.Nombres ?? ""} ${vendedor.Apellidos ?? ""}`.trim(),
            correo: vendedor.Correo ?? null,
            telefono: vendedor.Telefono ?? null,
        } : null;

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

    // updateCambio() {
    //     return <SView center row style={{ justifyContent: "space-between", marginBottom: 40 }}>
    //         <SText fontSize={16} color={STheme.color.text}>Cambio:</SText>
    //         <SText fontSize={18} bold color={this.props.totalFinal < this._recibido ? "green" : "red"}    >
    //             Bs {SMath.formatMoney(this._devolvido, 2)}
    //         </SText>
    //     </SView>
    // }

    renderPopudPago() {
        const { subtotal, totalConIVA, totalFinal } = this.props;
        let monto_recibido_number = parseFloat(this._recibido);
        if (isNaN(monto_recibido_number)) monto_recibido_number = 0;
        this._devolvido = monto_recibido_number - parseFloat(totalFinal);

        return SPopup.open({
            key: "PopupCrearMoneda",
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
                            defaultValue={this._recibido}
                            onChangeText={(text) => {
                                this._recibido = text;
                                console.log("nada " + this._recibido)
                                // this.updateCambio();
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

                    {/* {this.updateCambio()} */}

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
                                if (!this.data?.cliente) {
                                    SNotification.send({
                                        title: "Error",
                                        body: "Debe seleccionar un cliente",
                                        type: "error",
                                        color: STheme.color.error,
                                        time: 5000,
                                    });
                                    return;
                                }

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

                                const datos = this.dataFormateada({
                                    caja: {
                                        subtotal: SMath.formatMoney(subtotal, 2),
                                        totalConIVA: SMath.formatMoney(totalConIVA, 2),
                                        totalFinal: SMath.formatMoney(totalFinal, 2),
                                        montoRecibido: SMath.formatMoney(this._recibido, 2),
                                        cambio: SMath.formatMoney(this._devolvido, 2)
                                    },
                                    carrito: this.carrito,
                                    cliente: this.data?.cliente,
                                    vendedor: Model.usuario.Action.getUsuarioLog()
                                });

                                console.log("🧾 Venta Formateada:");
                                console.log(JSON.stringify(datos, null, 2));

                                this.showPaymentModal = false;
                                this._recibido = "";
                                this.forceUpdate();
                                SPopup.close("PopupCrearMoneda");
                            }}
                        >
                            <SText color={STheme.color.white}>Confirmar Pago</SText>
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
            <SView col={"xs-12"} row color={STheme.color.danger}>
                <SView col={"xs-4"}>
                    <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
                        <SView col={"xs-12 md-12"} backgroundColor="transparent" row center onPress={() => this.seleccionarCliente()}>
                            <SView col={"xs-5 md-5"} backgroundColor="transparent"   >
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
        );
    };

    render() {
        return <>
            {this.renderTecladoNumerico()}
            {/* {this.renderPopudPago()} */}
        </>
    }
}
