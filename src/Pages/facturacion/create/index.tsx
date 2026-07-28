import React from "react";
import { SDate, SHr, SIcon, SNavigation, SNotification, SPage, SText, STheme, SUuid, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
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
import SIconApp from "../../../Assets/SIconApp";

export default class index extends React.Component {
    _____ambiente = MDL.factura.getAmbiente();

    factura: Factura;
    parametricas: Parametricas = {};
    state = {
        siat: null,
        ambiente: MDL.factura.ambiente,
    }
    constructor(props: any) {
        super(props); this.factura = {
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
            time: 1000,
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
        this.updatePageBackground();
    }

    async actualizarNumeroFactura() {
        try {
            const response: any = await SSocket.sendPromise({
                service: "facturacion",
                component: "factura",
                type: "getAll",
                estado: "cargando",
                key_usuario: Model.usuario.Action.getKey(),
                key_empresa: Model.empresa.Action.getKey(),
            });
            const facturas: any[] = Object.values(response?.data ?? {});
            let max = 0;
            facturas.forEach((f: any) => {
                if (f?.ambiente != this.state.ambiente) return;
                if ((f?.data?.codigoSucursal ?? "") != this.factura.data.codigoSucursal) return;
                if ((f?.data?.codigoPuntoVenta ?? "") != this.factura.data.codigoPuntoVenta) return;
                const n = parseInt(f?.data?.numeroFactura ?? "0");
                if (!isNaN(n) && n > max) max = n;
            });
            this.factura.data.numeroFactura = (max + 1).toString();
            this.setState({ ...this.state });
        } catch (e) {
            console.error("No se pudo calcular el correlativo de factura", e);
        }
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        if (prevState.ambiente !== this.state.ambiente) {
            this.updatePageBackground();
        }
    }

    updatePageBackground() {
        const backgroundColor = this.state.ambiente === 1 ? STheme.color.success : STheme.color.warning;
        SPage.setBackground(<SView style={{ backgroundColor }} />);
    }

    validarAntesDeEmitir() {
        const detalle = this.factura.data.detalle; for (let i = 0; i < detalle.length; i++) {
            const item = detalle[i];
            // 🔴 codigoProducto
            if (!item.codigoProducto || item.codigoProducto.trim() === "") {
                SNotification.send({
                    title: "codigoProducto requerida",
                    body: `El item ${i + 1} no tiene codigoProducto.`,
                    color: STheme.color.danger,
                    time: 1000,

                });
                return false; // 🔥 IMPORTANTE
            }// 🔴 UNIDAD DE MEDIDA
            if (!item.unidadMedida || item.unidadMedida.trim() === "") {
                SNotification.send({
                    title: "Unidad de medida requerida",
                    body: `El item ${i + 1} no tiene unidad de medida.`,
                    color: STheme.color.danger,
                    time: 1000,

                });
                return false; // 🔥 IMPORTANTE
            }
            // 🔴 PRECIO UNITARIO
            if (!item.precioUnitario || item.precioUnitario.trim() === "") {
                SNotification.send({
                    title: "Precio requerido",
                    body: `El item ${i + 1} no tiene precio unitario.`,
                    color: STheme.color.danger,
                    time: 1000,
                });
                return false;
            }
            // 🔴 PRECIO INVÁLIDO
            const precio = parseFloat(item.precioUnitario);
            if (isNaN(precio) || precio <= 0) {
                SNotification.send({
                    title: "Precio inválido",
                    body: `El item ${i + 1} tiene un precio inválido.`,
                    color: STheme.color.danger,
                    time: 1000,
                });
                return false;
            } const cantidad = parseFloat(item.cantidad ?? "0");
            const descuento = parseFloat(item.montoDescuento ?? "0");
            const cantidadValida = isNaN(cantidad) ? 0 : cantidad;
            const precioValido = isNaN(precio) ? 0 : precio;
            const descuentoValido = isNaN(descuento) ? 0 : descuento;
            const totalItem = cantidadValida * precioValido;
            if (descuentoValido >= totalItem && totalItem > 0) {
                SNotification.send({
                    title: "Descuento inválido",
                    body: `El descuento del item ${i + 1} no puede ser igual o mayor al total (${totalItem}).`,
                    color: STheme.color.danger,
                    time: 3000,
                });
                return false;
            }
        }
        // aqui pongo que no tiene leyenda y genera
        // this.factura.data.leyenda = "";
        // 🔴 VALIDAR LEYENDA
        if (!this.factura.data.leyenda || this.factura.data.leyenda.trim() === "") {
            const leyendas = this.parametricas.leyendasFactura;
            if (leyendas && leyendas.length > 0) {
                const random = Math.floor(Math.random() * leyendas.length);
                this.factura.data.leyenda = leyendas[random].descripcionLeyenda;
            } else {
                SNotification.send({
                    title: "Leyenda requerida",
                    body: "No hay leyendas disponibles para la factura. Verifica las paramétricas.",
                    color: STheme.color.warning,
                    time: 2000,
                });
                return false;
            }
        }
        return true;
    }

    handleEnviar() {
        this.validarAntesDeEmitir();

        const faccc = this.factura;
        // console.clear();
        // console.dir(JSON.stringify(faccc));
        console.dir(faccc);

        // return;
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
            });
            MDL.factura.imprimir({ cuf: e.data.cuf })

        }).catch((e) => {
            SNotification.send({
                key: "facturacionEmitir",
                title: "Ocurrio un error al emitir la factura",
                body: e.error + "aaaa",
                color: STheme.color.danger,
                time: 5000,
            })
        })
    }
    render() {
        const titleText = `Emitir Factura (Ambiente: ${this.state.ambiente === 1 ? "Producción ✅" : "Prueba 🛠️"})`;


        return <SPage
            hidden title={titleText} header={
                <SView col="xs-12" style={{ backgroundColor: this.state.ambiente === 1 ? STheme.color.barColor : STheme.color.warning, height: 36, overflow: "hidden" }} row center>
                    <SView width={120} height={"100%"} onPress={() => SNavigation.goBack()} center> <SIconApp name="Back" height={18} width={20} fill={STheme.color.text} /> </SView>
                    <SView flex center> <SText fontSize={14} numberOfLines={1}>{titleText}</SText> </SView>
                    <SView width={120} height={"100%"} center>
                        {/* alvaro */}
                        {/* <SView height={26} style={{
                            borderRadius: 6,
                            backgroundColor: this.state.ambiente == 1 ? STheme.color.success : STheme.color.warning,
                            paddingHorizontal: 8,
                            borderWidth: 1,
                            borderColor: this.state.ambiente == 1 ? STheme.color.success : STheme.color.warning,
                        }} row center
                            onPress={() => {
                                MDL.factura.setAmbiente(MDL.factura.ambiente == 1 ? 2 : 1)
                                this.setState({ ambiente: MDL.factura.ambiente }, () => {
                                    this.actualizarNumeroFactura();
                                })
                            }}
                        >
                            <SText fontSize={11} color={STheme.color.text} center bold >{this.state.ambiente == 1 ? "PRODUCCIÓN" : "PRUEBA"}</SText>
                            <SView width={4} />
                            <SIcon name='Reload' width={9} fill={STheme.color.text} />
                        </SView> */}
                    </SView>
                </SView>
            }

        >

            <SView padding={8}>
                <SView col={"xs-12"} row style={{ alignItems: "flex-start" }}>
                    <SView flex={3} center>
                        <SelectSucursalPuntoVenta factura={this.factura} onPuntoVentaChange={this.actualizarNumeroFactura.bind(this)} />
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