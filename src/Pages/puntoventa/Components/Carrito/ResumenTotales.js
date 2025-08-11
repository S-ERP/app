import React, { Component } from 'react';
import { SView, SText, STheme, SMath } from 'servisofts-component';
import MDL from '../../../../MDL';



export default class ResumenTotales extends Component {
    sucursal = null;

    async componentDidMount() {
        this.sucursal = await MDL.compra_venta.getSucursalSeleccionada();
        this.forceUpdate(); // Refresca para que aparezca la sucursal
    }

    render() {
        const sucursal = this.sucursal;
        const { subtotal, totalImpuesto, numeroIva, totalDescuento } = this.props;

        return (
            <SView
                col={"xs-12"}
                border={STheme.color.card}
                style={{ borderRadius: 2, padding: 14 }}
                height={110}
            >
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.darkGray}>Subtotal:</SText>
                    <SText fontSize={13} bold color={STheme.color.darkGray}>
                        Bs {SMath.formatMoney(subtotal, 2)}
                    </SText>
                </SView>

                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.darkGray}>
                        IVA ({numeroIva}%)
                    </SText>
                    <SText fontSize={13} color={STheme.color.darkGray}>
                        + Bs {SMath.formatMoney(totalImpuesto, 2)}
                    </SText>
                </SView>

                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.darkGray}>Descuento:</SText>
                    <SText fontSize={13} color={STheme.color.darkGray}>
                        - Bs {SMath.formatMoney(totalDescuento || 0, 2)}
                    </SText>
                </SView>

                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.darkGray}>Total:</SText>
                    <SText fontSize={13} bold color={STheme.color.darkGray}>
                        Bs {SMath.formatMoney((subtotal - totalDescuento), 2)}
                    </SText>
                </SView>

                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.darkGray}>Sucursal:</SText>
                    <SText fontSize={13} bold color={STheme.color.darkGray}>
                        {sucursal?.descripcion || "No seleccionada"}
                    </SText>
                </SView>
            </SView>
        );
    }
}
