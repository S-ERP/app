import React, { Component } from 'react';
import { SHr, SNavigation, SNotification, SPopup, SScrollView2, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import CargarEfectivoDelBanco from '../Acciones/CargarEfectivoDelBanco';
import Transferencia from '../Acciones/Transferencia';
import SIconApp from '../../../Assets/SIconApp';
import { ColorCompraVenta } from '../../../Config/theme';
import TotalTipoPagoTabla from './TotalTipoPagoTabla';
import PdfCierreCaja from '../../../Components/PDF/venta/PdfCierreCaja';
import SelectTipoPagoVenta from './SelectTipoPagoVenta';

export default class MenuAcciones extends Component {

    cerrar_caja() {
        const caja = this.props.caja;
        if (!caja?.key) return;
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
                        <SView col={"xs-12"} center>
                            <SView width={120} height={40} center style={{
                                borderRadius: 4,
                                borderColor: STheme.color.danger,
                                backgroundColor: STheme.color.danger,
                            }} onPress={() => {
                                SPopup.confirm({
                                    title: "Cerrar Caja",
                                    message: "¿Deseas cerrar la caja?",
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
        CargarEfectivoDelBanco.open({});
    }

    transferir() {
        Transferencia.open({ key: this.props.caja?.key });
    }

    render() {
        const caja = this.props.caja;
        const cajaCerrada = !!caja?.fecha_cierre;

        return (
            <SView row>
                {!cajaCerrada && (
                    <>
                        <BtnAccion text={"Transferir"} margin={4} padding={10} background={STheme.color.card} borderColor={STheme.color.card} onPress={this.transferir.bind(this)} icon="Reload" />
                        <BtnAccion text={"Vender Productos"} margin={4} padding={10} background={ColorCompraVenta.venta + "70"} borderColor={ColorCompraVenta.venta} onPress={() => { SNavigation.navigate("/puntoventa") }} icon="ventaCarro" />
                        <BtnAccion text={"Comprar Productos"} margin={4} padding={10} background={ColorCompraVenta.compra + "70"} borderColor={ColorCompraVenta.compra} onPress={() => { SNavigation.navigate("/compra2") }} icon="compraCarro" />
                        <BtnAccion text={"Pagar a Proveedores"} margin={4} padding={10} background={STheme.color.card} borderColor={STheme.color.card} onPress={() => { SNavigation.navigate("/proveedor") }} icon="pagoefectivo" />
                        <BtnAccion text={"Cobrar a Clientes"} margin={4} padding={10} background={STheme.color.card} borderColor={STheme.color.card} onPress={() => { SNavigation.navigate("/cliente") }} icon="tareaUser" />
                        <BtnAccion text={"Cerrar la Caja"} margin={4} padding={10} background={STheme.color.danger + "70"} borderColor={STheme.color.danger} onPress={this.cerrar_caja.bind(this)} icon="remove" />
                    </>
                )}
                <BtnAccion text={"Imprimir Cierre Caja"} margin={4} padding={10} background={STheme.color.warning + "70"} borderColor={STheme.color.lightGray} onPress={() => {
                    if (caja?.key) PdfCierreCaja.imprimirPDF(caja.key);
                }} icon="imprimir" />
            </SView>
        );
    }
}

const BtnAccion = (props) => {
    return <SView row style={{
        backgroundColor: props.background || STheme.color.card,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: props.borderColor || STheme.color.card,
    }} padding={props.padding || 8} margin={props.margin || 4} onPress={props.onPress}>
        {props.icon && <SIconApp width={18} height={18} name={props.icon} fill={STheme.color.text} />}
        <SView width={props.icon ? 8 : 0} />
        <SText>{props.text}</SText>
    </SView>;
};
