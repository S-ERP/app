import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SList, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

export default class UsuariosNota extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentDidMount() {
        SSocket.sendPromise({
            component: "nota_usuario",
            type: "getAll",
            key_nota: this.props.key_nota

        }).then(e => {
            let keys = Object.values(e.data).map(a => a.key_usuario);
            SSocket.sendPromise({
                version: "2.0",
                service: "usuario",
                component: "usuario",
                type: "getAllKeys",
                keys: keys,
            }).then(e2 => {
                // this.setState(e);
                Object.values(e.data).map(a => {
                    a.usuario = e2?.data[a.key_usuario]?.usuario ?? {}
                })
                this.setState({ data: e.data })
            })

        })
    }

    usuarioItem = ({ key_usuario, usuario, onPress }) => {
        return <SView width={80} height={80} center row>
            <SView style={{ width: 60, height: 60, borderRadius: 100, }} onPress={onPress}>
                <SView style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: STheme.color.card,
                    backgroundColor: STheme.color.card,
                    overflow: "hidden"
                }}>

                    <SImage src={Model.usuario._get_image_download_path(SSocket.api, key_usuario)} />
                </SView>
                {/* <SView style={{
                    width: 14,
                    height: 14,
                    borderRadius: 100,
                    backgroundColor: STheme.color.success,
                    position: "absolute",
                    bottom: 0,
                    right: 0
                }} /> */}
            </SView>
            <SText color={"#000"} fontSize={10} center row height={13} style={{
                overflow: 'hidden',
            }}>{usuario?.Nombres}</SText>

        </SView>
    }
    render() {
        return <SView col={"xs-12"} height={85} >
            <SList
                horizontal
                data={{
                    "add": {
                        key_usuario: "asd",
                        usuario: { Nombres: "Invitar" },
                        onPress: () => {
                            SNavigation.navigate("/usuario", {
                                onSelect: (usuario) => {
                                    SSocket.sendPromise({
                                        component: "nota_usuario",
                                        type: "registro",
                                        data: {
                                            key_usuario: usuario.key,
                                            key_nota: this.props.key_nota
                                        },
                                        key_usuario: Model.usuario.Action.getKey(),
                                        key_empresa: Model.empresa.Action.getKey()
                                    }).then(e => {
                                        this.componentDidMount();
                                    })
                                }
                            })
                        }
                    },
                    ...this.state.data
                }}
                space={0}
                render={(a) => this.usuarioItem(a)}
            />
            <SHr h={1} color='#66666644' />
        </SView>
    }
}
