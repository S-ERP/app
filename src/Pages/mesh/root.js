import React, { Component } from 'react';
import { View, Text, SectionList } from 'react-native';
import { SBuscador, SHr, SIcon, SImage, SInput, SList, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
import { Container } from '../../Components';

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openSections: []
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
            // let tipos = {}
            // Object.values(e.data).map(d => {
            //     const tipo = d.tipo + "".trim();
            //     if (!tipos[tipo]) {
            //         tipos[tipo] = { key: tipo, data: [] }
            //     }
            //     tipos[tipo].data.push(d);
            // })

            // this.setState({ data: tipos })
        }).catch(e => {
            console.error(e);
        })
    }

    renderItem(obj) {
        return <SView col={"xs-12"} padding={4} style={{
            borderBottomWidth: 1,
            borderBottomColor: STheme.color.card
        }} onPress={() => {
            if (this.onSelect) {
                this.onSelect(obj);
                return;
            }
            // SNavigation.navigate("/mesh/preview", { url: obj.url })
            // SNavigation.navigate("/mesh/new", { pk: obj.key })
        }} row>
            <SView width={34} height={34} card>
                <SImage src={SSocket.api.root + "mesh/" + obj.key} />
            </SView>
            <SView width={8} />
            <SView flex style={{
                justifyContent: "center"
            }}>
                <SText fontSize={18} bold>{obj.descripcion}</SText>
                <SText fontSize={12} color={STheme.color.lightGray}>{obj.tipo}</SText>
            </SView>
            <SView width={34} height={34} card onPress={() => {
                SNavigation.navigate("/mesh/preview", { url: obj.url })
            }}>
                <SIcon name='blender/camera' fill={STheme.color.warning} />
            </SView>
            <SView width={8} />
            <SView width={34} height={34} card onPress={() => {
                SNavigation.navigate("/mesh/new", { pk: obj.key })
            }}>
                <SIcon name='Edit' />
            </SView>
        </SView>
    }
    renderList() {
        if (!this.state.data) return <SLoad />
        return <SectionList
            style={{
                flex: 1,
                width: "100%",
            }}
            contentContainerStyle={{
                width: "100%",
            }}
            sections={Object.values(this.state.data).map(sec => ({
                ...sec,
                data: this.state.openSections[sec.key] ? sec.data : []
            }))}
            renderSectionHeader={({ section }) => {
                return <SView col={"xs-12"} padding={8} height={50} card border={"#fff"} center onPress={() => {
                    this.state.openSections[section.key] = !this.state.openSections[section.key];
                    this.setState({ ...this.state })
                }}>
                    <SText center bold>{section.key}</SText>
                </SView>
            }}
            renderItem={({ item }) => {
                return this.renderItem(item)
            }}
        />
    }
    render() {
        return <SPage title={"mesh"}>
            <Container>
                <SHr />
                <SText card padding={8} onPress={() => { SNavigation.navigate("/mesh/new") }}>NUEVO MESH</SText>
                <SHr />

                {/* {this.renderList()} */}
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
