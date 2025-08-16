import React, { Component } from 'react';
import { SButtom, SHr, SInput, SNavigation, SNotification, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import PopupMontoDetalle from '../PopupMontoDetalle';
import Config from '../../../../Config';

export default class index {
    static key = "ingreso_banco";
    static descripcion = "Retirar del banco"
    static icon = "Ingreso"
    static permiso = "allow_ingreso_banco"
    static isActive(obj) {
        return 1
    }
    static getEstado(obj) {
        return <SText color={STheme.color.success}>{"confirmada"}</SText>
    }
    static action(obj) {

    }
    static onDeleteCajaDetalle(obj) {
        return new Promise((resolve, reject) => {
            resolve("Dont required")
        })
    }
    static onPress(caja, punto_venta_tipo_pago) {
        //Pedimos el monto y el detalle
        SNavigation.navigate("/contabilidad/cuentas", {
            codigo: Config.cuenta_contable.caja_ingreso_banco.cuenta,
            key_cuenta: "f30fe343-cfb5-4770-8adb-4f11a1316259",
            onSelect: (cuenta_banco) => {
                if (!cuenta_banco.key) {
                    SPopup.alert("La cuenta de banco no cuenta con una cuenta contable configurada, porfavor vaya a la cuenta de banco y seleccione correctamente la cuenta contable del plan de cuentas.")
                    return;
                }
                SNavigation.goBack();
                PopupMontoDetalle.open({
                    title: this.descripcion,
                    detail: cuenta_banco?.codigo + " " + cuenta_banco?.descripcion,
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
                                    "descripcion": detalle,
                                    "monto": monto,
                                    "tipo": this.key,
                                    "key_tipo_pago": tipo_pago.key,
                                    "fecha": caja.fecha,
                                    key_cuenta_banco: cuenta_banco.key
                                }
                                //Registramos el caja_detalle
                                Model.caja_detalle.Action.registro({
                                    data: caja_detalle,
                                    key_empresa: Model.empresa.Action.getSelect()?.key,
                                    key_usuario: Model.usuario.Action.getKey()
                                }).then((resp) => {
                                    console.log(resp)

                                }).catch(e => {
                                    SNotification.send({
                                        title: "Error",
                                        body: e?.error,
                                        color: STheme.color.danger,
                                        time: 5000,
                                    })
                                })
                            }

                        })
                    }
                });
            }
        });
    }
}
