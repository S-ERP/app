import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import { Container } from '../../../Components';
import SelectTipoPago from './SelectTipoPago';


export default class Abierta extends Component {

    state = {
        movimientos: []
    }
    componentDidMount() {
        // this.loadData();

        MDL.caja.getDetalle(this.props.caja.key).then(movimientos => {
            movimientos.sort((a, b) => {
                return new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() - new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime();
            })
            this.setState({ movimientos });
        });
    }
    // async loadData() {
    //     const ajusteBanco = await MDL.contabilidad.getAjuste("bancos");
    //     console.log(ajusteBanco);
    // }

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
                color: STheme.color.danger,
                time: 5000
            })
        })
    }
    renderListaItem(item, index) {
        let color = STheme.color.success;
        if (item.monto < 0) {
            color = STheme.color.danger;
        }
        return <SView key={index} row padding={8} style={{
            borderBottomWidth: 1,
            borderColor: STheme.color.card
        }}>
            <SView flex>
                <SText >{item.descripcion}</SText>
                <SText color={STheme.color.lightGray} fontSize={10}>{item.tipo}</SText>
                <SHr />
                <SText fontSize={10} color={STheme.color.lightGray}>{new SDate(item.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")}</SText>

            </SView>
            <SView style={{
                alignItems: "flex-end"
            }}>
                <SText fontSize={16} bold color={color}>{SMath.formatMoney(item.monto)}</SText>
                <SHr h={4} />
                <SText color={STheme.color.lightGray} fontSize={10}>{item.key_tipo_pago}</SText>

            </SView>


        </SView>

    }
    render() {
        return (
            <SView col={"xs-12"} center flex>
                {/* <SText>{JSON.stringify(this.props.caja)}</SText> */}
                <SView col={"xs-11 sm-10 md-8 lg-6"} flex>
                    <SHr />
                    <SView row>
                        <SText card padding={8} margin={4} onPress={() => {
                            SNavigation.navigate("/puntoventa")
                        }}>Vender Productos</SText>
                        <SText card padding={8} margin={4}>Cobrar a Clientes</SText>
                        <SText card padding={8} margin={4} onPress={() => {

                        }}>Cargar efectivo desde Banco</SText>
                        <SText card padding={8} margin={4}>Otros Ingresos</SText>
                        <SText card padding={8} margin={4} onPress={() => {
                            SNavigation.navigate("/compra2")
                        }}>Comprar Productos</SText>
                        <SText card padding={8} margin={4}>Pagar a Proveedores</SText>
                        <SText card padding={8} margin={4} onPress={() => {
                            SelectTipoPago.openPopup({
                                key_punto_venta: this.props.caja.key_punto_venta,
                                solo_para_caja: true,
                                onSelect: (item) => {

                                }
                            });
                        }}>Enviar al Banco</SText>
                        <SText card padding={8} margin={4} onPress={this.cerrar_caja.bind(this)} >Cerrar la Caja</SText>
                    </SView>
                    {/* <SHr /> */}
                    {/* <SelectTipoPago key_punto_venta={this.props.caja.key_punto_venta} /> */}
                    <SHr />
                    <FlatList
                        data={this.state.movimientos}
                        ItemSeparatorComponent={() => <SHr />}
                        renderItem={({ item, index }) => {
                            return this.renderListaItem(item, index);
                        }} />
                </SView>
            </SView>
        );
    }
}