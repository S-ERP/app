import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SImage, SPage, SText, STheme, SView } from 'servisofts-component';
import Components from '../../../../../Components';
import Model from '../../../../../Model';
import Cliente from '../Cliente';
import Detalle from '../Detalle';
import PlanPagos from '../PlanPagos';
import Proveedor from '../Proveedor';
import ReciboCarta from '../../../../../Components/PDF/venta/ReciboCarta';
import ReciboRollo from '../../../../../Components/PDF/venta/ReciboRollo';
import Estado from './Components/Estado';
import SSocket from 'servisofts-socket';
import Separador1 from './Components/Separador1';


export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        this.data = this.props.data;
        let permiso = Model.usuarioPage.Action.getPermiso({ url: "/venta", permiso: "admin" })
        // this.isAdmin = !!permiso ?? Model.compra_venta_participante.Action.allowAdmin({ key_compra_venta: this.props.data.key });
        this.isAdmin = !!permiso ? true : Model.compra_venta_participante.Action.allowAdmin({ key_compra_venta: this.props.data.key });
        this.isSuperAdmin = !!permiso;

        var statei = Model.compra_venta.Action.getStateInfo(this.data.state)
        console.log("AQUI", this.data)
        return (<SView col={"xs-12 sm-11 md-8 lg-8 xl-6"} card >
            <Estado data={this.data} />
            <SView col={"xs-12"} padding={10} row>
                <SView style={{ paddingRight: 15 }} center>
                    <SView width={70} height={70} style={{
                        borderRadius: 100,
                        borderWidth: 2,
                        borderColor: STheme.color.card,
                        overflow: "hidden",
                        maxWidth: "100%",
                        maxHeight: "100%"
                    }} >
                        <SImage src={Model.empresa._get_image_download_path(SSocket.api, this.data?.key_empresa)} style={{
                            resizeMode: "cover",
                        }} />
                    </SView>
                </SView>
                <SView col={"xs-9"} row center>
                    <SText col={"xs-12"} fontSize={12} bold>{this.data?.descripcion}</SText>
                    <SText bold col={"xs-3"} fontSize={12}>Empresa: </SText>
                    <SText fontSize={12} col={"xs-9"}>{this.data?.empresa?.razon_social}</SText>
                    {/* <SHr height={1}/> */}
                    <SText bold fontSize={12} col={"xs-3"}>NIT: </SText>
                    <SText fontSize={12} col={"xs-9"}>{this.data?.empresa?.nit}</SText>
                </SView>


                <SText center >{this.data?.observacion}</SText>
                <Separador1 />
                <Proveedor data={this.data} disabled />
                <Separador1 />
                <Cliente data={this.data} disabled />
                <Separador1 />
                {/* <Components.compra_venta.Conyuge data={this.data} disabled />
                 <Separador1  />
                <Components.compra_venta.Garante data={this.data} disabled />
                <Separador1  /> */}
                <Detalle data={this.data} disabled />
                <Separador1 />
                <Separador1 />

                <Components.compra_venta.Totales data={this.data} disabled />
                <Separador1 />
                <SHr height={10} />
                <PlanPagos ref={ref => this.pp = ref} data={this.data} disabled />
                <Separador1 />
                <SView col={"xs-12"} style={{ alignItems: "flex-end", paddingBottom: 10, paddingTop: 10 }}>
                    <Components.compra_venta.QRVenta data={this.data} />
                </SView>

                <Separador1 />
                <Components.compra_venta.Participantes data={this.data} disabled />
                <Separador1 />
                <Components.compra_venta.Comentarios data={this.data} disabled />


                <SView col={"xs-12"} row center>
                    <SView col={"xs-12"} center>
                        <SHr />
                        <SText bold>ACCIONES</SText>
                        <SHr />
                    </SView>
                    <SView col={"xs-12"} center row>
                        <SView card style={{ padding: 16, marginBottom: 10 }}>
                            <SView onPress={() => ReciboRollo.imprimir(this.data.key)}>
                                <SText>DESCARGAR PDF ROLLO</SText>
                            </SView>
                        </SView>
                        <SView width={8} />
                        <SView card style={{ padding: 16, marginBottom: 10 }}>
                            <SView onPress={() => ReciboCarta.imprimir(this.data.key)}>
                                <SText>DESCARGAR PDF CARTA</SText>
                            </SView>
                        </SView>
                        <SView width={8} />
                        <SView style={{ marginBottom: 10, overflow:"hidden", borderRadius:4 }} backgroundColor={STheme.color.background}>
                            <Components.compra_venta.GenerarAsiento data={this.data} />
                        </SView>

                        <SView width={8} />
                        <SView card style={{ padding: 16,marginBottom: 10, backgroundColor:STheme.color.barColor }} onPress={() => {
                            Model.compra_venta.Action.changeState({ data: this.data, state: "cotizacion" })
                        }}>
                            <SText bold color={STheme.color.danger}>VOLVER A COTIZACIÓN</SText>
                        </SView>
                    </SView>
                </SView>


                {/* <Components.compra_venta.Exportar data={this.data} /> */}
                {/* <SHr />
                <Components.compra_venta.GenerarAsiento data={this.data} />
                <SHr /> */}
                <SView col={"xs-12"} row center>

                    {/* <SView card style={{ padding: 16 }} onPress={() => {
                    Model.compra_venta.Action.changeState({ data: this.data, state: "denegado" })
                }}>
                    <SText bold color={STheme.color.danger}>DENEGAR</SText>
                </SView>
                <SView width={8} /> */}
                    {/* <SView card style={{ padding: 16 }} onPress={() => {
                        Model.compra_venta.Action.changeState({ data: this.data, state: "cotizacion" })
                    }}>
                        <SText bold color={STheme.color.danger}>VOLVER A COTIZACION</SText>
                    </SView> */}
                </SView>
                <SHr height={15} />
            </SView>


        </SView>

        );
    }
}