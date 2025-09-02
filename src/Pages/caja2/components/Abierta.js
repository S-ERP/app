import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SelectTipoPago from './SelectTipoPago';
import TotalTipoPago from './TotalTipoPago';
import DetalleItem from './DetalleItem';
import MenuAcciones from './MenuAcciones';
import Components from '../../../Components';
import Model from '../../../Model';
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
    mensaje() {
        return <SView col={"xs-11 sm-10 md-8 lg-6"} center row   >
            <SView col={"xs-12"} row>
                <SView width={150} row center style={{
                    backgroundColor: STheme.color.card, borderWidth: 1, borderColor: STheme.color.card,
                    padding: 8,
                    borderRadius: 4,
                }}
                >
                    <SText
                        // disabled={true} 
                        onPress={() => {
                            SPopup.date("Selecciona ss la fecha", (a) => {
                                console.log("devorame " + JSON.stringify(this.props.caja))
                                Model.caja.Action.editar({
                                    data: {
                                        ...this.props.caja,
                                        fecha: a.fecha + "T00:00:00"
                                    },
                                    key_usuario: Model.usuario.Action.getKey(),
                                }).then(e => {
                                    console.log(e);
                                }).catch(e => {
                                    console.error(e);
                                })
                            })
                        }}>Cambiar fecha gestion</SText>
                </SView>
            </SView>
            <SHr />
            <SHr />
            <SView col={"xs-12"} row>
                <SView flex>
                    <SText color={STheme.color.text} fontSize={12}>{"Registrada el " + new SDate(this.props.caja.fecha_on).toString("DAY, dd de MONTH del yyyy a las hh:mm")}</SText>
                    <SText color={STheme.color.text} fontSize={12}>{"para la fecha " + new SDate(this.props.caja.fecha, "yyyy-MM-dd").toString("DAY, dd de MONTH del yyyy")}</SText>
                    <SHr />
                    <SText color={STheme.color.warning} fontSize={12}>{this.props.caja.fecha_cierre ? new SDate(this.props.caja.fecha_cierre).toString("DAY, dd de MONTH del yyyy a las hh:mm") : "La caja se encuentra abierta."}</SText>
                </SView>
                <SView>
                    <Components.caja.QRCaja pk={this.props.caja.key} width={120} height={120} />
                </SView>
            </SView>
        </SView >
    }
    render() {
        return (
            <SView col={"xs-12"} center flex>
                <FlatList style={{ flex: 1, width: "100%", }}
                    data={this.state.movimientos}
                    ItemSeparatorComponent={() => <SHr />}
                    ListHeaderComponent={() => {
                        return <SView col={"xs-12"} center>
                            <TotalTipoPago key_punto_venta={this.props.caja.key_punto_venta} movimientos={this.state.movimientos} />
                            <SHr h={32} />
                            <SView col={"xs-11 sm-10 md-8 lg-6"} >
                                <MenuAcciones caja={this.props.caja} movimientos={this.state.movimientos} />
                            </SView>
                            <SHr h={32} />
                        </SView>
                    }}
                    renderItem={({ item, index }) => {
                        return <SView col={"xs-12"} center>
                            {this.mensaje()}
                            <SHr h={32} />

                            <SView col={"xs-11 sm-10 md-8 lg-6"} border={"pink"}  >
                                <DetalleItem item={item} index={index} tipo_pago={this.state.tipo_pago} />
                            </SView>
                        </SView>
                    }} />
            </SView>
        );
    }
}