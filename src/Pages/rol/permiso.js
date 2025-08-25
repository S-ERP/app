import React from "react";
import { SImage, SInput, SNavigation, SNotification, SPage, SSwitch, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";
import SSocket from "servisofts-socket";

export default class permiso extends React.Component {

    key_rol = SNavigation.getParam("key_rol", "");
    comuns = ["page", "ver", "new", "edit", "delete", "table"]
    loadData = async () => {
        const pages = await MDL.rolesPermisos.getAllPage();
        const permisos = await MDL.rolesPermisos.getAllPermiso();
        const rolPermiso = await MDL.rolesPermisos.getAllRolPermiso(this.key_rol);
        const arrPages = Object.values(pages);
        arrPages.map(page => {
            page.permisos = Object.values(permisos).filter(permiso => permiso.key_page === page.key);
            page.permisos.map(permiso => {
                permiso.rolPermiso = Object.values(rolPermiso).find(rp => rp.key_permiso === permiso.key);
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
                        <SText flex numberOfLines={1}  fontSize={12} style={{
                        }}>{e.data}</SText>
                    </SView>
                }} />,
            ...this.comuns.map(com => {
                return <DinamicTable.Col key={com} label={com} width={120}
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
    render() {
        const { permiso, key_rol } = this.props;
        return <SView row padding={2} style={{ alignItems: "center", marginRight: 8 }
        }>
            <SSwitch scale={2} size={12} value={!!permiso.rolPermiso} onChange={e => {
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
            }} />
            <SView width={4} />
            <SText fontSize={12}  >{permiso.descripcion}</SText>
        </SView >
    }
}