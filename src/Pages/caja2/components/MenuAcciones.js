import React, { Component } from 'react';
import { SHr, SImage, SNavigation, SNotification, SPopup, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import CargarEfectivoDelBanco from '../Acciones/CargarEfectivoDelBanco';
import Transferencia from '../Acciones/Transferencia';
import SIconApp from '../../../Assets/SIconApp';
import TotalTipoPagoTabla from './TotalTipoPagoTabla';
import PdfCierreCaja from '../../../Components/PDF/venta/PdfCierreCaja';
import SelectTipoPagoVenta from './SelectTipoPagoCompra';
import SSocket from 'servisofts-socket';
import { ColorCompraVenta } from '../../../Config/theme';

export default class MenuAcciones extends Component {

    state = { usuario: null }

    componentDidMount() {
        this._mounted = true;
        this.cargarUsuario();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.caja?.key_usuario !== this.props.caja?.key_usuario) {
            this.cargarUsuario();
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    cargarUsuario() {
        const keyUsuario = this.props.caja?.key_usuario;
        const _key_caja = SNavigation.getParam("key");
        if (!_key_caja || !keyUsuario) return;
        MDL.usuario.getByKeys([keyUsuario]).then(usuarios => {
            if (this._mounted) this.setState({ usuario: usuarios?.[0] ?? null });
        }).catch(() => { });
    }

    getNombreCajero() {
        const u = this.state.usuario;
        if (!u) return null;
        return [u.Nombres, u.Apellidos].filter(Boolean).join(" ") || null;
    }

    cerrar_caja() {
        const caja = this.props.caja;
        if (!caja?.key) return;
        const nombreCajero = this.getNombreCajero();
        SPopup.open({
            key: "barcode_scanner",
            content: <SView style={{
                width: "100%",
                maxWidth: 800,
                backgroundColor: STheme.color.background,
                borderRadius: 8,
                overflow: "hidden",
                padding: 15,
                maxHeight: "100%",
            }} height={415} withoutFeedback>
                <SView style={{ height: "100%" }}>
                    <SScrollView2>
                        <SText bold fontSize={16}>Resumen de cuentas</SText>
                        <SHr height={4} />
                        <TotalTipoPagoTabla key_punto_venta={caja.key_punto_venta} movimientos={this.props.movimientos} />
                        <SHr height={20} />
                        <SView col={"xs-12"} row style={{ alignItems: "center", justifyContent: "flex-end" }}>
                            {nombreCajero && (
                                <SView row style={{
                                    alignItems: "center",
                                    backgroundColor: STheme.color.danger + "18",
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: STheme.color.danger + "60",
                                    paddingHorizontal: 10,
                                    paddingVertical: 8,
                                    marginRight: 12,
                                    flex: 1,
                                }}>
                                    <SView width={36} height={36} style={{
                                        borderRadius: 18,
                                        overflow: "hidden",
                                        borderWidth: 2,
                                        borderColor: STheme.color.danger,
                                    }}>
                                        {SSocket.api?.root && caja?.key_usuario
                                            ? <SImage src={`${SSocket.api.root}usuario/${caja.key_usuario}`} style={{ width: 36, height: 36 }} />
                                            : <SView width={36} height={36} center style={{ backgroundColor: STheme.color.card }}>
                                                <SIconApp name="Muser" width={20} height={20} fill={STheme.color.danger} />
                                            </SView>
                                        }
                                    </SView>
                                    <SView width={10} />
                                    <SView flex>
                                        <SText fontSize={10} color={STheme.color.danger}>Cajero activo</SText>
                                        <SText fontSize={13} bold numberOfLines={1}>{nombreCajero}</SText>
                                    </SView>
                                </SView>
                            )}
                            <SView width={120} height={40} center style={{
                                borderRadius: 4,
                                borderColor: STheme.color.danger,
                                backgroundColor: STheme.color.danger,
                            }} onPress={() => {
                                SPopup.confirm({
                                    title: "Cerrar Caja",
                                    message: nombreCajero
                                        ? `¿Estás seguro de cerrar la caja de ${nombreCajero}?`
                                        : "¿Deseas cerrar la caja?",
                                    onPress: () => {
                                        SNotification.send({
                                            key: "caja_cerrar",
                                            title: "Cargando",
                                            type: "loading",
                                        });
                                        MDL.caja.cerrar({
                                            key: caja.key,
                                            key_punto_venta: caja.key_punto_venta,
                                        }).then(() => {
                                            SPopup.close("barcode_scanner");
                                            SNotification.remove("caja_cerrar");
                                            SNotification.send({ key: "pdf_cierre", title: "Generando PDF de cierre...", type: "loading" });
                                            PdfCierreCaja.imprimirPDF(caja.key)
                                                .then(() => {
                                                    SNotification.remove("pdf_cierre");
                                                    SNavigation.replace("/caja", {});
                                                })
                                                .catch(e => {
                                                    SNotification.send({ key: "pdf_cierre", title: "Error al generar PDF", body: e?.error ?? JSON.stringify(e), color: STheme.color.danger, time: 5000 });
                                                    SNavigation.replace("/caja", {});
                                                });
                                        }).catch(e => {
                                            SNotification.send({
                                                key: "caja_cerrar",
                                                title: "Error al cerrar caja",
                                                body: e?.error ?? JSON.stringify(e),
                                                color: STheme.color.danger,
                                                time: 5000,
                                            });
                                        });
                                    }
                                });
                            }}>
                                <SText fontSize={15}>Cerrar Caja</SText>
                            </SView>
                        </SView>
                    </SScrollView2>
                </SView>
            </SView>
        });
    }

    enviarAlBanco = () => {
        const caja = this.props.caja;
        if (!caja?.key) return;
        const movimientos = this.props.movimientos ?? [];
        SelectTipoPagoVenta.openPopup({
            key_punto_venta: caja.key_punto_venta,
            solo_para_caja: true,
            montoMaximoPorTipo: {
                efectivo: movimientos.filter(mov => mov.key_tipo_pago === "efectivo").reduce((sum, mov) => sum + (mov.monto || 0), 0),
                pagare: movimientos.filter(mov => mov.key_tipo_pago === "pagare").reduce((sum, mov) => sum + (mov.monto || 0), 0),
                cheque: movimientos.filter(mov => mov.key_tipo_pago === "cheque").reduce((sum, mov) => sum + (mov.monto || 0), 0),
            },
            onSelect: (item) => {
                const monto = parseFloat(item?.efectivo) || 0;
                if (monto <= 0) {
                    SNotification.send({ key: "banco_envio", title: "Monto inválido", body: "El monto debe ser mayor a 0.", color: STheme.color.danger, time: 4000 });
                    return;
                }
                MDL.caja.registro_detalle({
                    key_caja: caja.key,
                    fecha: caja.fecha,
                    descripcion: "Envio al banco",
                    monto: monto * -1,
                    tipo: "egreso_banco",
                    tipo_pago: item,
                }).then(() => {
                    SelectTipoPagoVenta.closePopup();
                }).catch(e => {
                    SNotification.send({
                        key: "banco_envio",
                        title: "Error al enviar al banco",
                        body: e?.error ?? JSON.stringify(e),
                        color: STheme.color.danger,
                        time: 5000,
                    });
                });
            }
        });
    }

    cargarEfectivoDelBanco() {
        CargarEfectivoDelBanco.open({ key_caja: this.props.caja?.key });
    }

    transferir() {
        Transferencia.open({ key: this.props.caja?.key });
    }

    render() {
        const caja = this.props.caja;
        const cajaCerrada = !!caja?.fecha_cierre;
        const soloLectura = !!this.props.soloLectura;
        const _key_caja = SNavigation.getParam("key");
        const { usuario } = this.state;

        return (
            <SView row wrap>
                {!cajaCerrada && (
                    <>
                        <BtnAccion text={"Transferir"} margin={4} padding={10} background={"#2563eb66"} borderColor={"#2563eb"} onPress={this.transferir.bind(this)} icon="transferir" />
                        <BtnAccion text={"Cargar Efectivo"} margin={4} padding={10} background={"#0891b266"} borderColor={"#0891b2"} onPress={this.cargarEfectivoDelBanco.bind(this)} icon="cargarEfectivo" disabled={soloLectura} />
                        <BtnAccion text={"Vender"} margin={4} padding={10} background={ColorCompraVenta.venta + "70"} borderColor={ColorCompraVenta.venta} onPress={() => { SNavigation.navigate("/puntoventa") }} icon="venta" disabled={soloLectura} />
                        <BtnAccion text={"Comprar"} margin={4} padding={10} background={ColorCompraVenta.compra + "70"} borderColor={ColorCompraVenta.compra} onPress={() => { SNavigation.navigate("/compra3") }} icon="compra" disabled={soloLectura} />
                        <BtnAccion text={"Proveedores"} margin={4} padding={10} background={"#ea580c66"} borderColor={"#ea580c"} onPress={() => { SNavigation.navigate("/proveedor") }} icon="proveedores" disabled={soloLectura} />
                        <BtnAccion text={"Clientes"} margin={4} padding={10} background={"#e11d4866"} borderColor={"#e11d48"} onPress={() => { SNavigation.navigate("/cliente") }} icon="clientes" disabled={soloLectura} />
                        {/* {_key_caja && usuario && (<CajeroCard usuario={usuario} key_usuario={caja?.key_usuario} />)} */}
                        <BtnAccion text={"Cerrar la Caja"} margin={4} padding={10} background={STheme.color.danger + "70"} borderColor={STheme.color.danger} onPress={this.cerrar_caja.bind(this)} icon="cerrarCaja" />
                    </>
                )}
                {/* {cajaCerrada && ( */}
                <BtnAccion text={"Imprimir Cierre Caja"} margin={4} padding={10} background={"#475569"} borderColor={STheme.color.lightGray} onPress={() => {
                    if (caja?.key) PdfCierreCaja.imprimirPDF(caja.key);
                }} icon="imprimir" />
                {/* )} */}
            </SView>
        );
    }
}

const CajeroCard = ({ usuario, key_usuario }) => {
    const nombre = [usuario?.Nombres, usuario?.Apellidos].filter(Boolean).join(" ") || "—";
    const fotoUrl = SSocket.api?.root && key_usuario
        ? `${SSocket.api.root}usuario/${key_usuario}`
        : null;
    return (
        <SView row style={{
            backgroundColor: STheme.color.danger + "20",
            borderRadius: 8,
            borderWidth: 2,
            borderColor: STheme.color.danger,
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 6,
            margin: 4,
        }}>
            <SView width={32} height={32} style={{ borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: STheme.color.danger }}>
                {fotoUrl
                    ? <SImage src={fotoUrl} style={{ width: 32, height: 32 }} />
                    : <SView width={32} height={32} center style={{ backgroundColor: STheme.color.card }}>
                        <SIconApp name="Muser" width={18} height={18} fill={STheme.color.text} />
                    </SView>
                }
            </SView>
            <SView width={8} />
            <SView>
                <SText fontSize={10} color={STheme.color.danger}>Cajero activo</SText>
                <SText fontSize={12} bold numberOfLines={1}>{nombre}</SText>
            </SView>
        </SView>
    );
};

const BtnAccion = (props) => {
    return <SView row style={{
        backgroundColor: props.disabled ? STheme.color.card : (props.background || STheme.color.card),
        borderRadius: 8,
        borderWidth: 2,
        borderColor: props.disabled ? STheme.color.lightGray + "30" : (props.borderColor || STheme.color.card),
        opacity: props.disabled ? 0.35 : 1,
    }} padding={props.padding || 8} margin={props.margin || 4} onPress={props.disabled ? undefined : props.onPress}>
        {props.icon && <SIconApp width={18} height={18} name={props.icon} fill={props.disabled ? STheme.color.lightGray : STheme.color.text} />}
        <SView width={props.icon ? 8 : 0} />
        <SText color={props.disabled ? STheme.color.lightGray : undefined}>{props.text}</SText>
    </SView>;
};
