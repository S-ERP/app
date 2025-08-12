import React, { Component } from 'react';
import { SView, SText, STheme, SMath, SNavigation, SPopup } from 'servisofts-component';
import MDL from '../../../../MDL';




export default class ResumenTotales extends Component {
    sucursal = null;

    async componentDidMount() {
        this.sucursal = await MDL.compra_venta.getSucursalSeleccionada();
        this.forceUpdate(); // Forzamos render para mostrar sucursal
    }

    seleccionarSucursal() {
        SPopup.close("popup_config_horario");

        SNavigation.navigate("/sucursal", {
            onSelect: (obj) => {
                const sucu = {
                    descripcion: obj.descripcion,
                    telefono: obj.telefono,
                    correo: obj.correo,
                    direccion: obj.direccion,
                    key_sucursal: obj.key,
                }
                MDL.compra_venta.setSucursalSeleccionada(sucu)
                    .then(() => {
                        MDL.compra_venta.sucursalSeleccionada = sucu;
                        this.sucursal = sucu;
                        this.forceUpdate(); // Forzamos render al actualizar sucursal
                    })
                    .catch(() => {
                        console.log("Error al guardar sucursal");
                    });
            }
        });
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
                        Bs {SMath.formatMoney((subtotal - (totalDescuento || 0)), 2)}
                    </SText>
                </SView>

                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}
                    onPress={() => this.seleccionarSucursal()}
                >
                    <SText fontSize={13} color={STheme.color.darkGray}>Sucursal:</SText>
                    <SText fontSize={13} bold color={sucursal?.descripcion ? STheme.color.darkGray : "red"}>
                        {sucursal?.descripcion || "No seleccionada"}
                    </SText>
                </SView>
            </SView>
        );
    }
}
