import React, { Component } from 'react';
import { SHr, SNavigation, SPage, SPopup, SText } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import PopupTag from './Components/PopupTag';
import SIconApp from '../../Assets/SIconApp';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import Config from '../../Config';
import FloatButtom from '../../Components/FloatButtom';

export default class Lista extends Component {
    constructor(props) {
        super(props);
        // Obtener el callback si fue pasado por navegación
        this.onSelect = SNavigation.getParam('onSelect');
    }

    modelos = null;

    async loadData() {
        const modelos = await MDL.inventario.tag.getAll();
        this.modelos = modelos;
        return modelos;
    }

    render() {
        return (
            <SPage title="TABLA DE ETIQUETAS / TAG" disableScroll>
                <DinamicTable
                    key={"tabla_modelo"}
                    ref={ref => this.table = ref}
                    {...Config.table.applyTheme()}
                    keyExtractor={e => e.key}
                    selectType='single'
                    language='es'
                    center
                    listFooterComponent={() => <SHr height={100} />}
                    loadData={this.loadData.bind(this)}
                    onSelect={e => {
                        if (this.onSelect) {
                            this.onSelect(e.row);
                            SNavigation.goBack();
                            return;
                        }

                        FloatMenu.open({
                            e: e.evt,
                            height: 330,
                            label: e.row?.descripcion,
                            options: [
                                {
                                    label: "Editar",
                                    icon: <SIconApp name='Edit' />,
                                    onPress: () => {
                                        PopupTag.open({
                                            editObject: e.row,
                                            onSuccess: () => {
                                                if (this.table) this.table.loadData();
                                            }
                                        });
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
                                                    if (this.table) this.table.loadData();
                                                });
                                            }
                                        });
                                    }
                                }
                            ]
                        });
                    }}
                >
                    <DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />
                    <DinamicTable.Col
                        key="nombre"
                        label="Nombre"
                        width={150}
                        textStyle={{ fontSize: 10 }}
                        data={e => e.row?.nombre}
                    />
                    <DinamicTable.Col
                        key="descripcion"
                        label="Descripcion"
                        width={150}
                        textStyle={{ fontSize: 10 }}
                        data={e => e.row?.descripcion}
                    />
                    <DinamicTable.Col
                        key="color"
                        label="Color"
                        width={150}
                        textStyle={{ fontSize: 10 }}
                        data={e => e.row?.color}
                    />


                    <DinamicTable.Col
                        key="key_usuario"
                        label="Administrador"
                        width={150}
                        textStyle={{ fontSize: 10 }}
                        data={e => e.row?.key_usuario}
                    />
                </DinamicTable>

                <FloatButtom onPress={() => {
                    PopupTag.open({
                        editObject: null, // nuevo registro
                        onSuccess: () => {
                            if (this.table) this.table.loadData();
                        }
                    });
                }} />
            </SPage>
        );
    }
}
