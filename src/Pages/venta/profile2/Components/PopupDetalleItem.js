import React, { Component } from 'react';
import { SHr, SImage, SMath, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../../../Model';
export default class PopupDetalleItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    detalle_item({ key_usuario, nombre, precio, cantidad, descuento }) {
        return <SView col={"xs-12"} row center>
            <SView width={40} height={40} style={{ padding: 4 }}>
                <SView flex height card style={{
                    overflow: 'hidden',
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + key_usuario} />
                </SView>
            </SView>
            <SView flex>
                <SText bold >{nombre}</SText>
                <SText>{SMath.formatMoney(precio)} X {SMath.formatMoney(cantidad)} </SText>
            </SView>
            <SView width={8} />
            <SView col={"xs-3"} style={{ alignItems: 'end', textAlign: "end" }}>
                <SText style={{ alignItems: 'end', textAlign: "end" }}>{SMath.formatMoney((precio * cantidad))}</SText>
                {descuento ? <SText color={STheme.color.danger}>- {SMath.formatMoney(descuento)}</SText> : null}
            </SView>
        </SView>
    }
    render() {
        const { key, nombre, key_usuario, cantidad, precio, descuento } = this.props.data;
        return (
            <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"} card height={250} style={{
                backgroundColor: STheme.color.background + "F0",
                padding: 4
            }} center>
                <SView col={"xs-12"}>
                    {this.detalle_item(this.props.data)}
                    <SHr height={50} />
                    <SView col={"xs-12"} center row>

                        <SView card style={{ padding: 16, }} onPress={() => {
                            console.log(this.props.data)
                            Model.compra_venta_detalle.Action.editar({
                                data: {
                                    ...this.props.data,
                                    key_compra_venta: this.props.key_compra_venta,
                                    key: key,
                                    estado: 0,
                                }
                            }).then(resp => {
                                // SPopup.close("popup-detalle-item")
                            })
                            SPopup.close("popup-detalle-item")
                            // Model.compra_venta.Action.changeState({ data: this.data, state: "denegado" })
                        }}>
                            <SText bold color={STheme.color.danger}>ANULAR</SText>
                        </SView>
                        <SView width={8} />

                        <SView card style={{ padding: 16 }} onPress={() => {
                            SNavigation.navigate("/venta/detalle/edit", { pk: this.props.data.key, key_compra_venta: this.props.key_compra_venta })
                            SPopup.close("popup-detalle-item")
                            // Model.compra_venta.Action.changeState({ data: this.data, state: "aprobado" })
                        }}>
                            <SText bold color={STheme.color.warning}>EDITAR</SText>
                        </SView>


                    </SView>
                </SView>
            </SView>
        );
    }
}
