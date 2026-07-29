import React from "react";
import { SDate, SHr, SIcon, SLoad, SNavigation, SNotification, SPage, SPopup, SStorage, STheme, SUuid, SView, SText, SButtom } from "servisofts-component";
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

const STORAGE_KEY_FACTURA_DUPLICAR = "factura_duplicar_pendiente";
const STORAGE_KEY_FACTURA_EDITAR_KEY = "factura_editar_key_pendiente";
const STORAGE_KEY_FACTURA_ESTADO = "factura_estado_pendiente";
const STORAGE_KEY_FACTURA_AMBIENTE = "factura_ambiente_pendiente";

// alvaro titulo
export default class index extends React.Component {
    _____ambiente = MDL.factura.getAmbiente();

    tipo: "duplicar" | "editar" = "duplicar";
    facturaKeyOriginal?: string;
    facturaEstadoOriginal?: string;
    facturaAmbienteOriginal?: number;
    factura: Factura;
    parametricas: Parametricas = {};
    state = {
        siat: null,
        ambiente: MDL.factura.ambiente,
        loadingDuplicado: false,
        mostrarErrores: false,
        estado: undefined as string | undefined,
    }
    constructor(props: any) {
        super(props);
        this.tipo = SNavigation.getParam("tipo") === "editar" ? "editar" : "duplicar";
        const param = SNavigation.getParam("factura_duplicar");
        const facturaDuplicar = param && typeof param === "object" ? param : undefined;
        if (this.tipo === "editar") {
            const facturaKeyParam = SNavigation.getParam("factura_key");
            this.facturaKeyOriginal = typeof facturaKeyParam === "string" ? facturaKeyParam : undefined;
        }
        const facturaEstadoParam = SNavigation.getParam("factura_estado");
        this.facturaEstadoOriginal = typeof facturaEstadoParam === "string" ? facturaEstadoParam : undefined;
        if (this.facturaEstadoOriginal) this.state.estado = this.facturaEstadoOriginal;
        const facturaAmbienteParam = parseInt(SNavigation.getParam("factura_ambiente") as any, 10);
        this.facturaAmbienteOriginal = (facturaAmbienteParam === 1 || facturaAmbienteParam === 2) ? facturaAmbienteParam : undefined;
        if (this.facturaAmbienteOriginal) this.state.ambiente = this.facturaAmbienteOriginal;
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
            const pKey = (this.tipo === "editar" && !this.facturaKeyOriginal)
                ? SStorage.getItem(STORAGE_KEY_FACTURA_EDITAR_KEY)
                : Promise.resolve(this.facturaKeyOriginal ?? null);
            const pEstado = this.facturaEstadoOriginal
                ? Promise.resolve(this.facturaEstadoOriginal)
                : SStorage.getItem(STORAGE_KEY_FACTURA_ESTADO);
            const pAmbiente = this.facturaAmbienteOriginal
                ? Promise.resolve(this.facturaAmbienteOriginal + "")
                : SStorage.getItem(STORAGE_KEY_FACTURA_AMBIENTE);
            const pDuplicar = SStorage.getItem(STORAGE_KEY_FACTURA_DUPLICAR);

            Promise.all([pKey, pEstado, pAmbiente, pDuplicar]).then(([key, estado, ambiente, raw]) => {
                if (this.tipo === "editar") this.facturaKeyOriginal = key || undefined;
                this.facturaEstadoOriginal = estado || undefined;
                const ambienteNum = parseInt(ambiente);
                this.facturaAmbienteOriginal = (ambienteNum === 1 || ambienteNum === 2) ? ambienteNum : undefined;

                let facturaDuplicar: any = undefined;
                if (raw) {
                    try {
                        facturaDuplicar = JSON.parse(raw);
                    } catch (e) {
                        console.error("No se pudo leer la factura a duplicar guardada", e);
                    }
                }
                this.factura = index.buildFactura(facturaDuplicar);
                this.setState({
                    loadingDuplicado: false,
                    ambiente: this.facturaAmbienteOriginal ?? this.state.ambiente,
                    estado: this.facturaEstadoOriginal ?? this.state.estado,
                });
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
        this.updatePageBackground();
    }

    async actualizarNumeroFactura() {
        if (this.tipo === "editar") return;
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
        const detalle = this.factura.data.detalle;
        const data = this.factura.data;

        const hayCamposVaciosCabecera = !data.numeroDocumento || !data.nombreRazonSocial || !data.codigoCliente
            || !data.numeroFactura || !data.codigoMetodoPago || !data.direccion || !data.telefono;

        const hayCamposVaciosDetalle = detalle.some((item) => {
            return !item.codigoProducto || item.codigoProducto.trim() === ""
                || !item.unidadMedida || item.unidadMedida.trim() === ""
                || !item.precioUnitario || item.precioUnitario.trim() === ""
                || !item.cantidad || item.cantidad.trim() === ""
                || !item.actividadEconomica || item.actividadEconomica.trim() === ""
                || !item.descripcion || item.descripcion.trim() === ""
                || item.montoDescuento == null || item.montoDescuento.trim() === "";
        });

        const hayCamposVacios = hayCamposVaciosCabecera || hayCamposVaciosDetalle;
        if (hayCamposVacios) {
            this.setState({ mostrarErrores: true });
            SNotification.send({
                title: "Campos incompletos",
                body: "Debe completar los campos requeridos.",
                color: STheme.color.danger,
                time: 2000,
            });
            return false;
        }
        this.setState({ mostrarErrores: false });

        for (let i = 0; i < detalle.length; i++) {
            const item = detalle[i];
            const precio = parseFloat(item.precioUnitario);
            if (isNaN(precio) || precio <= 0) {
                SNotification.send({
                    title: "Precio inválido",
                    body: `El item ${i + 1} tiene un precio inválido.`,
                    color: STheme.color.danger,
                    time: 1000,
                });
                return false;
            }
            const cantidad = parseFloat(item.cantidad ?? "0");
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

    confirmarEditar() {
        if (!this.facturaKeyOriginal) {
            SNotification.send({
                title: "Error",
                body: "No se encontró la factura original a editar.",
                color: STheme.color.danger,
                time: 5000,
            });
            return;
        }
        MDL.factura.editarFactura(this.facturaKeyOriginal, this.factura.data, this.state.ambiente, this.state.estado ?? "").then(() => {
            SNavigation.goBack();
        }).catch((e) => {
            console.error(e);
        });
    }

    confirmarDuplicar() {
        SNotification.send({
            key: "facturacionEmitir",
            title: "Emitiendo factura",
            type: "loading"
        })
        MDL.factura.duplicar(this.factura, this.state.ambiente).then((e) => {
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

    handleEnviar() {
        if (!this.validarAntesDeEmitir()) return;

        const isEditar = this.tipo === "editar";
        const key = "confirmEnviarFactura";

        SPopup.open({
            key: key,
            style: { backgroundColor: STheme.color.text + "AA" },
            content: <SView width={340} style={{ maxWidth: "100%", borderRadius: 14, overflow: "hidden" }} backgroundColor={STheme.color.background} withoutFeedback center>
                <SView col={"xs-12"} padding={16} center style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray }}>
                    <SText fontSize={18} bold color={STheme.color.warning}>{isEditar ? "⚠ Confirmar edición" : "⚠ Confirmar emisión"}</SText>
                </SView>
                <SView col={"xs-12"} padding={24} center>
                    <SText fontSize={40}>{isEditar ? "📝" : "🧾"}</SText>
                    <SHr h={8} />
                    <SText fontSize={16} bold center>{isEditar ? "¿Está seguro de editar esta factura?" : "¿Está seguro de emitir esta factura?"}</SText>
                    <SHr h={8} />
                    <SText fontSize={12} center color={STheme.color.gray}>
                        {isEditar
                            ? "Podrá modificar la información de la factura antes de guardar los cambios."
                            : "Una vez emitida, la factura será enviada al SIAT y no podrá modificarse."}
                    </SText>
                    <SHr h={8} />
                    <SText fontSize={12} bold center color={STheme.color.danger}>{"Esta acción no se puede deshacer."}</SText>
                </SView>
                <SView col={"xs-12"} row padding={16} style={{ borderTopWidth: 1, borderColor: STheme.color.lightGray }}>
                    <SView flex center onPress={() => SPopup.close(key)} style={{ padding: 12, borderRadius: 8, backgroundColor: STheme.color.card, marginRight: 6 }}>
                        <SText center bold>{"Cancelar"}</SText>
                    </SView>
                    <SView flex center onPress={() => {
                        SPopup.close(key);
                        if (isEditar) this.confirmarEditar();
                        else this.confirmarDuplicar();
                    }} style={{ padding: 12, borderRadius: 8, backgroundColor: STheme.color.success, marginLeft: 6 }}>
                        <SText center bold color={STheme.color.white}>{isEditar ? "✔ Sí, editar factura" : "✔ Sí, emitir factura"}</SText>
                    </SView>
                </SView>
            </SView>
        });
    }
    render() {
        const accionText = this.tipo === "editar" ? "Editar Factura" : "Duplicar Factura";
        const titleText = `${accionText} (Ambiente: ${this.state.ambiente === 1 ? "Producción ✅" : "Prueba 🛠️"})`;

        const ambienteColor = this.state.ambiente == 1 ? STheme.color.success : STheme.color.warning;
        const header = <SView col="xs-12 " style={{
            backgroundColor: STheme.color.background,
            height: 64,
            borderBottomWidth: 1,
            borderColor: STheme.color.lightGray,
            paddingHorizontal: 12,
        }} row center>

            <SView width={42} height={42} onPress={() => SNavigation.goBack()} center style={{
                borderRadius: 21,
                backgroundColor: STheme.color.card,
                borderWidth: 1,
                borderColor: STheme.color.lightGray,
            }}>
                <SIconApp name="Back" height={18} width={20} fill={STheme.color.text} />
            </SView>
            <SView width={12} />
            <SView flex>
                <SText fontSize={16} bold numberOfLines={1}>{accionText}</SText>
                <SText fontSize={11} color={STheme.color.gray} numberOfLines={1}>{"Facturación electrónica · SIAT Bolivia"}</SText>
            </SView>
            <SView row center style={{
                borderRadius: 999,
                backgroundColor: ambienteColor + "22",
                borderWidth: 1,
                borderColor: ambienteColor,
                paddingHorizontal: 12,
                paddingVertical: 6,
            }}
                onPress={() => {
                    MDL.factura.setAmbiente(MDL.factura.ambiente == 1 ? 2 : 1)
                    this.setState({ ambiente: MDL.factura.ambiente }, () => {
                        this.actualizarNumeroFactura();
                    })
                }}
            >
                <SView width={7} height={7} style={{ borderRadius: 4, backgroundColor: ambienteColor }} />
                <SView width={6} />
                <SText fontSize={11} bold color={ambienteColor}>{this.state.ambiente == 1 ? "AMBIENTE: PRODUCCIÓN" : "AMBIENTE: PRUEBA"}</SText>
                <SView width={6} />
                <SIcon name='Reload' width={9} fill={ambienteColor} />
            </SView>
        </SView>;

        const footerAlvaro = this.tipo === "duplicar" ? <SView col={"xs-12 md-10"} style={{
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: STheme.color.lightGray,
            borderRadius: 12,
            padding: 12,
            backgroundColor: STheme.color.background,
        }}>
            <Label fontSize={12} bold>{"Información"}</Label>
            <SHr h={4} />
            <Label fontSize={11} color={STheme.color.gray}>{"• Se copiarán todos los productos de la factura original."}</Label>
            <Label fontSize={11} color={STheme.color.gray}>{"• La factura original permanecerá sin modificaciones."}</Label>
            <Label fontSize={11} color={STheme.color.gray}>{"• Podrá editar cualquier dato antes de emitir la nueva factura."}</Label>
            <Label fontSize={11} color={STheme.color.gray}>{"• Se generará un nuevo número de factura al momento de la emisión."}</Label>
        </SView> : <SView col={"xs-12 md-10"} style={{
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: STheme.color.lightGray,
            borderRadius: 12,
            padding: 12,
            backgroundColor: STheme.color.background,
        }}>
            <Label fontSize={12} bold>{"Información"}</Label>
            <SHr h={4} />
            <Label fontSize={11} color={STheme.color.gray}>{"• Se cargarán todos los datos actuales de la factura."}</Label>
            <Label fontSize={11} color={STheme.color.gray}>{"• Podrá modificar cualquier información antes de guardar los cambios."}</Label>
            <Label fontSize={11} color={STheme.color.gray}>{"• La factura conservará su número y su identidad dentro del sistema."}</Label>
            <Label fontSize={11} color={STheme.color.gray}>{"• Verifique la información antes de guardar las modificaciones."}</Label>
        </SView>;

        if (this.state.loadingDuplicado) {
            return <SPage hidden title={titleText} header={header}>
                <SView col={"xs-12"} padding={40} center>
                    <SLoad />
                </SView>
            </SPage>;
        }
        return <SPage hidden header={header}  >

            <SView col={"xs-12 md-8"} padding={8} center >
                <SView col={"xs-12"} row style={{ alignItems: "flex-start" }}>
                    <SView flex={3} center>
                        <SelectSucursalPuntoVenta factura={this.factura} onPuntoVentaChange={this.actualizarNumeroFactura.bind(this)} mostrarErrores={this.state.mostrarErrores} />
                    </SView>
                    <SView flex={2} />
                    <SView flex={3} center style={{ minWidth: 150 }}>
                        <NitNumero factura={this.factura} estado={this.state.estado} ambiente={this.state.ambiente}
                            mostrarErrores={this.state.mostrarErrores}
                            onEstadoChange={(estado) => { this.facturaEstadoOriginal = estado; this.setState({ estado }); }}
                        />
                    </SView>
                </SView>
                <SHr h={30} />
                <SView center>
                    <Label fontSize={30} bold>{"FACTURA"}</Label>
                    <Label >{"(Con Derecho a Crédito Fiscal)"}</Label>
                </SView>
                <SHr h={16} />
                <Cabecera factura={this.factura} parametricas={this.parametricas} mostrarErrores={this.state.mostrarErrores} />
                <SHr h={16} />


                <SView col={"md-8"} center  >

                    <Detalle factura={this.factura} parametricas={this.parametricas} mostrarErrores={this.state.mostrarErrores} />
                </SView>


                <SHr h={16} />


                <Footer factura={this.factura} parametricas={this.parametricas} mostrarErrores={this.state.mostrarErrores} onSend={this.handleEnviar.bind(this)} />
                <SHr h={16} />

                <SView row>
                    <SButtom style={{ height: 35 }} type={"danger"} onPress={() => {
                        SNavigation.goBack()
                    }}>Cancelar</SButtom>
                    <SView width={5} />
                    <SButtom style={{ height: 35, background:"green" }} type={"outline"}  onPress={() => {
                        this.handleEnviar()
                    }}>Duplicar Factura</SButtom>
                </SView>

            </SView>
            {footerAlvaro}
            <SHr h={10} />
        </SPage>;
    }
}