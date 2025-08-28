import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import { Container } from '../../../Components';
import SelectTipoPago from './SelectTipoPago';
import SIconApp from '../../../Assets/SIconApp';
import TotalTipoPago from './TotalTipoPago';


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
    renderListaItem(item, index) {
        let color = STheme.color.success;
        if (item.monto < 0) {
            color = STheme.color.danger;
        }
        return <SView key={index} row padding={4} style={{
            borderBottomWidth: 1,
            borderColor: STheme.color.card
        }}>

            <SView flex>
                <SView row style={{
                    alignItems: "center"
                }}>
                    <SView style={{
                        width: 20,
                        height: 20,
                        borderRadius: 100,
                        backgroundColor: STheme.color.card,
                    }} center>
                        <SText color={STheme.color.lightGray} fontSize={10} >{this.state.movimientos.length - index}</SText>
                    </SView>
                    <SView width={4} />
                    <SText >{item.descripcion}</SText>

                </SView>
                <SHr h={4} />
                <SView row style={{
                    alignItems: "center"
                }}>
                    <View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText fontSize={10} color={STheme.color.lightGray}>{new SDate(item.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm")}</SText>
                    </View>
                    <SView width={8} />
                    <View style={{
                        backgroundColor: MDL.caja.detalle_types[item.tipo]?.color + "66" || STheme.color.card,
                        borderWidth: 1,
                        borderColor: MDL.caja.detalle_types[item.tipo]?.color || STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText fontSize={10}   >{MDL.caja.detalle_types[item.tipo]?.label || item.tipo}</SText>
                    </View>
                    <SView width={8} />
                    {item.codigo_comprobante && <><View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText color={STheme.color.link} underLine fontSize={10} onPress={() => {
                            SNavigation.navigate("/contabilidad/asiento_contable/profile", { pk: item.key_comprobante })
                        }}>{item.codigo_comprobante}</SText>
                    </View>
                        <SView width={8} />
                    </>}
                    {item?.data?.key_compra_venta && <><View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4
                    }}>
                        <SText fontSize={10} onPress={() => {
                            SNavigation.navigate("/compra/profile", { pk: item?.data?.key_compra_venta })
                        }}>{"Compra"}</SText>
                    </View>
                        <SView width={8} />
                    </>}
                    <View style={{
                        // backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        padding: 2,
                        borderRadius: 4,
                        flexDirection: "row",
                        alignItems: "center"
                    }}>
                        <SView width={16} height={16}>
                            {this?.state?.tipo_pago?.[item.key_tipo_pago] && <SIconApp name={this?.state?.tipo_pago?.[item.key_tipo_pago].icon} />}
                        </SView>
                        <SView width={4} />
                        <SText color={STheme.color.lightGray} fontSize={10}>{this?.state?.tipo_pago?.[item.key_tipo_pago]?.descripcion || item.key_tipo_pago}</SText>
                    </View>
                </SView>
            </SView>
            <SView style={{
                alignItems: "flex-end"
            }}>
                <SView row center>
                    <SText fontSize={18} bold color={color}>{SMath.formatMoney(item.monto)}</SText>
                    {/* <SView width={4} /> */}

                </SView>

                {/* <SText color={STheme.color.lightGray} fontSize={10}>{this?.state?.tipo_pago?.[item.key_tipo_pago]?.descripcion || item.key_tipo_pago}</SText> */}
                {/* <SView width={4} />
                    <SView width={16} height={16}>
                        {this?.state?.tipo_pago?.[item.key_tipo_pago] && <SIconApp name={this?.state?.tipo_pago?.[item.key_tipo_pago].icon} />}
                    </SView> */}

            </SView>
            <SHr h={4} />

        </SView>

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
                                <SView row >
                                    <SText card padding={8} margin={4} onPress={() => {
                                        SNavigation.navigate("/puntoventa")
                                    }}>Vender Productos</SText>
                                    <SText card style={{ backgroundColor: STheme.color.danger }} padding={8} margin={4}>Cobrar a Clientes</SText>
                                    <SText card padding={8} margin={4} onPress={() => {
                                        // SelectTipoPago.openPopup({
                                        //     key_punto_venta: this.props.caja.key_punto_venta,
                                        //     solo_para_caja: true,
                                        //     onSelect: (item) => {

                                        //     }
                                        // })
                                    }}>Cargar efectivo desde Banco</SText>
                                    <SText card padding={8} margin={4} style={{ backgroundColor: STheme.color.danger }} >Otros Ingresos</SText>
                                    <SText card padding={8} margin={4} onPress={() => {
                                        SNavigation.navigate("/compra2")
                                    }}>Comprar Productos</SText>
                                    <SText card padding={8} margin={4} style={{ backgroundColor: STheme.color.danger }}>Pagar a Proveedores</SText>
                                    <SText card padding={8} margin={4} onPress={() => {
                                        SelectTipoPago.openPopup({
                                            key_punto_venta: this.props.caja.key_punto_venta,
                                            solo_para_caja: true,
                                            montoMaximoPorTipo: {
                                                efectivo: this.state.movimientos.filter(mov => mov.key_tipo_pago == "efectivo").reduce((sum, mov) => sum + mov.monto, 0),
                                                pagare: this.state.movimientos.filter(mov => mov.key_tipo_pago == "pagare").reduce((sum, mov) => sum + mov.monto, 0),
                                                cheque: this.state.movimientos.filter(mov => mov.key_tipo_pago == "cheque").reduce((sum, mov) => sum + mov.monto, 0),
                                            },
                                            onSelect: (item) => {
                                                MDL.caja.registro_detalle({
                                                    key_caja: this.props.caja.key,
                                                    fecha: this.props.caja.fecha,
                                                    descripcion: "Envio al banco",
                                                    monto: item.efectivo * -1,
                                                    tipo: "egreso_banco",
                                                    key_tipo_pago: "efectivo"
                                                }).then(e => {
                                                    SelectTipoPago.closePopup();
                                                }).catch(e => {

                                                })
                                            }
                                        });
                                    }}>Enviar al Banco</SText>
                                    <SText card padding={8} margin={4} onPress={this.cerrar_caja.bind(this)} >Cerrar la Caja</SText>
                                </SView>
                            </SView>
                            <SHr h={32} />
                        </SView>

                    }}
                    renderItem={({ item, index }) => {
                        return <SView col={"xs-12"} center>
                            <SView col={"xs-11 sm-10 md-8 lg-6"} >
                                {this.renderListaItem(item, index)}
                            </SView>
                        </SView>
                    }} />
            </SView>
        );
    }
}