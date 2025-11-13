import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../../Model';
import Cliente from '../Cliente';

import Detalle from '../Detalle';

import Proveedor from '../Proveedor';


import Components from '../../../../../Components';
import Estado from './Components/Estado';
import Separador1 from './Components/Separador1';
import TotalesVenta from '../TotalesVenta';
import PlanPagos from '../PlanPagos';

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    guardarCuotas() {

    }
    getActions() {
        if (!this.isAdmin) return null
        return <SView col={"xs-12"} row center>
            <SView card style={{ padding: 16 }} onPress={() => {
                Model.compra_venta.Action.changeState({ data: this.data, state: "cotizacion" })
            }}>
                <SText bold color={STheme.color.danger}>VOLVER A COTIZAR</SText>
            </SView>
            <SView width={8} />
            <SView card style={{ padding: 16 }} onPress={() => {
                this.pp.guardarCuotas().then((e) => {
                    console.log(e);
                }).catch((e) => {
                    console.error(e)
                })
            }}>
                <SText bold color={STheme.color.lightBlack}>GUARDAR</SText>
            </SView>
            <SView width={8} />
            <SView card style={{ padding: 16 }} onPress={() => {
                this.pp.guardarCuotas().then((e) => {
                    console.log(e);
                    if (e.tipo_pago != "contado") {
                        // if (!this.data.garante) {
                        //     SPopup.alert("Deve ingresar el garante para vender al credito")
                        //     return;
                        // }
                        // if (!this.data.conyuge) {
                        //     SPopup.alert("Deve ingresar el conyuge para vender al credito")
                        //     return;
                        // }
                    }
                    Model.compra_venta.Action.changeState({ data: this.data, state: "vendido" }).then((resp) => {
                        Model.producto.Action.CLEAR();
                        Model.compra_venta_detalle.Action.CLEAR();
                    }).catch(e => {
                        SPopup.alert(e.error)
                    })
                }).catch((e) => {
                    console.error(e)
                })

            }}>
                <SText bold color={STheme.color.success}>VENDER</SText>
            </SView>

        </SView>
    }
    render() {
        this.data = this.props.data;
        let permiso = Model.usuarioPage.Action.getPermiso({ url: "/venta", permiso: "admin" })
        // this.isAdmin = !!permiso ?? Model.compra_venta_participante.Action.allowAdmin({ key_compra_venta: this.props.data.key });
        this.isAdmin = !!permiso ? true : Model.compra_venta_participante.Action.allowAdmin({ key_compra_venta: this.props.data.key });

        this.isSuperAdmin = !!permiso;
        // var statei = Model.compra_venta.Action.getStateInfo(this.data.state)
        return (<SView col={"xs-12 sm-11 md-8 lg-8 xl-6"} card>
            <Estado data={this.data} />
            <SView col={"xs-12"} center style={{ padding: 14, }}>
                <SHr />
                <SText center bold fontSize={18}>{this.data?.descripcion}</SText>
                <SHr />
                <SText center >{this.data?.observacion}</SText>
                <Separador1 />
                <Proveedor data={this.data} disabled />
                <Separador1 />
                <Cliente data={this.data} disabled />
                <Separador1 />
                {/* <Components.compra_venta.Conyuge data={this.data} disabled={!this.isAdmin} />
                <Separador1 />
                <Components.compra_venta.Garante data={this.data} disabled={!this.isAdmin} />
                <Separador1 /> */}
                <Detalle data={this.data} disabled />
                <Separador1 />
                <TotalesVenta data={this.data} />
                <Separador1 />
                <SHr height={10} />
                <PlanPagos ref={ref => this.pp = ref} data={this.data} disabled />
                <Separador1 />
                <SView col={"xs-12"} style={{ alignItems: "flex-end", paddingBottom: 10, paddingTop: 10 }}>
                    <Components.compra_venta.QRVenta data={this.data} />
                </SView>
                <Separador1 />
                {/* {this.getActions()} */}
            </SView>
            <SHr height={16} />
            {/* <Components.compra_venta.Exportar data={this.data} />
            <SHr height={50} />
            <Components.compra_venta.Participantes data={this.data} />
            <SHr height={50} />
            <SView col={"xs-12"} center card>
                <Components.compra_venta.Comentarios data={this.data} />
            </SView> */}
        </SView>
        );
    }
}