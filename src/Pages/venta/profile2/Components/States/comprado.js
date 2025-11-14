import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SImage, SPage, SText, STheme, SView } from 'servisofts-component';
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
import TotalesVenta from '../TotalesVenta';
import MDL from '../../../../../MDL';
import ComprobanteRollo from '../../../../../Components/PDF/compra/ComprobanteRollo';
import ComprobanteCarta from '../../../../../Components/PDF/compra/ComprobanteCarta';


export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    async componentDidMount() {
        let sucursal = await MDL.empresa.getAllSucursales()
        let miSucursal = sucursal.find(s => s.key == this.props.data.key_sucursal)
        this.setState({ miSucursal })

    }

    render() {
        this.data = this.props.data;
        let permiso = Model.usuarioPage.Action.getPermiso({ url: "/venta", permiso: "admin" })
        this.isAdmin = !!permiso ? true : Model.compra_venta_participante.Action.allowAdmin({ key_compra_venta: this.props.data.key });
        this.isSuperAdmin = !!permiso;

        this.sucursal = this.state?.miSucursal;
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
                    <SText fontSize={10}>{this.sucursal?.descripcion}</SText>
                    {(this.sucursal?.punto_venta) ?
                        <SText fontSize={10}>Punto de venta: {this.sucursal?.punto_venta[0].descripcion}</SText>
                        : null
                    }
                </SView>
                <SView col={"xs-8"} row center>
                    <SText col={"xs-12"} fontSize={12} bold>{this.data?.descripcion}</SText>
                    <SText bold col={"xs-3"} fontSize={12}>Empresa: </SText>
                    <SText fontSize={12} col={"xs-9"}>{this.data?.empresa?.razon_social}</SText>
                    <SText bold fontSize={12} col={"xs-3"}>NIT: </SText>
                    <SText fontSize={12} col={"xs-9"}>{this.data?.empresa?.nit}</SText>
                    <SText bold col={"xs-3"} fontSize={12}>Obs: </SText>
                    <SText fontSize={12} col={"xs-9"}>{this.data?.observacion}</SText>
                </SView>
                <SHr height={10} />
                <Separador1 />
                <SView col={"xs-12"} row center>
                    {(this.data.tipo == "venta") ?
                        <Cliente data={this.data} disabled /> :
                        <Proveedor data={this.data} disabled />
                    }
                </SView>

                <Separador1 />
                <Detalle data={this.data} disabled />
                <Separador1 />
                <Separador1 />
                <TotalesVenta data={this.data} />
                <Separador1 />
                <SHr height={10} />
                <PlanPagos ref={ref => this.pp = ref} data={this.data} disabled />
                <Separador1 />
                <SView col={"xs-12"} style={{ alignItems: "flex-end", paddingBottom: 10, paddingTop: 10 }}>
                    <Components.compra_venta.QRCompra data={this.data} />
                </SView>
                <Separador1 />

                <SView col={"xs-12"} row center>
                    <SView col={"xs-12"} center>
                        <SHr />
                        <SText bold>ACCIONES</SText>
                        <SHr />
                    </SView>
                    <SView col={"xs-12"} center row>
                        <SView card style={{ padding: 10, marginBottom: 10, backgroundColor: STheme.color.barColor}} row center>
                             <SIcon name={"iconDescarga2"} fill={STheme.color.text} width={25} height={25}/>
                                                        <SView width={8} />
                            <SView onPress={() => ComprobanteRollo.imprimir(this.data.key)}>
                                <SText>DESCARGAR PDF ROLLO</SText>
                            </SView>
                        </SView>
                        <SView width={8} />
                        <SView card style={{ padding: 10, marginBottom: 10, backgroundColor: STheme.color.barColor }} row center>
                             <SIcon name={"iconDescarga2"} fill={STheme.color.text} width={25} height={25}/>
                                                        <SView width={8} />
                            <SView onPress={() => ComprobanteCarta.imprimir(this.data.key)}>
                                <SText>DESCARGAR PDF CARTA</SText>
                            </SView>
                        </SView>
                        {/* <SView width={8} />
                        <SView style={{ marginBottom: 10, overflow: "hidden", borderRadius: 4 }} backgroundColor={STheme.color.background}>
                            <Components.compra_venta.GenerarAsiento data={this.data} />
                        </SView>

                        <SView width={8} />
                        <SView card style={{ padding: 16, marginBottom: 10, backgroundColor: STheme.color.barColor }} onPress={() => {
                            Model.compra_venta.Action.changeState({ data: this.data, state: "cotizacion" })
                        }}>
                            <SText bold color={STheme.color.danger}>VOLVER A COTIZACIÓN</SText>
                        </SView> */}
                    </SView>
                </SView>
             
                <SHr height={15} />
            </SView>
        </SView>

        );
    }
}