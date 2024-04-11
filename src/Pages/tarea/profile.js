import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SDate, SHr, SIcon, SImage, SInput, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import { connect } from 'react-redux';
import { Container } from '../../Components';
import SSocket from 'servisofts-socket';
import SList from 'servisofts-component/Component/SList2';
import UsuariosAsigandos from './Components/UsuariosAsigandos';
import Labels from './Components/Labels';

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

    getEstado(data) {
        let color = data?.estado == 2 ? "#7C57E0" : STheme.color.success
        let txt = data?.estado == 2 ? "Close" : "Open"
        return <SView width={70} style={{
            height: 26,
            backgroundColor: color,
            borderRadius: 80,
            paddingBottom: 2,
        }} center row>
            <SView width={26} height={26} style={{ borderRadius: 100, overflow: "hidden", padding: 5 }}>
                {/* <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + obj.key_usuario} /> */}
                <SIcon name='tareaclose' fill={STheme.color.text} />
            </SView>
            <SText bold fontSize={12} center>{txt}</SText>
        </SView>
    }
    comentar() {
        let data = Model.tarea.Action.getByKey(this.pk);
        return <SView col={"xs-12"} row>
            <SView
                colHidden='xs'
                width={56}
                style={{ alignItems: "center", overflow: "hidden", maxWidth: 56 }}>
                <SView width={40} height={40} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                    <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + Model.usuario.Action.getKey()} />
                </SView>
            </SView>
            <SView flex>
                <SView flex>
                    <SHr />
                    <SText bold fontSize={16}>{"Comentar"}</SText>
                    <SHr />
                    <SView col={"xs-12"} border={STheme.color.card} style={{
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
                                borderColor: STheme.color.card
                            }}>
                                <SInput
                                    ref={ref => this.inputcomentar = ref}
                                    customStyle={"clean"}
                                    type='textArea'
                                    placeholder={"Add your comment here..."}
                                    placeholderTextColor={STheme.color.gray}
                                    style={{
                                        textAlignVertical: "top",
                                        padding: 4,
                                    }}
                                />
                            </SView>
                        </SView>
                        <SHr />
                        {/* <SView col={"xs-12"} height={35} style={{ alignItems: "center", paddingLeft: 8 }} row>
                            <SText fontSize={10} >Markdown is supported</SText>
                            <SView width={32} />
                            <SText fontSize={10} >Paste, drop, or click to add files</SText>
                        </SView> */}
                    </SView>
                </SView>
                <SHr h={4} />
                <SView col={"xs-12"} height={35} style={{ alignItems: "center", paddingLeft: 8 }} row>
                    <SView flex />
                    <SText fontSize={10} padding={8} width={100} center style={{ borderRadius: 4 }
                    } backgroundColor={STheme.color.card}
                        color={data?.estado != 2 ? "#7C57E0" : STheme.color.success}
                        onPress={() => {
                            let valor = this.inputcomentar.getValue();
                            SSocket.sendPromise({
                                component: "tarea",
                                type: data?.estado == 2 ? "abrir" : "cerrar",
                                key_tarea: this.pk,
                                key_empresa: Model.empresa.Action.getKey(),
                                key_usuario: Model.usuario.Action.getKey(),
                                notification_data:{
                                    usuario: Model.usuario.Action.getUsuarioLog(),
                                    empresa: Model.empresa.Action.getSelect()
                                }
                            }).then(e => {
                                console.log(e);
                                Model.tarea.Action.CLEAR();
                                // this.inputcomentar.setValue("")
                                // this.state.data[e.data.key] = e.data;
                                // this.setState({...this.state})
                            }).catch(e => {
                                console.error(e);
                            })
                        }}>{data?.estado == 2 ? "Open Issue" : "Close issue"}</SText>
                    <SView width={32} />
                    <SText fontSize={10} padding={8} style={{ borderRadius: 4 }} backgroundColor={STheme.color.success} onPress={() => {
                        let valor = this.inputcomentar.getValue();
                        let usuario = Model.usuario.Action.getUsuarioLog();
                        SSocket.sendPromise({
                            component: "tarea_comentario",
                            type: "registro",
                            data: {
                                descripcion: valor,
                                tipo: "comentario"
                            },
                            key_tarea: this.pk,
                            key_empresa: Model.empresa.Action.getKey(),
                            key_usuario: Model.usuario.Action.getKey(),
                            notification_data: {
                                usuario: usuario,
                                empresa: Model.empresa.Action.getSelect()
                            }
                        }).then(e => {

                            this.inputcomentar.setValue("")
                            this.state.data[e.data.key] = e.data;
                            this.setState({ ...this.state })
                            console.log(e);
                        }).catch(e => {
                            console.error(e);
                        })
                    }}>Comment</SText>
                </SView>
            </SView>
        </SView >
    }
    comentario(obj) {
        let usuario = Model.usuario.Action.getByKey(obj.key_usuario);
        if (obj.tipo == "comentario") {
            return <SView col={"xs-12"} row>
                <SView colHidden='xs' width={56} style={{ alignItems: "center", overflow: 'hidden' }}>
                    <SView width={40} height={40} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                        <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                    </SView>
                </SView>
                <SView flex>
                    <SView col={"xs-12"} border={STheme.color.card} style={{
                        borderRadius: 4,
                        overflow: "hidden",
                        // backgroundColor:STheme.color.background
                    }} >
                        <SView col={"xs-12"} style={{ alignItems: "center", paddingLeft: 8, paddingTop: 8, paddingBottom: 8, backgroundColor: STheme.color.card }} row>
                            <SText bold clean>{usuario?.Nombres} {usuario?.Apellidos}</SText>
                            <SView width={4} />
                            <SText clean color={STheme.color.gray} fontSize={12}>hace {new SDate(obj.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())} </SText>
                        </SView>
                        <SView col={"xs-12"} flex padding={8} row>
                            <SHr h={8} />
                            <SText color={STheme.color.text}>{obj.descripcion}</SText>
                            {/* {(obj.descripcion ?? "").split(" ").map(a => <SText color={STheme.color.text}>{a + " "}</SText>)} */}
                            <SHr h={16} />
                        </SView>
                    </SView>
                </SView>
            </SView>
        }
        if (obj.tipo == "delete_user" || obj.tipo == "add_user") {
            let usuarioInvitado = Model.usuario.Action.getByKey(obj.data?.key_usuario_participante);
            return <SView col={"xs-12"} row >
                <SView colHidden='xs' width={56} style={{ alignItems: "center", overflow: 'hidden' }}>
                    {/* <SView width={40} height={40} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                    <SImage src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                </SView> */}
                </SView>
                <SView row >
                    <SView width={28} height={28} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden", padding: 5 }}>
                        {/* <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + obj.key_usuario} /> */}
                        <SIcon name='tareaUser' fill={obj.tipo == "delete_user" ? STheme.color.danger : STheme.color.success} />
                    </SView>
                    <SView width={8} />
                </SView>
                <SView flex row style={{
                    paddingTop: 3,
                    alignItems: "center"
                }}>

                    <SView width={20} height={20} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}
                        onPress={() => {
                            SNavigation.navigate("/usuario/profile", { pk: usuario.key })
                        }}
                    >
                        <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                    </SView>
                    <SView width={4} />
                    <SView row onPress={() => {
                        SNavigation.navigate("/usuario/profile", { pk: usuario.key })
                    }}>
                        <SText bold>{usuario?.Nombres}</SText>
                        <SView width={4} />
                        <SText bold>{usuario?.Apellidos}</SText>
                    </SView>
                    <SView width={4} />
                    {(obj.descripcion ?? "").split(" ").map(a => <SText color={STheme.color.gray}>{a + ' '}</SText>)}
                    <SView width={4} />
                    <SView row onPress={() => {
                        SNavigation.navigate("/usuario/profile", { pk: usuarioInvitado.key })
                    }}>
                        <SText bold>{usuarioInvitado?.Nombres}</SText>
                        <SView width={4} />
                        <SText bold>{(usuarioInvitado?.Apellidos ?? "").split(" ")[0]}</SText>
                    </SView>
                    <SView width={4} />
                    <SText color={STheme.color.gray} fontSize={12}>hace {new SDate(obj.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())} </SText>
                </SView>
            </SView>
        }
        if (obj.tipo == "delete_label" || obj.tipo == "add_label") {
            let label = Model.label.Action.getByKey(obj.data?.key_label);
            return <SView col={"xs-12"} row >
                <SView colHidden='xs' width={56} style={{ alignItems: "center", overflow: 'hidden' }}>
                    {/* <SView width={40} height={40} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                    <SImage src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                </SView> */}
                </SView>
                <SView row >
                    <SView width={28} height={28} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden", padding: 5 }}>
                        {/* <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + obj.key_usuario} /> */}
                        <SIcon name='tarealabel' fill={obj.tipo == "delete_label" ? STheme.color.danger : STheme.color.success} />
                    </SView>
                    <SView width={8} />
                </SView>
                <SView flex row style={{
                    paddingTop: 3,
                    alignItems: "center"
                }}>
                    <SView row onPress={() => {
                        SNavigation.navigate("/usuario/profile", { pk: usuario.key })
                    }}>
                        <SView width={20} height={20} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                            <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                        </SView>
                    </SView>
                    <SView width={4} />
                    <SView row onPress={() => {
                        SNavigation.navigate("/usuario/profile", { pk: usuario.key })
                    }}>
                        <SText bold>{usuario?.Nombres}</SText>
                        <SView width={4} />
                        <SText bold>{usuario?.Apellidos}</SText>
                    </SView>
                    <SView width={4} />
                    {(obj.descripcion ?? "").split(" ").map(a => <SText color={STheme.color.gray}>{a + ' '}</SText>)}
                    <SView width={4} />
                    <SView row style={{
                        backgroundColor: label?.color + "66", borderRadius: 16, padding: 2,
                        paddingLeft: 4,
                        paddingRight: 4,
                        borderWidth: 1,
                        borderColor: label?.color
                    }}>
                        <SText bold fontSize={12}  >{label?.descripcion}</SText>
                    </SView>
                    <SView width={4} />
                    <SText color={STheme.color.gray} fontSize={12}>hace {new SDate(obj.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())} </SText>
                </SView>
            </SView >
        }
        if (obj.tipo == "abrir" || obj.tipo == "cerrar") {
            return <SView col={"xs-12"} row >
                <SView colHidden='xs' width={56} style={{ alignItems: "center", overflow: 'hidden' }}>
                    {/* <SView width={40} height={40} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                    <SImage src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                </SView> */}
                </SView>
                <SView row >
                    <SView width={28} height={28} style={{ borderRadius: 100, backgroundColor: obj?.tipo != "abrir" ? "#7C57E0" : STheme.color.success, overflow: "hidden", padding: 5 }}>
                        {/* <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + obj.key_usuario} /> */}
                        <SIcon name='tareaclose' fill={STheme.color.text} />
                    </SView>
                    <SView width={8} />
                </SView>
                <SView flex row style={{
                    paddingTop: 3,
                    alignItems: "center"
                }}>

                    <SView width={20} height={20} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                        <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                    </SView>
                    <SView width={4} />
                    <SText bold>{usuario?.Nombres}</SText>
                    <SView width={4} />
                    <SText bold>{usuario?.Apellidos}</SText>
                    <SView width={4} />
                    {(obj.descripcion ?? "").split(" ").map(a => <SText color={STheme.color.gray}>{a + ' '}</SText>)}
                    <SView width={4} />
                    {/* <SText bold>{usuarioInvitado?.Nombres}</SText> */}
                    {/* <SView width={4} /> */}
                    {/* <SText bold>{(usuarioInvitado?.Apellidos ?? "").split(" ")[0]}</SText> */}
                    {/* <SView width={4} /> */}
                    <SText color={STheme.color.gray} fontSize={12}>hace {new SDate(obj.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())} </SText>
                </SView>
            </SView>
        }
        return <SView col={"xs-12"} row >
            <SView colHidden='xs' width={56} style={{ alignItems: "center", overflow: 'hidden' }}>
                {/* <SView width={40} height={40} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
            <SImage src={SSocket.api.root + "usuario/" + obj.key_usuario} />
        </SView> */}
            </SView>
            <SView flex row style={{
                alignItems: "center"
            }}>
                <SView width={20} height={20} style={{ borderRadius: 100, backgroundColor: STheme.color.card, overflow: "hidden" }}>
                    <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + obj.key_usuario} />
                </SView>
                <SView width={4} />
                <SText bold>{usuario?.Nombres}</SText>
                <SView width={4} />
                <SText bold>{usuario?.Apellidos}</SText>
                <SView width={4} />
                {(obj.descripcion ?? "").split(" ").map(a => <SText color={STheme.color.gray}>{a + " "}</SText>)}
                <SView width={4} />
                <SText color={STheme.color.gray} fontSize={12}>hace {new SDate(obj.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())} </SText>
            </SView>
        </SView>
    }
    renderComponent() {
        let data = Model.tarea.Action.getByKey(this.pk);
        if (!data) return <SLoad />
        let usuario = Model.usuario.Action.getByKey(data.key_usuario);
        return <SView col={"xs-12"}>
            <SView col={"xs-12"} row>
                {(data.descripcion ?? "").split(" ").map(a => <SText fontSize={24} color={STheme.color.text} bold>{a + " "}</SText>)}
                <SView flex />
                <SView width={20} />
                <SView flex />
                <SText card width={45} height={22} center onPress={() => SNavigation.navigate("/tarea/edit", { pk: this.pk })}>Edit</SText>
                <SView width={4} />
                <SText card center height={22} width={80} style={{
                    backgroundColor: STheme.color.success

                }} onPress={() => SNavigation.navigate("/tarea/new")}>New issue</SText>
                <SView width={4} />
            </SView>
            <SHr />
            <SView row style={{
                alignItems: "center"
            }}>
                {this.getEstado(data)}
                <SView width={4} />
                <SText fontSize={12} color={STheme.color.text}>{`${usuario?.Nombres} ${usuario?.Apellidos}`}</SText>
                <SView width={4} />
                {`creo esta tarea el ${new SDate(data.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd a las HH")}`.split(" ").map(a => <SText fontSize={12} color={STheme.color.gray}>{a + " "}</SText>)}

            </SView>

        </SView>
    }

    render() {
        return <SPage title={"Tarea"} onRefresh={(e) => {
            Model.tarea.Action.CLEAR();
            this.state.data = null;
            this.componentDidMount();
            this.setState({ ...this.state })
        }}>
            <SView col={"xs-12"} center >
                <SView col={"xs-11"} center >
                    <SHr />
                    <SView col={"xs-12"} >
                        {this.renderComponent()}

                        <SHr h={16} />
                        <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.card }} />
                        <SHr h={16} />
                    </SView>
                    <SView col={"xs-12"} row>
                        <SView col={"xs-12 md-7.9 lg-8.9"} >
                            <SView col={"xs-12"}>
                                {/* <SView style={{ position: "absolute", left: 10, height: "100%", width: 1, borderLeftWidth: 1, borderColor: STheme.color.card }} /> */}
                                {!this.state.data ? <SLoad /> :
                                    <SList
                                        order={[{ key: "fecha_on", type: "date", order: "asc" }]}
                                        space={32}
                                        data={this.state.data}
                                        render={a => this.comentario(a)} />
                                }
                                <SHr h={16} />
                                <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.card }} />


                            </SView>
                            <SHr h={16} />
                            {this.comentar({})}
                            <SHr h={32} />
                        </SView>
                        <SView col={"xs-0.2"} />
                        <SView col={"xs-12 md-3.9 lg-2.9"} >
                            {/* <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.gray }} /> */}
                            {/* <SHr h={16} /> */}
                            <SView colHidden='md lg xl xxl'>
                                <SHr h={16} />
                                <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.card }} />
                                <SHr h={16} />
                            </SView>
                            <UsuariosAsigandos key_tarea={this.pk} />
                            <SHr h={16} />
                            <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.card }} />
                            <SHr h={16} />
                            <Labels key_tarea={this.pk} />
                            <SHr h={16} />
                            <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.card }} />
                            <SHr h={16} />
                        </SView>
                    </SView>
                </SView>
            </SView>
        </SPage >
    }
}

const initStates = (state) => {
    return { state }
};
export default connect(initStates)(profile);
