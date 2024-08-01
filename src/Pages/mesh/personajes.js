import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SList, SNavigation, SPage, SText, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';
import SThreeGLView from '../../Components/SThree/SThreeGLView';
import Preview from '../three/preview';

export default class personajes extends Component {

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
        return <SView row padding={5} onPress={() => {
            if (this.onSelect) {
                this.onSelect(obj);
                return;
            }
            SNavigation.navigate("/mesh/edit", { key: obj.key })
        }}>
            <SView card width={100}>

                <SView width={100} height={110} style={{ padding: 4 }}>
                    <SView flex height card style={{
                        overflow: 'hidden',
                    }}>
                        <SImage src={SSocket.api.root + "mesh/" + obj?.key + "?date=" + new Date().getTime()} style={{ resizeMode: "cover" }} />
                    </SView>
                </SView>
                <SText padding={5} center fontSize={14} bold>{obj.descripcion}</SText>
            </SView>
        </SView>
    }
    render() {
        return <SPage title={"mesh"}
        >
            {/* <Container> */}
            <SView col={"xs-12"} center height>
                <SView col={"xs-11"} row>
                    <SHr />
                    <Preview />
                    {/* <SThreeGLView
                        onCreate={({ gl, renderer, scene, camera }) => {
                        }}

                        update={({ delta }) => {
                        }}
                    /> */}
                    <SHr />
                </SView>
                <SView col={"xs-12"} row
                    style={{
                        position: "absolute",
                        bottom: 0,
                    }}>
                    <SList data={this.state.data}
                        horizontal
                        filter={d => d.is_personaje == true}
                        render={this.renderItem.bind(this)}
                    />
                </SView>
            </SView>
            {/* </Container> */}
        </SPage>
    }
}
