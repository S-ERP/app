import React from "react";
import { SPage, SText } from "servisofts-component";
import SSocket from "servisofts-socket";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import PagarConPasarela from "../pasarela/Components/PagarConPasarela";

export default class index extends React.Component {
    async loadData() {
        const resp = await SSocket.sendPromise({
            service: "caja",
            component: "cotizacion",
            type: "getAll",
            key_empresa: MDL.empresa?.select?.key
        })
        return Object.values(resp.data ?? []);
    }
    render() {
        return <SPage title={"Cotizaciones"} disableScroll>
            <DinamicTable loadData={this.loadData.bind(this)}>
                <DinamicTable.Col key={"key"} label="key" data={e => e.row.key} />
                <DinamicTable.Col key={"tipo_pago"}
                    label="tipo_pago"
                    data={e => e.row.data.tipos_pago}
                    width={300}
                    customComponent={(e) => {
                        const tipos_pago = e.row.data.tipos_pago;
                        return Object.values(tipos_pago).map((tipo_pago, index) => {
                            return <SText onPress={() => {
                                if (tipo_pago?.empresa_tipo_pago?.key_pasarela_empresa) {
                                    // console.log("Pagar con pasarela", tipo_pago);
                                    // return
                                    PagarConPasarela.open({
                                        key_pasarela_empresa: tipo_pago?.empresa_tipo_pago?.key_pasarela_empresa,
                                        monto: tipo_pago?.monto_nacional,
                                        tipo: "cotizacion",
                                        data: {
                                            key_cotizacion: e.row.key,
                                            key_tipo_pago: tipo_pago?.empresa_tipo_pago?.key
                                        }
                                    })
                                }

                            }}>{tipo_pago?.empresa_tipo_pago?.descripcion} {tipo_pago?.monto_nacional}</SText>
                        })
                    }}
                />
            </DinamicTable>
        </SPage>
    }
}