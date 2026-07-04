import React, { Component } from 'react';
import { SHr, SIcon, SImage, SNotification, SPage, SPopup, SSCrollView, SScrollView2, SText, STheme, SView, SButtom, SDate, SMath, STable, STable2 } from 'servisofts-component';
import Components from '../../../../../Components';
import Model from '../../../../../Model';
import Cliente from '../Cliente';
import Detalle from '../Detalle';
import PlanPagos from '../PlanPagos';
import Proveedor from '../Proveedor';
import ReciboCarta from '../../../../../Components/PDF/venta/ReciboCarta';
import ReciboRollo from '../../../../../Components/PDF/venta/ReciboRollo';
import ReciboSmall from '../../../../../Components/PDF/venta/ReciboSmall';
import Estado from './Components/Estado';
import SSocket from 'servisofts-socket';
import Separador1 from './Components/Separador1';
import TotalesVenta from '../TotalesVenta';
import MDL from '../../../../../MDL';
import PopupSuscriptor from '../PopupSuscriptor';
import SIconApp from '../../../../../Assets/SIconApp';
import PopupDescripcion from '../../../Components/PopupDescripcion';
const PAGE_URL = "/venta/profile2";
export default class vendido extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            miSucursal: null,
            anulada: false,
            anulando: false,
        };
        this.popupAbierto = false;
    }
    async componentDidMount() {
        let sucursal = await MDL.empresa.getAllSucursales()
        let miSucursal = sucursal.find(s => s.key == this.props.data.key_sucursal)
        this.setState({ miSucursal })
        // if (this.props.data) {
        //     console.log("DATAP1", this.props.data);
        //     PopupSuscriptor.open({ data: this.props.data });
        // }
        // 👇 abrir con el mismo tipo de data que usa Detalle
        const primerDetalle = this.props.data?.detalle?.[0];

        if (primerDetalle) {
            console.log("DATA", this.props.data);
            console.log("DATAP1", primerDetalle);
            //PopupSuscriptor.open({ data: primerDetalle });
        }
    }
    // componentDidUpdate(prevProps) {
    //     if (prevProps.data !== this.props.data) {
    //         this.setState({ data: this.props.data });
    //     }
    //     if (!this.popupAbierto && this.props.data) {
    //         this.popupAbierto = true;
    //         PopupSuscriptor.open({ data: this.props.data });
    //     }
    // }
    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.setState({ data: this.props.data });
            console.log("DATAP1", this.props.data);
            // PopupSuscriptor.open({ data: this.props.data });
        }
    }
    openPdfFromBase64(base64) {
        const base64Content = base64.split(",")[1];
        const byteCharacters = atob(base64Content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const width = 512;
        const height = 512;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);
        window.open(blobUrl, "fact", `width=${width},height=${height},top=${top},left=${left}`);
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
        console.log("RENDER VENDIDO", this.props.data);
        const prueba = this.props.data;
        const esVenta = prueba?.tipo === "venta";
        const puedeAnularVenta = MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "anular_venta" });

        console.log("puedeAnularVenta", puedeAnularVenta);

        console.log("puedeAnularVenta", JSON.stringify(prueba));
        const data = this.props.data;
        let permiso = Model.usuarioPage.Action.getPermiso({ url: "/venta", permiso: "admin" })
        this.isAdmin = !!permiso ? true : Model.compra_venta_participante.Action.allowAdmin({ key_compra_venta: this.props.data.key });
        this.isSuperAdmin = !!permiso;
        this.sucursal = this.state?.miSucursal;
        this.data = { ...prueba, sucursal: this.state?.miSucursal };
        const anulada = this.state.anulada || Number(this.data?.estado) === 0;
        return (<SView col={"xs-12 sm-11 md-8 lg-8 xl-6"} card >
            <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                {this.data?.factura?.cuf ? <>
                    <SView width={170} center
                        style={{ backgroundColor: STheme.color.card, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, marginRight: 8, borderBottomColor: STheme.color.card, borderBottomWidth: 3 }}
                        padding={15}>
                        <SText bold fontSize={18} style={{ textTransform: "uppercase" }}>Factura Nro. {this.data?.factura?.numero}</SText>
                    </SView>
                </> : null}
                {!anulada && <Estado data={this.data} />}
                {anulada ? (
                    <SView style={{ backgroundColor: STheme.color.danger, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 }}>
                        <SText bold color={"#fff"} fontSize={12}>{esVenta ? "VENTA ANULADA" : "COMPRA ANULADA"}</SText>
                    </SView>
                ) : (
                    <SView
                        onPress={() => {
                            if (this.state.anulando) return;
                            if (!puedeAnularVenta) {
                                SNotification.send({
                                    key: "anular_venta_permiso",
                                    title: "Sin permisos para anular ventas",
                                    body: "Tu rol dentro del sistema no permite anular ventas. Si crees que esto es un error, comunícate con el administrador del sistema.",
                                    color: STheme.color.danger,
                                    time: 6000,
                                });
                                return;
                            }

                            SPopup.confirm({
                                title: "Anular venta",
                                message: "¿Está seguro de que desea anular esta venta? Esta acción no se puede deshacer.",
                                onPress: () => {
                                    const notificationKey = `anular_v_${this.data?.key}`;
                                    this.setState({ anulando: true });
                                    SNotification.send({ key: notificationKey, title: "Anulando venta...", type: "loading" });
                                    MDL.caja.anular_venta({ key_compra_venta: this.data?.key })
                                        .then(() => {
                                            SNotification.send({ key: notificationKey, title: "Venta anulada", body: "La venta se anuló correctamente.", color: STheme.color.success });
                                            this.setState({ anulada: true, anulando: false });
                                            if (this.props.onReload) this.props.onReload({ anulada: true });
                                        })
                                        .catch((error) => {
                                            this.setState({ anulando: false });
                                            SNotification.send({ key: notificationKey, title: "Error al anular venta", body: error?.error || error?.message || String(error), color: STheme.color.danger });
                                        });
                                }
                            });
                        }}
                        style={{ backgroundColor: STheme.color.danger + "22", borderWidth: 1, borderColor: STheme.color.danger, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6, opacity: this.state.anulando ? 0.5 : 1 }}
                    >
                        <SText bold color={STheme.color.danger} fontSize={12}>{esVenta ? "ANULAR VENTA" : "ANULAR COMPRA"}</SText>
                    </SView>
                )}
            </SView>
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
                    <SView row col={"xs-12"}>
                        <SText bold col={"xs-3"} fontSize={12}>Descripción: </SText>
                        <SText col={"xs-7"} fontSize={12} bold>{this.data?.descripcion}</SText>
                        <SView col={"xs-2"} row center onPress={() => {
                            if (MDL.rolesPermisos.getPermiso({ url: PAGE_URL, permiso: 'edit' })) {
                                PopupDescripcion.open({
                                    data: this.data,
                                    onReload: () => {
                                        console.log("RELOAD")
                                        this.props.onReload();
                                        SPopup.close("PopupDescripcion");
                                    }
                                })
                            } else {
                                SNotification.send({
                                    key: "editar_descripcion",
                                    title: "Sin permisos de edición",
                                    body: "Tu rol dentro del sistema no permite realizar modificaciones en este módulo. Si crees que esto es un error, comunícate con el administrador del sistema.",
                                    color: STheme.color.danger,
                                    time: 9000,
                                });
                            }
                        }}>
                            <SIconApp name={"Pencil"} width={14} height={14} fill={STheme.color.text} />
                        </SView>
                    </SView>
                    <SText bold col={"xs-3"} fontSize={12}>Empresa: </SText>
                    <SText fontSize={12} col={"xs-9"}>{this.data?.empresa?.razon_social}</SText>
                    <SText bold fontSize={12} col={"xs-3"}>NIT: </SText>
                    <SText fontSize={12} col={"xs-9"}>{this.data?.empresa?.nit}</SText>
                    <SText bold col={"xs-3"} fontSize={12}>Obsww: </SText>
                    <SText fontSize={12} col={"xs-9"}>{this.data?.observacion}</SText>
                </SView>
                <SHr height={10} />
                <Separador1 />
                <SView col={"xs-12"} row center>
                    {(this.data.tipo == "venta") ?
                        <Cliente data={this.data} disabled tipo={"cliente"}
                            onReload={() => {
                                console.log("RELOAD 2")
                                this.props.onReload();
                            }}
                        /> :
                        <Proveedor data={this.data} disabled tipo={"proveedor"}
                            onReload={() => {
                                console.log("RELOAD 2")
                                this.props.onReload();
                            }}
                        />
                    }
                </SView>
                <Separador1 />
                <Detalle data={this.data} disabled onPress={(data) => {
                    PopupSuscriptor.open({ data: data, })
                }} />
                <Separador1 />
                <Separador1 />
                <TotalesVenta data={this.data} />
                <Separador1 />
                <SHr height={10} />
                <PlanPagos ref={ref => this.pp = ref} data={this.data} onReload={this.props.onReload} disabled />
                <Separador1 />
                <SView col={"xs-12"} style={{ alignItems: "flex-end", paddingBottom: 10, paddingTop: 10 }}>
                    <Components.compra_venta.QRVenta data={this.data} />
                </SView>
                <Separador1 />
                { }
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
                                        if (resp?.data?.cuf || resp?.estado === 'exito') {
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
                        <SView col={"xs-5.5"} style={{ padding: 10, marginBottom: 10, backgroundColor: STheme.color.card, borderColor: STheme.color.card, borderWidth: 1 }} row center>
                            <SIcon name={"iconDescarga2"} fill={STheme.color.text} width={25} height={25} />
                            <SView width={8} />
                            <SView onPress={() => ReciboSmall.imprimir(this.data.key)}>
                                <SText>DESCARGAR PDF SMALL</SText>
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