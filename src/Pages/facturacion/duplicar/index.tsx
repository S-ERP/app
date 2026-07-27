import React from "react";
import { SDate, SHr, SLoad, SNavigation, SNotification, SPage, SStorage, STheme, SUuid, SView } from "servisofts-component";
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

// Misma key usada por BoxMenu al presionar "Duplicar Factura": sirve de respaldo
// porque SNavigation no persiste params tipo objeto en la URL (se pierden al recargar).
const STORAGE_KEY_FACTURA_DUPLICAR = "factura_duplicar_pendiente";

export default class index extends React.Component {
    _____ambiente = MDL.factura.getAmbiente();

    factura: Factura;
    parametricas: Parametricas = {};
    state = {
        siat: null,
        ambiente: MDL.factura.ambiente,
        loadingDuplicado: false,
    }
    constructor(props: any) {
        super(props);
        const param = SNavigation.getParam("factura_duplicar");
        // Al recargar la página, SNavigation solo conserva el param si viene por navegación
        // en memoria; tras un F5 llega como string ("[object Object]") o undefined.
        const facturaDuplicar = param && typeof param === "object" ? param : undefined;
        this.factura = index.buildFactura(facturaDuplicar);
        this.state.loadingDuplicado = !facturaDuplicar;
    }

    static buildFactura(facturaDuplicar?: any): Factura {
        return {
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
                ],
                ...(facturaDuplicar ? {
                    ...facturaDuplicar,
                    cuf: "",
                    cufd: "",
                    cafc: "",
                    fechaEmision: new SDate().toString() + "",
                    detalle: (facturaDuplicar.detalle ?? []).map((item: any) => ({
                        ...item,
                        codigoProducto: item.codigoProducto != null ? String(item.codigoProducto) : "",
                        codigoProductoSin: item.codigoProductoSin != null ? String(item.codigoProductoSin) : "",
                        actividadEconomica: item.actividadEconomica != null ? String(item.actividadEconomica) : "",
                        cantidad: item.cantidad != null ? String(item.cantidad) : "1",
                        unidadMedida: item.unidadMedida != null ? String(item.unidadMedida) : "1",
                        descripcion: item.descripcion != null ? String(item.descripcion) : "",
                        precioUnitario: item.precioUnitario != null ? String(item.precioUnitario) : "0",
                        montoDescuento: item.montoDescuento != null ? String(item.montoDescuento) : "0",
                        subTotal: item.subTotal != null ? String(item.subTotal) : "0",
                        numeroImei: item.numeroImei != null ? String(item.numeroImei) : "",
                        numeroSerie: item.numeroSerie != null ? String(item.numeroSerie) : "",
                    })),
                } : {})
            }
        }
    }

    componentDidMount(): void {
        if (this.state.loadingDuplicado) {
            SStorage.getItem(STORAGE_KEY_FACTURA_DUPLICAR).then((raw) => {
                let facturaDuplicar: any = undefined;
                if (raw) {
                    try {
                        facturaDuplicar = JSON.parse(raw);
                    } catch (e) {
                        console.error("No se pudo leer la factura a duplicar guardada", e);
                    }
                }
                this.factura = index.buildFactura(facturaDuplicar);
                this.setState({ loadingDuplicado: false });
            });
        }
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
        // return;
        const FacturaData = this.factura;
        const FacturaAmbiente = this.state.ambiente;
        console.log("Factura a emitir:", FacturaData);
        console.log("Ambiente de emisión:", FacturaAmbiente === 1 ? "Producción" : "Prueba");
        // return;

        SNotification.send({
            key: "facturacionEmitir",
            title: "Emitiendo factura",
            type: "loading"
        })
        const resp = MDL.factura.emitir(this.factura, this.state.ambiente).then((e) => {
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

        console.log("%c" + JSON.stringify(resp), `color: #cc2eb2; font-weight: bold;`);

    }
    render() {
        if (this.state.loadingDuplicado) {
            return <SPage title={`Duplicar Factura (Ambiente: ${this._____ambiente === 1 ? "Producción ✅" : "Prueba 🛠️"})`}>
                <SView col={"xs-12"} padding={40} center>
                    <SLoad />
                </SView>
            </SPage>;
        }
        return <SPage title={`Duplicar Factura (Ambiente: ${this._____ambiente === 1 ? "Producción ✅" : "Prueba 🛠️"})`}>
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