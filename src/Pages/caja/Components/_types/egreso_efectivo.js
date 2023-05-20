import React, { Component } from 'react';
import { SButtom, SHr, SInput, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import PopupMontoDetalle from '../PopupMontoDetalle';

export default class index {
    static key = "egreso_efectivo";
    static descripcion = "Egreso de efectivo"
    static icon = "Egreso"
    static permiso = ""
    static isActive(obj) {
        return 1
    }
    static getEstado(obj) {
        return <SText color={STheme.color.success}>{"confirmada"}</SText>
    }
    static action(obj) {

    }
    static onPress(caja, punto_venta_tipo_pago) {
        //Pedimos el monto y el detalle
        SNavigation.navigate("/contabilidad/cuentas", {
            codigo: "5",
            key_cuenta: "f30fe343-cfb5-4770-8adb-4f11a1316259",
            onSelect: (cuenta_contable) => {
                SNavigation.goBack();
                PopupMontoDetalle.open({
                    title: this.descripcion,
                    detail: cuenta_contable.codigo + " - " + cuenta_contable.descripcion,
                    onSubmit: ({ monto, detalle }) => {

                        var detalles = Model.caja_detalle.Action.getAll({ key_caja: caja.key });
                        var movimientos = Object.values(detalles).filter(o => o.key_tipo_pago == "efectivo" && o.estado != 0)
                        var monto_en_caja = 0;
                        movimientos.map(o => { monto_en_caja += parseFloat(o.monto); });
                        if (monto_en_caja < monto) {
                            SPopup.alert("No tienes efectivo suficiente.")
                            return;
                        }
                        //Pedimos el tipo de pago
                        if (caja.fraccionar_moneda) {
                            // SNavigation.navigate("/caja/fraccionar", {
                            //     "monto": monto,
                            //     "detalle": detalle,
                            //     "key_caja": caja.key,
                            //     "_type": this.key,
                            // })
                            // return;
                        }
                        var caja_detalle = {
                            "key_caja": caja.key,
                            "descripcion": detalle,
                            "monto": monto * -1,
                            "tipo": this.key,
                            "key_tipo_pago": "efectivo",
                            cuentas: [{ key_cuenta_contable: cuenta_contable.key, monto: monto }],
                        }
                        //Registramos el caja_detalle
                        Model.caja_detalle.Action.registro({
                            data: caja_detalle,
                            cuentas: [{ key_cuenta_contable: cuenta_contable.key, monto: monto }],
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
