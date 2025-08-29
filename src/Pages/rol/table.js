import React from "react";
import { SDate, SHr, SImage, SNavigation, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import SSocket from "servisofts-socket";
import FloatMenu from "../../Components/FloatMenu";
import FloatButtom from "../../Components/FloatButtom";
import PopupCrearRol from "./Components/PopupCrearRol";
import SIconApp from "../../Assets/SIconApp";

export default class table extends React.Component {
    async loadInitialData() {
        const roles = await MDL.rolesPermisos.getAllEmpresa()
        return Object.values(roles);
    }

    mostrarTabla() {
        return <DinamicTable
            {...Config.table.applyTheme()}
            loadData={this.loadInitialData.bind(this)}

            //  loadData={async () => {
            //     return this.loadInitialData();
            // }}

            selectType="single"
            onSelect={e => {
                FloatMenu.open({
                    e: e.evt,
                    label: "Rol: " + e.row?.descripcion,
                    options: [
                        {
                            label: "Permisos",
                            onPress: () => {
                                SNavigation.navigate("/rol/permiso", { key_rol: e.row.key })
                            }
                        },

                        {
                            icon: <SIconApp name='Edit' />,
                            label: "Actualizar Rol",
                            onPress: () => {
                                const proveedor = {
                                    ...e.row,
                                    key_usuario: MDL.usuario.session?.key,
                                }
                                PopupCrearRol.open({
                                    editObject: proveedor,
                                    key_empresa: proveedor.key_empresa,
                                    onSuccess: async () => {
                                        // this.DinamicTable.loadData();
                                        this.loadInitialData.bind(this)
                                    },
                                })
                            }
                        },
                        {
                            icon: <SIconApp name='Delete' />,
                            label: "Eliminar Rol",
                            onPress: () => {
                                SPopup.confirm({
                                    title: "Eliminar Proveedor",
                                    message: "¿Estás seguro de eliminar esta sucursal?",
                                    onPress: () => {
                                        const data = {
                                            ...e.row,
                                            estado: 0,
                                        }
                                        // MDL.inventario.proveedor.editar(data).then((resp) => {
                                        //     this.DinamicTable.loadData();
                                        //     SNotification.send({
                                        //         title: "Proveedor Elimninada",
                                        //         body: "Proveedor se ha Elimninado correctamente.",
                                        //         time: 3000,
                                        //         color: STheme.color.success,
                                        //     });
                                        // }).catch((e) => {
                                        //     console.error("Error al guardar el Proveedor", e);
                                        //     SNotification.send({
                                        //         title: "Error",
                                        //         body: "No se pudo guardar el Proveedor.",
                                        //         time: 3000,
                                        //         color: STheme.color.danger,
                                        //     });
                                        // })
                                    }
                                })
                            }
                        }

                    ]
                })
            }}
        >

            <DinamicTable.Col key="index" label="#" width={40} data={(e) => e.index + 1} />

            <DinamicTable.Col key={"key"} label={"Key"} textStyle={{ color: STheme.color.lightGray, fontSize: 10 }} data={e => e.row.key} />

            <DinamicTable.Col key={"foto"} label={"Foto"}
                data={e => SSocket.api.roles_permisos + "rol/" + e.row.key}
                customComponent={e => <SView col={"xs-12"} height={40}>
                    <SImage src={e.data} />
                </SView>}
            />
            <DinamicTable.Col key={"descripcion"} label={"Rol"} width={200} textStyle={{ fontWeight: "bold" }} data={e => e.row.descripcion} />

            <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />
            <DinamicTable.Col key="admin" label="Admin" width={120} data={(e) => e.row?.usuario?.Nombres ?? ""}
                customComponent={e => <>
                    {(e.row?.key_usuario) ?
                        <SView col={"xs-12"} row  >
                            <SView style={{ width: 28 }}>
                                <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66" }}>
                                    <SImage src={`${SSocket.api.root}usuario/${e.row?.key_usuario}`} style={{ resizeMode: "cover" }} />
                                </SView>
                            </SView>
                            <SView width={5} />
                            <SText center color={STheme.color.text}>{e.row?.usuario?.Nombres}</SText>
                        </SView> : null}
                </>}
            />

        </DinamicTable>
    }

    render() {
        return <SPage title={"Rol"}>
            {this.mostrarTabla()}
            <SHr height={20} />
            <FloatButtom onPress={() => {
                PopupCrearRol.open({
                    onSuccess: async () => {
                        // this.DinamicTable.loadData();
                        this.loadInitialData.bind(this)
                    },
                });
            }} />
        </SPage>
    }
}