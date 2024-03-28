import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SImage, SList, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class Publicaciones extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "tarea",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey()
        }).then(e => {
            this.setState({ data: e.data })
        })
    }

    Item = () => {


        return <SView padding={4} flex height={280} onPress={() => SNavigation.navigate("/publicacion")}>
            <SView flex style={{
                backgroundColor: STheme.color.card,
                borderRadius: 16,

            }} padding={4} >
                <SView padding={4} height={150}>
                    <SImage src={require('../../../Assets/jpg/publicacion.jpg')} style={{ width: " 100%", height: 150, borderRadius: 8, resizeMode: "cover" }} />
                </SView>
                <SHr height={15} />
                <SText color={STheme.color.text} fontSize={17} bold>Título publicación para el sector empresarial</SText>
                <SHr height={10} />
                <SView padding={4} height={50} style={{alignItems:"flex-end", position:"relative"}}>
                    <SText color={STheme.color.gray} fontSize={14} >Mar 9, 2024</SText>
                </SView>
            </SView>

        </SView>
    }
    render() {
        (this.state.data ?? console.log("no hay data"))
        let semana = new SDate().getFirstDayOfWeek();
        return <SView col={"xs-12"} >
            <SView row>
                <SText bold fontSize={15}> Publicaciones</SText>
            </SView>
            <SHr />
            <SView col={"xs-12"} row>
                {new Array(2).fill(0).map((a, i) => this.Item())}
            </SView>
        </SView>
    }
}
