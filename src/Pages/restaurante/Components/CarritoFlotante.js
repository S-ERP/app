import React, { Component, useEffect, useRef } from 'react'
import { SHr, SImage, SList, SList2, SNavigation, SScrollView2, SText, STheme, SView } from 'servisofts-component'
import { Container } from '../../../Components';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import { ScrollView } from 'react-native';
import Cantidad from '../../../Components/Cantidad';
import Cantidad2 from '../../../Components/Cantidad2';

export default class CarritoFlotante extends Component {
    static _INSTACE;
    static open(data) {
        CarritoFlotante._INSTACE.setState({ open: true, data: data })
    }
    state = {
        open: false,

        // open: true,
        // data: {
        //     "descripcion": "Un Delicioso corte de carne de la mas alta calidad. ",
        //     "estado": 1,
        //     "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //     "fecha_on": "2024-01-19T15:08:03.00004",
        //     "index": 1,
        //     "nombre": "Punta de S",
        //     "key_categoria_producto": "527a528d-35f6-4bbb-a288-8e0421e26835",
        //     "ley_seca": false,
        //     "precio": 54,
        //     "habilitado": true,
        //     "sub_productos": [
        //         {
        //             "descripcion": "Sub Producto de Prueba",
        //             "estado": 1,
        //             "key_producto": "64463316-243a-443f-af84-af68d499bb18",
        //             "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //             "sub_producto_detalles": [
        //                 {
        //                     "descripcion": "Bien Cocido",
        //                     "estado": 1,
        //                     "key_sub_producto": "74705d1e-46ad-4dd0-b9e5-52ff507ff280",
        //                     "precio": 0,
        //                     "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //                     "fecha_on": "2024-01-23T11:24:08.000522",
        //                     "index": null,
        //                     "nombre": "Bien Cocido",
        //                     "key": "4b85550b-fff2-4803-a59a-4e96ea16c37d"
        //                 },
        //                 {
        //                     "descripcion": "Termino 3/4",
        //                     "estado": 1,
        //                     "key_sub_producto": "74705d1e-46ad-4dd0-b9e5-52ff507ff280",
        //                     "precio": 0,
        //                     "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //                     "fecha_on": "2024-01-23T11:26:56.00053",
        //                     "index": null,
        //                     "nombre": "Termino 3/4",
        //                     "key": "c8ec69e2-3c87-4335-8976-832e3a88b531"
        //                 },
        //                 {
        //                     "descripcion": "Termino a la inglesa",
        //                     "estado": 1,
        //                     "key_sub_producto": "74705d1e-46ad-4dd0-b9e5-52ff507ff280",
        //                     "precio": 0,
        //                     "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //                     "fecha_on": "2024-01-23T11:27:09.00046",
        //                     "index": null,
        //                     "nombre": "Termino a la inglesa",
        //                     "key": "767bfba0-a319-4059-a13f-4fa3896c0492"
        //                 },
        //                 {
        //                     "descripcion": "Termino Medio",
        //                     "estado": 1,
        //                     "key_sub_producto": "74705d1e-46ad-4dd0-b9e5-52ff507ff280",
        //                     "precio": 1,
        //                     "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //                     "fecha_on": "2024-01-23T11:26:42.000957",
        //                     "index": null,
        //                     "nombre": "Termino Medio",
        //                     "key": "013ebf7b-a14f-41d9-90be-9301ff32f831"
        //                 }
        //             ],
        //             "fecha_on": "2024-01-23T11:07:51.000912",
        //             "index": 1,
        //             "nombre": "Termino",
        //             "key": "74705d1e-46ad-4dd0-b9e5-52ff507ff280",
        //             "cantidad_seleccion": 1
        //         },
        //         {
        //             "descripcion": "Deliciosas guarniciones",
        //             "estado": 1,
        //             "key_producto": "64463316-243a-443f-af84-af68d499bb18",
        //             "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //             "sub_producto_detalles": [
        //                 {
        //                     "descripcion": "fddfas",
        //                     "estado": 1,
        //                     "key_sub_producto": "e9fff9b1-1f3d-4801-8fb8-1c9ff1ca1528",
        //                     "precio": 5,
        //                     "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //                     "fecha_on": "2024-02-16T18:22:34.000392",
        //                     "index": 1,
        //                     "nombre": "guarnicion 1",
        //                     "key": "07cb0e81-a945-4d20-99a0-7ec61a5c969e"
        //                 },
        //                 {
        //                     "descripcion": "dfasfa",
        //                     "estado": 1,
        //                     "key_sub_producto": "e9fff9b1-1f3d-4801-8fb8-1c9ff1ca1528",
        //                     "precio": null,
        //                     "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //                     "fecha_on": "2024-02-16T18:23:07.000542",
        //                     "index": 2,
        //                     "nombre": " guarnición 2",
        //                     "key": "1202faa3-1e1e-46f3-9af1-30c898ed8782"
        //                 },
        //                 {
        //                     "descripcion": "fgdfs",
        //                     "estado": 1,
        //                     "key_sub_producto": "e9fff9b1-1f3d-4801-8fb8-1c9ff1ca1528",
        //                     "precio": null,
        //                     "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //                     "fecha_on": "2024-02-16T18:23:17.000261",
        //                     "index": 3,
        //                     "nombre": "guarnición 3",
        //                     "key": "5627e9ef-c1ef-4986-9791-5d4960c6a4d4"
        //                 },
        //                 {
        //                     "descripcion": null,
        //                     "estado": 1,
        //                     "key_sub_producto": "e9fff9b1-1f3d-4801-8fb8-1c9ff1ca1528",
        //                     "precio": 1,
        //                     "key_usuario": "527a528d-35f6-4bbb-a288-8e0421e28887",
        //                     "fecha_on": "2024-02-16T18:23:28.000482",
        //                     "index": 4,
        //                     "nombre": "guarnición 4",
        //                     "key": "6e973924-1438-42e9-bb31-7414e2d1f7e9"
        //                 }
        //             ],
        //             "fecha_on": "2024-02-16T17:18:44.000816",
        //             "index": 2,
        //             "nombre": "Guarniciones",
        //             "key": "e9fff9b1-1f3d-4801-8fb8-1c9ff1ca1528",
        //             "cantidad_seleccion": 4
        //         }
        //     ],
        //     "key": "64463316-243a-443f-af84-af68d499bb18",
        //     "mayor_edad": false
        // }
    }
    componentDidMount() {
        CarritoFlotante._INSTACE = this;
    }

    monstrarSubProductos = (a) => {
        let arr = a.data.sub_productos
        if (!arr || !Array.isArray(arr)) {
            return null;
        }
        return arr.map(b => {
            let sp = b.sub_producto_detalle.map(c => c.cantidad + "x " + c.nombre)
            return <SText fontSize={10} color={STheme.color.gray}>{b.nombre}: {sp.join(", ")}</SText>
        })
    }
    render() {
        CarritoFlotante._INSTACE = this;
        if (!this.state.open) return null
        const productos = Model?.carrito?.Action.getState().productos ?? {};
        let arrCarrito = Object.values(productos).filter(a => a.key_producto == this.state?.data?.key);
        if (arrCarrito.length <= 0) {
            this.setState({ open: false })
            return null;
        }

        let cantidad = 0;
        arrCarrito.map(a => cantidad += (a?.cantidad ?? 0))

        return <SView col={"xs-12"} height style={{
            position: "absolute",
            bottom: 0,
            backgroundColor: "#00004466",
        }} center >
            <SView flex col={"xs-12"} onPress={() => {
                this.setState({ open: false })
            }}>

            </SView>
            <SView col={"xs-12 sm-11 md-9 lg-8 xl-6"} height={"50%"} style={{
                position: "absolute",
                bottom: 0,
                backgroundColor: STheme.color.background,
                borderTopRightRadius: 4,
                borderTopLeftRadius: 4,
                // maxHeight: "50%"
            }} >
                <SView row padding={8}>
                    <SView width={50} height={50}>
                        <SImage src={SSocket.api.root + "producto/" + this.state?.data?.key} />
                    </SView>
                    <SView width={16} />
                    <SView flex>
                        <SText font={"Montserrat-Bold"} fontSize={18} bold>{this.state.data.nombre}</SText>
                        <SText col={"xs-12"} fontSize={12} color={STheme.color.gray} style={{
                            maxHeight: 100,
                            overflow:"hidden"
                        }}>{this.state.data.descripcion}</SText>
                    </SView>
                </SView>
                <SHr h={1} color={STheme.color.card} />
                <SView flex >
                    {/* <SScrollView2> */}
                    <SList
                        padding={8}
                        data={arrCarrito}
                        space={16}


                        // scrollEnabled={false}
                        render={a => {


                            return <SView style={{
                                borderBottomWidth: 1,
                                borderColor: STheme.color.card
                            }} >
                                <SView col={"xs-12"} row>
                                    <SView width={50} height={50}>
                                        <SImage src={SSocket.api.root + "producto/" + this.state?.data?.key} />
                                    </SView>
                                    <SView width={16} />
                                    <SView flex>
                                        <SText fontSize={14}>{this.state.data.nombre}</SText>
                                        {this.monstrarSubProductos(a)}
                                    </SView>
                                    <SView >
                                        <SText fontSize={16} bold>Bs.{(((a?.data?.precio - ((a?.data?.precio ?? 0) * (a?.data?.descuento_porcentaje ?? 0)) - (a?.data?.descuento_monto ?? 0)) + (a?.data.monto_total_subproducto_detalle ?? 0)) * a.cantidad)}</SText>
                                    </SView>
                                </SView>
                                <SView col={"xs-12"} row>
                                    <SView flex />
                                    <Cantidad2 defaultValue={a.cantidad} limit={(a?.data?.limite_compra) - (cantidad - a.cantidad)} onChange={(e) => {
                                        console.log(e);
                                        if (!e) {
                                            Model.carrito.Action.removeItem(a.key)
                                        } else {
                                            // cantidad = e -
                                            cantidad += e - a.cantidad
                                            a.cantidad = e;
                                            Model.carrito.Action.setItem(a.key, a)
                                        }
                                        this.setState({ ...this.state })

                                    }} />
                                </SView>
                                <SHr />
                            </SView>
                        }}
                    />
                    {/* </SScrollView2> */}
                </SView>
                <SView col={"xs-12"} center padding={8} style={{
                    // position: "absolute",
                    // bottom: 0,
                    backgroundColor: STheme.color.background
                }} onPress={() => {
                    this.setState({ open: false })
                    SNavigation.navigate("/restaurante/sub_producto", this.state.data);
                }}>
                    <SText underLine>+ Agregar nueva personalización</SText>
                </SView>
            </SView>
        </SView>
    }
}