import React from "react";
import { SDate, SHr, SImage, SNavigation, SNotification, SPage, SPopup, STheme, SView } from "servisofts-component";
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
            ref={ref => this.DinamicTable = ref}
            selectType="single"
            onSelect={e => {
                FloatMenu.open({
                    e: e.evt,
                    label: "Rol: " + e.row?.descripcion,
                    options: [
                        {  icon: <SIconApp name='permisos' fill={STheme.color.text} />, label: "Permisos",  onPress: () => { SNavigation.navigate("/rol/permiso", { key_rol: e.row.key }) } },
                        {
                            icon: <SIconApp name='Edit' />,
                            label: "Editar Rol",
                            onPress: () => {
                                const roles = {
                                    ...e.row,
                                    key_usuario: MDL.usuario.session?.key,
                                }
                                PopupCrearRol.open({
                                    editObject: roles,
                                    key_empresa: roles.key_empresa,
                                    onSuccess: async () => {
                                        this.DinamicTable.loadData();
                                    },
                                })
                            }
                        },
                        {
                            icon: <SIconApp name='Delete' />,
                            label: "Eliminar Rol",
                            onPress: () => {
                                SPopup.confirm({
                                    title: "Eliminar Rol",
                                    message: "¿Estás seguro de eliminar esta sucursal?",
                                    onPress: () => {
                                        const data = {
                                            ...e.row,
                                            estado: 0,
                                        }


                                        MDL.rolesPermisos.editarRol(data).then((resp) => {
                                            this.DinamicTable.loadData();
                                            SNotification.send({
                                                title: "rol actualizado",
                                                body: "rol se ha guardado correctamente.",
                                                time: 3000,
                                                color: STheme.color.success,
                                            });
                                        }).catch((e) => {
                                            if (this.props.onSuccess) this.props.onSuccess(e)
                                            // console.error("Error al guardar el rol:", e);
                                            SNotification.send({
                                                title: "Error",
                                                body: "No se pudo guardar el rol.",
                                                time: 3000,
                                                color: STheme.color.danger,
                                            });
                                        });


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
                data={e => SSocket.api.roles_permisos + "rol/" + e.row.key + `?date=${new Date().getTime()}`}
                customComponent={e => <SView col={"xs-12"} height={40}>
                    <SImage src={e.data} />
                </SView>}
            />
            <DinamicTable.Col key={"descripcion"} label={"Descripción"} data={e => e.row.descripcion} />
            {/* <DinamicTable.Col key={"tipo"} label={"tipo"} width={50} textStyle={{ fontWeight: "bold" }} data={e => e.row.tipo} />
            <DinamicTable.Col key={"observacion"} label={"observacion"} width={50} textStyle={{ fontWeight: "bold" }} data={e => e.row.observacion} />
            <DinamicTable.Col key={"color"} label={"color"} width={50} textStyle={{ fontWeight: "bold" }} data={e => e.row.color} /> */}

            <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.lightGray, }} dateFormat="yyyy-MM-dd hh:mm" />

            <DinamicTable.Col key={"key_empresa"} label={"key_empresa"} width={150} textStyle={{ color: STheme.color.lightGray, fontSize: 10 }} data={e => e.row.key_empresa} />

        </DinamicTable>
    }

    render() {
        return <SPage title={"Rol"}>
            {this.mostrarTabla()}
            <SHr height={20} />
            <FloatButtom onPress={() => {
                PopupCrearRol.open({
                    onSuccess: async () => {
                        this.DinamicTable.loadData();
                    },
                });
            }} />
        </SPage>
    }
}