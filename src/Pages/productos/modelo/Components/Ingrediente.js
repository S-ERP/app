import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SInput, SNavigation, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../../Model';

export default class Ingrediente extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {

            }
        };
    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "inventario",
            component: "modelo",
            type: "getAll",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
        }).then(resp => {
            this.state.modelos = resp.data;
            SSocket.sendPromise({
                service: "inventario",
                component: "modelo_ingrediente",
                type: "getAll",
                key_modelo: this.props.key_modelo,
                key_usuario: Model.usuario.Action.getKey(),
            }).then(e => {
                if (!e.data) return;
                Object.values(e.data).map(a => {
                    a.modelo = this.state.modelos[a.key_modelo_ingrediente]
                })
                this.setState({ data: e.data })
            }).catch(e => {

            })
        }).catch(e => {

        })

    }

    item(obj) {
        return <SView col={"xs-12"} row>
            <SView col={"xs-7"} padding={4}>
                <SInput type='text'
                    placeholder={"Seleccionar ingrediente"}
                    value={this.state?.data[obj.key]?.modelo?.descripcion}
                    editable={false}
                />
            </SView>
            <SView col={"xs-4"} padding={4}>
                <SInput type='money' icon={<SText>x</SText>} defaultValue={parseFloat(this.state?.data[obj.key]?.cantidad??0).toFixed(2)} placeholder={"0.00"} onChangeText={(e) => {

                    new SThread(2000, "hilo_send", true).start(() => {
                        console.log(e)
                        if (e == obj.cantidad) return;
                        this.save({
                            key_modelo_ingrediente: obj.key_modelo_ingrediente,
                            key_modelo: obj.key_modelo,
                            cantidad: e
                        })
                    })
                }} />
            </SView>
            <SView col={"xs-1"} center onPress={() => {
                SSocket.sendPromise({
                    service: "inventario",
                    component: "modelo_ingrediente",
                    type: "editar",
                    data: {
                        key: obj.key,
                        estado: 0,
                    },
                    key_modelo: this.props.key_modelo,
                    key_usuario: Model.usuario.Action.getKey(),
                }).then(e => {
                    if (!e.data) return;
                    delete this.state.data[e.data.key];
                    this.setState({ ...this.state })
                }).catch(e => {

                })
            }}>
                <SView width={20} height={20}>
                    <SIcon name='Close' fill={STheme.color.danger} />
                </SView>
            </SView>
        </SView>
    }

    save(data, modelo) {
        SSocket.sendPromise({
            service: "inventario",
            component: "modelo_ingrediente",
            type: "registro",
            data: data,
            key_usuario: Model.usuario.Action.getKey(),
        }).then(e => {
            this.state.data[e.data.key] = e.data;
            this.state.data[e.data.key].modelo = modelo;
            this.setState({ ...this.state })
        }).catch(e => {
            console.log(e);
        })
    }
    render() {
        return <SView col={"xs-12"} >
            <SHr />
            <SView col={"xs-12"} row>
                <SText bold>Ingredientes</SText>
                <SView flex />
                <SView col={"xs-1"} onPress={() => {
                    SNavigation.navigate("/productos/modelo/select", {
                        filter: (a) => {
                            if (a.key == this.props.key_modelo) return false;
                            if (this.state.data) {
                                console.log(this.state.data, a.key)
                                let finded = Object.values(this.state.data).find(b => b.key_modelo_ingrediente == a.key)
                                if (finded) return false;
                            }
                            return a.estado > 0;
                        },
                        onSelect: (modelo) => {
                            if (this.state.data[modelo.key]) {
                                SPopup.alert("El ingrediente ya existe");
                                return;
                            }
                            // this.state.data[e.key] = {
                            //     ...e,
                            //     cantidad: "1.00"
                            // };
                            this.save({
                                key_modelo_ingrediente: modelo.key,
                                key_modelo: this.props.key_modelo,
                                cantidad: "1.00"
                            }, modelo)



                        }
                    })
                }} center><SIcon name='Add' width={20} height={20} /></SView>
            </SView>
            <SHr />
            <SView col={"xs-12"}>
                {Object.values(this.state.data).map((a, i) => {
                    return this.item(a)
                })}
            </SView>
            <SHr />
        </SView>
    }
}
