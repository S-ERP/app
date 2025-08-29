import React, { Component } from 'react';
import { SView, SText, STheme, SPopup, SNotification, SButtom, SHr } from 'servisofts-component';
import Carrito from '../Carrito';
export default class PopupCarritoFlotante extends Component {
    static refContenido = null;
    static open(props) {
        SPopup.open({
            key: "popup_carrito_flotante",
            type: 1,
            content: (
                <SView col="xs-10 sm-9" center backgroundColor={STheme.color.background} style={{
                    borderRadius: 8,
                    maxWidth: 400,
                    shadowColor: "#18181b",
                    shadowOffset: { width: 5, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 60,
                }} padding={24} withoutFeedback>
                    <ContenidoCarritoFlotante
                        ref={ref => (this.refContenido = ref)} // guardamos el ref
                        {...props} />
                </SView>
            )
        });
    }
    static closePopup() {
        SPopup.close("popup_carrito_flotante")
        this.refContenido?.vaciarCarrito?.(); // <- ahora sí funciona
    }
}
class ContenidoCarritoFlotante extends Component {
    carrito = [];
    descuentoManual = 0;
    componentDidMount() {
        this.loader();
    }
    loader() {
        this.carritoRefModal?.setCarrito?.(this.props.productos);
        this.forceUpdate();
    }
    vaciarCarrito() {
        // this.carritoRefModal?.setCarrito([]);
        // this.carrito.forEach(item => {
        //     this.carritoRefModal?.onModificarStock?.(item.key, +item.cantidad);
        // });
        this.descuentoManual = 0;
        this.carrito = [];
        this.carritoRefModal?.onModificarStock?.(null, 0);
        this.carritoRefModal?.setCarrito?.([]);
        SNotification.send({ title: "Carrito vaciado", message: "Todos los productos fueron removidos." });
        // this.forceUpdate();
    }
    render() {
        return (
            <SView col="xs-12" flex center>
                <SView height={8} />
                <SText fontSize={18} bold center>Carrito de d</SText>
                <SHr height={16} />
                <SView col="xs-12">
                    <Carrito
                        ref={(ref) => (this.carritoRefModal = ref)}
                        onModificarStock={(key, delta) => this.carritoRefModal?.modificarStock?.(key, delta)}
                    />
                </SView>
            </SView>
        );
    }
}
