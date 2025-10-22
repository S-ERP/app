import React from "react";
import { SPage, SText } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";

export default class root extends React.Component {

    componentDidMount() {
        this.loadData();
    }
    async loadData() {
        const resp = await SSocket.sendPromise({
            service: "compra_venta",
            component: "descuento",
            type: "getAll",
            key_empresa: MDL.empresa.select.key,
        })
        return Object.values(resp.data);
    }
    render() {
        return <SPage title={"Descuento"} disableScroll>

            <SText onPress={() => {
                SSocket.sendPromise({
                    service: "compra_venta",
                    component: "descuento",
                    type: "registro",
                    data: {
                        descripcion: "2 Porciento de descuento",
                        porcentaje: 0.02,
                        monto: 0,

                    },
                    key_usuario: MDL.usuario.session.key,
                    key_empresa: MDL.empresa.select.key,
                })
            }}>{"REGISTRAR"}</SText>
            <DinamicTable loadData={this.loadData}>
                <DinamicTable.Col
                    key={"descripcion"}
                    label={"descripcion"}
                    width={200}
                    data={e => e.row.descripcion}></DinamicTable.Col>
                <DinamicTable.Col
                    key={"porcentaje"}
                    label={"porcentaje"}
                    data={e => e.row.porcentaje}></DinamicTable.Col>
                <DinamicTable.Col
                    key={"monto"}
                    label={"monto"}
                    data={e => e.row.monto}></DinamicTable.Col>
                <DinamicTable.Col
                    key={"key_tipo_cliente"}
                    label={"key_tipo_cliente"}
                    data={e => ""}></DinamicTable.Col>
            </DinamicTable>
        </SPage>
    }
}