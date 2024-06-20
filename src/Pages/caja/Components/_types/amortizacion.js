import React, { Component } from 'react';
import { SDate, SNavigation, SPopup, SText, STheme } from 'servisofts-component';
import Model from '../../../../Model';
import Popups from '../../../../Components/Popups';
import SSocket from 'servisofts-socket';

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
        if (obj.key_tipo_pago == "qr") {
            if (!obj.qrid) return <SText color={STheme.color.danger}>{"Sin QR"}</SText>
            if (!obj.transactionid) return <SText color={STheme.color.warning}>{"Pendiente de pago. Ver QR"}</SText>
        }
        if (!obj.key_comprobante) return <SText color={STheme.color.danger}>{"Sin Comprobante"}</SText>
        if (!obj.data.key_amortizacion) return <SText color={STheme.color.warning}>{"Pendiente"}</SText>
        return <SText color={STheme.color.success}>{"confirmada"}</SText>
    }

    static async solicitarQRalBanco(obj) {
        const qrresp = await SSocket.sendPromise({
            component: "solicitud_qr",
            type: "getQr",
            estado: "cargando",
            version: "V1",
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
            monto: obj.monto,
            descripcion: obj.descripcion,
            nit: "nit",
            razon_social: "USUARIO QUE PAGA",
            correos: [""],
            tipo: "caja_movimiento-amortizacion"
        }, 2 * 60 * 1000)

        obj.qrid = qrresp.data.qrid
        const editresp = await Model.caja_detalle.Action.editar({
            data: obj,
            key_usuario: Model.usuario.Action.getKey(),
            key_empresa: Model.empresa.Action.getKey(),
        })
    }
    static action(obj) {
        return new Promise(async (resolve, reject) => {

            if (obj.key_tipo_pago == "qr") {
                if (!obj.qrid) {
                    await this.solicitarQRalBanco(obj);
                    resolve("")
                    return
                }
                if (!obj.transactionid) {
                    SNavigation.navigate("/cafe/qr", {
                        qrid: obj.qrid, verificar: (qr) => {
                            console.log("Se verifico el qr")
                        }
                    })
                    resolve("")
                    return

                }
            }
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
            }, 1000 * 60).then(e => {
                var amortizacion = e.data;
                if (!obj.data) obj.data = {}
                obj.data.key_amortizacion = amortizacion.key;
                // obj.cuentas = Object.values(e.cuentas);
                Model.caja_detalle.Action.editar({
                    data: obj,
                    key_usuario: Model.usuario.Action.getKey(),
                    key_empresa: Model.empresa.Action.getKey(),
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
                                console.log("Selecciono el tipo de pago", tipo_pago);

                                var caja_detalle = {
                                    "key_caja": caja.key,
                                    "descripcion": "Amortizacion de cuota",
                                    "monto": montoFinal,
                                    "tipo": this.key,
                                    "key_tipo_pago": tipo_pago.key,
                                    "fecha": caja.fecha,
                                    "enviar_cierre_caja": !!tipo_pago?.pvtp?.enviar_cierre_caja,
                                    key_cuenta_contable_banco: tipo_pago?.pvtp?.key_cuenta_contable,
                                    "data": {
                                        "type": "amortizacion",
                                        "key_cuotas": Object.keys(cuotas)
                                    }
                                }
                                Model.caja_detalle.Action.registro({
                                    data: caja_detalle,
                                    key_usuario: Model.usuario.Action.getKey(),
                                    key_empresa: Model.empresa.Action.getKey(),
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
