import React, { Component } from 'react';
import { SView, SText, STheme, SMath, SNavigation, SPopup, SHr } from 'servisofts-component';
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
                style={{ borderRadius: 8, padding: 8, backgroundColor: STheme.color.card }}
                height={135}
            >
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <SText fontSize={13} color={STheme.color.text}>Subtotal:</SText>
                    <SText fontSize={13} bold color={STheme.color.text}>
                        Bs {SMath.formatMoney(subtotal, 2)}
                    </SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.text}>
                        IVA ({numeroIva}%)
                    </SText>
                    <SText fontSize={13} color={STheme.color.text}>
                        + Bs {SMath.formatMoney(totalImpuesto, 2)}
                    </SText>
                </SView>
                <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                    <SText fontSize={12} color={STheme.color.text}>Descuento:</SText>
                    <SText fontSize={13} color={STheme.color.text}>
                        - Bs {SMath.formatMoney(totalDescuento || 0, 2)}
                    </SText>
                </SView>
                <SHr height={3} />
                <SView col={"xs-12"} style={{ borderColor: STheme.color.gray, borderBottomWidth: 2 }} />
                <SHr height={5} />
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4, padding: 3 }}>
                    <SText fontSize={18} color={STheme.color.text}>Total:</SText>
                    <SText fontSize={18} bold color={STheme.color.text}>
                        Bs {SMath.formatMoney((subtotal - (totalDescuento || 0)), 2)}
                    </SText>
                </SView>
                <SView col={"xs-12"} style={{ borderColor: STheme.color.gray, borderBottomWidth: 2 }} />
                <SHr height={8} />
                <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}
                    onPress={() => this.seleccionarSucursal()}
                >
                    <SText fontSize={13} color={STheme.color.text}>Sucursal:</SText>
                    <SText fontSize={13} bold color={sucursal?.descripcion ? STheme.color.text : "red"}>
                        {sucursal?.descripcion || "No seleccionada"}
                    </SText>
                </SView>
            </SView>
        );
    }
}
