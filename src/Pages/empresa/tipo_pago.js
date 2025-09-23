import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import PopupCrearTipoPago from './Components/PopupCrearTipoPago';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import PuntoDeVentaChoise from './Components/PuntoDeVentaChoise';

export default class tipo_pago extends Component {
    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({ url: "/empresa/tipo_pago", permiso: "ver" }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        })
    }
    async loadData() {
        try {


            const tipo_pago = await MDL.caja.tipo_pago_getAll();
            const empresa_tipo_pago = await MDL.caja.empresa_tipo_pago_getAll();
            const empresa_tipo_pago_punto_venta = await MDL.caja.empresa_tipo_pago_punto_venta_getAll();
            const empresa = await MDL.empresa.getFull();
            const base = empresa.monedas.find(a => a.tipo == "base");
            const cuentas = await MDL.contabilidad.getCuentas();
            const arr = Object.values(empresa_tipo_pago).map(a => {
                a.cuenta = cuentas[a.key_cuenta_contable]
                a.tipo_pago = tipo_pago[a.key_tipo_pago]
                a.puntos_ventas = [];
                empresa_tipo_pago_punto_venta.filter(b => b.key_empresa_tipo_pago == a.key).map(b => {
                    // a.puntos_ventas.push(empresa.sucursales.find(c => c.key == b.key_sucursal).puntos_venta.find(d => d.key == b.key_punto_venta))
                    empresa.sucursales.map(suc => {
                        if (!suc?.puntos_venta) return;
                        const pv = suc.puntos_venta.find(pv => pv.key == b.key_punto_venta);
                        // suc.puntos_venta.map(pv => {
                        //     pv._code = suc.descripcion + " - " + pv.descripcion
                        //     // if (!pv?.empresa_tipo_pago) return;
                        //     // const find = pv.empresa_tipo_pago.find(pvtp => pvtp.key == a.key)
                        //     const find = 

                        if (pv) a.puntos_ventas.push(pv);
                        // })
                    })
                })

                if (a.key_moneda) {
                    a.moneda = empresa.monedas.find(b => b.key == a.key_moneda);
                }
                if (a.cuenta?.key_moneda) {
                    a.moneda_cuenta = empresa.monedas.find(b => b.key == a.cuenta.key_moneda);
                } else {
                    a.moneda_cuenta = base;
                }
                return a;
            })
            return arr
        } catch (error) {
            console.error(error);
            return []
        }
    }

    render() {
        return <SPage title={"Tipo Pago"} disableScroll>

            <DinamicTable
                ref={ref => this.DinamicTable = ref}
                {...Config.table.applyTheme()}
                selectType='single'
                loadData={this.loadData.bind(this)}
                onSelect={e => {
                    if (MDL.rolesPermisos.getPermiso({ url: "/empresa/tipo_pago", permiso: 'edit' })) {
                        FloatMenu.open({
                            e: e.evt,
                            label: e.row.descripcion,
                            options: [
                                {
                                    label: "Editar", icon: <SIconApp name='Edit' />,
                                    onPress: () => {
                                        PopupCrearTipoPago.open({
                                            editObject: e.row,
                                            onSuccess: async () => {
                                                this.DinamicTable.loadData();
                                            }
                                        })
                                    }
                                }
                            ]
                        })
                    }
                }
                }
            >
                <DinamicTable.Col key={"key"} label='Key'
                    width={50} data={e => e.row.key}
                    textStyle={{
                        fontSize: 10,
                        color: STheme.color.lightGray,
                    }} />
                <DinamicTable.Col key={"Descripcion"} label='Descripcion'
                    width={150}
                    textStyle={{
                        fontWeight: "bold"
                    }}
                    data={e => e.row.descripcion} />
                <DinamicTable.Col key={"tipo_pago"} label='Tipo Pago' data={e => e.row?.tipo_pago?.descripcion}
                    cellStyle={{
                        alignItems: "center"
                    }}
                    customComponent={e => {
                        const color = (e.row?.tipo_pago?.color ?? STheme.colorFromText(e.data))
                        return <SView style={{
                            padding: 2, backgroundColor: color + "44",
                            borderWidth: 1,
                            borderColor: color,
                            borderRadius: 4,
                        }}>
                            <SText style={{
                                fontSize: 12,
                                color: STheme.color.text,
                            }}>{e.data}</SText>
                        </SView>
                    }}
                />
                <DinamicTable.Col key={"moneda"} label='Moneda' data={e => e.row.moneda?.descripcion} />
                <DinamicTable.Col key={"moneda_cuenta"} label='Moneda de la cuenta' data={e => e.row.moneda_cuenta?.descripcion} />
                <DinamicTable.Col key={"cuenta_contable"}
                    wrap
                    label='Cuenta Contable'
                    width={200}
                    data={e => `${e.row.cuenta?.codigo} - ${e.row.cuenta?.descripcion}`}
                    textStyle={{
                        fontSize: 10
                    }} />
                <DinamicTable.Col
                    key={"puntos_ventas"}
                    label='Puntos de ventas habilitados'
                    width={400}
                    data={e => e.row.puntos_ventas.map(a => a._code)}
                    customComponent={e => <PuntoDeVentaChoise
                        data={e.row.puntos_ventas.map(a => a.key)}
                        onAdd={(pv) => {
                            console.log("On Add", pv);
                            e.row.puntos_ventas.push(pv);
                            const k = "guardando_pv_" + pv.key
                            SNotification.send({
                                key: k,
                                title: "Guardando...",
                                type: "loading",
                            })
                            MDL.caja.empresa_tipo_pago_punto_venta_registro({
                                key_empresa_tipo_pago: e.row.key,
                                key_punto_venta: pv.key,
                            }).then(e => {
                                MDL.empresa._getFullCache.key_empresa = "";
                                SNotification.remove(k)
                                this.DinamicTable.loadData();
                            }).catch(e => {
                                SNotification.send({
                                    key: k,
                                    title: "Error al guardar",
                                    body: e?.error,
                                    color: STheme.color.danger,
                                    time: 4000,
                                })
                            })
                        }}
                        onPress={(evt, selevt) => {
                            const k = "eliminando_pv_" + selevt.key
                            SNotification.send({
                                key: k,
                                title: "Eliminando...",
                                type: "loading",
                            })
                            MDL.caja.empresa_tipo_pago_punto_venta_eliminar({
                                key_empresa_tipo_pago: e.row.key,
                                key_punto_venta: selevt.key,
                            }).then(e => {
                                MDL.empresa._getFullCache.key_empresa = "";

                                SNotification.remove(k)
                                this.DinamicTable.loadData();
                            }).catch(e => {
                                SNotification.send({
                                    key: k,
                                    title: "Error al eliminar",
                                    body: e?.error,
                                    color: STheme.color.danger,
                                    time: 4000,
                                })

                            })
                            console.log(evt, selevt, e.row)
                        }}
                    />}
                />
            </DinamicTable>

            <FloatButtom onPress={() => {
                PopupCrearTipoPago.open({
                    onSuccess: async () => {
                        this.DinamicTable.loadData();
                    },
                });
            }} />
        </SPage>
    }
}
