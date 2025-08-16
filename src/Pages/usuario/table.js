import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SPage, STheme, SPopup, SView, SText, SNavigation, SIcon, SDate, SNotification, SImage } from 'servisofts-component';
import MDL from '../../MDL';

import { DinamicTable } from 'servisofts-table'
// import SPageMenu from '../../Components/SPageMenu';
// import BoxMenu from '../registro/components/BoxMenu';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import RolesDelUsuario from '../rol/Components/RolesDelUsuario';
import FormEditarUsuario from './Components/FormEditarUsuario';
import FormEditarPassword from './Components/FormEditarPassword';
// import SelectFiltroGuardado from '../../Components/FiltroTabla/SelectFiltroGuardado';
// import FiltroTabla from '../../Components/FiltroTabla';
import FloatButtom from '../../Components/FloatButtom';
import Model from '../../Model';
import SSocket from 'servisofts-socket';


const ImageLabel = ({ label, src, textStyle, wrap = true }) => {
    return <SView row >
        <SView width={20} height={20} style={{ borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card }}>
            <SImage enablePreview src={src} style={{ resizeMode: "cover" }} />
        </SView>
        <SView width={4} />

        <Text style={[textStyle, { flex: 1 }]} numberOfLines={!wrap ? 0 : 1} >{label}</Text>
    </SView>
}

export default class table extends Component {
    static PERMISO = "ver"
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    loadData = async () => {
        var users = await MDL.usuario.getAll()

        let eu = Model.empresa_usuario.Action.getAllByKeyEmpresa(Model.empresa.Action.getKey());
        let usuarios = await MDL.usuario.getAll()
        console.log(eu);
        if (!eu || !usuarios) return null
        let data = Object.values(eu).map(a => {
            let usr = usuarios[a.key_usuario];
            usr.empresa_usuario = a;
            return usr;
        })
        console.log("DATA", data);
        this.setState({ data })
        return Object.values(data).filter(user => user.estado === "1")


        // var userRoles = await MDL.role.getAllUserRoles();
        // var roles = await MDL.role.getAll();
        // users.map((user) => {
        //     user.roles = userRoles.filter((userRole) => {
        //         return userRole.key_user == user.key
        //     }).map((userRole) => {
        //         userRole.rol = roles.find((role) => {
        //             return role.key == userRole.key_role
        //         })

        //         return userRole;
        //     }).filter((userRole) => {
        //         return !!userRole.rol
        //     })
        // })

    }

    validarFecha = (fecha_) => {
        let fecha = new Date(fecha_);
        if (!isNaN(fecha.getTime())) {
            let opcionesFecha = { day: '2-digit', month: '2-digit', year: '2-digit' };
            let opcionesHora = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            let fechaFormateada = new Intl.DateTimeFormat('es-ES', opcionesFecha).format(fecha);
            let horaFormateada = new Intl.DateTimeFormat('es-ES', opcionesHora).format(fecha);
            return !fecha_ ? "" : `${fechaFormateada} ${horaFormateada}`;
        } else {
            return "";
        }
    }


    render() {
        console.log(this.state.users)
        return <SPage disableScroll preventBack title={"Usuarios"}
            icon={<SIcon name='Muser' fill={STheme.color.text} />}
            navBarContent={<SView flex row>
                <SView flex />
                {/* <FiltroTabla
          ref={ref => this.filtro = ref}
          type='usuario'
          getDinamicTable={() => this.table} /> */}
                <SView width={8} />
            </SView>}
        >
            <DinamicTable
                ref={ref => this.table = ref}
                selectType="single"
                onEvent={e => {
                    if (this.filtro) this.filtro.onEvent(e);
                }}
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row.Nombres + " " + e.row.Apellidos,

                        options: [
                            // {
                            //     label: "Administrar Roles",
                            //     icon: <SIcon name="Engranaje" fill={STheme.color.text} />,
                            //     onPress: () => {
                            //         RolesDelUsuario.open({
                            //             data: e.row,
                            //             onRegister: (e) => {
                            //                 this.table.loadData();
                            //             }
                            //         })

                            //     }
                            // },
                            {
                                label: "Editar usuario",
                                onPress: () => {
                                    FormEditarUsuario.open({
                                        data: e.row,
                                        onRegister: (e) => {
                                            this.table.loadData();
                                        }
                                    })
                                    // SNavigation.navigate("/usuario/registro", { key: e.row.key })
                                },
                                icon: <SIcon name="Edit" fill={STheme.color.text} />,
                            },
                            {
                                label: "Cambiar contraseña",
                                onPress: () => {
                                    FormEditarPassword.open({
                                        data: e.row,
                                        onRegister: (e) => {
                                            // this.table.loadData();
                                        }
                                    })
                                    // SNavigation.navigate("/usuario/registro", { key: e.row.key })
                                },
                                icon: <SIcon name="Lock" fill={STheme.color.text} />,
                            },
                            {
                                label: "Eliminar usuario",
                                // icon: "Delete",
                                icon: <SIcon name="Delete" fill={STheme.color.text} />,
                                onPress: () => {
                                    SPopup.confirm({
                                        title: "Eliminar usuario",
                                        message: "¿Estas seguro de eliminar el usuario?",
                                        onPress: () => {
                                            // MDL.usuario.eliminar(e.row.key).then((resp) => {
                                            //     this.table.loadData();
                                            // }).catch((e) => {
                                            //     SNotification.error("Error al eliminar el usuario")
                                            // })
                                            e.row.estado = 0;
                                            MDL.usuario.editar(e.row).then((resp) => {
                                                this.table.loadData();
                                            }).catch((e) => {
                                                SNotification.error("Error al eliminar el usuario")
                                            })
                                        }
                                    })

                                }
                            },


                        ]
                    })

                }}


                loadData={this.loadData.bind(this)}
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                language='es'

            >
                <DinamicTable.Col
                    key='index'
                    textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                    data={e => e.index + 1}
                    format={e => e.index + 1}
                    width={30} />
                <DinamicTable.Col
                    key='key'
                    label='Key'
                    textStyle={{ fontSize: 10, color: STheme.color.lightGray }}
                    data={e => e.row.key}
                    width={50} />
                <DinamicTable.Col
                    key='Nombres'
                    label='Nombre'
                    data={e => e.row.Nombres}
                    customComponent={e => <ImageLabel wrap={e.colData.wrap} label={e.data} src={SSocket.api.root + "usuario/" + e.row?.key} textStyle={e.textStyle} />}
                    width={150} />
                <DinamicTable.Col
                    key='Apellidos'
                    label='Apellidos'
                    data={e => e.row.Apellidos}
                    width={150} />
                <DinamicTable.Col
                    key='CI'
                    label='# CI'
                    data={e => e.row.CI}
                    width={150} />
                <DinamicTable.Col
                    key='Telefono'
                    label='# Telefono'
                    data={e => e.row.Telefono}
                    width={150} />
                <DinamicTable.Col
                    key='Correo'
                    label='Correo electrónico'
                    data={e => e.row.Correo}
                    width={200} />


                {/* <DinamicTable.Col
                    key='roles'
                    label='# roles'
                    data={e => e.row.roles.map(i => i?.rol?.description)}
                    width={150} />
                <DinamicTable.Col key="created_at" data={a => !a.row.created_at ? null : new SDate(a.row.created_at, "yyyy-MM-ddThh:mm:ssTZD").date}
                    dataType='date'
                    label={"F. Registro"}
                    format={e => this.validarFecha(e.data)}
                    textStyle={{ color: STheme.color.lightGray }}
                    width={140}
                />
                <DinamicTable.Col key="updated_at"
                    data={a => !a.row.updated_at ? null : new SDate(a.row.updated_at, "yyyy-MM-ddThh:mm:ssTZD").date}
                    dataType='date'
                    label={"F. Edicion"}
                    format={e => this.validarFecha(e.data)}
                    textStyle={{ color: STheme.color.lightGray }}
                    width={140}
                />
             
                <DinamicTable.Col key="last_connection"
                    data={a => !a.row.last_connection ? null : new SDate(a.row.last_connection, "yyyy-MM-ddThh:mm:ssTZD").date}
                    dataType='date'
                    label={"Ultima Conexión"}
                    dateFormat='dd MON yyyy, hh:mm:ss'
                    textStyle={{ color: STheme.color.lightGray }}
                    customComponent={(e) => {
                        if (!e.row.last_connection) return <SText fontSize={10} color={STheme.color.lightGray}>Sin conexión</SText>
                        return <SText fontSize={10} color={STheme.color.lightGray}>{new SDate(e.row.last_connection, "yyyy-MM-ddThh:mm:ssTZD").timeSince(new SDate())}</SText>
                    }}
                    width={80}
                /> */}
            </DinamicTable>
            <FloatButtom onPress={() => {
                SNavigation.navigate('/registro')
                // FormRegistroRole.open({
                //   onRegister: (e) => {
                //     this.table.loadData();
                //   }
                // })
            }} />
        </SPage>
    }
}
