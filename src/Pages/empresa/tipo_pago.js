import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SPage, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import PopupCrearTipoPago from './Components/PopupCrearTipoPago';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import PuntoDeVentaChoise from './Components/PuntoDeVentaChoise';

export default class tipo_pago extends Component {
    async loadData() {
        try {


            const tipo_pago = await MDL.empresa.getTipoPago();
            const punto_venta_tipo_pago = await MDL.empresa.getAllPuntoVentaTipoPago();
            const empresa = await MDL.empresa.getFull();
            const base = empresa.monedas.find(a => a.tipo == "base");
            const cuentas = await MDL.contabilidad.getCuentas();
            const arr = Object.values(punto_venta_tipo_pago).map(a => {
                a.cuenta = cuentas[a.key_cuenta_contable]
                a.tipo_pago = tipo_pago[a.key_tipo_pago]
                if (a.cuenta?.key_moneda) {
                    a.moneda = empresa.monedas.find(b => b.key == a.cuenta.key_moneda);
                } else {
                    a.moneda = base;
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
                }}
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
                <DinamicTable.Col key={"cuenta_contable"}
                    wrap
                    label='Cuenta Contable'
                    width={200}
                    data={e => e.row.cuenta?.descripcion}
                    textStyle={{
                        fontSize: 10
                    }} />
                <DinamicTable.Col
                    key={"puntos_ventas"}
                    label='Puntos de ventas habilitados'
                    width={400}
                    data={e => []}
                    customComponent={e => <PuntoDeVentaChoise />}
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
