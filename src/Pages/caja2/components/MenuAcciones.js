import React, { Component } from 'react';
import { SNavigation, SNotification, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import SelectTipoPago from './SelectTipoPago';
import CargarEfectivoDelBanco from '../Acciones/CargarEfectivoDelBanco';
import Transferencia from '../Acciones/Transferencia';


export default class MenuAcciones extends Component<{ caja: any, movimientos: any[] }> {


    cerrar_caja() {
        const { caja } = this.props
        SNotification.send({
            key: "caja_cerrar",
            title: "Cargando",
            type: "loading",
        })
        MDL.caja.cerrar({
            key: caja.key,
            key_punto_venta: caja.key_punto_venta,
        }).then(e => {
            SNotification.remove("caja_cerrar");
        }).catch(e => {
            SNotification.send({
                key: "caja_cerrar",
                title: "Error al cerrar caja",
                body: e.error,
                color: STheme.color.danger,
                time: 5000
            })
        })
    }
    enviarAlBanco = () => {
        SelectTipoPago.openPopup({
            key_punto_venta: this.props.caja.key_punto_venta,
            solo_para_caja: true,
            montoMaximoPorTipo: {
                efectivo: this.props.movimientos.filter(mov => mov.key_tipo_pago == "efectivo").reduce((sum, mov) => sum + mov.monto, 0),
                pagare: this.props.movimientos.filter(mov => mov.key_tipo_pago == "pagare").reduce((sum, mov) => sum + mov.monto, 0),
                cheque: this.props.movimientos.filter(mov => mov.key_tipo_pago == "cheque").reduce((sum, mov) => sum + mov.monto, 0),
            },
            onSelect: (item) => {
                console.log(item);
                MDL.caja.registro_detalle({
                    key_caja: this.props.caja.key,
                    fecha: this.props.caja.fecha,
                    descripcion: "Envio al banco",
                    monto: item.efectivo * -1,
                    tipo: "egreso_banco",
                    tipo_pago: item
                }).then(e => {
                    SelectTipoPago.closePopup();
                }).catch(e => {

                })
            }
        });
    }

    cargarEfectivoDelBanco() {
        CargarEfectivoDelBanco.open({})
    }
    transferir() {
        Transferencia.open({})
        // CargarEfectivoDelBanco.open({})
    }
    render() {
        return (

            <SView row >
                {/* <SText card style={{ backgroundColor: STheme.color.danger }} padding={8} margin={4}>{"Cobrar a Clientes"}</SText> */}
                <SText card padding={8} margin={4} onPress={this.transferir.bind(this)}>{"Transferir"}</SText>
                {/* <SText card padding={8} margin={4} onPress={this.cargarEfectivoDelBanco.bind(this)}>{"Cargar efectivo desde Banco"}</SText> */}
                <SText card padding={8} margin={4} onPress={() => { SNavigation.navigate("/puntoventa") }}>{"Vender Productos"}</SText>
                {/* <SText card padding={8} margin={4} style={{ backgroundColor: STheme.color.danger }} >{"Otros Ingresos"}</SText> */}
                <SText card padding={8} margin={4} onPress={() => { SNavigation.navigate("/compra2") }}>{"Comprar Productos"}</SText>
                {/* <SText card padding={8} margin={4} style={{ backgroundColor: STheme.color.danger }}>{"Pagar a Proveedores"}</SText> */}
                {/* <SText card padding={8} margin={4} onPress={this.enviarAlBanco.bind(this)}>{"Enviar al Banco"}</SText> */}

                <SText card padding={8} margin={4} onPress={() => { SNavigation.navigate("/proveedor") }}>{"Pagar a Proveedores"}</SText>
                <SText card padding={8} margin={4} onPress={() => { SNavigation.navigate("/cliente") }}>{"Cobrar a Clientes"}</SText>

                <SText card padding={8} style={{
                    backgroundColor: STheme.color.danger,
                }} margin={4} onPress={this.cerrar_caja.bind(this)} >{"Cerrar la Caja"}</SText>


            </SView>

        );
    }
}
