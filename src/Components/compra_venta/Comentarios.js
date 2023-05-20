import React, { Component } from 'react';
import { SDate, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';
export default class Comentarios extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}

    renderLista() {
        var data = Model.compra_venta_comentario.Action.getAll({
            key_compra_venta: this.props.data.key
        });
        if (!data) return <SLoad />
        return <SList
            data={data}
            limit={5}
            order={[{ key: "fecha_on", order: "desc", peso: 1 }]}
            render={(obj) => {
                var user = Model.usuario.Action.getByKey(obj.key_usuario);
                if (!user) return <SLoad />
                return <SView col={"xs-12"} style={{
                    padding: 4
                }}>
                    <SView row col={"xs-12"}>
                        <SView width={40} height={40} style={{ padding: 4 }}>
                            <SView flex height card style={{
                                overflow: 'hidden',
                            }}>
                                <SImage src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                            </SView>
                        </SView>
                        <SView width={8} />
                        <SView flex center>
                            <SView col={"xs-12"}>
                                <SText bold>{user.Nombres ?? ""} {user.Apellidos ?? ""}</SText>
                                <SText>{obj.descripcion}</SText>

                            </SView>
                        </SView>
                    </SView>
                    <SView col={"xs-12"} row>
                        <SView flex />
                        <SText fontSize={12} color={STheme.color.gray}>{new SDate(obj.fecha_on).toString("yyyy-MM-dd hh:mm:ss")}</SText>
                    </SView>
                    <SHr height={1} color={STheme.color.card} />
                </SView>
            }}
        />

    }

    handleComment() {
        var txt = this.imp_comment.getValue()
        if (!txt) return null;
        this.setState({ loading: true })
        this.imp_comment.setValue("");
        Model.compra_venta_comentario.Action.registro({
            data: {
                key_compra_venta: this.props.data.key,
                descripcion: txt,
                observacion: "",
            },
            key_usuario: Model.usuario.Action.getKey()
        }).then((r) => {
            this.imp_comment.focus();
            this.setState({ loading: false })
        }).catch((e) => {
            this.setState({ loading: true })
        })
    }
    getInput() {
        if (this.props.disabled) return null;
        return <SView col={"xs-12"} style={{
            padding: 16,
        }} row >
            <SView flex>
                <SInput ref={ref => this.imp_comment = ref} type={"text"} placeholder={"Escribe un comentario..."}
                    onKeyPress={(evt) => {
                        if (evt.key === 'Enter') {
                            this.handleComment();
                        }
                    }}
                />
            </SView>
            <SView width={40} height={40} onPress={() => {
                this.handleComment()
            }}>
                <SIcon name='Salir' />
            </SView>
        </SView>
    }
    render() {
        this.data = this.props.data;
        return <SView col={"xs-12"} center>
            <SHr />
            <SText bold>COMENTARIOS</SText>
            <SHr />
            {this.getInput()}
            <SHr />
            {this.renderLista()}
            <SHr />
        </SView>
    }
}
