import React from "react";
import { SIcon, SImage, SInput, SNavigation, SNotification, SPage, SSwitch, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import TextArea from "../../Components/QueryTool/TextArea";
import TextAreaPopup from "../../Components/QueryTool/TextAreaPopup";
import ToolTips from "../../Components/ToolTips";

export default class permiso extends React.Component {

    key_rol = SNavigation.getParam("key_rol", "");
    comuns = ["page", "ver", "new", "edit", "delete", "table"]
    loadData = async () => {
        const pages = await MDL.rolesPermisos.getAllPage();
        const permisos = await MDL.rolesPermisos.getAllPermiso();
        const rolPermiso = await MDL.rolesPermisos.getAllRolPermiso(this.key_rol);
        const permiso_info = await MDL.rolesPermisos.getAllPermisoInfo();

        const arrPages = Object.values(pages);
        arrPages.map(page => {
            page.permisos = Object.values(permisos).filter(permiso => permiso.key_page === page.key);
            page.permisos.map(permiso => {
                permiso.rolPermiso = Object.values(rolPermiso).find(rp => rp.key_permiso === permiso.key);
                permiso.info = permiso_info[permiso.key]
            })
        })

        return arrPages;
        console.log("Permisos", permisos, pages);
    }
    render() {
        const cols = [
            <DinamicTable.Col key="foto" label="Foto" width={40} data={e => e.row.key}
                customComponent={e => {
                    return <SView width={24} height={24}>
                        <SImage src={SSocket.api.roles_permisos + "page/" + e.data} />
                    </SView>
                }} />,
            <DinamicTable.Col key="url" label="URL" width={200} data={e => e.row.url} />,
            <DinamicTable.Col key="descripcion" label="Descripcion" width={180} data={e => e.row.descripcion}
                customComponent={e => {
                    return <SView row style={{
                        height: "100%",
                        alignItems: "center",
                    }}>
                        {new Array(e.row.url.split("/").length - 1).fill(0).map((_, index) => {
                            return <SView style={{
                                width: 16,
                                height: "100%",
                                borderLeftWidth: 1,
                                borderLeftColor: STheme.color.card
                            }} />
                        })}
                        <SText flex numberOfLines={1} fontSize={12} style={{
                        }}>{e.data}</SText>
                    </SView>
                }} />,
            ...this.comuns.map(com => {
                return <DinamicTable.Col key={com} label={com} width={140}
                    data={e => e.row.permisos.find(permiso => permiso.type == com)?.descripcion}
                    customComponent={e => {
                        if (!e.data) return;
                        return <PermisoSwitch permiso={e.row.permisos.find(permiso => permiso.type == com)} key_rol={this.key_rol} />
                    }}
                />
            }),
            <DinamicTable.Col key="permisos" label="Permisos" width={800}
                data={e => e.row.permisos.filter(permiso => !this.comuns.includes(permiso.type)).map(permiso => permiso.type)}
                cellStyle={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    flexWrap: "wrap",
                }}
                customComponent={e => {
                    return e.row.permisos.filter(permiso => !this.comuns.includes(permiso.type)).sort((a, b) => {
                        if (a.type < b.type) return -1;
                        if (a.type > b.type) return 1;
                        return 0;
                    }).map((permiso, index) => {
                        return <PermisoSwitch key={index} permiso={permiso} key_rol={this.key_rol} />
                    })
                }}
            />
        ]
        return <SPage title={"permiso"} disableScroll>
            <DinamicTable
                {...Config.table.applyTheme()}
                loadData={this.loadData.bind(this)}
                selectType="multiple"
                loadInitialState={async () => {
                    return {
                        sorters: [
                            { key: "url", order: "asc", type: "string" },
                        ]
                    }
                }}


            >
                {cols}

            </DinamicTable>
        </SPage>
    }
}

class PermisoSwitch extends React.Component<{ permiso: string, key_rol: string }> {
    handleEdit = () => {
        const { permiso, key_rol } = this.props;
        TextAreaPopup.open({
            type: "MD",
            title: permiso.descripcion,
            defaultValue: permiso.info?.descripcion,
            onChangeText: (e) => {
                const k = "editando";
                new SThread(1000, k, true).start(() => {
                    SNotification.send({
                        key: k,
                        title: "Guardando",
                        type: "loading",
                    })
                    SSocket.sendPromise({
                        service: "roles_permisos",
                        component: "permisoInfo",
                        type: "save",
                        data: {
                            key_permiso: permiso.key,
                            descripcion: e,
                        }
                    }).then(a => {
                        permiso.info = a.data;
                        this.forceUpdate()
                        SNotification.remove(k)
                    }).catch(e => {
                        SNotification.send({
                            key: k,
                            title: "Error",
                            body: e?.error,
                            color: STheme.color.danger,
                            time: 5000
                        })
                    })
                })
            }
        })
    }
    handleOnChange(e) {
        const { permiso, key_rol } = this.props;
        SNotification.send({
            key: "edit_permiso_" + permiso.key,
            title: "Cargando",
            body: permiso.descripcion,
            type: "loading",

        })
        if (permiso.rolPermiso) {
            // Editar
            MDL.rolesPermisos.editarRolPermiso({
                ...permiso.rolPermiso,
                estado: 0,
            }).then(e => {
                SNotification.remove("edit_permiso_" + permiso.key)
                permiso.rolPermiso = null;
                this.forceUpdate();
            }).catch(e => {
                SNotification.send({
                    key: "edit_permiso_" + permiso.key,
                    title: "Error",
                    body: e?.error,
                    color: STheme.color.danger,
                    time: 5000
                })
                console.log(e);
            })
        } else {
            // registart
            MDL.rolesPermisos.registrarRolPermiso({
                key_rol: key_rol,
                key_permiso: permiso.key,
            }).then(e => {
                SNotification.remove("edit_permiso_" + permiso.key)
                permiso.rolPermiso = e;
                this.forceUpdate();
            }).catch(e => {
                SNotification.send({
                    key: "edit_permiso_" + permiso.key,
                    title: "Error",
                    body: e?.error,
                    color: STheme.color.danger,
                    time: 5000
                })
                console.log(e);
            })
        }
    }
    render() {
        const { permiso, key_rol } = this.props;
        return <SView row padding={2} style={{ alignItems: "center", marginRight: 8 }
        }>
            <SSwitch scale={2} size={12} value={!!permiso.rolPermiso} onChange={e => {
                this.handleOnChange(e);
            }} />
            <SView width={4} />
            <SText fontSize={12}  >{permiso.descripcion}</SText>
            <SView width={4} />
            {permiso?.info?.descripcion && <ToolTips
                type="info"
                small
                color={STheme.color.warning}
                descripcion={permiso.info.descripcion}
                // itemWidth={200}
                itemHeight={300}
            />}
            <SView width={4} />
            <SView style={{
                width: 14,
                height: 14
            }} onPress={() => {
                this.handleEdit();
            }}>
                <SIconApp name="Pencil" fill={STheme.color.lightGray} />
            </SView>
        </SView >
    }
}