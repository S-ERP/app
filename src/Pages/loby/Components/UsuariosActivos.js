import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SImage, SList, SMath, SNavigation, SText, STheme, SUuid, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class UsuariosActivos extends Component {
    constructor(props) {
        super(props);
        this.state = { 
        };

    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "empresa",
            component: "empresa_usuario",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            // key_usuario: Model.usuario.Action.getKey(),

        }).then(e => {
            this.setState({ data: e.data })
        })
    }


    toChat(key_usuario) {
        const key = Model.empresa.Action.getKey();
        Model.chat.Action.registro({
            data: {
                key: key,
                descripcion: "Chat de la empresa " + Model.empresa.Action.getSelect().razon_social,
                observacion: "--",
                color: "#000000",
                tipo: "empresa",
            },
            users: [
                { key_usuario: Model.usuario.Action.getKey(), tipo: "admin", },
                { key_usuario: key_usuario, tipo: "admin", },
            ],
            key_usuario: Model.usuario.Action.getKey()
        }).then((resp) => {
            SNavigation.navigate("/chat/profile", { pk: key })
        }).catch(e => {
            // Model.chat.Action.CLEAR();
            // Model.chat_usuario.Action.CLEAR();
            SNavigation.navigate("/chat/profile", { pk: key })
        })
    }
    usuarioItem = ({ alias, key_usuario, ultima_actividad }) => {
        var lastConect = new SDate(ultima_actividad).getTime();
        var now = new SDate().getTime()
        if (ultima_actividad == null) lastConect = 999999999;
        var diferenciaMiliSegundos = now - lastConect
        var diferenciasegundos = Math.floor(diferenciaMiliSegundos / 1000)
        var diferenciaminutos = Math.floor(diferenciaMiliSegundos / (1000 * 60))

        console.log("user", alias)
        console.log("ultima_actividad", ultima_actividad)
        console.log("diferenciasegundos", diferenciasegundos)
        console.log("diferenciaminutos", diferenciaminutos)
       
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
                       
                    }} center><SText  fontSize={7}>{diferenciaminutos} min</SText></SView> : (diferenciasegundos < 60) ? <SView style={{
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
        console.log("UsuariosActivos")
        console.log(this.state.data)
        var dataUser = this.state.data
        //sort my list of objects by date in descending order
        

        // dataUser.sort((a, b) => {
        //     const dateA = new Date(a.ultima_actividad);
        //     const dateB = new Date(b.ultima_actividad);
        //     return dateB - dateA;

        // });
        // var dataOrder = Object.values(this.state.data).filter(o => o.key_tipo_pago == tipo_pago.key && o.estado != 0)

        console.log("dataUser", dataUser)

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
