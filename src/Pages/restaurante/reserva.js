import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SButtom, SHr, SImage, SInput, SMath, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
import { Btn, Container } from '../../Components';
import SSocket from 'servisofts-socket';
import producto from '../productos/producto';

export default class reserva extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handleGuardar() {
        const carrito = Model.carrito.Action.getState()
        const productos = []
        Object.values(carrito.productos).map((prd) => {
            productos.push({
                key: prd.key_producto,
                cantidad: prd.cantidad,
                precio: prd.data.precio
            })
        })

        SNotification.send({
            key: "guardar_producto",
            title: "Realizando venta",
            body: "Porfavor espere...",
            type: "loading"
        })
        SSocket.sendPromise({
            service: "compra_venta",
            component: "compra_venta",
            type: "ventaRapida",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            data: {
                // key_sucursal:"",
                // cliente:"",
                productos: productos,
            },

        }).then(e => {
            if (e.estado != "exito") throw { error: "No se recibio exito como respuesta." }
            SNotification.remove("guardar_producto")
            SNotification.send({
                title: "Realizando venta",
                body: "Porfavor espere...",
                color: STheme.color.success,
                time: 5000
            })
        }).catch(e => {
            SNotification.remove("guardar_producto")
            SNotification.send({
                title: "Realizando venta",
                body: e?.error ?? "Error al realizar venta.",
                color: STheme.color.danger,
                time: 5000
            })
        })
    }
    renderProductos({ productos }) {
        if (!productos) return <SText>{"No Hay productos"}</SText>
        return <FlatList data={Object.values(productos)}
            style={{ width: "100%" }}
            ItemSeparatorComponent={() => <SView height={16} />}
            renderItem={({ index, item }) => {
                console.log(item);
                const { key, key_producto, cantidad, data } = item;
                return <SView col={"xs-12"} row height={40} style={{
                    borderBottomWidth: 1,
                    borderColor: "#66666644"
                }} >
                    <SView width={40} height={40}>
                        <SImage src={SSocket.api.inventario + "producto/" + key_producto + "?time=" + new Date().getTime()}
                            style={{
                                borderRadius: 4,
                                resizeMode: "cover"
                            }} />
                    </SView>
                    <SView width={8} />
                    <SView flex>
                        <SText fontSize={16}>{data.nombre}</SText>
                        <SView row>
                            <SText color={STheme.color.gray}>Bs. {SMath.formatMoney(data.precio)}</SText>
                            <SText color={STheme.color.gray}>{"  x  "}</SText>
                            <SText color={STheme.color.gray}>{cantidad}</SText>
                        </SView>
                    </SView>
                    <SView>
                        <SText color={STheme.color.gray} fontSize={16}>{SMath.formatMoney(cantidad * data.precio)}</SText>
                    </SView>
                </SView>
            }}

            ListFooterComponent={() => {
                return <SView col={"xs-12"} row style={{
                    borderTopWidth: 1,
                    borderColor: "#444",
                    marginTop: 20,
                    paddingTop: 8
                }}>
                    <SView flex>
                        <SText bold fontSize={16}>{"Total"}</SText>
                    </SView>
                    <SView>
                        <SText bold fontSize={16}>{SMath.formatMoney(10)}</SText>
                    </SView>
                </SView>
            }}
        />
    }

    renderDetalleCliente() {
        return <SView col={"xs-12"} center >
            <SText color={STheme.color.gray} col={"xs-12"}>{"Datos del cliente"}</SText>
            <SInput icon={<SText bold>{"Nit :"}</SText>} placeholder={"S/N"} />
            <SInput icon={<SText bold>{"R.S.:"}</SText>} placeholder={"S/N"} />
        </SView>
    }
    render() {
        //VERIFICANDO SI HAY PEDIDOS PENDIENTES
        const carrito = Model.carrito.Action.getState()
        return <SPage title={""}>
            <Container>
                <SHr h={32} />
                <SView col={"xs-12"} card center>
                    <SHr />
                    <SText fontSize={16} bold>{"Comfirmacion de venta"}</SText>
                    <SHr />
                </SView>
                <SHr h={32} />
                <SText color={STheme.color.gray} col={"xs-12"}>{"Productos"}</SText>
                <SView col={"xs-12"} card padding={8}>
                    {this.renderProductos(carrito)}
                </SView>
                <SHr h={32} />
                {this.renderDetalleCliente()}
                <SHr h={32} />
                {/* <SText>{JSON.stringify(carrito, "\n", "\t")}</SText> */}
                <Btn width={100} onPress={this.handleGuardar.bind(this)}>{"Guardar"}</Btn>
            </Container>
        </SPage>
    }
}
