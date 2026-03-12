import React from "react";
import { SHr, SInput, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import { ref } from "process";
import SelectorAlmacen from "../../Components/Selectores/SelectorAlmacen";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";

export default class traspaso_inventario extends React.Component {
    selectItems = []
    almacen = {}
    almacen_destino = {}

    async loadData() {
        // if (!this.almacen?.key) {
        //     return [];
        // }
        if (!this.almacen?.key) {
            throw "sin_almacen_origen";
        }

        const modelos = await MDL.inventario.getAllModeloStock(this.almacen?.key ?? "") ?? [];
        return modelos.filter(a => {
            return a.stock > 0;
        })
    }
    async loadDataTraspaso() {
        if (!this.almacen?.key) {
            throw "sin_almacen_origen";
        }
        if (!this.almacen_destino?.key) {
            throw "sin_almacen_destino";
        }
        if (!this.selectItems.length) {
            throw "sin_items_select";

        }


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

        let descripcion = this.detalleTraspasoInput.getValue();

        try {
            const resp = await SSocket.sendPromise({
                service: "inventario",
                component: "modelo",
                type: "traspaso_inventario",
                descripcion: descripcion,
                key_usuario: MDL.usuario?.session?.key,
                key_empresa: MDL.empresa?.select?.key,
                key_almacen_origen: almacen_origen.key,
                key_almacen_destino: almacen_destino.key,
                data: this.selectItems.map(i => {
                    return {
                        key_modelo: i.key,
                        cantidad: i.stock_traspaso
                    }
                })
            })
        } catch (e) {
            throw e?.error;
        }

        this.selectItems = [];
        this.mainTable.loadData();
        this.traspasoTable.loadData();

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
            <SView col={"xs-12"} row flex padding={6}>
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
                                this.mainTable.rowSelecteds = {}
                                this.mainTable.loadData();
                                this.traspasoTable.loadData();
                            }} />
                    </SView>
                    <SHr />
                    <DinamicTable
                        ref={ref => this.mainTable = ref}
                        {...Config.table.applyTheme({
                            cellStyle: {
                                height: 30
                            }
                        })}
                        loadData={this.loadData.bind(this)}

                        renderError={(err) => {
                            console.log("ERRORR:", err);
                            if (err.error == "sin_almacen_origen") {
                                // return (
                                //     <SView col={"xs-12"} padding={10} >
                                //         <SText fontSize={12} color={STheme.color.text}>
                                //             {"Seleccione un almacén origen"}
                                //         </SText>
                                //     </SView>
                                // );
                                return <BoxMensaje
                                    titulo={"Seleccione un almacén origen"}
                                    descripcion={"Debe seleccionar un almacén origen para continuar con el traspaso de inventario"}
                                    icon="AlertOutline" />
                            }
                            return (
                                <SView col={"xs-12"} padding={10} >
                                    <SText fontSize={12} color={STheme.color.text}>
                                        {err?.error || "Error desconocido"}
                                    </SText>
                                </SView>
                            )

                        }}
                        renderNoResults={(result) => {
                            return <BoxMensaje
                                titulo={"Sin productos"}
                                descripcion={"El almacén seleccionado no contiene productos para traspasar"}
                                icon="AlertOutline" />

                        }}

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
                                this.traspasoTable.loadData();
                                // this.almacen = e;
                                // this.selectItems = [];
                                // this.mainTable.loadData();
                            }} />
                    </SView>
                    <SHr />
                    <DinamicTable
                        ref={ref => this.traspasoTable = ref}
                        {...Config.table.applyTheme({
                            cellStyle: {
                                height: 30
                            }
                        })}
                        adjustColumnWidth
                        loadData={this.loadDataTraspaso.bind(this)}
                        renderError={(err) => {
                            console.log(this.almacen_destino);
                            console.log("ERRORR:", err);
                            if (err.error == "sin_almacen_destino") {


                                return (
                                    <BoxMensaje
                                        titulo={"Seleccione un almacén destino"}
                                        descripcion={"Primero debe elegir el almacén donde se registrará el ingreso de los productos transferidos."}
                                        icon="AlertOutline"
                                    />
                                );

                            }
                            if (err.error == "sin_almacen_origen") {
                                return (
                                    <BoxMensaje
                                        titulo={"Seleccione un almacén origen"}
                                        descripcion={"Debe seleccionar un almacén origen para continuar con el traspaso de inventario"}
                                        icon="AlertOutline" />
                                );
                            }
                            if (err.error == "sin_items_select") {
                                return (
                                    <BoxMensaje
                                        titulo={"Seleccione los productos a traspasar"}
                                        descripcion={"Seleccione los productos del inventario de origen que desea transferir al almacén destino."}
                                        icon="producto" />
                                );
                            }

                            return (
                                <SView col={"xs-12"} padding={10} center>
                                    <SText fontSize={12} color={STheme.color.text}>
                                        {err?.error || "Error desconocido"}
                                    </SText>
                                </SView>
                            )
                        }}
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


                                    SPopup.open({
                                        key: "confirm_traspaso",
                                        content: <SView col={"xs-12"} center>
                                            <SView style={{
                                                width: 300,
                                                height: 150,
                                                padding: 16,
                                                borderRadius: 8,
                                                backgroundColor: STheme.color.background,
                                            }} withoutFeedback>
                                                <SText>¿Confirmar traspaso de inventario?</SText>
                                                <SHr />
                                                <SInput ref={ref => this.detalleTraspasoInput = ref} placeholder={"Detalle del traspaso"} />
                                                <SHr />
                                                <SView col={"xs-12"} row center>
                                                    <SView style={{
                                                        backgroundColor: STheme.color.success,
                                                        padding: 8,
                                                        paddingHorizontal: 16,
                                                        borderRadius: 4,
                                                        marginRight: 8,
                                                    }} onPress={() => {

                                                        SNotification.send({
                                                            key: "traspaso_inventario",
                                                            title: "Traspaso de inventario",
                                                            body: "Se esta procesando el traspaso de inventario",
                                                            type: "loading"

                                                        })
                                                        this.handleTraspaso().then(() => {
                                                            SNotification.send({
                                                                key: "traspaso_inventario",
                                                                title: "Traspaso de inventario",
                                                                body: "El traspaso de inventario se realizo con exito",
                                                                time: 5000,
                                                                color: STheme.color.success
                                                            })
                                                            SPopup.close("confirm_traspaso");
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
                                                        <SText>{"CONFIRMAR"}</SText>
                                                    </SView>
                                                </SView>
                                            </SView>
                                        </SView>

                                    })


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

const BoxMensaje = ({ titulo, descripcion, icon }) => {
    return <SView col={"xs-9"} padding={10} card style={{
        marginTop: 5, marginLeft: 5,
        minHeight: 75
    }}>
        <SView row>
            <SIconApp name={icon} height={20} width={20} fill={STheme.color.text} />
            <SView width={8} />
            <SText center bold fontSize={13} color={STheme.color.text}>
                {titulo}
            </SText>
        </SView>
        <SHr />
        <SText col={"xs-12"} fontSize={12} color={STheme.color.text}>
            {descripcion}
        </SText>
    </SView>
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
            // if (e > row.stock) {
            //     row.stock_traspaso = row.stock;
            // }
            setValue(row.stock_traspaso);
        }} />
}