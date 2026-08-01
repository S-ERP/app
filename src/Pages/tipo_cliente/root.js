import React from "react";
import { SDate, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import { DinamicTable } from "servisofts-table";
import FloatButtom from "../../Components/FloatButtom";
import FloatMenu from "../../Components/FloatMenu";
import SIconApp from "../../Assets/SIconApp";
import Config from "../../Config";
import FormRegistroTipoCliente from "../crm/Components/FormRegistroTipoCliente";

export default class root extends React.Component {

    // componentDidMount() {
    //     this.loadData();
    // }

    async loadData() {
        // const pasarelas = await MDL.caja.pasarela.getAll();
        // const pasarela_empresa = await MDL.caja.pasarela_empresa.getAll();
        // pasarela_empresa.map(pe => {
        //     pe.pasarela = pasarelas.find(p => p.key == pe.key_pasarela);
        // })
        const tipo_cliente = await MDL.crm.tipoCliente.getAll();
        console.log("tipo_cliente", tipo_cliente);
        return tipo_cliente;
    }
    render() {
        return <SPage title={"Tipo de Cliente"} disableScroll>
            <DinamicTable
                ref={ref => this.table = ref}
                {...Config.table.applyTheme()}
                loadData={this.loadData}
                loadInitialState={async () => {
                    return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
                }}
                onSelect={(e) => {
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row.titulo,
                        options: [
                            {
                                label: "Editar", icon: <SIconApp name="Edit" />,
                                onPress: () => {
                                    // FormularioPasarela.open({
                                    //     editObject: e.row,
                                    //     onSuccess: (e) => {
                                    //         this.table.loadData();
                                    //     }
                                    // })
                                    FormRegistroTipoCliente.open({
                                        defaultData: e.row,
                                        // onRegister: () => this.props.onLoadData(),
                                        onActualizar: () => this.table.loadData()
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
                                    SPopup.confirm({
                                        title: "Eliminar Tipo de Cliente",
                                        message: "¿Estás seguro de eliminar este tipo de cliente?",
                                        onPress: () => {
                                            // MDL.caja.empresa_tipo_pago_save({
                                            //     ...e.row,
                                            //     estado: 0,
                                            // }).then((resp: any) => {
                                            //     this.DinamicTable.loadData();
                                            // }).catch(e => {
                                            // })
                                            MDL.crm.tipoCliente.eliminar(e.row).then(() => {
                                                // this.props.onDeleteStage(e.row.key);
                                                this.table.loadData();
                                                SNotification.send({
                                                    title: `✅ "${e.row.titulo}" eliminado`,
                                                    color: STheme.color.success,
                                                    time: 2000
                                                });
                                            }).catch(err => {
                                                SNotification.send({
                                                    title: "❌ Error al eliminar",
                                                    body: err,
                                                    color: STheme.color.danger
                                                });
                                            });
                                        }
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

                        ]
                    })

                }}>
                <DinamicTable.Col width={50} key={"key"} label={"Key"} data={e => e.row.key} />
                <DinamicTable.Col key={"fecha_on"} label="F.Creación" width={110} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.lightGray, }} dateFormat="yyyy-MM-dd hh:mm" />

                <DinamicTable.Col width={200} key={"titulo"} label={"Título"} data={e => e.row?.titulo} />
                <DinamicTable.Col width={200} key={"descripcion"} label={"Descripción"} data={e => e.row?.descripcion} />
                <DinamicTable.Col width={200} key={"color"} label={"Color"} data={e => e.row.color}
                    customComponent={e => {
                        // const key = e.row?.key_usuario;
                        // const nombre = e.row?.cajero?.Nombres ?? "Sin cajero";
                        return <SView col="xs-12" row center>
                            <SView
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 100,
                                    overflow: "hidden",
                                    backgroundColor: e.row.color,
                                }}
                            >
                            </SView>
                            <SView width={5} />
                        </SView>
                    }}
                />
                {/* <DinamicTable.Col width={200} key={"params"} label={"params"} data={e => JSON.stringify(e.row.params)} /> */}
            </DinamicTable>
            <FloatButtom onPress={() => {
                // FormularioPasarela.open({
                //     onSuccess: (e) => {
                //         this.table.loadData();
                //     }
                // })
                FormRegistroTipoCliente.open({
                    onRegister: (e) => {
                        this.table.loadData();
                    }
                })
            }} />
        </SPage >
    }
}