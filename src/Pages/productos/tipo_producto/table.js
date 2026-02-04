import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import MDL from '../../../MDL';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import FormularioTipoProducto from '../Components/FormularioTipoProducto';
import FloatButtom from '../../../Components/FloatButtom';
import SSocket from 'servisofts-socket';

export default class table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime()
        };
    }


    async loadData() {
        const tipos = await MDL.inventario.getAllTipoProducto()
        const cuentas = await MDL.contabilidad.getCuentas();
        tipos.map(t => {
            t.cuenta_contable = cuentas[t.key_cuenta_contable];
            t.cuenta_contable_ganancia = cuentas[t.key_cuenta_contable_ganancia];
            t.cuenta_contable_costo = cuentas[t.key_cuenta_contable_costo];
            t.cuenta_contable_depreciacion_activo = cuentas[t.key_cuenta_contable_depreciacion_activo];
            t.cuenta_contable_depreciacion_gasto = cuentas[t.key_cuenta_contable_depreciacion_gasto];
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

                                    // console.clear();
                                    // console.log("%c" + JSON.stringify(e.row, null, 2), "color: #e1bb11; font-weight: bold;");

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
                        alignItems: "center",
                        justifyContent: "flex-start",
                        flexDirection: "row"
                    }}
                    width={100}
                    customComponent={e => {
                        return <SView col={"xs-12"} row center >
                            <SView center style={{
                                padding: 4,
                                borderRadius: 4,
                                backgroundColor: STheme.colorFromText(e.row?.tipo ?? "") + "44",
                                borderWidth: 1,
                                borderColor: STheme.colorFromText(e.row?.tipo ?? ""),
                            }}><SText fontSize={10}>{(e.row?.tipo ?? "").toUpperCase()}</SText></SView>
                        </SView>
                    }} />


                <DinamicTable.Col key={"descripcion"} wrap label="Descripcion" data={e => e.row.descripcion} width={300}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "tipo_producto/.128_" + e.row.key + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row.key + "?date=" + this.state.time}
                    />}
                    textStyle={{
                        fontSize: 14,
                    }} />

                <DinamicTable.Col key={"unidad_medida_facturacion"} label="unidad_medida_facturacion" width={200} textStyle={{ color: STheme.color.lightGray }} data={e => e.row.unidad_medida_facturacion ? `${e.row.unidad_medida_facturacion}` : ""} />
                <DinamicTable.Col key={"codigo_facturacion"} label="codigo_facturacion" width={200} textStyle={{ color: STheme.color.lightGray }} data={e => e.row.codigo_facturacion ? `${e.row.codigo_facturacion}` : ""} />

                <DinamicTable.Col key={"key_cuenta_contable"} label="key_cuenta_contable" width={200} textStyle={{ color: STheme.color.lightGray }} data={e => e.row.cuenta_contable ? `${e.row.cuenta_contable.codigo} ${e.row.cuenta_contable.descripcion}` : ""} />
                <DinamicTable.Col key={"key_cuenta_contable_ganancia"} label="key_cuenta_contable_ganancia" width={200} textStyle={{ color: STheme.color.lightGray }} data={e => e.row.cuenta_contable_ganancia ? `${e.row.cuenta_contable_ganancia.codigo} ${e.row.cuenta_contable_ganancia.descripcion}` : ""} />
                <DinamicTable.Col key={"key_cuenta_contable_costo"} label="key_cuenta_contable_costo"
                    width={200}
                    textStyle={{
                        color: STheme.color.lightGray
                    }}
                    data={e => e.row.cuenta_contable_costo ? `${e.row.cuenta_contable_costo.codigo} ${e.row.cuenta_contable_costo.descripcion}` : ""} />

                <DinamicTable.Col key={"key_cuenta_contable_depreciacion_activo"} label="key_cuenta_contable_depreciacion_activo"
                    width={200}
                    textStyle={{
                        color: STheme.color.lightGray
                    }}
                    data={e => e.row.cuenta_contable_depreciacion_activo ? `${e.row.cuenta_contable_depreciacion_activo.codigo} ${e.row.cuenta_contable_depreciacion_activo.descripcion}` : ""} />
                <DinamicTable.Col key={"key_cuenta_contable_depreciacion_gasto"} label="key_cuenta_contable_depreciacion_gasto"
                    width={200}
                    textStyle={{
                        color: STheme.color.lightGray
                    }}
                    data={e => e.row.cuenta_contable_depreciacion_gasto ? `${e.row.cuenta_contable_depreciacion_gasto.codigo} ${e.row.cuenta_contable_depreciacion_gasto.descripcion}` : ""} />
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
const ImageLabel = (props) => {
    return <SView row style={{
        alignItems: "center",
    }}>
        <SView style={{
            width: 30,
            height: 30,
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={props.src} enablePreview
                srcPreview={props.srcPreview}
                style={{
                    resizeMode: "cover",
                }} />
        </SView>
        <SView width={8} />
        <SText flex style={props.textStyle} numberOfLines={1} >{props.data}</SText>
    </SView>
}