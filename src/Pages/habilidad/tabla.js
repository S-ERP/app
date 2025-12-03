import React, { Component } from 'react';
import { SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import PopupRegistrarHabilidad from '../empresa/Components/PopupRegistrarHabilidad';

export default class tabla extends Component {
    componentDidMount() {
        MDL.rolesPermisos.getPermisoAsync({
            url: "/habilidad/tabla",
            permiso: "ver"
        }).then((permit) => {
            if (!permit) {
                SNavigation.goBack();
                return;
            }
        }).catch(e => {
            console.error(e);
        })
    }

    // Método loadData como en el ejemplo funcionando
    async loadData() {
        try {
            const habilidades = await MDL.habilidad.getAll();

            // Procesar como en el ejemplo: Object.values() si es objeto
            let arr = [];
            if (Array.isArray(habilidades)) {
                arr = habilidades;
            } else if (habilidades && typeof habilidades === 'object') {
                arr = Object.values(habilidades);
            }

            console.log("Datos cargados para tabla:", arr);
            return arr;

        } catch (error) {
            console.error(error);
            return [];
        }
    }

    render() {
        return (
            <SPage title={"Habilidades"} disableScroll>
                {/* Header */}
                <SView row center style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: STheme.color.card,
                    backgroundColor: STheme.color.background
                }}>
                    <SText fontSize={16} bold>Lista de Habilidades</SText>
                    <SView flex />
                </SView>

                {/* Tabla */}
                <DinamicTable
                    ref={ref => this.DinamicTable = ref}
                    loadData={this.loadData.bind(this)}
                    loadInitialState={async () => {
                        return {
                            sorters: [{ key: "descripcion", order: 'asc', type: "string" }]
                        }
                    }}
                    onSelect={e => {
                        // Menú contextual para editar/eliminar
                        if (MDL.rolesPermisos.getPermiso({ url: "/habilidad/tabla", permiso: 'edit' })) {
                            FloatMenu.open({
                                e: e.evt,
                                label: e.row.descripcion,
                                options: [
                                    {
                                        label: "Editar",
                                        icon: <SIconApp name='Edit' />,
                                        onPress: () => {
                                            // Abrir popup en modo edición
                                            PopupRegistrarHabilidad.open({
                                                editObject: e.row, // Pasar el objeto a editar
                                                onSuccess: () => {
                                                    // Recargar la tabla cuando se edite exitosamente
                                                    if (this.DinamicTable) {
                                                        this.DinamicTable.loadData();
                                                    }
                                                }
                                            });
                                        }
                                    },
                                    {
                                        label: "Eliminar",
                                        icon: <SIconApp name='Delete' />,
                                        onPress: () => {
                                            // Lógica para eliminar
                                            // Necesitarías implementar MDL.habilidad.eliminar()
                                            console.log("Eliminar:", e.row);
                                        }
                                    }
                                ]
                            });
                        }
                    }}
                    style={{
                        borderWidth: 1,
                        borderColor: STheme.color.card,
                        borderRadius: 4,
                        margin: 8
                    }}
                >
                    <DinamicTable.Col
                        key={"key"}
                        label='Key'
                        width={50}
                        data={e => e.row.key}
                        textStyle={{
                            fontSize: 10,
                            color: STheme.color.lightGray,
                        }}
                    />
                    <DinamicTable.Col
                        key={"descripcion"}
                        label='Descripción'
                        width={300}
                        wrap
                        textStyle={{
                            fontSize: 12,
                        }}
                        data={e => e.row.descripcion}
                    />
                    <DinamicTable.Col
                        key={"estado"}
                        label='Estado'
                        width={80}
                        data={e => e.row.estado == 1 ? "Activo" : "Inactivo"}
                        textStyle={{
                            fontSize: 10,
                            color: e => e.row.estado == 1 ? STheme.color.success : STheme.color.danger,
                        }}
                    />
                </DinamicTable>

                {/* Botón flotante para registrar nueva habilidad */}
                <FloatButtom
                    onPress={() => {
                        PopupRegistrarHabilidad.open({
                            onSuccess: () => {
                                // Recargar la tabla cuando se registre exitosamente
                                if (this.DinamicTable) {
                                    this.DinamicTable.loadData();
                                }
                            }
                        });
                    }}
                />
            </SPage>
        );
    }
}