import React, { Component } from 'react';
import { SDate, SNavigation, SPopup, SText, STheme } from 'servisofts-component';
import Model from '../../../../Model';
import Popups from '../../../../Components/Popups';

export default class amortizacion {
    static key = "amortizacion";
    static descripcion = "Deudas de clientes"
    static icon = "Caja"
    static permiso = ""
    static isActive(obj) {
        if (!obj.data.key_amortizacion) return 0
        return 1
    }
    static getEstado(obj) {
        if (!obj.data.key_amortizacion) return <SText color={STheme.color.warning}>{"Pendiente"}</SText>
        return <SText color={STheme.color.success}>{"confirmada"}</SText>
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
                    monto: monto,
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
            })
        })


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
    static onPress(caja, punto_venta_tipo_pago) {
        SNavigation.navigate("/cobranza/clientes_con_deuda", {
            onSelect: (cuotas) => {
                let total = 0;
                Object.values(cuotas).map(o => total += o.monto);
                Popups.MontoCaja.open({
                    data: cuotas,
                    defaultValue: parseFloat(total).toFixed(2),
                    onPress: (montoFinal) => {
                        SNavigation.navigate("/caja/tipo_pago", {
                            monto: montoFinal,
                            detalle: "Amortizacion de cuota",
                            key_caja: caja.key,
                            key_punto_venta: caja.key_punto_venta,
                            _type: this.key,
                            onSelect: (tipo_pago) => {
                                console.log("Selecciono el tipo de pago");
                                var caja_detalle = {
                                    "key_caja": caja.key,
                                    "descripcion": "Amortizacion de cuota",
                                    "monto": montoFinal,
                                    "tipo": this.key,
                                    "key_tipo_pago": tipo_pago.key,
                                    "fecha": caja.fecha,
                                    "data": {
                                        "type": "amortizacion",
                                        "key_cuotas": Object.keys(cuotas)
                                    }
                                }
                                Model.caja_detalle.Action.registro({
                                    data: caja_detalle,
                                    key_usuario: Model.usuario.Action.getKey()
                                }).then((resp) => {
                                    console.log(resp)

                                })
                            }

                        })
                    }
                });




            }
        })
    }
}
