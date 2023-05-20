import React, { Component } from 'react';
import { SImage, SLoad, SMath, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'


export default class Producto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            producto: props.producto,
            index: props.index
        };

    }

    sendToServer(producto) {
        console.log(producto)
        return;
        SSocket.sendPromise({
            service: "compra_venta",
            component: "cuota",
            type: "verificar",
            data: producto
        }).then(e => {
            // console.log(e);
            this.state.producto.verificado = true;
            this.setState({ ...this.state.producto });
        }).catch(e => {
            producto = { ...this.state.producto };
            this.state.producto.verificado = e.error;
            this.setState({ ...this.state.producto });
            console.error(e);
        })
        return;
        SSocket.sendPromise({
            service: "inventario",
            component: "producto",
            type: "verificar",
            data: producto
        }).then(e => {
            // console.log(e);
            this.state.producto.verificado = true;
            this.setState({ ...this.state.producto });
        }).catch(e => {
            producto = { ...this.state.producto };
            this.state.producto.verificado = e.error;
            this.setState({ ...this.state.producto });
            console.error(e);
        })
    }

    presCuotas(producto, tipo) {
        producto.open = tipo;
        this.setState({ ...producto });
    }

    getCuotas() {
        if (!this.state.producto.open) {
            return <><SText margin={10} color={STheme.color.blue} underLine onPress={() => { this.presCuotas(this.state.producto, true) }}>Cuotas</SText>  </>
        }
        return <>
            <SText margin={10} color={STheme.color.blue} underLine onPress={() => { this.presCuotas(this.state.producto, false) }}>Cerrar</SText>
            {
                this.state.producto.cuotas.map((cuota, i) => {
                    // console.log(cuota);
                    return <SView flex key={i + ""} row width={300} center>
                        <SText width={50} padding={5}># {i}</SText>
                        <SText width={100} padding={5}>{cuota["FECHA  PAGO"]}</SText>
                        <SText width={100} padding={5}>{SMath.formatMoney(cuota["AMORT."])}</SText>
                    </SView>
                })
            }

        </>
    }

    verificarOk() {
        let send = {};
        send["marca"] = this.state.producto["MARCA:"];
        send["modelo"] = this.state.producto["MODELO:"];
        send["chasis"] = this.state.producto["CHASIS:"];
        send["motor"] = this.state.producto["MOTOR:"];
        this.sendToServer(send)
        this.state.producto.verificado = "verificando";
        this.setState({ ...this.state.producto });

    }

    card() {
        if (!this.state.producto.verificado) return this.cardNormal("")
        if (this.state.producto.verificado === "verificando") return this.cardNormal("cargando")
        if (this.state.producto.verificado === true) return this.cardSussed()
        return this.cardError(this.state.producto.verificado)
    }

    cardError(error) {
        return <SView key={this.state.index} margin={20} border={1} style={{ borderWidth: 1, borderColor: STheme.color.warning }} backgroundColor={STheme.color.card} padding={10} borderRadius={15} width={300}>
            {error === "no_existe_marca" ? <SText color={STheme.color.warning} margin={5}>{this.state.producto["MARCA:"]}</SText> : <SText margin={5}>{this.state.producto["MARCA:"]}</SText>}
            {error === "no_existe_modelo" ? <SText color={STheme.color.warning} margin={5}>{this.state.producto["MODELO:"]}</SText> : <SText margin={5}>{this.state.producto["MODELO:"]}</SText>}
            {(error === "no_existe_chasis" || error === "chasis_duplicado") ? <SText color={STheme.color.warning} margin={5}>{this.state.producto["CHASIS:"]}</SText> : <SText margin={5}>{this.state.producto["CHASIS:"]}</SText>}
            {(error === "no_existe_motor" || error === "motor_duplicado") ? <SText color={STheme.color.warning} margin={5}>{this.state.producto["MOTOR:"]}</SText> : <SText margin={5}>{this.state.producto["MOTOR:"]}</SText>}
            <SText margin={5}>{this.state.producto["FRV:"]}</SText>
            <SText margin={5}>{this.state.producto["POLIZA"]}</SText>
            <SText margin={5}>{this.state.producto["COLOR:"]}</SText>
            <SText margin={5}>{this.state.producto["AÑO:"]}</SText>
            <SText margin={5}>{this.state.producto["CLIENTE"]}</SText>
            <SText color={STheme.color.warning} center >{error}</SText>


            {this.getCuotas()}
        </SView>

    }

    cardNormal(estado) {
        return <SView key={this.state.index} margin={20} border={1} backgroundColor={STheme.color.card} padding={10} borderRadius={15} width={300}>
            <SText margin={5}>{this.state.producto["MARCA:"]}</SText>
            <SText margin={5}>{this.state.producto["MODELO:"]}</SText>
            <SText margin={5}>{this.state.producto["CHASIS:"]}</SText>
            <SText margin={5}>{this.state.producto["MOTOR:"]}</SText>
            <SText margin={5}>{this.state.producto["FRV:"]}</SText>
            <SText margin={5}>{this.state.producto["POLIZA"]}</SText>
            <SText margin={5}>{this.state.producto["COLOR:"]}</SText>
            <SText margin={5}>{this.state.producto["AÑO:"]}</SText>
            <SText margin={5}>{this.state.producto["CLIENTE"]}</SText>
            {estado === "cargando" ? <SLoad /> : <SText onPress={() => { this.verificarOk() }} center color={STheme.color.danger}>Pendiente</SText>}


            {this.getCuotas()}
        </SView>

    }

    cardSussed() {
        return <SView key={this.state.index} margin={20} border={1} style={{ borderWidth: 1, borderColor: STheme.color.success }} backgroundColor={STheme.color.card} padding={10} borderRadius={15} width={300}>
            <SText margin={5}>{this.state.producto["MARCA:"]}</SText>
            <SText margin={5}>{this.state.producto["MODELO:"]}</SText>
            <SText margin={5}>{this.state.producto["CHASIS:"]}</SText>
            <SText margin={5}>{this.state.producto["MOTOR:"]}</SText>
            <SText margin={5}>{this.state.producto["FRV:"]}</SText>
            <SText margin={5}>{this.state.producto["POLIZA"]}</SText>
            <SText margin={5}>{this.state.producto["COLOR:"]}</SText>
            <SText margin={5}>{this.state.producto["AÑO:"]}</SText>
            <SText margin={5}>{this.state.producto["CLIENTE"]}</SText>
            <SText center color={STheme.color.success}>Exito</SText>

            {this.getCuotas()}
        </SView>

    }

    render() {
        return <SView center card>
            {this.card()}
        </SView>
    }
}
