import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SelectTipoPago from './SelectTipoPago';
import TotalTipoPago from './TotalTipoPago';
import DetalleItem from './DetalleItem';
import MenuAcciones from './MenuAcciones';


export default class Abierta extends Component {

    state = {
        movimientos: []
    }
    componentDidMount() {
        this.loadData();
        this.ondetallechange = MDL.caja.addEventListener("onDetalleChange", () => {
            this.loadData();
        })
        MDL.empresa.getTipoPago().then((tipo_pago) => {
            this.setState({ tipo_pago });
        })
    }
    componentWillUnmount() {
        MDL.caja.removeEventListener(this.ondetallechange);
    }
    loadData() {
        MDL.caja.getDetalle(this.props.caja.key).then(movimientos => {
            movimientos.sort((a, b) => {
                return new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() - new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime();
            })
            this.setState({ movimientos });
        });
    }

    cerrar_caja() {
        const { caja } = this.props
        SNotification.send({
            key: "caja_cerrar",
            title: "Cargando",
            type: "loading",
        })
        MDL.caja.cerrar({
            key: caja.key,
            key_punto_venta: caja.key_punto_venta,
        }).then(e => {
            SNotification.remove("caja_cerrar");
        }).catch(e => {
            SNotification.send({
                key: "caja_cerrar",
                title: "Error al cerrar caja",
                body: e.error,
                color: STheme.color.danger,
                time: 5000
            })
        })
    }

    render() {
        return (
            <SView col={"xs-12"} center flex>
                {/* <SText>{JSON.stringify(this.props.caja)}</SText> */}

                <FlatList
                    style={{
                        flex: 1,
                        width: "100%",
                    }}

                    data={this.state.movimientos}
                    ItemSeparatorComponent={() => <SHr />}
                    ListHeaderComponent={() => {
                        return <SView col={"xs-12"} center>
                            <TotalTipoPago key_punto_venta={this.props.caja.key_punto_venta} movimientos={this.state.movimientos} />
                            <SHr h={32} />
                            <SView col={"xs-11 sm-10 md-8 lg-6"} >
                                <MenuAcciones caja={this.props.caja}  movimientos={this.state.movimientos}/>
                            </SView>
                            <SHr h={32} />
                        </SView>

                    }}
                    renderItem={({ item, index }) => {
                        return <SView col={"xs-12"} center>
                            <SView col={"xs-11 sm-10 md-8 lg-6"} >
                                <DetalleItem item={item} index={index} tipo_pago={this.state.tipo_pago} />
                            </SView>
                        </SView>
                    }} />
            </SView>
        );
    }
}