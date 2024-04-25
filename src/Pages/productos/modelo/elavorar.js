import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SButtom, SHr, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import SList from 'servisofts-component/Component/SList2';
import { Container } from '../../../Components';
import Ingrediente from './Components/Ingrediente';
import Sucursal from '../../../Components/empresa/sucursal';

export default class elavorar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk");
        this.key_sucursal = SNavigation.getParam("key_sucursal");
        this.key_almacen = SNavigation.getParam("key_almacen", "4b86e776-26f9-48c3-a733-32c9d646c80f");
    }


    loadData(key_sucursal) {
        SSocket.sendPromise({
            service: "inventario",
            component: "modelo",
            type: "buscarIngredientes",
            key_modelo: this.pk,
            key_usuario: Model.usuario.Action.getKey(),
            key_sucursal: key_sucursal,
        }).then(a => {
            // SNotification.send({
            //     title: "Exito",
            //     body: "Se creo con exito",
            //     color: STheme.color.success,
            //     time: 5000,
            // })
            this.setState({ data: a.data })
        }).catch(e => {
            SNotification.send({
                title: "Error",
                body: e?.error,
                color: STheme.color.danger,
                time: 5000,
            })
        })
    }

    renderItem = (itm) => {
        return <SView style={{ width: "100%", }} padding={8} card>
            <SText>{itm.modelo} X {itm.cantidad}</SText>
            <SText color={STheme.color.lightGray} fontSize={8}>{itm.key_almacen}</SText>
            {/* <SText>{JSON.stringify(itm, "\n", "\t")}</SText> */}
        </SView>
    }
    renderElementos() {
        if (!this.state.data) return <SLoad />
        return <SList data={this.state.data}
            render={this.renderItem.bind(this)} />
    }
    render() {
        return <SPage title={"Elaborar"}>
            <Container>
                <SHr />
                <Sucursal.Select defaultValue={this.key_sucursal} onChange={e => {
                    this.loadData(e.key)
                    this.setState({ sucursal: e })
                }} />
                {!this.state.sucursal ? null :
                    <>
                        <Ingrediente key_modelo={this.pk} />
                        <SHr />
                        <SText>DISPONIBLES</SText>
                        <SHr />
                        {this.renderElementos()}
                        <SView col={"xs-12"}>
                            <SView flex>
                                <SInput ref={ref => this.almacen = ref} label={"Almacen"} defaultValue={this.key_almacen} onPress={() => {
                                    SNavigation.navigate("/inventario/almacen", {
                                        onSelect: (e) => {
                                            this.key_almacen = e.key;
                                            this.almacen.setValuze(e.key)
                                        }
                                    })
                                }} />
                            </SView>
                            <SHr />
                            <SView row>
                                <SView flex padding={8}>
                                    <SInput ref={ref => this.cantidad = ref} label={"Cantidad"} defaultValue={1} />
                                </SView>
                                <SView flex padding={8}>
                                    <SInput type='money' ref={ref => this.precio_compra = ref} label={"Precio"} defaultValue={1.0} />
                                </SView>
                            </SView>
                        </SView>

                        <SHr />
                        <SText onPress={() => {
                            SSocket.sendPromise({
                                service: "inventario",
                                component: "modelo",
                                type: "procesar",
                                key_modelo: this.pk,
                                key_sucursal: this.key_sucursal,
                                key_almacen: this.key_almacen,
                                key_empresa: Model.empresa.Action.getKey(),
                                key_usuario: Model.usuario.Action.getKey(),
                                cantidad: this.cantidad.getValue(),
                                precio_compra: this.precio_compra.getValue(),
                                precio_venta: this.precio_compra.getValue(),

                            }).then(e => {
                                SNotification.send({
                                    title: "Procesar producto",
                                    body: "Producto procesado con exito",
                                    time: 5000,
                                    color: STheme.color.success
                                })
                            }).catch(e => {
                                SNotification.send({
                                    title: "Procesar producto",
                                    body: e.error,
                                    time: 5000,
                                    color: STheme.color.danger
                                })
                            })
                        }} card padding={8}>PROCESAR</SText>
                    </>
                }
            </Container>
        </SPage>
    }
}
