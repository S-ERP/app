import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import MDL from '../../../MDL';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import FormularioTipoProducto from '../Components/FormularioTipoProducto';
import FloatButtom from '../../../Components/FloatButtom';

export default class table extends Component {


    async loadData() {
        const tipos = await MDL.inventario.getAllTipoProducto()
        const cuentas = await MDL.contabilidad.getCuentas();
        tipos.map(t => {
            t.cuenta_contable = cuentas[t.key_cuenta_contable];
            t.cuenta_contable_ganancia = cuentas[t.key_cuenta_contable_ganancia];
            t.cuenta_contable_costo = cuentas[t.key_cuenta_contable_costo];
        })
        return tipos;
    }
    render() {
        return <SPage title={"Tipos de productos"} disableScroll>
            <DinamicTable
                ref={ref => this.table = ref}
                {...Config.table.applyTheme()}
                loadData={this.loadData.bind(this)}
                selectType='single'
                onSelect={e => {
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row.descripcion,
                        options: [
                            {
                                label: "Editar",
                                icon: <SIconApp name='Edit' />,
                                onPress: () => {
                                    FormularioTipoProducto.open({
                                        editObject: e.row,
                                        onSuccess: () => {
                                            if (this.table) {
                                                this.table.loadData();
                                                this.state.time = new Date().getTime();
                                            }
                                        }

                                    })
                                }
                            },

                            {
                                label: "Eliminar",
                                icon: <SIconApp name='Delete' />,
                                onPress: () => {

                                    SPopup.confirm({
                                        title: "Eliminar Tipo de producto",
                                        message: "¿Está seguro de eliminar el tipo de producto " + e.row.descripcion + "?",
                                        onPress: () => {
                                            MDL.inventario.saveTipoProducto({
                                                key: e.row.key,
                                                estado: 0,
                                            }).then(() => {
                                                if (this.table) {
                                                    this.table.loadData();
                                                }
                                            });
                                        }
                                    });
                                }
                            },
                        ]
                    })
                }}
            >
                <DinamicTable.Col key={"tipo"} label="Tipo" data={e => e.row.tipo}
                    cellStyle={{
                        // alignItems: "center",
                        justifyContent: "flex-start",
                        flexDirection: "row"
                    }}
                    width={120}
                    customComponent={e => {
                        return <View style={{
                            padding: 2,
                            borderRadius: 4,
                            backgroundColor: STheme.colorFromText(e.row.tipo) + "44",
                            borderWidth: 1,
                            borderColor: STheme.colorFromText(e.row.tipo)
                        }}>
                            <SText fontSize={10}>{e.row.tipo}</SText>
                        </View>
                    }} />
                <DinamicTable.Col key={"descripcion"} wrap label="Descripcion" data={e => e.row.descripcion} width={300}
                    textStyle={{
                        fontSize: 14,
                    }} />
                <DinamicTable.Col key={"key_cuenta_contable"} label="key_cuenta_contable"
                    width={200}
                    textStyle={{
                        color: STheme.color.lightGray
                    }}
                    data={e => e.row.cuenta_contable ? `${e.row.cuenta_contable.codigo} ${e.row.cuenta_contable.descripcion}` : ""} />
                <DinamicTable.Col key={"key_cuenta_contable_ganancia"} label="key_cuenta_contable_ganancia"
                    width={200}
                    textStyle={{
                        color: STheme.color.lightGray
                    }}
                    data={e => e.row.cuenta_contable_ganancia ? `${e.row.cuenta_contable_ganancia.codigo} ${e.row.cuenta_contable_ganancia.descripcion}` : ""} />
                <DinamicTable.Col key={"key_cuenta_contable_costo"} label="key_cuenta_contable_costo"
                    width={200}
                    textStyle={{
                        color: STheme.color.lightGray
                    }}
                    data={e => e.row.cuenta_contable_costo ? `${e.row.cuenta_contable_costo.codigo} ${e.row.cuenta_contable_costo.descripcion}` : ""} />
            </DinamicTable>
            <FloatButtom onPress={() => {
                FormularioTipoProducto.open({
                    onSuccess: () => {
                        if (this.table) {
                            this.table.loadData();
                            this.state.time = new Date().getTime();
                        }
                    }

                })
            }} />
        </SPage>
    }
}
