import React, { Component } from 'react';
import { SView, SText, STheme, SMath, SHr } from 'servisofts-component';
export default class ResumenTotales extends Component {
    render() {
        const { moneda, subtotal,subtotalMoneda, totalImpuesto, numeroIva, totalDescuento } = this.props;
        /**
         * Componente para mostrar un resumen de totales con subtotal, impuestos, descuentos y total.
         * @param {Object} props - Propiedades del componente.
         * @param {string} [props.monedaSymbol='Bs'] - Símbolo de la moneda a mostrar.
         * @param {number} props.subtotal - Valor del subtotal.
         * @param {number} props.totalImpuesto - Valor total de impuestos.
         * @param {number} props.numeroIva - Porcentaje de IVA aplicado.
         * @param {number} [props.totalDescuento=0] - Valor total del descuento.
         */
        return (
            <SView
                col={"xs-12"}
                border={STheme.color.card}
                style={{ borderRadius: 8, padding: 8, backgroundColor: STheme.color.card }}
                height={100} >
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.text}>Subtotal:</SText>
                    <SText fontSize={13} bold color={STheme.color.text}>
                        {/* {moneda?.observacion} {SMath.formatMoney(subtotal, 2)} */}
                        {moneda?.observacion} {SMath.formatMoney(subtotalMoneda, 2)}
                    </SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.text}>
                        IVA ({numeroIva}%)
                    </SText>
                    <SText fontSize={13} color={STheme.color.text}>
                        + {moneda?.observacion} {SMath.formatMoney(totalImpuesto, 2)}
                    </SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.text}>Descuento:</SText>
                    <SText fontSize={13} color={STheme.color.text}>
                        {moneda?.observacion} {SMath.formatMoney(totalDescuento || 0, 2)}
                    </SText>
                </SView>
                <SHr height={3} />
                <SView col={"xs-12"} style={{ borderColor: STheme.color.gray, borderBottomWidth: 2 }} />
                <SHr height={5} />
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4, padding: 3 }}>
                    <SText fontSize={18} color={STheme.color.text}>Total:</SText>
                    <SText fontSize={18} bold color={STheme.color.text}>
                        {moneda?.observacion} {SMath.formatMoney((subtotal - (totalDescuento || 0)), 2)}
                    </SText>
                </SView>
            </SView>
        );
    }
}
