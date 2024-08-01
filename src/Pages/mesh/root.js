import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SList, SNavigation, SPage, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.onSelect = SNavigation.getParam("onSelect")
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
        return <SView col={"xs-12"} card padding={4} onPress={() => {
            if (this.onSelect) {
                this.onSelect(obj);
                return;
            }
            SNavigation.navigate("/mesh/edit", { key: obj.key })
        }} row>
            <SView width={34} height={34} card>
                <SImage src={SSocket.api.root + "mesh/" + obj.key} />
            </SView>
            <SView width={8}/>
            <SView flex style={{
                justifyContent: "center"
            }}>
                <SText fontSize={18} bold>{obj.descripcion}</SText>
            </SView>
        </SView>
    }
    render() {
        return <SPage title={"mesh"}>
            <Container>
                <SHr />
                <SText card padding={8} onPress={() => { SNavigation.navigate("/mesh/new") }}>NUEVO MESH</SText>
                <SHr />
                <SList
                    buscador
                    data={this.state.data}
                    order={[{ key: "descripcion", order: "asc", }]}
                    render={this.renderItem.bind(this)}
                />
            </Container>
        </SPage>
    }
}
