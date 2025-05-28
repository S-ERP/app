import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SButtom, SHr, SIcon, SImage, SLoad, SMapView, SMath, SNavigation, SPage, SPopup, SText, STheme, SThread, SUuid, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';


export default class TipoEntrega extends Component {
    constructor(props) {
        super(props);
        this.state = {
            monto: 0,
            distancia: 0,
        };
    }
    componentDidMount() {
        if (this.props?.data?.key) {
            Model.incentivo.Action.getAllActivos({ key_restaurante: this.props?.data?.key }, true);
            this.setState({ monto: 0, load: false })
        }
    }
    handlePress(delivery) {
        if (delivery && this.state.monto <= 0) return;
        if (this.props.onChange) this.props.onChange({

            delivery: delivery ? this.state.monto : false,
            descuentos: this.state?.descuentos,
        });
        // if (this.props.parent) parent.delivery = delivery ? this.state.monto : false
        this.setState({ delivery: delivery })
    }

    getCostoEnvio(distancia, { defaultDelivery }) {
        // TODO: ricky
        this.state.distancia = distancia;
        this.data_costos = Model.costo_envio.Action.getAll();
        this.incentivos = Model.incentivo.Action.getAllActivos({ key_restaurante: this.data.key });

        // let incentivos = this.getTotalIncentivos();

        if (!this.data_costos || !this.incentivos) return null;
        let monto_incentivos = 0;
        Object.values(this.incentivos).map((obj) => {
            monto_incentivos += obj.monto;
        })
        var distancia_t = distancia;
        console.log(distancia_t)

        var costo = { metro: 0, monto: 0 };
        var max = { monto: 0 };
        Object.values(this.data_costos).map(obj => {
            if (distancia_t <= obj.metro && (costo.metro > obj.metro || costo.metro == 0)) {
                costo = obj;
                return;
            }
            if (obj.monto >= max.monto) {
                max = obj;
            }
        })
        if (costo.monto <= 0) {
            costo = max;
        }

        this.costo_envio = costo;
        this.monto_incentivos = monto_incentivos;
        let total = costo.monto + monto_incentivos;
        if (!this.state.monto && !this.state.load) {
            this.state.monto = total;
            if (defaultDelivery) {
                this.handlePress(total)
            }
            this.cargarDescuentos();

            this.setState({ load: true })
        }
    }

    cargarDescuentos() {
        console.log("Cargando descuentos...", this.data);
        const monto_delivery = this.state.monto;
        const monto_producto = this.data?.horario?.precio * this.data?.horario?.cantidad;

        let prd = {};
        let productos = { ...(Model?.carrito?.Action.getState().productos ?? {}) };
        Object.values(productos).map(a => prd[a.key_producto] = true);
        let key_productos = Object.keys(prd);
        new SThread(300, "Asdasd").start(() => {
            console.log("monto_producto", productos)
            SSocket.sendPromise({
                component: "descuento",
                type: "calcularDescuento",
                key_restaurante: this.props.key_restaurante,
                key_productos: key_productos,
                monto_delivery: monto_delivery,
                monto_producto: monto_producto
            }).then((e) => {
                this.state.descuentos = e.data;
                console.log(this.state)
                // this.setState({ monto: 0, delivery: 1 })
                this.handlePress(1)
                this.setState({ ...this.state })
            }).catch(e => {
                console.error(e);
            })
            // SSocket.sendPromise({
            //     component: "descuento",
            //     type: "calcularDescuento",
            //     productos: this.props.key_restaurante,
            //     monto_delivery: monto_delivery,
            //     monto_producto: monto_producto
            // }).then((e) => {
            //     this.state.descuentos = e.data;
            //     console.log(this.state)
            //     // this.setState({ monto: 0, delivery: 1 })
            //     this.handlePress(1)
            //     this.setState({ ...this.state })
            // }).catch(e => {
            //     console.error(e);
            // })
        })
    }
    renderCostoEnvio() {
        if (this.state.monto) {

            if (this.state.descuentos) {
                let descuento_delivery = 0;
                this.state.descuentos.map(d => {
                    descuento_delivery += d.total_descuento_delivery;
                })
                let resto = this.state.monto - descuento_delivery
                if (resto <= 0) {
                    return <SView width={120} height={25} style={{ alignItems: 'flex-end', }}>
                        {/* <SIcon name={"PrecioOriginalBottom"} /> */}
                        <SImage src={require("../../../Assets/img/Banner_p.png")} />
                        <SView style={{
                            position: "absolute",
                            right: 14,
                            top: 5,
                            transform: [{ rotate: "-3deg" }]
                        }}>
                            <SText fontSize={9} color={"#fff"} bold>{"Envío Gratis"}</SText>
                        </SView>
                    </SView>
                    return <SText fontSize={14}   >Envío Gratis</SText>
                } else {
                    return <SText font={"Montserrat-SemiBold"} fontSize={14}   >Costo del envío: Bs. {SMath.formatMoney(resto)} </SText>

                }
            }
            return <SText fontSize={14} font={"Montserrat-SemiBold"}>Costo del envío: Bs. {SMath.formatMoney(this.state.monto)} </SText>
        } else {
            return <SText fontSize={14} font={"Montserrat-SemiBold"}>No hay costos de envío</SText>
        }
    }



    tipo_recoger(delivery, distancia) {
        if (!this.data.recoger) return null;
        return <SView col={"xs-12"} row style={{ borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 6, }}
            onPress={this.handlePress.bind(this, false)} >
            <SView col={"xs-2"} center flex>
                <SView width={18} height={18} style={{ borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 25 }}
                    backgroundColor={!this.state.delivery ? STheme.color.primary : "transparent"} ></SView>
            </SView>
            <SView col={"xs-10"} >
                <SHr height={15} />
                <SText fontSize={18} col={"xs-12"} font={"Montserrat-Bold"}>Recoger del lugar </SText>
                <SHr height={10} />

                <SText fontSize={14} col={"xs-12"}   >¡Se encuentra a {distancia} Km de tu ubicación!</SText>
                <SHr height={15} />
                <SView col={"xs-12"} row center>
                    <SView col={"xs-6"} >
                    </SView>
                    <SView col={"xs-6"} style={{ alignItems: "flex-end", }}
                        row
                        center>
                        <SIcon name={'ComoLlegar'} height={26} width={26} />
                        <SText color={STheme.color.primary} height={26} center fontSize={15} font={"Montserrat-Bold"}
                            onPress={() => {
                                SNavigation.navigate("/restaurante/comollegar", { pk: this.props.data.key });
                            }}
                        >Cómo llegar {">"}</SText>
                    </SView>
                </SView>
            </SView>
            <SHr height={10} />
        </SView >
    }

    tipo_domicilio(delivery, distancia) {
        if (!delivery) return null;
        if (!this?.state?.monto || this.state.distancia != distancia) {
            console.log("Entro a calcular el tipo ", distancia)
            if(this.state.distancia != distancia){
                this.state.monto = 0;
                this.state.load = false;
            }
            
            this.getCostoEnvio(distancia, { defaultDelivery: true })
        }

        let direccion = Model.filtros.Action.getByKey("direccion", {}, null).select;
        return <SView col={"xs-12"} row style={{ borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 6 }} onPress={this.handlePress.bind(this, true)}>
            <SView col={"xs-2"} center flex>
                <SView width={18} height={18} style={{ borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 25 }}
                    backgroundColor={!!this.state.delivery ? STheme.color.primary : "transparent"} ></SView>
            </SView>
            <SView col={"xs-10"} >
                <SHr height={15} />
                <SText fontSize={18} font={"Montserrat-Bold"}>Envío a domicilio</SText>
                <SView col={"xs-11"} center style={{
                    borderRadius: 8,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: STheme.color.lightGray
                }}>
                    <SView col={"xs-12"} height={130}>
                        <SMapView
                            ref={(ref) => this.map = ref}
                            initialRegion={{
                                latitude: direccion?.latitude,
                                longitude: direccion?.longitude,
                                latitudeDelta: 0.006,
                                longitudeDelta: 0.006,
                            }}>
                            <></>
                            <SMapView.SMarker latitude={direccion?.latitude} longitude={direccion?.longitude} />
                        </SMapView>
                    </SView>
                    <SView col={"xs-12"} padding={4} style={{
                        borderBottomWidth: 1,
                        borderBottomColor: STheme.color.lightGray,
                        borderTopWidth: 1,
                        borderTopColor: STheme.color.lightGray,
                    }}>
                        {!direccion?.descripcion ? null :
                            <SView row>
                                <SText center fontSize={12} color={STheme.color.primary}>Nombre:</SText>
                                <SText style={{ paddingLeft: 1 }} fontSize={12}>{direccion?.descripcion}</SText>
                            </SView>
                        }

                        <SView row>
                            <SText fontSize={12} color={STheme.color.primary}>Direccion:</SText>
                            <SText style={{ paddingLeft: 1 }} fontSize={12}>{direccion?.direccion}</SText>
                        </SView>

                        <SView row>
                            <SText fontSize={12} color={STheme.color.primary}>Referencia:</SText>
                            <SText style={{ paddingLeft: 1 }} fontSize={12}> {direccion?.referencia}</SText>
                        </SView>


                    </SView>
                    <SView col={"xs-12"} height={50} center>
                        <SView col={"xs-12"}
                            row
                            center>
                            <SIcon name={'ComoLlegar'} height={26} width={26} />
                            <SText color={STheme.color.primary} height={26} center fontSize={15} font={"Montserrat-Bold"}
                                onPress={() => {
                                    SNavigation.navigate("/direccion", {
                                        // pk: this.props.data.key,
                                        onSelect: (e) => {
                                            SNavigation.goBack()
                                            if (this.map) {
                                                console.log(e);
                                                this.map.animateToRegion({
                                                    latitude: e.latitude,
                                                    longitude: e.longitude,
                                                    latitudeDelta: 0.006,
                                                    longitudeDelta: 0.006,
                                                })
                                            }
                                            this.handlePress(0)
                                            this.setState({ monto: 0 })
                                            new SThread(1000, "cargando", false).start(() => {
                                                this.setState({ monto: 0, load: false })
                                                this.handlePress(true)
                                            })
                                        }
                                    });
                                }}
                            >Cambiar Ubicación {">"}</SText>
                        </SView>
                    </SView>
                </SView>
                <SHr height={15} />
                {this.renderCostoEnvio()}
                <SHr height={15} />
            </SView>
            <SHr height={10} />
        </SView >
    }
    render() {
        this.data = this.props.data;
        // if (!this.data) {
        // this.data = Model.restaurante.Action.getByKeyRecursive(this.props.key_restaurante);
        if (!this.data) return <SLoad />

        // }
        let delivery = this.data.delivery;
        return (
            <SView backgroundColor={STheme.color.background} col={"xs-12"} center>
                <SHr height={40} />
                <SView col={"xs-11"}/*  style={{ opacity: delivery == true ? 1 : 0.3 }} */ >
                    <SText fontSize={18} font={"Montserrat-Bold"}>Tipo de entrega</SText>
                    <SHr height={15} />
                    {this.tipo_recoger(delivery, this.data.distancia)}
                    <SHr height={15} />
                    {this.tipo_domicilio(delivery, this.data.distancia_metros)}
                    <SHr height={15} />
                </SView>
            </SView>
        );
    }
}

// const initStates = (state) => {
//     return { state }
// };
// export default connect(initStates)(TipoEntrega);