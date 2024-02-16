import React, { Component } from 'react';
import { SButtom, SHr, SInput, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import PopupMontoDetalle from '../PopupMontoDetalle';
import Config from '../../../../Config';

export default class index {
    static key = "egreso_banco";
    static descripcion = "Enviar al banco"
    static icon = "Egreso"
    static permiso = "allow_egreso_banco"
    static isActive(obj) {
        return 1
    }
    static getEstado(obj) {
        return <SText color={STheme.color.success}>{"confirmada"}</SText>
    }
    static onDeleteCajaDetalle(obj) {
        return new Promise((resolve, reject) => {
            resolve("Dont required")
        })
    }
    static action(obj) {

    }
    static onPress(caja, punto_venta_tipo_pago) {
        //Pedimos el monto y el detalle
        SNavigation.navigate("/banco", {
            cuenta: true,
            onSelect: (cuenta_banco) => {
                SNavigation.goBack();
                PopupMontoDetalle.open({
                    title: this.descripcion,
                    detail: cuenta_banco?.descripcion + " " + cuenta_banco?.observacion,
                    onSubmit: ({ monto, detalle }) => {
                        //Pedimos el tipo de pago
                        SNavigation.navigate("/caja/tipo_pago", {
                            monto: monto,
                            detalle: detalle,
                            key_caja: caja.key,
                            key_punto_venta: caja.key_punto_venta,
                            _type: this.key,
                            onSelect: (tipo_pago) => {
                                var caja_detalle = {
                                    "key_caja": caja.key,
                                    "fecha": caja.fecha,
                                    "descripcion": detalle,
                                    "monto": monto * -1,
                                    "tipo": this.key,
                                    "key_tipo_pago": tipo_pago.key,
                                    key_cuenta_banco: cuenta_banco.key_cuenta_contable
                                }
                                //Registramos el caja_detalle
                                Model.caja_detalle.Action.registro({
                                    data: caja_detalle,
                                    key_empresa: Model.empresa.Action.getSelect()?.key,
                                    key_usuario: Model.usuario.Action.getKey()
                                }).then((resp) => {
                                    console.log(resp)

                                })
                            }

                        })
                    }
                });
            }
        });
    }
}
