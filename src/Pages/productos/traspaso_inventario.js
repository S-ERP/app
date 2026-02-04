import React from "react";
import { SHr, SInput, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import { ref } from "process";
import SelectorAlmacen from "../../Components/Selectores/SelectorAlmacen";

export default class traspaso_inventario extends React.Component {
    selectItems = []
    almacen = {}
    almacen_destino = {}

    async loadData() {
        if (!this.almacen?.key) {
            return [];
        }
        const modelos = await MDL.inventario.getAllModeloStock(this.almacen?.key ?? "") ?? [];
        return modelos.filter(a => {
            return a.stock > 0;
        }).sort((a, b) => b.stock - a.stock);
    }
    async loadDataTraspaso() {
        return this.selectItems;
    }

    async handleTraspaso() {
        const almacen_origen = this.almacen;
        const almacen_destino = this.almacen_destino;
        if (!almacen_origen?.key) {
            throw "Seleccione el almacen de origen";
        }
        if (!almacen_destino?.key) {
            throw "Seleccione el almacen de destino";
        }
        if (almacen_origen.key == almacen_destino.key) {
            throw "El almacen de origen y destino no pueden ser el mismo";
        }

        
        console.log("TRASPASAR", this.selectItems);

    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     if (nextState.selectItems != this.state.selectItems) {
    //         this.traspasoTable.loadData();
    //         return true;
    //     }
    //     return true;
    // }

    render() {
        return <SPage title={"Traspasar inventario"} disableScroll>
            <SView col={"xs-12"} row flex >
                <SView col={"xs-6"} height style={{
                    borderWidth: 1,
                }}>
                    <SView height={40} width={200}>
                        <SHr />
                        {/* <SInput customStyle={"erp"} height={30} label={"Inventario Origen"} /> */}
                        <SelectorAlmacen
                            label={"Inventario Origen"}
                            customStyle={"erp"}
                            onChangeSelect={(e) => {
                                console.log(e);
                                this.almacen = e;
                                this.selectItems = [];
                                this.mainTable.loadData();
                            }} />
                    </SView>
                    <DinamicTable
                        ref={ref => this.mainTable = ref}
                        {...Config.table.applyTheme({
                            cellStyle: {
                                height: 30
                            }
                        })}
                        loadData={this.loadData.bind(this)}
                        adjustColumnWidth
                        selectType="multiple"
                        onSelect={e => {
                            const row = e.row;
                            const selec = this.selectItems.find(i => i.key == row.key);
                            if (selec) {
                                this.selectItems = this.selectItems.filter(i => i.key != row.key);
                                this.traspasoTable.loadData();
                                // this.setState({ selectItems: this.state.selectItems.filter(i => i.key != row.key) });
                                return;
                            }
                            this.selectItems = [...this.selectItems, row];
                            this.traspasoTable.loadData();
                            // this.setState({ selectItems: [...this.state.selectItems, row] });
                        }}

                    >
                        {/* <DinamicTable.Col key={"key"} label="Key" data={e => e.row.key} /> */}
                        <DinamicTable.Col key={"nombre"} label='Nombre' width={200} data={(e) => e.row.descripcion} wrap

                            textStyle={{ fontWeight: "bold", fontSize: 14 }}
                        />
                        <DinamicTable.Col key={"stock"} label='stock' width={70} data={(e) => e.row.stock} textStyle={{ textAlign: "center" }}
                            headerStyle={{
                                justifyContent: "center"
                            }} />
                    </DinamicTable>
                </SView>
                <SView col={"xs-6"} style={{ borderWidth: 1, }} height>
                    <SView height={40} width={200}>
                        <SHr />
                        <SelectorAlmacen
                            label={"Inventario Destino"}

                            customStyle={"erp"}
                            onChangeSelect={(e) => {
                                // console.log(e);
                                this.almacen_destino = e;
                                // this.almacen = e;
                                // this.selectItems = [];
                                // this.mainTable.loadData();
                            }} />
                    </SView>
                    <DinamicTable
                        ref={ref => this.traspasoTable = ref}
                        {...Config.table.applyTheme({
                            cellStyle: {
                                height: 30
                            }
                        })}
                        adjustColumnWidth
                        loadData={this.loadDataTraspaso.bind(this)}
                        listFooterComponent={e => {
                            return <SView col={"xs-12"} style={{
                                alignItems: "flex-end"
                            }}>
                                <SHr />
                                <SView style={{
                                    backgroundColor: STheme.color.warning,
                                    padding: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 4,
                                }} onPress={() => {

                                    SNotification.send({
                                        key: "traspaso_inventario",
                                        title: "Traspaso de inventario",
                                        body: "Se esta procesando el traspaso de inventario",
                                        type:"loading"

                                    })
                                    this.handleTraspaso().then(() => {
                                        SNotification.send({
                                            key: "traspaso_inventario",
                                            title: "Traspaso de inventario",
                                            body: "El traspaso de inventario se realizo con exito",
                                            time: 5000,
                                            color: STheme.color.success
                                        })
                                        // this.selectItems = [];
                                        // this.mainTable.loadData();
                                        // this.traspasoTable.loadData();
                                    }).catch(e => {
                                        SNotification.send({
                                            key: "traspaso_inventario",
                                            title: "Traspaso de inventario",
                                            body: "Error al realizar el traspaso de inventario: " + e,
                                            time: 5000,
                                            color: STheme.color.error
                                        })
                                        console.error(e);
                                    });

                                }}>
                                    <SText>{"ENVIAR"}</SText>
                                </SView>
                            </SView>
                        }}
                    >
                        {/* <DinamicTable.Col key={"key"} label="Key" data={e => e.row.key} /> */}
                        <DinamicTable.Col key={"nombre"} label='Nombre' width={200} data={(e) => e.row.descripcion} wrap
                            textStyle={{ fontWeight: "bold", fontSize: 14 }}
                        />
                        <DinamicTable.Col key={"stock_traspaso"} label='stock' width={70}
                            data={(e) => e.row.stock_traspaso}
                            headerStyle={{
                                justifyContent: "center"
                            }}
                            textStyle={{ textAlign: "center" }}
                            customComponent={e => {
                                return <InputCantidad row={e.row} />
                            }}
                        />
                    </DinamicTable>
                </SView>
            </SView>
        </SPage>
    }
}

const InputCantidad = ({ row }) => {
    const [value, setValue] = React.useState(row.stock_traspaso);
    React.useEffect(() => {
        setValue(row.stock_traspaso);
    }, [row.stock_traspaso])
    return <SInput height={24} value={value} type="money2" placeholder={row.stock}
        required
        icon={" "} onChangeText={(e) => {
            row.stock_traspaso = e;
            if (e > row.stock) {
                row.stock_traspaso = row.stock;
            }
            setValue(row.stock_traspaso);
        }} />
}