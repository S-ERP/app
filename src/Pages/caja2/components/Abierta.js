import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SDate, SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import TotalTipoPago from './TotalTipoPago';
import DetalleItem from './DetalleItem';
import MenuAcciones from './MenuAcciones';
import Components from '../../../Components';
import Model from '../../../Model';
export default class Abierta extends Component {
    state = {
        movimientos: [],
        ready: false,
    }
    componentDidMount() {
        this.loadData();
        this.ondetallechange = MDL.caja.addEventListener("onDetalleChange", () => {
            this.loadData();
        })

        MDL.empresa.getFull().then(empresa => {
            this.setState({ empresa });
        })
    }
    componentWillUnmount() {
        MDL.caja.removeEventListener(this.ondetallechange);
    }
    async loadData() {
        const movimientos = await MDL.caja.getDetalle(this.props.caja.key)
        const tipo_pago = await MDL.caja.tipo_pago_getAll()
        const empresa_tipo_pago = await MDL.caja.empresa_tipo_pago_getAll();
        movimientos.sort((a, b) => {
            return new SDate(b.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime() - new SDate(a.fecha_on, "yyyy-MM-ddThh:mm:ss").getTime();
        })
        movimientos.map((m) => {
            m.empresa_tipo_pago = empresa_tipo_pago[m.key_empresa_tipo_pago]
        })
        this.setState({ movimientos, tipo_pago, ready: true });
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
        console.log("PROPSSS", this.props);
        let key_user = this.props.caja.key_usuario
        let usuario = Model.usuario.Action.getByKey(key_user);
        if (!usuario) return;
        // this.sucursal = Model.sucursal.Action.getByKey(this.punto_venta.key_sucursal);
        let key_sucursal = this.props.caja.key_sucursal
        console.log("KEY SUCURSAL", key_sucursal);

        // let sucursales = Model.sucursal.Action.getAll();
        // let suc = Object.values(sucursales ?? {}).filter(s => s.key === key_sucursal) ?? null;
        // console.log("SUCURSAL", suc);
        // let sucursal = suc ? suc[0] : null;
        // console.log("SUCURSAL data ", sucursal);

        let keySucursal = this.props.caja.key_sucursal;
        let keyPuntoVenta = this.props.caja.key_punto_venta;
        const sucursal = this.state.empresa?.sucursales.find(s => s.key === keySucursal);

        const puntoVenta = sucursal?.puntos_venta?.find(
            pv => pv.key === keyPuntoVenta
        );

        console.log("Sucursal:", sucursal);
        console.log("Punto de venta:", puntoVenta);


        return <SView col={"xs-11 sm-10 md-8 lg-6"} center row   >

            <SHr />
            <SView col={"xs-12"} padding={15} row style={{
                borderRadius: 8,
                backgroundColor: STheme.color.primary + "50",
                borderWidth: 1,
                borderColor: STheme.color.card

            }}>
                <SText bold fontSize={16}>Estado de la Caja</SText>
                {/* <SImage src={require("/src/Assets/img/cajero.png")} style={{ resizeMode: "cover", width: 50, height: 50 }} />
                <SImage src={require("/src/Assets/img/sucursal.png")} style={{ resizeMode: "cover", width: 50, height: 50 }} />
                <SIcon name='cajero' width={50} height={50} fill={"#020000"} />
                <SIcon name='cajero' width={50} height={50} fill={"#090909"} /> */}

                <SHr height={10} />
                <SView col={"xs-12"} style={{ borderBottomWidth: 0.5, borderColor: STheme.color.card }} height={5} />
                <SHr height={20} />
                <SView row col={"xs-12 xl-3"} center style={{ borderRightWidth: 1, borderColor: STheme.color.card }}>
                    {this.props.caja.fecha_cierre ? <SView row center col={"xs-12"}>
                        <SView width={20} height={20} center style={{ borderRadius: 50, backgroundColor: STheme.color.danger + "50" }}>
                            <SView center style={{ width: 10, height: 10, backgroundColor: STheme.color.danger, borderRadius: 50 }} />
                        </SView>
                        <SView width={10} />
                        <SText color={STheme.color.danger} fontSize={18}>Caja cerrada</SText>
                        <SHr height={10} />
                        <SText col={"xs-12"} fontSize={12} center color={STheme.color.text}>{new SDate(this.props.caja.fecha_cierre).toString("DAY, dd de MONTH del yyyy a las hh:mm")}</SText>
                    </SView> :
                        <SView row center>
                            <SView width={20} height={20} center style={{ borderRadius: 50, backgroundColor: STheme.color.success + "50" }}>
                                <SView center style={{ width: 10, height: 10, backgroundColor: STheme.color.success, borderRadius: 50 }} />
                            </SView>
                            <SView width={10} />
                            <SText color={STheme.color.success} fontSize={18}>Caja Abierta</SText>
                        </SView>
                    }
                </SView>
                {/* <SText color={STheme.color.warning} fontSize={12}>{this.props.caja.fecha_cierre ? new SDate(this.props.caja.fecha_cierre).toString("DAY, dd de MONTH del yyyy a las hh:mm") : "La caja se encuentra abierta."}</SText> */}
                {/* <SView row width={10} />
                <SView height={30} row style={{ borderLeftWidth: 1, borderColor: STheme.color.card }} padding={10} /> */}
                <SView row col={"xs-12 xl-5"} padding={10}>
                    <SText fontSize={16} color={STheme.color.lightGray}>Fecha de gestión:</SText>
                    <SView row width={10} />
                    {/* <SText color={STheme.color.text} fontSize={12}>{new SDate(this.props.caja.fecha, "yyyy-MM-dd").toString("DAY, dd de MONTH del yyyy")}</SText> */}
                    <SText bold color={STheme.color.text} fontSize={16}>{new SDate(this.props.caja.fecha, "yyyy-MM-dd").toString("yyyy-MM-dd")}</SText>
                    <SHr />
                    <SText fontSize={12} color={STheme.color.lightGray}>Fecha de registro:</SText>
                    <SView row width={10} />
                    <SText color={STheme.color.text} fontSize={12}>{new SDate(this.props.caja.fecha_on, "yyyy-MM-dd").toString("yyyy-MM-dd hh:mm")}</SText>
                </SView>
                {!this.props.caja.fecha_cierre && <SView row col={"xs-12 xl-3"} center>
                    <SView width={160} height={42} row center style={{
                        backgroundColor: STheme.color.card, borderWidth: 2, borderColor: STheme.color.card,
                        padding: 10,
                        borderRadius: 8,
                    }}
                    >
                        <SText
                            // disabled={true} 
                            onPress={() => {
                                SPopup.date("Selecciona la fecha", (a) => {
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
                            }}>Cambiar fecha gestión</SText>
                    </SView>
                </SView>
                }
                <SHr height={10} />
                <SView col={"xs-12"} style={{ borderBottomWidth: 0.5, borderColor: STheme.color.card }} height={5} />
                <SHr height={10} />
                <SView row >
                    <SIcon name='Muser' width={12} height={12} fill={STheme.color.lightGray} />
                    <SView row width={5} />
                    <SText fontSize={12} color={STheme.color.lightGray}>Usuario:</SText>
                    <SView row width={10} />
                    <SText color={STheme.color.text} fontSize={12}>{usuario?.Nombres + " " + usuario?.Apellidos}</SText>
                </SView>
                <SView width={30} />
                <SView row >
                    <SIcon name='iconUbicacion' width={12} height={12} fill={STheme.color.lightGray} />
                    <SView row width={5} />
                    <SText fontSize={12} color={STheme.color.lightGray}>Sucursal:</SText>
                    <SView row width={10} />
                    <SText color={STheme.color.text} fontSize={12}>{sucursal?.descripcion} - {puntoVenta?.descripcion}</SText>
                </SView>
            </SView>
            <SHr />
            {/* <SView col={"xs-12"} row>
                <SView width={150} row center style={{
                    backgroundColor: STheme.color.card, borderWidth: 1, borderColor: STheme.color.card,
                    padding: 8,
                    borderRadius: 4,
                }}
                >
                    <SText
                        onPress={() => {
                            SPopup.date("Selecciona la fecha", (a) => {
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
                        }}>Cambiar fecha gestión</SText>
                </SView>
            </SView>
            <SHr />
            <SView col={"xs-12"} row>
                <SView flex>
                    <SText color={STheme.color.text} fontSize={12}>{"Registrada el " + new SDate(this.props.caja.fecha_on).toString("DAY, dd de MONTH del yyyy a las hh:mm")}</SText>
                    <SText color={STheme.color.text} fontSize={12}>{"para la fecha " + new SDate(this.props.caja.fecha, "yyyy-MM-dd").toString("DAY, dd de MONTH del yyyy")}</SText>
                    <SHr />

                </SView>
                <SView>
                </SView>
            </SView> */}

        </SView >
    }
    render() {
        console.log("EMRPESA DATA ", this.state.empresa)


        return (
            <SView col={"xs-12"} center flex>
                <FlatList style={{ flex: 1, width: "100%", }}
                    data={this.state.movimientos}
                    ItemSeparatorComponent={() => <SHr />}
                    ListHeaderComponent={() => {
                        let ventas = this.state.movimientos.filter(m => m.tipo == "venta").length;
                        let compras = this.state.movimientos.filter(m => m.tipo == "compra").length;
                        console.log("MOVIMIENTOS", this.state.movimientos);

                        const tiposMap = {
                            venta: "cantidadVentas",
                            compra: "cantidadCompras",
                            apertura: "cantidadAperturas",
                            anulacion_venta: "cantidadAnulacionesVenta",
                            anulacion_compra: "cantidadAnulacionesCompra",
                            amortizacion_compra: "cantidadAmortizaciones",
                            amortizacion_venta: "cantidadAmortizaciones",
                        };

                        const agrupado = this.state.movimientos.reduce((acc, item) => {
                            const key = item.key_compra_venta;

                            if (!acc[key]) {
                                acc[key] = {
                                    key_compra_venta: key,
                                    items: [],
                                };
                            }

                            const grupo = acc[key];
                            grupo.items.push(item);

                            const campo = tiposMap[item.tipo];
                            if (campo) {
                                grupo[campo] = 1; // solo 1 aunque se repita
                            }

                            return acc;
                        }, {});

                        console.log("AGRUPADO", agrupado);

                        const totales = Object.values(agrupado).reduce((acc, item) => {
                            acc.cantidadVentas += item.cantidadVentas || 0;
                            acc.cantidadCompras += item.cantidadCompras || 0;
                            acc.cantidadAnulacionesVenta += item.cantidadAnulacionesVenta || 0;
                            acc.cantidadAnulacionesCompra += item.cantidadAnulacionesCompra || 0;
                            acc.cantidadAmortizaciones += item.cantidadAmortizaciones || 0;
                            acc.cantidadAperturas += item.cantidadAperturas || 0;
                            return acc;
                        }, {
                            cantidadVentas: 0,
                            cantidadCompras: 0,
                            cantidadAnulacionesVenta: 0,
                            cantidadAnulacionesCompra: 0,
                            cantidadAmortizaciones: 0,
                            cantidadAperturas: 0,
                        });
                        console.log("TOTALES", totales);
                        return <SView col={"xs-12"} center>
                            <SHr h={20} />
                            <SView col={"xs-11 sm-10 md-8 lg-6"} >
                                <SText bold fontSize={16}>Cuentas y Saldos </SText>
                            </SView>
                            <SHr h={10} />
                            <TotalTipoPago key_punto_venta={this.props.caja.key_punto_venta} movimientos={this.state.movimientos} />
                            <SHr h={32} />
                            <SView col={"xs-11 sm-10 md-8 lg-6"} >
                                <SText bold fontSize={16}>Acciones Rápidas</SText>
                                <SHr h={10} />
                                <MenuAcciones caja={this.props.caja} movimientos={this.state.movimientos} key_punto_venta={this.props.caja.key_punto_venta} />
                                <SHr h={32} />
                            </SView>


                            {this.mensaje()}
                            <SHr h={32} />
                            {(!this.state.ready) && <SText color={STheme.color.lightGray}>Cargando movimientos...</SText>}
                            {(this.state.ready && this.state.movimientos.length <= 0) && <SText color={STheme.color.lightGray}>No hay movimientos</SText>}
                            {/* {(this.state.ready && this.state.movimientos.length > 0) && <SText color={STheme.color.lightGray}>Hay {this.state.movimientos.length} movimientos</SText>}
                            {(this.state.ready && this.state.movimientos.length > 0) && <SText color={STheme.color.lightGray}>Hay {ventas} ventas</SText>}
                            {(this.state.ready && this.state.movimientos.length > 0) && <SText color={STheme.color.lightGray}>Hay {compras} compras</SText>} */}
                            <SView col={"xs-12"} center row wrap>
                                {totales.cantidadVentas > 0 && boxCant({ text: `${totales.cantidadVentas}`, color: STheme.color.success, subtitulo: "Ventas", icon: "ventaCarro" })}
                                {totales.cantidadCompras > 0 && boxCant({ text: `${totales.cantidadCompras}`, color: STheme.color.warning, subtitulo: "Compras", icon: "compraCarro" })}
                                {totales.cantidadAnulacionesVenta > 0 && boxCant({ text: `${totales.cantidadAnulacionesVenta}`, color: STheme.color.danger, subtitulo: "Anulaciones de venta", icon: "cancelado" })}
                                {totales.cantidadAnulacionesCompra > 0 && boxCant({ text: `${totales.cantidadAnulacionesCompra}`, color: STheme.color.danger, subtitulo: "Anulaciones de compra", icon: "cancelado" })}
                                {totales.cantidadAmortizaciones > 0 && boxCant({ text: `${totales.cantidadAmortizaciones}`, color: STheme.color.info, subtitulo: "Amortizaciones", icon: "Mamortizacion" })}
                                {totales.cantidadAperturas > 0 && boxCant({ text: `${totales.cantidadAperturas}`, color: STheme.color.success, subtitulo: "Aperturas", icon: "Mapertura" })}
                            </SView>
                        </SView>
                    }}
                    renderItem={({ item, index }) => {
                        return <SView col={"xs-12"} center >
                            <SView col={"xs-11 sm-10 md-8 lg-6"}>
                                <DetalleItem item={item} index={this.state.movimientos.length - index} empresa={this.state.empresa} tipo_pago={this.state.tipo_pago} />
                            </SView>
                        </SView>
                    }} />
                <SHr h={20} />
            </SView>
        );
    }
}

const boxCant = (props) => {
    return <SView col={"xs-4 md-2"} card row center backgroundColor={props.color || STheme.color.lightGray} style={{
        padding: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: STheme.color.card,
        marginRight: 10,
        marginBottom: 10,
    }}>
        <SIcon name={props.icon} width={24} height={24} fill={STheme.color.white} />
        <SView width={10} />
        <SText fontSize={20} bold>{props.text}</SText>
        <SHr />
        <SText fontSize={14} color={STheme.color.lightGray}>{props.subtitulo}</SText>
    </SView>
}

// Estilos auxiliares
const styles = {
    boxCantidad: {
        // borderWidth: 1,
        borderColor: STheme.color.card,
        padding: 5,
        borderRadius: 4,
        marginRight: 10,
        marginBottom: 10,
    }
}