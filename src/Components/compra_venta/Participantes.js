import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';
import PopupDeleteParticipante from './PopupDeleteParticipante';
export default class Participantes extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}


    popupDelete(obj, user) {
        if (this.props.disabled) return null;
        SPopup.open({
            key: "delete_participante",
            content: <PopupDeleteParticipante compra_venta={this.props.data} data={obj} user={user} />
        })
    }
    renderLista() {

        return <SList
            center
            horizontal
            filter={d => d.estado != 0}
            data={this.data_participantes}
            render={(obj) => {
                var user = Model.usuario.Action.getByKey(obj.key_usuario_participante);
                if (!user) return <SLoad />
                return <SView width={120} onPress={this.isAdmin ? () => {
                    this.popupDelete(obj, user)
                } : null} >
                    <SView col={"xs-12"} center>
                        <SView width={40} height={40} style={{ padding: 4 }}>
                            <SView flex height card style={{
                                overflow: 'hidden',
                            }}>
                                <SImage src={SSocket.api.root + "usuario/" + obj.key_usuario_participante} />
                            </SView>
                        </SView>
                        <SView flex center>
                            <SView col={"xs-12"} center>
                                <SText center>{user.Nombres ?? ""} {user.Apellidos ?? ""}</SText>
                                <SText color={STheme.color.gray} fontSize={12} center >{obj.tipo ?? ""}</SText>
                            </SView>
                        </SView>
                    </SView>
                </SView>
            }}
        />

    }
    getButtom() {
        if (this.props.disabled || !this.isAdmin) return null;
        return <SView card width={220} style={{
            padding: 16,

        }} onPress={() => {
            SNavigation.navigate("/usuario", {
                onSelect: (user) => {
                    Model.compra_venta_participante.Action.registro({
                        data: {
                            key_compra_venta: this.props.data.key,
                            key_usuario_participante: user.key,
                        },
                        key_usuario: Model.usuario.Action.getKey()
                    }).then((resp) => {
                        console.log("Exito");
                    }).catch((e) => {
                        console.error(e);
                    })
                }
            })
        }}>
            <SText bold color={STheme.color.danger} center>AGREGAR PARTICIPANTE</SText>
        </SView>
    }
    getButtomSalir() {
        if (this.props.disabled) return null
        return <SView card width={220} style={{
            padding: 16,

        }} onPress={() => {

            SPopup.confirm({
                title: "Seguro de abandonar la cotizacion?",
                onPress: () => {
                    Model.compra_venta_participante.Action.editar({
                        data: {
                            ...this.my,
                            estado: 0,
                        },
                        key_usuario: Model.usuario.Action.getKey()
                    }).then((resp) => {
                        SNavigation.goBack();
                        console.log("Exito");
                    }).catch((e) => {
                        console.error(e);
                    })
                }
            })

        }}>
            <SText bold color={STheme.color.danger} center>ABANDONAR</SText>
        </SView>
    }
    render() {
        this.data = this.props.data;
        this.data_participantes = Model.compra_venta_participante.Action.getAll({
            key_compra_venta: this.props.data.key
        });

        if (!this.data_participantes) return <SLoad />
        this.my = Object.values(this.data_participantes).find(o => o.key_usuario_participante == Model.usuario.Action.getKey());
        if (!this.my) return null
        if (!this.my.estado) return null
        this.isAdmin = this.my.tipo == "admin"
        return <SView col={"xs-12"} center>
            <SHr />
            <SText bold>PARTICIPANTES</SText>
            <SHr />
            {this.renderLista()}
            <SHr />
            {this.getButtom()}
            <SHr />
            {this.getButtomSalir()}
        </SView>
    }
}
