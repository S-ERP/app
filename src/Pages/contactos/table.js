import React from "react";
import { SIcon, SImage, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import SSocket from "servisofts-socket";
import FloatButtom from "../../Components/FloatButtom";
import PopupCrearCliente from "../cliente/Components/PopupCrearCliente";
import FloatMenu from "../../Components/FloatMenu";
import AdminsitrarHabilidades from "../cliente/Components/AdministrarHabilidades";
import AdministrarTipo from "../cliente/Components/AdministrarTipo";

export default class table extends React.Component {
    async loadData() {
        const contactos = await MDL.crm.cliente.getAll();
        // const tipos = await MDL.crm.tipoCliente.getAll()
        console.log("dataALL 2:", contactos);
        const habilidades = await MDL.habilidad.getAllWithUsuarios();
        contactos.forEach(contacto => {
            contacto.habilidades = (habilidades ?? []).filter(h => h.key_usuarios?.includes(contacto.key)) ?? [];
        });
        console.log("dataALL:", contactos);
        return contactos;
    }
    render() {
        return <SPage title={"contactos"} disableScroll>
            <DinamicTable
                {...Config.table.applyTheme()}

                loadData={this.loadData.bind(this)}
                ref={ref => (this.DinamicTable = ref)}
                onSelect={e => {
                    const { row, evt } = e;
                    const nombreCliente = `CONTACTO: ${row?.nombres ?? 'Sin nombre'}`;
                    const options = [];

                    // if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'edit' })) {
                    options.push({
                        label: 'Editar contacto',
                        icon: <SIcon name="tareaUser" fill={STheme.color.warning} />,
                        onPress: () => {
                            const cliente = { ...row, key_usuario: MDL.usuario.session?.key };
                            PopupCrearCliente.open({
                                editObject: cliente,
                                onSuccess: () => this.DinamicTable.loadData(),
                            });
                        },
                    });
                    // }





                    // if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'delete' })) {
                    options.push({
                        label: 'Eliminar contacto',
                        icon: <SIcon name="tareaUser" fill={STheme.color.danger} />,
                        onPress: () => {
                            SPopup.confirm({
                                title: 'Eliminar Contacto',
                                message: `¿Estás seguro de eliminar a ${nombreCliente}?`,
                                onPress: () => {
                                    SSocket.sendPromise({
                                        service: 'crm',
                                        component: 'cliente',
                                        type: 'editar',
                                        data: { ...row, estado: 0 },
                                    })
                                        .then(() => {
                                            SNotification.send({
                                                key: 'eliminar_ok',
                                                title: 'Éxito',
                                                body: `${nombreCliente} fue eliminado correctamente.`,
                                                time: 1500,
                                                color: STheme.color.success,
                                            });
                                            this.DinamicTable.loadData();
                                        })
                                        .catch(err => {
                                            console.error('Error al eliminar contacto:', err);
                                            SNotification.send({
                                                key: 'eliminar_error',
                                                title: 'Error',
                                                body: 'Ocurrió un error al eliminar. Intenta nuevamente.',
                                                time: 3000,
                                                color: STheme.color.danger,
                                            });
                                        });
                                },
                            });
                        },
                    });
                    // }

                    //  options.push({
                    //     label: 'Ver perfil',
                    //     icon: <SIcon name="Eyes" fill={STheme.color.text} />,
                    //     onPress: () => {
                    //         SNavigation.navigate("/cliente/perfil", { key: e.row.key })
                    //     },
                    // });

                    // if (this.onSelect) {
                    //     options.push({
                    //         label: "select",
                    //         onPress: () => {
                    //             this.onSelect(e.row);
                    //         }
                    //     })
                    // }
                    options.push({
                        label: "Administrar Tipos",
                        icon: <SIcon name="configurar" fill={STheme.color.text} />,
                        onPress: () => {
                            AdministrarTipo.open({
                                contacto: e.row,
                                onSuccess: () => {
                                    this.DinamicTable.loadData();
                                }
                            });
                        }
                    })

                    options.push({
                        label: "Administrar Habilidades",
                        icon: <SIcon name="addTarea" fill={STheme.color.text} />,
                        onPress: () => {
                            AdminsitrarHabilidades.open({
                                key_usuario: e.row.key,
                                onSuccess: () => {
                                    this.DinamicTable.loadData();
                                }
                            });
                        }
                    })
                    FloatMenu.open({
                        e: evt,
                        label: nombreCliente,
                        options,
                    });
                }}

            >
                <DinamicTable.Col key="index" label="#" width={40} data={e => e.index + 1} />
                <DinamicTable.Col
                    key="key"
                    label="Foto"
                    width={40}
                    data={e => `${SSocket.api.root}usuario/${e.row?.key}`}
                    customComponent={e => (
                        <SView col="xs-12" center row>
                            <SView
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 100,
                                    overflow: 'hidden',
                                    backgroundColor: `${STheme.color.card}`,
                                }}
                            >
                                <SImage src={`${e.data}?date=${new Date().getTime()}`} style={{ resizeMode: 'cover' }} />
                            </SView>
                        </SView>
                    )}
                />
                <DinamicTable.Col
                    key="key-"
                    label="Ver"
                    width={40}
                    data={e => ""}
                    customComponent={e => <SView row center card padding={2} onPress={() => { SNavigation.navigate("/cliente/perfil", { key: e.row.key }) }}>
                        <SIcon name='Eyes' height={14} fill={STheme.color.lightGray} ></SIcon>
                    </SView>} />
                <DinamicTable.Col key={"nombre"} label="Nombre" data={e => e.row.nombres} width={200} />
                {/* <DinamicTable.Col key={"apellido"} label="Apellido" data={e => e.row.apellidos} /> */}
                <DinamicTable.Col key={"telefono"} label="Teléfono" data={e => e.row.telefono} width={120} />
                <DinamicTable.Col key={"correo"} label="Email" width={200} data={e => e.row.correo} />
                <DinamicTable.Col key={"nit"} label="NIT" data={e => e.row.nit} />
                <DinamicTable.Col key={"razon_social"} label="Razón Social" data={e => e.row.razon_social} width={200} />
                <DinamicTable.Col key={"fecha_nacimiento"} label="Fecha de Nacimiento" data={e => e.row.fecha_nacimiento} />
                <DinamicTable.Col key={"tipo_cliente"} label="Tipo" data={e => ((e.row.tipo_cliente ?? []).map(a => a.titulo))} width={160}
                    cellStyle={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                        gap: 4,
                    }}
                    customComponent={e => {
                        return (e.row.tipo_cliente ?? []).map((tc) => {
                            return <SView style={{
                                // borderWidth: 1,
                                // backgroundColor: (tc.color ?? STheme.colorFromText(tc.titulo)) + "33",
                                // borderColor: tc.color ?? STheme.colorFromText(tc.titulo),
                                padding: 2,
                                paddingHorizontal: 4,
                                borderRadius: 4,
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 2,
                            }} row>
                                <SView style={{
                                    width: 12,
                                    height: 12, borderRadius: 100,
                                    backgroundColor: (tc.color ?? STheme.colorFromText(tc.titulo)),

                                }}></SView>
                                <SText key={tc.key} bold fontSize={12}  >{tc.titulo}</SText>
                            </SView>
                        })
                    }}
                />

                <DinamicTable.Col key={"habilidades"} label="Habilidades" data={e => ((e.row.habilidades ?? []).map(a => {
                    return a.descripcion
                }))} width={160}
                    cellStyle={{
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                        gap: 4,
                    }}

                    customComponent={e => {
                        let contacto = e.row;

                        return (
                            <>
                                <SView
                                    col={"xs-12"}
                                    row
                                    center
                                    padding={2}
                                // onPress={() => {
                                //     AdminsitrarHabilidades.open({
                                //         key_usuario: contacto.key,
                                //         onSuccess: () => {
                                //             this.DinamicTable.loadData();
                                //         }
                                //     });
                                // }}
                                >
                                    {(contacto.habilidades ?? []).map((tc) => (
                                        <SView
                                            key={tc.key}
                                            style={{
                                                backgroundColor: STheme.colorFromText(tc.descripcion) + "66",
                                                borderWidth: 1,
                                                borderColor: STheme.colorFromText(tc.descripcion),
                                                padding: 2,
                                                borderRadius: 4,
                                                paddingHorizontal: 4,
                                                margin: 2
                                            }}
                                        >
                                            <SText fontSize={10}>{tc.descripcion}</SText>
                                        </SView>
                                    ))}
                                </SView>
                            </>
                        );
                    }}

                // customComponent={e => {
                //     let contacto = e.row;

                //     return (e.row.habilidades ?? []).map((tc) => {
                //         return <SView style={{
                //             backgroundColor: STheme.colorFromText(tc.descripcion) + "66",
                //             borderWidth: 1,
                //             borderColor: STheme.colorFromText(tc.descripcion),
                //             padding: 2,
                //             borderRadius: 4,
                //             paddingHorizontal: 4,
                //         }}>
                //             <SText key={tc.key} fontSize={10}  >{tc.descripcion}</SText>
                //         </SView>
                //     })
                // }}
                />

            </DinamicTable >
            {/* {MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'new' }) && ( */}
            < FloatButtom
                onPress={() =>
                    PopupCrearCliente.open({
                        onSuccess: () => this.DinamicTable.loadData(),
                    })
                }
            />
            {/* )} */}
        </SPage >
    }
}