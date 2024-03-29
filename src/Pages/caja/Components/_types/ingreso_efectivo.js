import React, { Component } from 'react';
import { SButtom, SHr, SInput, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import PopupMontoDetalle from '../PopupMontoDetalle';
import Config from '../../../../Config';

export default class index {
    static key = "ingreso_efectivo";
    static descripcion = "Ingreso de efectivo"
    static icon = "Ingreso"
    static permiso = ""
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
        SNavigation.navigate("/contabilidad/cuentas", {
            codigo: Config.cuenta_contable.caja_ingreso_efectivo.cuenta,
            // key_cuenta: "3038c20e-12f5-46b5-b70a-129fb634b241",
            onSelect: (cuenta_contable) => {
                SNavigation.goBack();
                PopupMontoDetalle.open({
                    title: this.descripcion,
                    detail: cuenta_contable.codigo + " - " + cuenta_contable.descripcion,
                    onSubmit: ({ monto, detalle }) => {
                        //Pedimos el tipo de pago
                        if (!!caja.fraccionar_moneda) {
                            SNavigation.navigate("/caja/fraccionar", {
                                "monto": monto,
                                "detalle": detalle,
                                "key_caja": caja.key,
                                "_type": this.key,
                                onSubmit: (fracciones) => {
                                    SNavigation.goBack();
                                    console.log(fracciones);
                                }
                            })
                            return;
                        }
                        var caja_detalle = {
                            "key_caja": caja.key,
                            "descripcion": detalle,
                            "monto": monto,
                            "tipo": this.key,
                            "key_tipo_pago": "efectivo",
                            "fecha": caja.fecha,
                            key_cuenta_contable: cuenta_contable.key
                            // cuentas: [{ key_cuenta_contable: cuenta_contable.key, monto: monto }],
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
                });
            }
        });
    }
}
