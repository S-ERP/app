import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread, SIcon } from 'servisofts-component';
import Model from '../../../../Model';
import ResumenTotales from './ResumenTotales';
import PopupConfirmaPago from './PopupConfirmaPago';
import FotoCliente from '../Foto/FotoCliente';
import SelectTipoPago from '../../../caja2/components/SelectTipoPago';
import MDL from '../../../../MDL';
import ReciboRollo from '../../../../Components/PDF/venta/ReciboRollo';
import ReciboCarta from '../../../../Components/PDF/venta/ReciboCarta';
import PopupCarritoFlotante from './PopupCarritoFlotante';
import Carrito from '../Carrito';
import Main from '../../Main';



// import React, { Component } from 'react';
// import { SView, SText, STheme, SNavigation, SMath, SInput, SNotification, SHr, SIcon } from 'servisofts-component';
// import Model from '../../../../Model';
// import ResumenTotales from './ResumenTotales';
// import PopupConfirmaPago from './PopupConfirmaPago';
// import FotoCliente from '../Foto/FotoCliente';
// import SelectTipoPago from '../../../caja2/components/SelectTipoPago';
// import MDL from '../../../../MDL';
// import ReciboRollo from '../../../../Components/PDF/venta/ReciboRollo';
// import ReciboCarta from '../../../../Components/PDF/venta/ReciboCarta';
// import PopupCarritoFlotante from './PopupCarritoFlotante';

export default class TecladoNumerico extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    renderButton(totalFinal, subtotal, subtotalMoneda, descuento, conFactura, carrito) {
        if (!this.tipos_pago) {
            SNotification.send({
                title: "Error",
                body: "No hay tipo de pago seleccionado",
                type: "error",
                color: STheme.color.error,
                time: 5000,
            });
            return;
        }

        const recibi = 0;
        // if (recibi < totalFinal) {
        //     SNotification.send({
        //         title: "Error",
        //         body: "El monto recibido es insuficiente para cubrir el total",
        //         type: "error",
        //         color: STheme.color.error,
        //         time: 5000,
        //     });
        //     return;
        // }

        const key_sucursal = this.props?.key_sucursal;
        const key_cliente = this.cliente?.key;
        const cliente = this.cliente;
        const key_cajero = this.props?.key_cajero;
        console.log(carrito);
        const detalle = carrito.map(item => ({
            key_modelo: item.key,
            descripcion: item.descripcion,
            precio_unitario: MDL.contabilidad.round(item.precio_venta_moneda), // Usar precio en moneda seleccionada
            precio_unitario_base: item.precio_venta, // Usar precio en moneda seleccionada
            cantidad: item.cantidad ?? 0,
        }));
        const caja = {
            subtotal: SMath.formatMoney(subtotalMoneda, 2),
            iva: SMath.formatMoney(this.props.totalImpuesto, 2), // Corregido: Usar totalImpuesto
            descuento: SMath.formatMoney(descuento || 0, 2),
            monto_total: SMath.formatMoney(totalFinal, 2), // Usar totalFinal directamente
            montoRecibido: SMath.formatMoney(recibi, 2),
            cambio: SMath.formatMoney(recibi - totalFinal, 2),
            conFactura: conFactura ? true : false,
            tipos_pago: this.tipos_pago,
            monto_factura: conFactura ? SMath.formatMoney(totalFinal, 2) : SMath.formatMoney(0, 2),
            monedaSymbol: this.props.monedaSymbol || 'Bs', // Incluir el símbolo de la moneda
        };
        let descuentos = null;
        if(this.props.descuentoSeleccionado){
            descuentos = [this.props.descuentoSeleccionado];
        }
        const datos = {
            key_sucursal,
            detalle,
            key_cliente,
            cliente,
            key_moneda: this.props?.moneda?.key,
            key_cajero,
            caja,
            descuentos: descuentos

        };

        SNotification.send({
            key: "compra",
            title: "Procesando pago...",
            type: "loading",
        });
        MDL.compra_venta.registrar(datos).then((res) => {
            ReciboCarta.imprimir(res.key);
            this.tipos_pago = null;
            SNotification.remove("compra");
            this.props?.onReload?.();
            this.props?.onReloadCliente?.();
            this.forceUpdate();
            SNavigation.navigate("/caja2");
        }).catch(res => {
            this.tipos_pago = null;
            this.forceUpdate();
            SNotification.send({
                key: "compra",
                title: "Error",
                body: res.error || "Error al procesar el pago",
                type: "error",
                color: STheme.color.error,
                time: 5000,
            });
        });
    }

    handleCalculatorPress(valor) {
        console.log("Presionó: " + valor);
    }

    renderTecladoNumerico = () => {
        const { subtotal, subtotalMoneda, descuento, totalImpuesto, totalFinal, numeroIva, conFactura, monedaSymbol, carrito, moneda } = this.props;
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
                <SView col={"xs-0 md-12"} row  >
                    <SView col={"xs-4"}>
                        <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 40, borderRadius: 8, margin: 2 }}>
                            <FotoCliente onReloadCliente={(cliente) => {
                                this.cliente = cliente;
                            }} />
                        </SView>
                        <SView center flex backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 8, margin: 2 }} onPress={() => {


                            if (!this.tipos_pago) {
                                const key_punto_venta = MDL.caja.activa.key_punto_venta;
                                const monedaSymbol = this.props.monedaSymbol || 'Bs';

                                let montoTotal_MN = parseFloat(subtotal.toFixed(2));
                                let montoTotal_ME = parseFloat(subtotalMoneda.toFixed(2));
                                console.log("abrir popup WEB 🎭🎭🎭🎭🎭🎭🎭🎭🎭");
                                console.log("key_punto_venta", key_punto_venta);
                                console.log("montoTotal_MN", montoTotal_MN);
                                console.log("montoTotal_ME", montoTotal_ME);
                                console.log("monedaSymbol", monedaSymbol);
                                let porcentajeDescuento = 0;
                                if (this.props.descuentoSeleccionado) {
                                    if (this.props.descuentoSeleccionado.porcentaje) {
                                        porcentajeDescuento = this.props.descuentoSeleccionado.porcentaje;
                                        montoTotal_MN -= (montoTotal_MN * porcentajeDescuento);
                                        montoTotal_ME -= (montoTotal_ME * porcentajeDescuento);
                                    }
                                }

                                SelectTipoPago.openPopup({
                                    key_punto_venta: key_punto_venta,
                                    key_moneda: moneda?.key,
                                    montoMaximo: montoTotal_MN, // Usar totalFinal
                                    monedaSymbol: monedaSymbol,
                                    onSelect: (item) => {
                                        this.tipos_pago = item;
                                        this.forceUpdate();
                                        this.renderButton(totalFinal, subtotalMoneda, subtotal, descuento, conFactura, carrito);
                                        SelectTipoPago.closePopup();
                                    },
                                });
                            }
                        }}>
                            <SIcon name="iconRight" width={50} height={50} fill={STheme.color.background} />
                            <SHr height={5} />
                            <SText style={{ ...style_text, textTransform: 'uppercase' }}>Pagar</SText>
                        </SView>
                    </SView>
                    <SView col={"xs-8"}>
                        {teclas.map((fila, i) => (
                            <SView key={i} row>
                                {fila.map((t, j) => (
                                    <SView key={j} flex center backgroundColor={STheme.color.darkGray} border={STheme.color.card}
                                        style={{
                                            height: 40,
                                            borderRadius: 8,
                                            overflow: "hidden",
                                            margin: 2,
                                        }}
                                        onPress={() => this.handleCalculatorPress(t)}
                                    >
                                        <SText style={style_text}>{t}</SText>
                                    </SView>
                                ))}
                            </SView>
                        ))}
                    </SView>
                </SView>
                {subtotal ? (
                    <SView col={"xs-12 md-0"} height={42} center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ borderRadius: 2, margin: 2 }} onPress={() => {

                        if (!this.tipos_pago) {




                            if (!this.tipos_pago) {
                                const key_punto_venta = MDL.caja.activa.key_punto_venta;
                                const monedaSymbol = this.props.monedaSymbol || 'Bs';

                                const montoTotal_MN = parseFloat(subtotal.toFixed(2));
                                const montoTotal_ME = parseFloat(subtotalMoneda.toFixed(2));
                                console.log("abrir popup WEB 🎭🎭🎭🎭🎭🎭🎭🎭🎭", this.props.descuentoSeleccionado);
                                console.log("key_punto_venta", key_punto_venta);
                                console.log("montoTotal_MN", montoTotal_MN);
                                console.log("montoTotal_ME", montoTotal_ME);
                                console.log("monedaSymbol", monedaSymbol);

                                SelectTipoPago.openPopup({
                                    key_punto_venta: key_punto_venta,
                                    key_moneda: moneda?.key,
                                    montoMaximo: montoTotal_MN, // Usar totalFinal
                                    monedaSymbol: monedaSymbol,
                                    onSelect: (item) => {
                                        this.tipos_pago = item;
                                        this.forceUpdate();
                                        this.renderButton(totalFinal, subtotalMoneda, subtotal, descuento, conFactura, carrito);
                                        SelectTipoPago.closePopup();
                                    },
                                });
                            }
                        }
                    }}>
                        <SText style={{ ...style_text, textTransform: 'uppercase' }}>Procesar Pago</SText>
                    </SView>
                ) : null}
            </>
        );
    };

    render() {
        return this.renderTecladoNumerico();
    }
}