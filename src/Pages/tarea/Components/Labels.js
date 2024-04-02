import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SImage, SList, SList2, SLoad, SNavigation, SText, STheme, SView } from 'servisofts-component';
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
        return <SList2
            horizontal
            scrollEnabled={false}
            data={this.state.data}
            filter={a => a.estado > 0}
            render={(a) => {
                let usuario = Model.usuario.Action.getByKey(a.key_usuario)
                return <SView style={{ alignItems: "center", borderRadius: 100, padding: 4, margin:2, backgroundColor: STheme.color.danger }} row onPress={(e) => {

                }}>
                    <SText fontSize={12}>{usuario?.Nombres} {usuario?.Apellidos}</SText>
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
                    SNavigation.navigate("/usuario", {
                        onSelect: (e) => {
                            // SSocket.sendPromise({
                            //     component: "tarea_usuario",
                            //     type: "registro",
                            //     key_tarea: this.props.key_tarea,
                            //     data: {
                            //         key_usuario: e.key
                            //     },
                            //     key_empresa: Model.empresa.Action.getKey(),
                            //     key_usuario: Model.usuario.Action.getKey(),
                            // }).then(e => {
                            //     this.state.data[e.data.key] = e.data;
                            //     this.setState({ ...this.state })
                            //     console.log("Exito");
                            // }).catch(e => {
                            //     console.log("error");
                            // })
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