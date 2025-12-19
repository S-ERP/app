import React, { Component } from 'react';
import { View, Text, Linking } from 'react-native';
import { SHr, SIcon, SImage, SNotification, SPage, SPopup, SSCrollView, SScrollView2, SText, STheme, SView, SButtom, SDate, SMath, STable, STable2 } from 'servisofts-component';
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
import PopupSuscriptor from '../PopupSuscriptor';


export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            miSucursal: null
        };
    }

    async componentDidMount() {
        let sucursal = await MDL.empresa.getAllSucursales()
        let miSucursal = sucursal.find(s => s.key == this.props.data.key_sucursal)
        this.setState({ miSucursal })


    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.setState({ data: this.props.data });
        }
    }

    openPdfFromBase64(base64) {
        // Extraer la parte del contenido base64 (sin el encabezado "data:application/pdf;base64,")
        const base64Content = base64.split(",")[1];

        // Decodificar base64 a un array de bytes
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        // Crear un Blob a partir del array de bytes
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        // Crear una URL temporal para el Blob
        const blobUrl = URL.createObjectURL(blob);

        // Abrir el PDF en una nueva pestaña
        // window.open(blobUrl);

        const width = 512;
        const height = 512;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);
        window.open(blobUrl, "fact", `width=${width},height=${height},top=${top},left=${left}`);
        // Limpia la URL cuando ya no la necesitas (opcional)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000); // 60s
    }

    imprimirFactura(cuf) {
        SNotification.send({
            key: "imprimir",
            title: "Imprimiendo factura",
            type: "loading"
        })
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "imprimir",
            key_empresa: Model.empresa.Action.getKey(),
            key_usuario: Model.usuario.Action.getKey(),
            cuf: cuf,
        }).then(e => {
            console.log(e);
            const b64 = e.data.pdf
            const pdf = `data:application/pdf;base64,${b64}`
            this.openPdfFromBase64(pdf)
            SNotification.send({
                key: "imprimir",
                title: "Factura impresa con éxito",
                body: cuf,
                color: STheme.color.success,
                time: 5000,
            })
        }).catch(e => {
            SNotification.send({
                key: "imprimir",
                title: "No se pudo imprimir la factura.",
                body: e.error,
                color: STheme.color.error,
                time: 5000,
            })
        })
    }

    render() {
        this.data = this.props.data;
        const sucursal = this.state.miSucursal;
        const data = this.props.data;

        let permiso = Model.usuarioPage.Action.getPermiso({ url: "/venta", permiso: "admin" })
        this.isAdmin = !!permiso ? true : Model.compra_venta_participante.Action.allowAdmin({ key_compra_venta: this.props.data.key });
        this.isSuperAdmin = !!permiso;
        // const { factura } = this.state;

        this.sucursal = this.state?.miSucursal;
        // console.clear();
        // console.log("%c" + JSON.stringify(this.data, null, 2), "color: #2ECC40; font-weight: bold;");

        return (<SView col={"xs-12 sm-11 md-8 lg-8 xl-6"} card >


            <SView col={"xs-12"} padding={10} row style={{ justifyContent: "space-between" }}>

                {this.data?.factura?.cuf ? <>
                    <SView width={170} center
                        style={{ backgroundColor: STheme.color.card, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, marginRight: 8, borderBottomColor: STheme.color.card, borderBottomWidth: 3 }}
                        padding={5}>
                        <SText bold fontSize={18} style={{ textTransform: "uppercase" }}>Factura Nro. {this.data?.factura?.numero}</SText>
                    </SView>
                </> : null}
                <Estado data={this.data} />
            </SView>




            {/* <Estado data={this.data} /> */}
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
                <Detalle data={this.data} disabled onPress={(data) => {
                    PopupSuscriptor.open({
                        data: data,
                    })
                }} />
                <Separador1 />
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


                {/* si ya tiene 2 facturas, no tiene que facturar */}



                <SView col={"xs-12"} row center>
                    <SView col={"xs-12"} center>
                        <SHr />
                        <SText bold>ACCIONES</SText>
                        <SHr />
                    </SView>



                    <SView col={"xs-12"} center row>
                        <SView col={"xs-12"} card style={{ padding: 10, marginBottom: 10, backgroundColor: this.data?.factura?.cuf ? STheme.color.card : STheme.color.barColor }} row center>
                            <SIcon name={"iconDescarga2"} fill={STheme.color.text} width={25} height={25} />
                            <SView width={8} />
                            <SView
                                onPress={async () => {
                                    try {
                                        const factura = this.data?.factura;
                                        if (factura?.cuf) {
                                            this.imprimirFactura(factura.cuf);
                                            return;
                                        }

                                        const resp = await MDL.compra_venta.factura(this.props.data.key);

                                        console.log("%c" + JSON.stringify(resp, null, 2), "color: #2ECC40; font-weight: bold;");

                                        if (resp?.data?.cuf || resp?.estado === 'exito') {

                                            // 🔁 RECARGAR DATA PARA EVITAR DOBLE FACTURA
                                            if (this.props.onReload) {
                                                await this.props.onReload();
                                            }

                                            const cuf = resp?.data?.cuf || this.props.data?.factura?.cuf;
                                            this.imprimirFactura(cuf);

                                        } else {
                                            SNotification.send({
                                                key: "imprimir",
                                                title: "Error al facturar",
                                                body: "No se recibió el CUF desde el servidor.",
                                                color: STheme.color.warning,
                                                time: 5000,
                                            });
                                        }


                                    } catch (error) {
                                        console.error(error);
                                        SNotification.send({
                                            key: "imprimir",
                                            title: "Error al facturar",
                                            body: error?.error || "Ocurrió un error inesperado",
                                            color: STheme.color.error,
                                            time: 5000,
                                        });
                                    }
                                }}
                            // onPress={() => ReciboRollo.imprimir(this.data.key)}
                            >
                                <SText bold> {this.data?.factura?.cuf ? "DESCARGAR FACTURA" : "FACTURAR E IMPRIMIR"} </SText>
                            </SView>
                        </SView>
                    </SView>



                    <SView col={"xs-12"} center row style={{ justifyContent: "space-between" }}>
                        <SView col={"xs-5.5"} style={{ padding: 10, marginBottom: 10, backgroundColor: STheme.color.card, borderColor: STheme.color.card, borderWidth: 1 }} row center>
                            <SIcon name={"iconDescarga2"} fill={STheme.color.text} width={25} height={25} />
                            <SView width={8} />
                            <SView onPress={() => ReciboRollo.imprimir(this.data.key)}>
                                <SText>DESCARGAR PDF ROLLO</SText>
                            </SView>
                        </SView>


                        <SView col={"xs-5.5"} style={{ padding: 10, marginBottom: 10, backgroundColor: STheme.color.card, borderColor: STheme.color.card, borderWidth: 1 }} row center>
                            <SIcon name={"iconDescarga2"} fill={STheme.color.text} width={25} height={25} />
                            <SView width={8} />
                            <SView onPress={() => ReciboCarta.imprimir(this.data.key)}>
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