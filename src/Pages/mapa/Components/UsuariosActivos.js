import React, { Component } from 'react';
import { SDate, SImage, SList, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class UsuariosActivos extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "empresa",
            component: "empresa_usuario",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })
    }

    usuarioItem = ({ alias, key_usuario, ultima_actividad }) => {
        var lastConect = new SDate(ultima_actividad).getTime();
        var now = new SDate().getTime()
        if (ultima_actividad == null) lastConect = 999999999;
        var diferenciaMiliSegundos = now - lastConect
        var diferenciasegundos = Math.floor(diferenciaMiliSegundos / 1000)
        var diferenciaminutos = Math.floor(diferenciaMiliSegundos / (1000 * 60))

        return <SView width={75} height={80} center onPress={() => {
            SNavigation.navigate("/usuario/profile", { pk: key_usuario })
        }}>
            <SView style={{ width: 60, height: 60, borderRadius: 100, }}>
                <SView style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: STheme.color.card,
                    backgroundColor: STheme.color.card,
                    overflow: "hidden"
                }}>
                    <SImage style={{
                        resizeMode: "cover"
                    }} src={Model.usuario._get_image_download_path(SSocket.api, key_usuario)} />
                </SView>
                {(diferenciaminutos < 60 && diferenciasegundos > 60) ?
                    <SView style={{
                        width: 27,
                        height: 14,
                        borderRadius: 100,
                        backgroundColor: STheme.color.gray,
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                    }} center><SText fontSize={7}>{diferenciaminutos} min</SText></SView> : (diferenciasegundos < 60) ? <SView style={{
                        width: 14,
                        height: 14,
                        borderRadius: 100,
                        backgroundColor: STheme.color.success,
                        position: "absolute",
                        bottom: 0,
                        right: 0
                    }} /> : null}
            </SView>
            <SText fontSize={10} col={"xs-12"} bold center row height={13} style={{
                overflow: 'hidden',
            }}>{alias}</SText>

        </SView>
    }
    render() {
        return <SView col={"xs-12"} height={100}  >
            <SText bold fontSize={12}> Usuarios</SText>
            <SList
                horizontal
                data={this.state.data}
                order={[{ key: "ultima_actividad", type: "date", order: "asc" }]}
                render={(a) => this.usuarioItem(a)}
            />
        </SView>
    }
}
