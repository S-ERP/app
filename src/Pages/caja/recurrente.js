import React from "react";
import { SNotification, SPage, SText } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import Config from "../../Config";

export default class recurrente extends React.Component {
    componentDidMount() {
        this.loadData();
    }
    async loadData() {
        const resp = await SSocket.sendPromise({
            service: "caja",
            component: "recurrente",
            type: "getAll",
            key_empresa: MDL.empresa.select?.key,
        })
        console.log(resp.data)
        return Object.values(resp.data)
    }
    async ejecutar(key) {
        SNotification.send({
            key: "ejecutar",
            title: "cargando",
            type:"loading"
        })
        try {

            const resp = await SSocket.sendPromise({
                service: "caja",
                component: "recurrente",
                type: "ejecutar",
                key: key
            })
            SNotification.send({
                key: "ejecutar",
                title: "exito",
                time: 5000
            })
        } catch (error) {
            SNotification.send({
                key: "ejecutar",
                title: "error",
                body: error?.error ?? JSON.stringify(error),
                time: 5000
            })
        }

        // console.log(resp.data)
        // return Object.values(resp.data)
    }
    render() {
        return <SPage title={"recurrente"} disableScroll>
            <DinamicTable
                {...Config.table.applyTheme}
                loadData={this.loadData.bind(this)}>
                <DinamicTable.Col key={"key"} label="Key" data={e => e.row.key} />
                <DinamicTable.Col key={"data"} label="data" width={300} data={e => JSON.stringify(e.row.data)} />
                <DinamicTable.Col key={"enviar"} label="enviar" width={300}
                    data={e => "enviar"}
                    onPress={(e) => {
                        this.ejecutar(e.row.key)
                    }}
                />
            </DinamicTable>
        </SPage>
    }
}