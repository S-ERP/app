import React, { Component } from 'react';
import { SButtom, SDate, SHr, SInput, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../../Model';
import PopupMontoDetalle from '../PopupMontoDetalle';
import Popups from '../../../../Components/Popups';

export default class index {
    static key = "pago_servicio";
    static descripcion = "Pago de servicio"
    static icon = "Carrito"
    static permiso = ""
    static isActive(obj) {
        if (!obj.data.key_amortizacion) return 0
        return 1
    }
    static getEstado(obj) {
        if (!obj.data.key_amortizacion) return <SText color={STheme.color.warning}>{"Pendiente"}</SText>
        return <SText color={STheme.color.success}>{"confirmada"}</SText>
    }

    static onDeleteCajaDetalle(obj) {
        return new Promise((resolve, reject) => {
            Model.cuota_amortizacion.Action.deleteAll({
                key_amortizacion: obj?.data?.key_amortizacion
            }).then(e => {
                resolve(e);
            }).catch(e => {
                reject(e)
            })

        })
    }
    static action(obj) {
        return new Promise((resolve, reject) => {
            if (obj.data.key_amortizacion) {
                reject("El movimiento ya esta confirmado.")
                return;
            }
            const { data, monto } = obj
            Model.cuota_amortizacion.Action.registro({
                data: {
                    descripcion: "Amortizacion de cuota desde caja.",
                    observacion: "--",
                    monto: monto * -1,
                    fecha: obj.fecha,
                    key_cuotas: data.key_cuotas,
                    key_caja_detalle: obj.key
                },
                key_usuario: Model.usuario.Action.getKey()
            }).then(e => {
                var amortizacion = e.data;
                obj.data.key_amortizacion = e.amortizaciones;
                obj.cuentas = Object.values(e.cuentas);
                Model.caja_detalle.Action.editar({
                    data: obj,
                    key_usuario: Model.usuario.Action.getKey()
                }).then((e) => {
                    resolve("Editado con exito");
                }).catch(e => {
                    reject("Error al editar el movimiento de caja");
                })
            }).catch(e => {
                reject("Error al amortizar");
                console.error(e);
            })
        })
    }
    static onPress(caja, punto_venta_tipo_pago) {
        //Pedimos el monto y el detalle
        SNavigation.navigate("/cobranza/proveedores_que_debemos", {
            onSelect: (cuotas) => {

                let total = 0;
                Object.values(cuotas).map(o => total += o.monto);
                Popups.MontoCaja.open({
                    data: cuotas,
                    defaultValue: parseFloat(total).toFixed(2),
                    onPress: (montoFinal) => {
                        SNavigation.navigate("/caja/tipo_pago", {
                            monto: montoFinal,
                            detalle: "Pago de servicio",
                            key_caja: caja.key,
                            key_punto_venta: caja.key_punto_venta,
                            _type: this.key,
                            onSelect: (tipo_pago) => {

                                if (tipo_pago.key == "efectivo") {
                                    var detalles = Model.caja_detalle.Action.getAll({ key_caja: caja.key });
                                    var movimientos = Object.values(detalles).filter(o => o.key_tipo_pago == "efectivo" && o.estado != 0)
                                    var monto_en_caja = 0;
                                    movimientos.map(o => { monto_en_caja += parseFloat(o.monto); });
                                    if (monto_en_caja < montoFinal) {
                                        SPopup.alert("No tienes efectivo suficiente.")
                                        return;
                                    }
                                }
                                var caja_detalle = {
                                    "key_caja": caja.key,
                                    "descripcion": "Pago de servicio",
                                    "monto": montoFinal * -1,
                                    "tipo": this.key,
                                    "key_tipo_pago": tipo_pago.key,
                                    "fecha": caja.fecha,
                                    "data": {
                                        "type": "pago_servicio",
                                        "key_cuotas": Object.keys(cuotas)
                                    }
                                }
                                console.log(caja_detalle)
                                Model.caja_detalle.Action.registro({
                                    data: caja_detalle,
                                    key_usuario: Model.usuario.Action.getKey()
                                }).then((resp) => {
                                    console.log(resp)

                                })
                            }

                        })
                    }
                })
            }
        })
        return;
        PopupMontoDetalle.open({
            title: this.descripcion,
            onSubmit: ({ monto, detalle }) => {
                //Pedimos el tipo de pago
                var caja_detalle = {
                    "key_caja": caja.key,
                    "descripcion": detalle,
                    "monto": monto * -1,
                    "tipo": "egreso",
                    "key_tipo_pago": "efectivo",
                }
                //Registramos el caja_detalle
                Model.caja_detalle.Action.registro({
                    data: caja_detalle,
                    key_usuario: Model.usuario.Action.getKey()
                }).then((resp) => {
                    console.log(resp)

                })

            }
        });
    }
}
