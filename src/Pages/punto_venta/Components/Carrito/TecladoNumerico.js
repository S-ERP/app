// TecladoNumerico.js
import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification } from 'servisofts-component';
import FotoCliente from '../Foto/FotoCliente';
import Model from '../../../../Model';

export default class TecladoNumerico extends Component {
    constructor(props) {
        super(props);

        this.data = props.data;
        this.carrito = props.carrito;
        this.showPaymentModal = false;
        this.amountReceived = 0;
        this.descuentoManual = "";

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

    // import FotoCliente from './FotoCliente'; // Asegúrate de que este componente exista e importe correctamente

    renderPopudPago() {
        const { subtotal, totalConIVA, totalFinal } = this.props;

        const montoRecibido = parseFloat(this.amountReceived || 0);
        // this.amountReceived = "";

        const change = isNaN(montoRecibido) ? 0 : montoRecibido - totalFinal;

        return SPopup.open({
            key: "PopupCrearMoneda",
            content: <SView style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: 500,
                // height: 500,
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
                    <SText fontSize={20} bold center  >  Confirmar Pago    </SText>
                    <SView height={20} />

                    <SView row style={{ justifyContent: "space-between", marginBottom: 12 }}>
                        <SText fontSize={16} color={STheme.color.text}>Total a Pagar:</SText>
                        <SText fontSize={18} bold color={STheme.color.warning}>
                            Bs {SMath.formatMoney(totalFinal, 2)}
                        </SText>
                    </SView>

                    <SView row borderColor={"transparent"} >
                        <SText fontSize={14} color={STheme.color.text}>Monto Recibido:</SText>


                        <SInput
                            // value={this.amountReceived}
                            onChangeText={(text) => {
                                this.amountReceived = text;
                                this.forceUpdate();
                            }}
                            type='number'
                            // keyboardType="numeric"
                            placeholder="Ej. 100.00"
                            style={{
                                height: 48,
                                fontSize: 20,
                                textAlign: "center",
                                borderWidth: 1,
                                borderColor: STheme.color.card,
                                borderRadius: 4,
                                marginTop: 8,
                                color: STheme.color.text,
                                backgroundColor: "transparent"
                            }}
                        />
                    </SView>
                    <SView height={20} />


                    <SView row style={{ justifyContent: "space-between", marginBottom: 40 }}>
                        <SText fontSize={16} color={STheme.color.text}>Cambio:</SText>
                        <SText fontSize={18} bold

                            color={change >= 0 ? STheme.color.success : STheme.color.danger}

                        >
                            Bs {SMath.formatMoney(change, 2)}
                        </SText>
                    </SView>

                    <SView row style={{ justifyContent: "space-around" }}>
                        <SView
                            // width={70}
                            onPress={() => {
                                this.showPaymentModal = false;
                                this.amountReceived = "";
                                this.forceUpdate();
                            }}
                            style={{
                                backgroundColor: STheme.color.lightGray,
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 4,
                                width: 150
                            }}
                        >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SView>



                        <SView

                            border={"red"}
                            style={{
                                backgroundColor: STheme.color.background,
                                borderColor:STheme.color.text,
                                paddingVertical: 12,
                                paddingHorizontal: 24,
                                borderRadius: 4,
                                width: 150
                            }}

                            onPress={() => {

                                const cajero = {
                                    montoRecibido: this.amountReceived

                                };




                                const datos = this.dataFormateada({
                                    caja: cajero,
                                    carrito: this.carrito,
                                    cliente: this.data?.cliente,
                                    vendedor: Model.usuario.Action.getUsuarioLog()
                                });
                                console.log("🧾 Venta Formateada:");
                                console.log(JSON.stringify(datos, null, 2));
                                this.amountReceived = "";
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
        const { nombre_completo, key_cliente, nombres } = cliente;

        const style_text = {
            color: STheme.color.text,
            fontSize: 12,
            fontWeight: "bold",
        };

        const teclas = [
            ["1", "2", "3", "Cant"],
            ["4", "5", "6", "% de desc."],
            ["7", "8", "9", "Precio"],
            ["+/-", "0", ".", "<"]
        ];

        const { subtotal, totalConIVA, totalFinal } = this.props;

        const montoRecibido = parseFloat(this.amountReceived || 0);
        // this.amountReceived = "";

        const change = isNaN(montoRecibido) ? 0 : montoRecibido - totalFinal;

        return (
            <SView col={"xs-12"} row color={STheme.color.danger}>
                <SView col={"xs-4"}>
                    <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
                        <SView row center onPress={() => this.seleccionarCliente()}>
                            <SView center backgroundColor={STheme.color.background} style={{
                                width: 30, height: 30, borderRadius: 18, margin: 4,
                                marginRight: (key_cliente ? 6 : 14), overflow: "hidden",
                            }}>
                                <FotoCliente data={cliente} />
                            </SView>
                            <SView>
                                <SText style={{ ...style_text, fontSize: 12 }}>{nombres || "Cliente"}</SText>
                                {key_cliente ? <SText style={{ ...style_text, fontSize: 12, color: "#26e9aeff" }}>Cliente Vip</SText> : null}
                            </SView>
                        </SView>
                    </SView>

                    <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {

                        // this.renderPaymentModal()
                        // this.showPaymentModal = true; // <-- Cambia flag a true para mostrar popup


                        this.renderPopudPago()

                        // const datos = this.dataFormateada({
                        //     carrito: this.carrito, cliente: this.data?.cliente, vendedor: Model.usuario.Action.getUsuarioLog()
                        // });
                        // console.log("🧾 Venta Formateada:");
                        // console.log(JSON.stringify(datos, null, 2));
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
        return this.renderTecladoNumerico();
    }
}
