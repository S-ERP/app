import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SList, SNavigation, SPage, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "mesh",
            type: "getAll",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })
    }

    renderItem(obj) {
        return <SView col={"xs-12"} card padding={8} onPress={() => {
            SNavigation.navigate("/mesh/edit", { key: obj.key })
        }}>
            <SText fontSize={18} bold>{obj.descripcion}</SText>
        </SView>
    }
    render() {
        return <SPage title={"mesh"}>
            <Container>
                <SHr />
                <SText card padding={8} onPress={() => { SNavigation.navigate("/mesh/new") }}>NUEVO MESH</SText>
                <SHr />
                <SList data={this.state.data}
                    render={this.renderItem.bind(this)}
                />
            </Container>
        </SPage>
    }
}
