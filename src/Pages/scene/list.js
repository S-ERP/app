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
            <SText>{obj.descripcion}</SText>
        </SView>
    }
    render() {
        return <SPage title={"Scene"}>
            <Container>
                <SHr />
                <SView col={"xs-12"}>
                    <SText onPress={() => { SNavigation.navigate("/scene/new") }}>NEW</SText>
                </SView>
                <SHr />
                <SList
                    data={this.state.data}
                    render={this.renderItem}
                />
            </Container>
        </SPage>
    }
}
