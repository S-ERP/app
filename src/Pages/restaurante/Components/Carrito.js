import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { SMath, SNavigation, SText, STheme, SView } from 'servisofts-component'
import { Container } from '../../../Components'
import { connect } from 'react-redux'
import Model from '../../../Model'
import SSocket from 'servisofts-socket'
import Popups from '../../../Components/Popups'

class Carrito extends Component {
    state = {

    }
    componentDidMount() {
        const carrito = Model.carrito.Action.getState()
        if (carrito.productos) {
            console.log(carrito.productos)
            let firstItem = Object.values(carrito.productos)[0];
            if (firstItem) {
                const kr = firstItem?.data?.key_empresa;
                if (kr != this.props.key_empresa) {
                    Popups.Carrito.open({
                        onPress: () => {
                        }
                    });
                    return;
                    // this.setState({})
                }
            }

        }
        //CARRITO ANTES
        // if (carrito.productos) {
        //     let firstItem = Object.values(carrito.productos)[0];
        //     if (firstItem) {
        //         const kr = firstItem?.data?.key_restaurante;
        //         if (kr != this.props.key_restaurante) {
        //             Popups.Carrito.open({
        //                 onPress: () => {
        //                 }
        //             });
        //             return;
        //         }
        //     }
        // }


        // console.log(carrito);
        // SSocket.sendPromise({
        //     component: "restaurante",
        //     type: "getCarrito",
        //     carrito: carrito?.productos ?? {},
        //     key_usuario: Model.usuario.Action.getKey(),
        // }).then(e => {
        //     let data = Object.values(e.carrito ?? {})
        //     let cambioProductos = data.filter(a => ((a.disponible == false)))
        //     if ((e.carrito?.tapeke?.disponible == 0) || (e.carrito?.tapeke?.cantidad > e.carrito?.tapeke?.disponible) || cambioProductos.length > 0) {
        //         Popups.CarritoAlert.open({ data: e })
        //     }
        // }).catch(e => {
        //     console.error(e)
        // })
    }
    calcularDescuento(monto) {
        SSocket.sendPromise({
            component: "descuento",
            type: "calcularDescuento",
            monto_delivery: 0,
            monto_producto: monto,
            key_empresa: this.props.key_empresa
        }).then((e) => {

            this.state.descuentos = e.data;
            let total_descuento_delivery = 0;
            let total_descuento_producto = 0;

            this.state.descuentos.map(a => {
                total_descuento_delivery += a.total_descuento_delivery;
                total_descuento_producto += a.total_descuento_producto;
            })
            console.log(total_descuento_producto)
            this.setState({ descuento: total_descuento_producto })
            // this.handlePress(1)
            // this.setState({ ...this.state })
        }).catch(e => {
            console.error(e);
        })
    }
    render() {
        const productos = Model.carrito.Action.getState()?.productos;
        let cantidad_productos = 0;
        let total = 0;
        console.log(productos)
        Object.values(productos).map(p => {
            cantidad_productos += p.cantidad;
            total += ((p?.data?.precio - ((p?.data?.precio ?? 0) * (p?.data?.descuento_porcentaje ?? 0)) - (p?.data?.descuento_monto ?? 0)) * p.cantidad) + (p?.data?.monto_total_subproducto_detalle ?? 0);
        })
        if (!cantidad_productos) return <SView />
        if (this.state.total != total) {
            this.state.total = total;
            // this.calcularDescuento(total);
        }
        return (<SView
            col={"xs-12"}
            height={50}
            style={{borderTopWidth: 3, borderTopColor: STheme.color.background}}
            backgroundColor={STheme.color.primary} center>
            <Container height>
                <SView col={"xs-12"} row height center>
                    <SView flex center>
                        <SView col={"xs-12"}>
                            <SText color={STheme.color.white} fontSize={16}>Total productos: {cantidad_productos}</SText>
                            <SText color={STheme.color.white} fontSize={16}>Total Bs. {SMath.formatMoney(total)}{this.state?.descuento ? "  -  Bs. " + this.state?.descuento : ""}</SText>
                        </SView>
                    </SView>
                    <SView center>
                        <SView width={170} height={30} backgroundColor={"#fff"} center style={{
                            borderRadius: 4
                        }} onPress={() => {
                            SNavigation.navigate('/restaurante/reserva', {
                                pk: this.props.key_restaurante,
                            });
                        }}>
                            <SText color={STheme.color.primary} fontSize={16} font='Montserrat-Bold'>REALIZAR PEDIDO</SText>
                        </SView>
                    </SView>
                </SView>
            </Container>
        </SView>
        )
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(Carrito);