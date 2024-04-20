import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SInput, SNavigation, SPopup, SText, SThread, SUuid, SView } from 'servisofts-component';
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
                component: "producto_ingrediente",
                type: "getAll",
                key_producto: this.props.key_producto,
                key_usuario: Model.usuario.Action.getKey(),
            }).then(e => {
                if (!e.data) return;
                Object.values(e.data).map(a => {
                    a.modelo = this.state.modelos[a.key_modelo]
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
            <SView col={"xs-5"} padding={4}>
                <SInput type='money' icon={<SText>x</SText>} defaultValue={this.state?.data[obj.key]?.cantidad} placeholder={"0.00"} onChangeText={(e) => {

                    new SThread(2000, "hilo_send", true).start(() => {
                        if (e == obj.cantidad) return;
                        this.save({
                            key_producto: obj.key_producto,
                            key_modelo: obj.key_modelo,
                            cantidad: e
                        })
                    })
                }} />
            </SView>
        </SView>
    }

    save(data) {
        SSocket.sendPromise({
            service: "inventario",
            component: "producto_ingrediente",
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
        return <SView col={"xs-12"} row>
            <SHr />
            <SText bold>Ingredientes</SText>
            <SView width={20} onPress={() => {
                SNavigation.navigate("/productos/modelo", {
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
                            key_producto: this.props.key_producto,
                            key_modelo: modelo.key,
                            cantidad: "1.00"
                        })



                    }
                })
            }}><SIcon name='Add' /></SView>
            <SView col={"xs-12"}>
                {Object.values(this.state.data).map((a, i) => {
                    return this.item(a)
                })}
            </SView>
            <SHr />
        </SView>
    }
}
