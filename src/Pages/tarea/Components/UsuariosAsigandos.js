import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SImage, SList, SList2, SLoad, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

// class UsuariosAsigandos extends Component {
export default class UsuariosAsigandos extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "tarea_usuario",
            type: "getAll",
            key_tarea: this.props.key_tarea,
            key_empresa: Model.empresa.Action.getKey()
        }).then(e => {
            this.setState({ data: e.data })
            console.log("Exito");
        }).catch(e => {
            console.log("error");
        })
    }
    getLista() {
        if (!this.state.data) return <SLoad />
        return <SList
            data={this.state.data}
            filter={a => a.estado > 0}
            render={(a) => {
                let usuario = Model.usuario.Action.getByKey(a.key_usuario)
                return <SView style={{ alignItems: "center" }} row

                >
                    <SView width={20} height={20} style={{
                        borderRadius: 100,
                        overflow: "hidden",
                        backgroundColor: STheme.color.card
                    }}
                        onPress={() => {
                            SNavigation.navigate("/usuario/profile", { pk: a.key_usuario })
                        }}
                    >
                        <SImage style={{ resizeMode: "cover" }} src={SSocket.api.root + "usuario/" + a.key_usuario} />
                    </SView>
                    <SView width={4} />
                    <SText fontSize={12}
                        onPress={() => {
                            SNavigation.navigate("/usuario/profile", { pk: a.key_usuario })
                        }}
                    >{usuario?.Nombres} {usuario?.Apellidos}</SText>
                    <SView width={8} />
                    <SView width={20} height={20} center
                        onPress={() => {
                            SPopup.confirm({
                                title: "¿Seguro que quieres eliminar al usuario " + usuario?.Nombres + "?",
                                message: usuario?.Nombres + " dejará de ver la tarea, si alguien es miembro de la tarea puede invitarlo nuevamente.",
                                onPress: () => {
                                    a.estado = 0;
                                    SSocket.sendPromise({
                                        component: "tarea_usuario",
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
                        }}
                    >
                        <SIcon name='remove' width={18} height={18} fill={STheme.color.danger} />
                    </SView>
                </SView>
            }}
        />
    }
    render() {
        return <SView col={"xs-12"}>
            <SView col={"xs-12"} row center>
                <SText fontSize={12} bold color={STheme.color.gray}>Usuarios Asignados</SText>
                <SView flex />
                <SView padding={6} width={28} height={28} onPress={() => {
                    SNavigation.navigate("/usuario", {
                        onSelect: (e) => {
                            SSocket.sendPromise({
                                component: "tarea_usuario",
                                type: "registro",
                                key_tarea: this.props.key_tarea,
                                data: {
                                    key_usuario: e.key
                                },
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