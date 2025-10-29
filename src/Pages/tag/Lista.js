import React, { Component } from 'react';
import { SDate, SHr, SMath, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import PopupTag from './Components/PopupTag';
import SIconApp from '../../Assets/SIconApp';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import Config from '../../Config';
import FloatButtom from '../../Components/FloatButtom';

export default class Lista extends Component {

    onSelect = SNavigation.getParam('onSelect');

    async loadData() {
        const modelos = await MDL.inventario.tag.getAll();
        this.modelos = modelos;
        return modelos;
    }

    render() {
        return (
            <SPage title="TABLA DE ETIQUETAS / TAG" disableScroll>
                <DinamicTable loadData={this.loadData} keyExtractor={e => e.key} center

                    key={"tabla_modelo"}
                    ref={ref => this.table = ref}
                    {...Config.table.applyTheme()}
                    // colors={Config.table.colors()}
                    // cellStyle={Config.table.cellStyle()}
                    // textStyle={Config.table.textStyle()}
                    selectType='single'
                    language='es'
                    listFooterComponent={() => {
                        return <SHr height={100} />

                    }}
                    // loadData={this.loadData.bind(this)}
                    onSelect={e => {

                        if (this.onSelect) {
                            this.onSelect(e.row);
                            SNavigation.goBack();
                            return;
                        }

                        FloatMenu.open({
                            e: e.evt,
                            height: 330,
                            label: e.row.descripcion,
                            options: [

                                {
                                    label: "Editar",
                                    icon: <SIconApp name='Edit' />,
                                    onPress: () => {
                                        PopupTag.open({
                                            editObject: e.row,
                                            onSuccess: () => {
                                                if (this.table) {
                                                    this.table.loadData();
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
                                            title: "Eliminar Modelo",
                                            message: "¿Está seguro de eliminar el modelo " + e.row?.descripcion + "?",
                                            onPress: () => {
                                                MDL.inventario.tag.editar({
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
                        });


                    }}

                >
                    <DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />
                    {/* <DinamicTable.Col key="fecha_on" label="FECHA" width={110} dataType="date" textStyle={{ fontSize: 10 }} data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} dateFormat="yyyy-MM-dd hh:mm" /> */}
                    {/* <DinamicTable.Col key="estado" label="estado" width={110} textStyle={{ fontSize: 10 }} data={e => e.row?.estado} /> */}
                    {/* <DinamicTable.Col key="key_empresa" label="key_empresa" width={110} textStyle={{ fontSize: 10 }} data={e => e.row?.key_empresa} /> */}
                    <DinamicTable.Col key="descripcion" label="descripcion" width={110} textStyle={{ fontSize: 10 }} data={e => e.row?.descripcion} />
                    <DinamicTable.Col key="key_usuario" label="Admnistrador" width={110} textStyle={{ fontSize: 10 }} data={e => e.row?.key_usuario} />
                </DinamicTable>



                <FloatButtom onPress={() => {
                    PopupTag.open({
                        editObject: null, // nuevo registro
                        onSuccess: () => {
                            if (this.table) {
                                this.table.loadData();
                            }
                        }
                    });
                }} />


            </SPage>
        );
    }
}
