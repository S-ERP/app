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
import FormularioTipoProductoCustom from '../Components/FormularioTipoProductoCustom';

export default class custom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime()
        };
    }


    async loadData() {
        const tipos = await MDL.inventario.execute_function("get_tipo_producto_custom", [MDL.empresa.select?.key])
        const cuentas = await MDL.contabilidad.getCuentas();
        tipos.map(t => {
            t.cuenta_contable = cuentas[t?.data?.key_cuenta_contable];
            t.cuenta_contable_ganancia = cuentas[t?.data?.key_cuenta_contable_ganancia];
            t.cuenta_contable_costo = cuentas[t?.data?.key_cuenta_contable_costo];
            t.cuenta_contable_depreciacion_activo = cuentas[t?.data?.key_cuenta_contable_depreciacion_activo];
            t.cuenta_contable_depreciacion_gasto = cuentas[t?.data?.key_cuenta_contable_depreciacion_gasto];
        })
        return tipos;
    }
    render() {
        return <SPage title={"Tipos de productos Custom"} disableScroll>
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
                                    FormularioTipoProductoCustom.open({
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
                                            MDL.inventario.execute_function("json_update", ["tipo_producto_custom", JSON.stringify({
                                                key: e.row.key,
                                                estado: 0,
                                            })]).then(() => {
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
                <DinamicTable.Col key={"tipo"} label="Tipo" data={e => e.row.data?.tipo}
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
                                backgroundColor: STheme.colorFromText(e.row?.data?.tipo ?? "") + "44",
                                borderWidth: 1,
                                borderColor: STheme.colorFromText(e.row?.data?.tipo ?? ""),
                            }}><SText fontSize={10}>{(e.row?.data?.tipo ?? "").toUpperCase()}</SText></SView>
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

                <DinamicTable.Col key={"unidad_medida_facturacion"} label="unidad_medida_facturacion" width={100} textStyle={{ color: STheme.color.lightGray }} data={e => e.row.unidad_medida_facturacion ? `${e.row.unidad_medida_facturacion}` : ""} />
                <DinamicTable.Col key={"codigo_facturacion"} label="codigo_facturacion" width={100} textStyle={{ color: STheme.color.lightGray }} data={e => e.row.codigo_facturacion ? `${e.row.codigo_facturacion}` : ""} />

                <DinamicTable.Col key={"cuentas"} label="Cuentas" width={300}
                    data={e => [
                        e.row.cuenta_contable ? `Inventario: ${e.row.cuenta_contable.codigo} ${e.row.cuenta_contable.descripcion}` : "",
                        e.row.cuenta_contable_ganancia ? `Ganancia: ${e.row.cuenta_contable_ganancia.codigo} ${e.row.cuenta_contable_ganancia.descripcion}` : "",
                        e.row.cuenta_contable_costo ? `Costo: ${e.row.cuenta_contable_costo.codigo} ${e.row.cuenta_contable_costo.descripcion}` : "",
                        e.row.cuenta_contable_depreciacion_activo ? `Dep. Activo: ${e.row.cuenta_contable_depreciacion_activo.codigo} ${e.row.cuenta_contable_depreciacion_activo.descripcion}` : "",
                        e.row.cuenta_contable_depreciacion_gasto ? `Dep. Gasto: ${e.row.cuenta_contable_depreciacion_gasto.codigo} ${e.row.cuenta_contable_depreciacion_gasto.descripcion}` : "",
                    ].filter(Boolean).join("\n")}
                    customComponent={e => {
                        const items = [
                            { label: "Inventario", cuenta: e.row.cuenta_contable },
                            { label: "Ganancia", cuenta: e.row.cuenta_contable_ganancia },
                            { label: "Costo", cuenta: e.row.cuenta_contable_costo },
                            { label: "Dep. Activo", cuenta: e.row.cuenta_contable_depreciacion_activo },
                            { label: "Dep. Gasto", cuenta: e.row.cuenta_contable_depreciacion_gasto },
                        ].filter(i => i.cuenta);
                        if (!items.length) return null;
                        return <SView col="xs-12" style={{ padding: 4, gap: 2 }}>
                            {items.map(i => <SView key={i.label} row style={{ alignItems: "center", gap: 4 }}>
                                <SText fontSize={10} style={{ color: STheme.color.lightGray, minWidth: 70 }}>{i.label}:</SText>
                                <SText fontSize={10} flex style={{ color: STheme.color.text }}>{i.cuenta.codigo} {i.cuenta.descripcion}</SText>
                            </SView>)}
                        </SView>
                    }}
                />
            </DinamicTable>
            <FloatButtom onPress={() => {
                FormularioTipoProductoCustom.open({
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