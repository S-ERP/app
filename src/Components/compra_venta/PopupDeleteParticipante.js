import React, { Component } from 'react';
import { SHr, SImage, SMath, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';
export default class PopupDeleteParticipante extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    detalle_item({ key_usuario_participante }, { Nombres, Apellidos }) {
        return <SView col={"xs-12"} center>
            <SView width={40} height={40} style={{ padding: 4 }}>
                <SView flex height card style={{
                    overflow: 'hidden',
                }}>
                    <SImage src={SSocket.api.root + "usuario/" + key_usuario_participante} />
                </SView>
            </SView>
            <SView flex>
                <SText bold >{Nombres} {Apellidos}</SText>
            </SView>
        </SView>
    }
    render() {
        const { key_usuario_participante } = this.props.data;
        var data = Model.compra_venta_participante.Action.getAll({
            key_compra_venta: this.props.compra_venta.key
        });
        if (!data) return null;
        var my = Object.values(data).find((o) => o.key_usuario_participante == key_usuario_participante);
        this.isAdmin = my?.tipo == "admin"
        return (
            <SView col={"xs-12 sm-10 md-8 lg-6 xl-4"} card height={250} style={{
                backgroundColor: STheme.color.background + "F0",
                padding: 4
            }} center>
                <SView col={"xs-12"}>
                    {this.detalle_item(this.props.data, this.props.user)}
                    <SHr height={50} />
                    <SView col={"xs-12"} center row>
                        <SView card style={{ padding: 16, }} onPress={() => {
                            Model.compra_venta_participante.Action.editar({
                                data: {
                                    ...this.props.data,
                                    tipo: this.isAdmin ? "" : "admin"
                                },
                                key_usuario: Model.usuario.Action.getKey()
                            }).then((resp) => {
                                SPopup.close("delete_participante")
                            }).catch((e) => {
                                console.error(e);
                                SPopup.close("delete_participante")
                            })
                        }}>
                            <SText bold color={STheme.color.danger}>{!this.isAdmin ? "VOLVER ADMIN" : "QUITAR ADMIN"}</SText>
                        </SView>
                        <SView width={8} />

                        <SView card style={{ padding: 16 }} onPress={() => {
                            Model.compra_venta_participante.Action.editar({
                                data: {
                                    ...this.props.data,
                                    estado: 0,
                                },
                                key_usuario: Model.usuario.Action.getKey()
                            }).then((resp) => {
                                SPopup.close("delete_participante")
                            }).catch((e) => {
                                console.error(e);
                                SPopup.close("delete_participante")
                            })
                        }}>
                            <SText bold color={STheme.color.warning}>ELIMINAR</SText>
                        </SView>


                    </SView>
                </SView>
            </SView>
        );
    }
}
