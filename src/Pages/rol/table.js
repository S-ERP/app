import React from "react";
import { SImage, SNavigation, SPage, SText, STheme, SView } from "servisofts-component";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import SSocket from "servisofts-socket";
import FloatMenu from "../../Components/FloatMenu";

export default class table extends React.Component {
    async loadData() {
        const roles = await MDL.rolesPermisos.getAllEmpresa()
        return Object.values(roles);
    }
    render() {
        return <SPage title={"Rol"}>
            <DinamicTable
                {...Config.table.applyTheme()}
                loadData={this.loadData.bind(this)}
                selectType="single"
                onSelect={e => {
                    FloatMenu.open({
                        e: e.evt,
                        options: [{
                            label: "Permisos",
                            onPress: () => {
                                SNavigation.navigate("/rol/permiso", { key_rol: e.row.key })
                            }
                        }]
                    })
                }}
            >
                <DinamicTable.Col key={"key"} label={"Key"}
                    textStyle={{
                        color: STheme.color.lightGray,
                        fontSize: 10
                    }}
                    data={e => e.row.key} />
                <DinamicTable.Col key={"foto"} label={"Foto"}
                    data={e => SSocket.api.roles_permisos + "rol/" + e.row.key}
                    customComponent={e => <SView col={"xs-12"} height={40}>
                        <SImage src={e.data} />
                    </SView>}
                />
                <DinamicTable.Col key={"descripcion"} label={"Rol"}
                    width={200}
                    textStyle={{
                        fontWeight: "bold"
                    }}
                    data={e => e.row.descripcion} />
            </DinamicTable>
        </SPage>
    }
}