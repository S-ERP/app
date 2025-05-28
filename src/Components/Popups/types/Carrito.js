import React, { Component } from 'react';
import { SForm, SGradient, SHr, SImage, SLoad, SMath, SNavigation, SPage, SPopup, SStorage, SText, STheme, SView, SIcon, SThread } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';
import Close from '../Components/Close';

type PropsType = {
    label?: String, body?: String,
    onPress?: any
}

export default class Carrito extends Component<PropsType> {
    static POPUP_CODE = "CARRITO_POPUP";
    static open(props: PropsType) {
        SPopup.open({
            key: this.POPUP_CODE,
            content: <Carrito {...props} />
        })
    }
    static close() {
        SPopup.close(this.POPUP_CODE)
    }
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    componentWillUnmount() {
        if (this.props.onPress) this.props.onPress()
        if (!this.isAction) {
            SNavigation.goBack();
        }
    }

    calcularDescuento(monto, key_restaurante) {
        SSocket.sendPromise({
            component: "descuento",
            type: "calcularDescuento",
            monto_delivery: 0,
            monto_producto: monto,
            key_restaurante: key_restaurante
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
        const { productos } = Model.carrito.Action.getState();
        const arrprd = Object.values(productos ?? {});
        const key_empresa = arrprd[0]?.data?.key_empresa
        const empresa = Model.empresa.Action.getByKey(key_empresa)


        // const productos = Model.carrito.Action.getState()?.productos;
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
            // this.calcularDescuento(total, key_restaurante);
        }


        return <SView width={362} center style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: STheme.color.lightGray,
        }} withoutFeedback backgroundColor={STheme.color.background}   >
            {/* <Close onPress={this.POPUP_CODE} /> */}
            <Close onPress={() => {
                Carrito.close();
            }} />

            <SHr height={15} />
            {/* <SText fontSize={20} bold>Este es tu carrito</SText> */}
            <SView row col={"xs-11"}>
                <SIcon name={"Canasta"} width={40} height={40} fill={STheme.color.primary} />
                <SView width={15} />
                <SView center >
                    <SText fontSize={21} font='Montserrat-ExtraBold'>Este es tu carrito</SText>
                </SView>
            </SView>
            <SView row col={"xs-11"} height={2} style={{
                borderBottomWidth: 2,
                borderColor: STheme.color.primary,
                alignItems: "flex-end",
                position: "absolute",
                top: 49,
                right: 0
            }} />
            <SHr />
            <SHr />
            <SView col={"xs-11"} row padding={4}>
                <SView width={50} height={50} card>
                    <SImage src={SSocket.api.empresa + "empresa/" + key_empresa} />
                </SView>
                <SView width={8} />
                <SView flex>
                    <SText col={"xs-12"} color={STheme.color.darkGray} style={{ fontSize: 16 }} font='Montserrat-SemiBold'  >{empresa?.razon_social}</SText>
                    <SView col={"xs-12"} row>
                        <SText color={STheme.color.gray} fontSize={11}>{cantidad_productos} items </SText>
                        <SView width={32} />
                        <SText color={STheme.color.gray} fontSize={11}>Bs. {SMath.formatMoney(total)}{this.state?.descuento ? "  -  Bs. " + this.state?.descuento : ""}</SText>
                    </SView>
                </SView>
            </SView>

            <SHr height={20} />
            <SView col={"xs-12"} row style={{
                justifyContent: "space-around"
            }}>
                <SView width={155} height={34} center backgroundColor={STheme.color.primary} style={{ borderRadius: 8 }}
                    onPress={() => {
                        this.isAction = true;
                        Model.carrito.Action.removeAll();
                        Carrito.close();
                    }}  >
                    <SText font={'Montserrat-Medium'} fontSize={10} color={STheme.color.white}>Vaciar carrito</SText>
                </SView>
                <SView width={155} height={34} center backgroundColor={"#DDD"} style={{ borderRadius: 8 }}
                    onPress={() => {
                        this.isAction = true;
                        SNavigation.goBack();
                        new SThread(300, "volviendo").start(() => {
                            SNavigation.navigate("/restaurante", { pk: key_empresa })
                        })
                        Carrito.close();
                    }}  >
                    <SText font={'Montserrat-Medium'} fontSize={10} color={STheme.color.gray}>Continuar pedido del carrito</SText>
                </SView>
            </SView>
            <SHr height={15} />
        </SView>
    }
}