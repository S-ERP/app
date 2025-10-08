import React from "react";
import { SDate, SHr, SNavigation, SNotification, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import SelectSucursalPuntoVenta from "./SelectSucursalPuntoVenta";
import { Factura } from "../../../MDL/factura/type";
import Model from "../../../Model";
import NitNumero from "./NitNumero";
import Label from "./Label";
import Cabecera from "./Cabecera";
import Detalle from "./Detalle";
import Footer from "./Footer";
import MDL from "../../../MDL";
import { Parametricas } from "../../../MDL/factura/typeParametricas";
// import Entorno from "../Components/Entorno";

export default class index extends React.Component {
    _____ambiente = MDL.factura.getAmbiente();

    factura: Factura;
    parametricas: Parametricas = {};
    state = {
        siat: null,
        ambiente: MDL.factura.ambiente,
    }
    constructor(props: any) {
        super(props);


        this.factura = {
            key: SUuid(),
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
            fecha_on: new Date().toISOString(),
            estado: 1,
            data: {
                nitEmisor: Model.empresa.Action.getSelect().nit,
                razonSocialEmisor: Model.empresa.Action.getSelect().razon_social,

                numeroFactura: "01",
                cuf: "",
                cufd: "",

                codigoSucursal: "0",
                codigoPuntoVenta: "0",
                municipio: "",
                direccion: "",
                telefono: "",
                fechaEmision: new SDate().toString() + "",
                nombreRazonSocial: "Servisofts SRL",
                codigoTipoDocumentoIdentidad: "5",
                numeroDocumento: "454561021",
                complemento: "",
                codigoCliente: "1",
                codigoMetodoPago: "1",
                numeroTarjeta: "",
                montoTotal: "0",
                montoTotalSujetoIva: "0",
                codigoMoneda: "1",
                tipoCambio: "1",
                montoTotalMoneda: "0",
                montoGiftCard: "0",
                descuentoAdicional: "0",
                codigoExcepcion: "1",
                cafc: "",
                leyenda: "",
                usuario: "Usuario",
                codigoDocumentoSector: "1",
                detalle: [
                    {
                        codigoProducto: "",
                        codigoProductoSin: "",
                        actividadEconomica: "",
                        cantidad: "1",
                        unidadMedida: "1",
                        descripcion: "",
                        precioUnitario: "0",
                        montoDescuento: "0",
                        subTotal: "0",
                        numeroImei: "",
                        numeroSerie: ""
                    }
                ]
            }
        }
    }

    componentDidMount(): void {

        SNotification.send({
            key: "ambienteFacturacion",
            title: this._____ambiente === 1 ? "Modo PRODUCCIÓN" : "Modo PRUEBA",
            body: this._____ambiente === 1 ? "Estás en modo de facturación PRODUCCIÓN." : "Estás en modo de facturación de PRUEBA",
            color: this._____ambiente === 1 ? STheme.color.success : STheme.color.warning,
            time: 10000,
        })

        MDL.rolesPermisos.getPermisoAsync({ url: "/facturacion/create", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        });
        MDL.factura.getParametrica({ ambiente: this.state.ambiente, parametrica: "tipoDocumentoIdentidad" }).then((parametricas) => {
            this.parametricas.tipoDocumentoIdentidad = parametricas as Parametricas["tipoDocumentoIdentidad"];
            this.setState({ ...this.state })
        }).catch(e => {
            console.error(e);
        })
        MDL.factura.getParametrica({ ambiente: this.state.ambiente, parametrica: "productosServicios" }).then((parametricas) => {
            this.parametricas.productosServicios = parametricas as Parametricas["productosServicios"];
            this.setState({ ...this.state })
        }).catch(e => {
            console.error(e);
        })
        MDL.factura.getParametrica({ ambiente: this.state.ambiente, parametrica: "unidadMedida" }).then((parametricas) => {
            this.parametricas.unidadMedida = parametricas as Parametricas["unidadMedida"];
            this.setState({ ...this.state })
        }).catch(e => {
            console.error(e);
        })
        MDL.factura.getParametrica({ ambiente: this.state.ambiente, parametrica: "leyendasFactura" }).then((parametricas) => {
            this.parametricas.leyendasFactura = parametricas as Parametricas["leyendasFactura"];
            if (!this.factura.data.leyenda && this.parametricas.leyendasFactura) {
                if (this.parametricas.leyendasFactura.length > 0) {
                    const random = Math.floor(Math.random() * this.parametricas.leyendasFactura.length)
                    this.factura.data.leyenda = this.parametricas.leyendasFactura[random].descripcionLeyenda
                }
            }
            this.setState({ ...this.state })
        }).catch(e => {
            console.error(e);
        })
    }

    handleEnviar() {
        console.log("Enviando");

        // if (this.factura.data.nit)
        SNotification.send({
            key: "facturacionEmitir",
            title: "Emitiendo factura",
            type: "loading"
        })
        MDL.factura.emitir(this.factura, this.state.ambiente).then((e) => {
            SNotification.send({
                key: "facturacionEmitir",
                title: "Factura emitida con éxito",
                color: STheme.color.success,
                time: 5000,
            })


            MDL.factura.imprimir({ cuf: e.data.cuf })

        }).catch((e) => {
            SNotification.send({
                key: "facturacionEmitir",
                title: "Ocurrio un error al emitir la factura",
                body: e.error,
                color: STheme.color.danger,
                time: 5000,
            })
            console.log(e);

        })
    }
    render() {
        return <SPage title={`Emitir Factura (Ambiente: ${this._____ambiente === 1 ? "Producción ✅" : "Prueba 🛠️"})`}>
            {/* return <SPage title={"Emitir Factura"}> */}
            {/* <Entorno onPress={() => {
                this.setState({ ambiente: this.state.ambiente == 1 ? 2 : 1 })
            }} ambiente={this.state.ambiente} /> */}
            <SView padding={8}>
                <SView col={"xs-12"} row style={{ alignItems: "flex-start" }}>
                    <SView flex={3} center>
                        <SelectSucursalPuntoVenta factura={this.factura} />
                    </SView>
                    <SView flex={2} />
                    <SView flex={3} center style={{ minWidth: 150 }}>
                        <NitNumero factura={this.factura} />
                    </SView>
                </SView>
                <SHr h={30} />
                <SView center>
                    <Label fontSize={30} bold>{"FACTURA"}</Label>
                    <Label >{"(Con Derecho a Crédito Fiscal)"}</Label>
                </SView>
                <SHr h={16} />
                <Cabecera factura={this.factura} parametricas={this.parametricas} />
                <SHr h={16} />
                <Detalle factura={this.factura} parametricas={this.parametricas} />
                <SHr h={16} />
                <Footer factura={this.factura} parametricas={this.parametricas} onSend={this.handleEnviar.bind(this)} />
            </SView>

        </SPage>;
    }
}