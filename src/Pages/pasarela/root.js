import React from "react";
import { SNotification, SPage, SText } from "servisofts-component";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import FloatButtom from "../../Components/FloatButtom";
import SelectorPasarela from "../../Components/Selectores/SelectorPasarela";
import FormularioPasarela from "./Components/FormularioPasarela";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import Config from "../../Config";
import PagarConPasarela from "./Components/PagarConPasarela";

export default class root extends React.Component {

    // componentDidMount() {
    //     this.loadData();
    // }

    async loadData() {
        const pasarelas = await MDL.caja.pasarela.getAll();
        const pasarela_empresa = await MDL.caja.pasarela_empresa.getAll();
        pasarela_empresa.map(pe => {
            pe.pasarela = pasarelas.find(p => p.key == pe.key_pasarela);
        })
        return pasarela_empresa;
    }
    render() {
        return <SPage title={"Pasarela"} disableScroll>
            <DinamicTable
                ref={ref => this.table = ref}
                {...Config.table.applyTheme()}
                loadData={this.loadData}
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row.descripcion,
                        options: [
                            {
                                label: "Editar", icon: <SIconApp name="Edit" />,
                                onPress: () => {
                                    FormularioPasarela.open({
                                        editObject: e.row,
                                        onSuccess: (e) => {
                                            this.table.loadData();
                                        }
                                    })
                                }
                            },
                            {
                                label: "Eliminar", icon: <SIconApp name="Delete" />,
                                onPress: () => {
                                    SNotification.send({
                                        title: "Not Implemet",
                                        time: 5000,
                                    })
                                    // MDL.compra_venta.execute_function("")
                                    // FormularioPasarela.open({
                                    //     editObject: e.row,
                                    //     onSuccess: (e) => {
                                    //         this.table.loadData();
                                    //     }
                                    // })
                                }
                            },
                            {
                                label: "Pagar con la pasarela", icon: <SIconApp name="Money" />,
                                onPress: () => {
                                    PagarConPasarela.open({
                                        key_pasarela_empresa: e.row.key,
                                        monto: 2
                                    })
                                    // SNotification.send({
                                    //     title: "Not Implemet",
                                    //     time: 5000,
                                    // })
                                    // FormularioPasarela.open({
                                    //     editObject: e.row,
                                    //     onSuccess: (e) => {
                                    //         this.table.loadData();
                                    //     }
                                    // })
                                }
                            },
                        ]
                    })

                }}>
                <DinamicTable.Col width={50} key={"key"} label={"Key"} data={e => e.row.key} />
                <DinamicTable.Col width={200} key={"pasarela"} label={"pasarela"} data={e => e.row?.pasarela?.descripcion} />
                <DinamicTable.Col width={200} key={"descripcion"} label={"descripcion"} data={e => e.row.descripcion} />
                <DinamicTable.Col width={200} key={"params"} label={"params"} data={e => JSON.stringify(e.row.params)} />
            </DinamicTable>
            <FloatButtom onPress={() => {
                FormularioPasarela.open({
                    onSuccess: (e) => {
                        this.table.loadData();
                    }
                })
            }} />
        </SPage >
    }
}