import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SImage, SList, SList2, SLoad, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

// class UsuariosAsigandos extends Component {
export default class Labels extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "tarea_label",
            type: "getAll",
            key_tarea: this.props.key_tarea,
            // key_empresa: Model.empresa.Action.getKey()
        }).then(e => {
            this.setState({ data: e.data })
            console.log("Exito");
        }).catch(e => {
            console.log("error");
        })
    }
    getLista() {
        // if (!this.state.data) return <SLoad />
        return <SList2
            horizontal
            scrollEnabled={false}
            data={this.state.data}
            filter={a => a.estado > 0}
            render={(a) => {
                let label = Model.label.Action.getByKey(a.key_label)
                return <SView style={{ alignItems: "center", borderRadius: 100, padding: 6, margin: 2, backgroundColor: label?.color + "66" ?? STheme.color.card }} row onPress={(e) => {
                    // a.estado = 0;
                    // SSocket.sendPromise({
                    //     component: "tarea_label",
                    //     type: "editar",
                    //     data: a,
                    //     key_tarea: this.props.key_tarea,
                    //     key_empresa: Model.empresa.Action.getKey(),
                    //     key_usuario: Model.usuario.Action.getKey()
                    // }).then(e => {
                    //     this.setState({ ...this.state })
                    //     console.log("Exito");
                    // }).catch(e => {
                    //     console.log("error");
                    // })
                    SPopup.confirm({
                        title: "¿Seguro que quieres eliminar el label " + label?.descripcion + "?",
                        message: "",
                        onPress: () => {
                            a.estado = 0;
                            SSocket.sendPromise({
                                component: "tarea_label",
                                type: "editar",
                                data: a,
                                key_tarea: this.props.key_tarea,
                                key_empresa: Model.empresa.Action.getKey(),
                                key_usuario: Model.usuario.Action.getKey()
                            }).then(e => {
                                this.setState({ ...this.state })
                                console.log("Exito");
                            }).catch(e => {
                                console.log("error");
                            })
                        }
                    })
                }}>
                    <SView center width={18} height={18} style={{ position: "absolute", right: -7, top: -9, backgroundColor:STheme.color.danger, borderRadius:40 }}>
                        <SIcon name='eliminar2' width={8} height={8} fill={STheme.color.white} />

                    </SView>
                    <SText fontSize={12} >{label?.descripcion}</SText>
                </SView>
            }}
        />
    }
    render() {
        return <SView col={"xs-12"}>
            <SView col={"xs-12"} row center>
                <SText fontSize={12} bold color={STheme.color.gray}>Labels</SText>
                <SView flex />
                <SView padding={6} width={28} height={28} onPress={() => {
                    SNavigation.navigate("/ajustes/label", {
                        onSelect: (e) => {
                            SSocket.sendPromise({
                                component: "tarea_label",
                                type: "registro",
                                key_tarea: this.props.key_tarea,
                                key_label: e.key,
                                // data: {
                                //     key_label: e.key
                                // },
                                key_empresa: Model.empresa.Action.getKey(),
                                key_usuario: Model.usuario.Action.getKey(),
                            }).then(e => {
                                this.state.data[e.data.key] = e.data;
                                this.setState({ ...this.state })
                                console.log("Exito");
                            }).catch(e => {
                                console.log("error");
                            })
                        }
                    })
                }}>
                    <SIcon name='tareaengranaje' fill={STheme.color.gray} />
                </SView>
            </SView>
            <SHr h={8} />
            {this.getLista()}
        </SView>
    }
}

// const initStates = (state) => {
//     return { state }
// };
// export default connect(initStates)(UsuariosAsigandos);