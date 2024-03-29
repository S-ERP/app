import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SImage, SInput, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import { connect } from 'react-redux';
import { Container } from '../../Components';
import SSocket from 'servisofts-socket';
import SList from 'servisofts-component/Component/SList2';

class profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk")
    }

    componentDidMount() {
        SSocket.sendPromise({
            component: "tarea_comentario",
            type: "getAll",
            key_tarea: this.pk,
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
        }).then(e => {
            this.setState({ data: e.data })
        }).catch(e => {
            console.error(e);
        })
    }

    getEstado() {
        let color = STheme.color.success
        let txt = "Open"
        return <SView width={70} style={{
            height: 26,
            backgroundColor: color,
            borderRadius: 80
        }} center>
            <SText bold fontSize={14} center>{txt}</SText>
        </SView>
    }
    comentar() {
        return <SView col={"xs-12"} row>
            <SView
                col={"xs-0 md-12"}
                style={{ alignItems: "center", overflow: "hidden", maxWidth: 56 }}>
                <SView width={40} height={40} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                    <SImage src={SSocket.api.root + "usuario/" + Model.usuario.Action.getKey()} />
                </SView>
            </SView>
            <SView flex>
                <SHr />
                <SText bold fontSize={16}>{"Add a comment"}</SText>
                <SHr />
                <SView col={"xs-12"} border={STheme.color.gray} style={{
                    borderRadius: 4
                }} >
                    <SView col={"xs-12"} height={35} card style={{ alignItems: "center", paddingLeft: 8 }} row>
                        <SText >Write</SText>
                        <SView width={32} />
                        <SText color={STheme.color.gray}>Preview</SText>
                    </SView>
                    <SView col={"xs-12"} flex padding={8} style={{
                        paddingBottom: 0
                    }}>
                        <SView style={{
                            borderWidth: 1,
                            borderRadius: 4,
                            borderColor: STheme.color.gray
                        }}>
                            <SInput
                                ref={ref => this.inputcomentar = ref}
                                customStyle={"clean"}
                                type='textArea'
                                placeholder={"Add your comment here..."}
                                placeholderTextColor={STheme.color.gray}
                                style={{
                                    padding: 4,
                                }}
                            />
                        </SView>
                    </SView>
                    <SView col={"xs-12"} height={35} style={{ alignItems: "center", paddingLeft: 8 }} row>
                        <SText fontSize={10} >Markdown is supported</SText>
                        <SView width={32} />
                        <SText fontSize={10} >Paste, drop, or click to add files</SText>
                    </SView>
                </SView>
            </SView>
            <SView col={"xs-12"} height={35} style={{ alignItems: "center", paddingLeft: 8 }} row>
                <SView flex />
                <SText fontSize={10} padding={8} width={100} center style={{ borderRadius: 4 }} backgroundColor={STheme.color.card} >Close issue</SText>
                <SView width={32} />
                <SText fontSize={10} padding={8} style={{ borderRadius: 4 }} backgroundColor={STheme.color.success} onPress={() => {
                    let valor = this.inputcomentar.getValue();
                    SSocket.sendPromise({
                        component: "tarea_comentario",
                        type: "registro",
                        data: {
                            descripcion: valor,
                        },
                        key_tarea: this.pk,
                        key_empresa: Model.empresa.Action.getKey(),
                        key_usuario: Model.usuario.Action.getKey(),
                    }).then(e => {
                        this.state.data[e.data.key] = e.data;
                        this.setState({ ...this.state })
                        console.log(e);
                    }).catch(e => {
                        console.error(e);
                    })
                }}>Comment</SText>
            </SView>
        </SView>
    }
    comentario(obj) {
        let usuario = Model.usuario.Action.getByKey(obj.key_usuario);
        return <SView col={"xs-12"} row>
            <SView col={"xs-0 md-12"} width={56} style={{ alignItems: "center", overflow: 'hidden' }}>
                <SView width={40} height={40} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                    <SImage src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                </SView>
            </SView>
            <SView flex>
                <SView col={"xs-12"} border={STheme.color.gray} style={{
                    borderRadius: 4
                }} >
                    <SView col={"xs-12"} height={30} card style={{ alignItems: "center", paddingLeft: 8 }} row>
                        <SText bold>{usuario?.Nombres} {usuario?.Apellidos}</SText>
                        <SView width={8} />
                        <SText color={STheme.color.gray}>commented {new SDate(obj.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd HH")} </SText>
                    </SView>
                    <SView col={"xs-12"} flex padding={8}>
                        <SHr h={8} />
                        <SText>{obj.descripcion}</SText>
                        <SHr h={16} />
                    </SView>
                </SView>
            </SView>
        </SView>
    }
    renderComponent() {
        let data = Model.tarea.Action.getByKey(this.pk);
        if (!data) return <SLoad />
        let usuario = Model.usuario.Action.getByKey(data.key_usuario);
        return <SView col={"xs-12"}>
            <SText fontSize={24} bold>{data?.descripcion}</SText>
            <SHr />
            <SView row style={{
                alignItems: "center"
            }}>
                {this.getEstado()}
                <SView width={4} />
                <SText fontSize={12} color={STheme.color.gray}>{`${usuario?.Nombres} ${usuario?.Apellidos} opened this issue ${new SDate(data.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd HH")}`}</SText>
            </SView>
            <SHr h={16} />
            <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.gray }} />
            <SHr h={16} />
            {!this.state.data ? <SLoad /> :
                <SList
                    order={[{ key: "fecha_on", type: "date", order: "asc" }]}
                    data={this.state.data}
                    render={a => this.comentario(a)} />
            }
            <SHr h={16} />
            {this.comentar({})}
        </SView>
    }

    render() {
        return <SPage title={"Tarea"}>
            <Container>
                <SView col={"xs-12"} row>
                    <SView flex />
                    <SText card padding={4} width={45} center onPress={() => SNavigation.navigate("/tarea/edit", { pk: this.pk })}>Edit</SText>
                    <SView width={4} />
                    <SText card center padding={4} width={80} style={{
                        backgroundColor: STheme.color.success

                    }} onPress={() => SNavigation.navigate("/tarea/new")}>New issue</SText>
                    <SView width={4} />
                </SView>
                {this.renderComponent()}
            </Container>
        </SPage >
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(profile);
