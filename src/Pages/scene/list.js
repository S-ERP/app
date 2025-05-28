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
        this.getData();
    }

    getData() {
        SSocket.sendPromise({
            component: "scene",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
        }).then(e => {
            console.log(e);
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })
    }
    renderItem(obj) {
        return <SView col={"xs-12"} card padding={8} onPress={() => {
            SNavigation.navigate("/scene", { pk: obj.key })
        }}>
            <SText fontSize={16} bold>{obj.descripcion}</SText>
        </SView>
    }
    render() {
        return <SPage title={"Scene"}>
            <Container>
                <SHr />
                <SView col={"xs-12"}>
                    <SText width={120} center card padding={8} onPress={() => { SNavigation.navigate("/scene/new") }}>CREAR SCENE</SText>
                </SView>
                <SHr />
                <SList
                    buscador
                    order={[{ key: "descripcion", order: "asc" }]}
                    data={this.state.data}
                    render={this.renderItem}
                />
            </Container>
        </SPage>
    }
}
