import React from "react";
import { SPage, SText } from "servisofts-component";
import SSocket from "servisofts-socket";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";

export default class cuentas2 extends React.Component {
    render() {
        return <SPage title={"cuentas2"} disableScroll>
            <DinamicTable
                loadData={async () => {
                    const resp = await SSocket.sendPromise({
                        "version": "1.0",
                        "service": "contabilidad",
                        "component": "cuenta_contable",
                        "type": "getAll",
                        "eliminado": false,
                        "key_empresa": MDL.empresa.select.key,
                        "key_usuario": MDL.usuario.session.key
                    })
                    return Object.values(resp.data);
                }}
                loadInitialState={async () => {
                    return {
                        sorters: [
                            { key: "codigo", order: "asc", type: "string" }
                        ]
                    }
                }}
            >
                <DinamicTable.Col key={"codigo"} label="Codigo" data={e => e.row.codigo} />
                <DinamicTable.Col key={"descripcion"} label="descripcion" width={300} data={e => e.row.descripcion} />
                <DinamicTable.Col key={"estado"} label="estado" data={e => e.row.estado} />
                <DinamicTable.Col key={"fecha_on"} label="fecha_on" data={e => e.row.fecha_on} />
            </DinamicTable>
        </SPage>
    }
}