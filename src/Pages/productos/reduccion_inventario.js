import React from "react";
import { SHr, SInput, SNotification, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import { DinamicTable } from "servisofts-table";
import MDL from "../../MDL";
import Config from "../../Config";
import { ref } from "process";
import SelectorAlmacen from "../../Components/Selectores/SelectorAlmacen";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import SelectorMotivoReduccion from "../../Components/Selectores/SelectorMotivoReduccion";

export default class reduccion_inventario extends React.Component {
    selectItems = []
    almacen = {}
    motivo_reduccion = {}

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
        if (!this.motivo_reduccion?.key) {
            throw "sin_motivo_reduccion";
        }
        if (!this.selectItems.length) {
            throw "sin_items_select";

        }


        return this.selectItems;
    }

    async handleTraspaso() {

        const almacen_origen = this.almacen;
        const motivo_reduccion = this.motivo_reduccion;
        if (!almacen_origen?.key) {
            throw "Seleccione el almacen de origen";
        }
        if (!motivo_reduccion?.key) {
            throw "Seleccione motivo de reducción";
        }
        if (almacen_origen.key == motivo_reduccion.key) {
            throw "El almacen de origen y destino no pueden ser el mismo";
        }

        let descripcion = this.detalleReduccionInput.getValue();

        try {
            const resp = await SSocket.sendPromise({
                service: "inventario",
                component: "modelo",
                type: "traspaso_inventario",
                descripcion: descripcion,
                key_usuario: MDL.usuario?.session?.key,
                key_empresa: MDL.empresa?.select?.key,
                key_almacen_origen: almacen_origen.key,
                motivo_reduccion: motivo_reduccion.key,
                data: this.selectItems.map(i => {
                    return {
                        key_modelo: i.key,
                        cantidad: i.cantidad
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

    async handleReduccion() {

        const almacen_origen = this.almacen;
        const motivo_reduccion = this.motivo_reduccion;
        if (!almacen_origen?.key) {
            throw "Seleccione el almacen de origen";
        }
        if (!motivo_reduccion?.key) {
            throw "Seleccione motivo de reducción";
        }
        if (almacen_origen.key == motivo_reduccion.key) {
            throw "El almacen de origen y destino no pueden ser el mismo";
        }

        let descripcion = this.detalleReduccionInput.getValue();

        try {
            const resp = await SSocket.sendPromise({
                service: "inventario",
                component: "modelo",
                type: "reduccion_inventario",
                descripcion: descripcion,
                key_usuario: MDL.usuario?.session?.key,
                key_empresa: MDL.empresa?.select?.key,
                key_almacen_origen: almacen_origen.key,
                motivo_reduccion: motivo_reduccion.descripcion,
                data: this.selectItems.map(i => {
                    return {
                        key_modelo: i.key,
                        cantidad: i.cantidad
                    }
                })
            })
        } catch (e) {
            throw e?.error;
        }

        // let dd = this.selectItems.map(i => {
        //     return {
        //         key_modelo: i.key,
        //         cantidad: i.cantidad
        //     }
        // })
        // console.log(almacen_origen.key)
        // console.log(motivo_reduccion.descripcion)
        // console.log(dd)


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
        console.log("motivo_reduccion:", this.motivo_reduccion);
        return <SPage title={"Reducir inventario"} disableScroll>
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
                                    descripcion={"Primero debe seleccionar un almacén origen para continuar con el proceso."}
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
                        <SelectorMotivoReduccion
                            label={"Motivo de Reducción"}

                            customStyle={"erp"}
                            onChangeSelect={(e) => {
                                // console.log(e);
                                this.motivo_reduccion = e;
                                console.log("motivo_reduccion change:", this.motivo_reduccion);
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
                            console.log(this.motivo_reduccion);
                            console.log("ERRORR:", err);
                            if (err.error == "sin_motivo_reduccion") {


                                return (
                                    <BoxMensaje
                                        titulo={"Seleccione un Motivo de reducción"}
                                        descripcion={"Debe seleccionar un motivo de reducción para continuar con el proceso."}
                                        icon="AlertOutline" />
                                );

                            }
                            if (err.error == "sin_almacen_origen") {
                                return (

                                    <BoxMensaje
                                        titulo={"Seleccione un almacén origen"}
                                        descripcion={"Primero debe seleccionar un almacén origen para continuar con el proceso."}
                                        icon="AlertOutline"
                                    />

                                );
                            }
                            if (err.error == "sin_items_select") {
                                return (
                                    <BoxMensaje
                                        titulo={"Seleccione los productos a reducir"}
                                        descripcion={"Seleccione los productos del inventario que desea retirar del stock mediante una reducción de inventario."}
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
                                <SHr height={10} />
                                <SView col={"xs-6"} card style={{
                                    padding: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 4,
                                    backgroundColor: STheme.color.background,
                                }}>
                                    <SText col={"xs-12"} fontSize={16} bold color={STheme.color.warning} style={{alignContent:"flex-end", textAlign:"right"}}>
                                        {"Total de productos a reducir: " + this.selectItems.length}
                                    </SText>
                                    <SHr />
                                    {/* <SText fontSize={14} color={STheme.color.text}>
                                        {"Total de la reducción: " + this.selectItems.reduce((a, b) => a + (b.precio_compra * b.cantidad), 0).toFixed(2)}
                                    </SText> */}
                                    {/* <SText fontSize={17} color={STheme.color.warning} bold style={{alignContent:"flex-end", textAlign:"right"}}>
                                        {"Total de la reducción: " +
                                            this.selectItems
                                                .reduce(
                                                    (total, item) =>
                                                        total +
                                                        ((Number(item?.precio_compra) || 0) *
                                                            (Number(item?.cantidad) || 0)),
                                                    0
                                                )
                                                .toFixed(2)
                                        }
                                    </SText> */}
                                </SView>
                                <SHr height={15} />
                                <SView style={{
                                    backgroundColor: STheme.color.warning,
                                    padding: 8,
                                    paddingHorizontal: 16,
                                    borderRadius: 4,
                                }} onPress={() => {

                                    const itemInvalido = this.selectItems.find(i => {
                                        const cantidad = Number(i.cantidad);
                                        return i.cantidad === undefined || i.cantidad === null || i.cantidad === "" || isNaN(cantidad) || cantidad <= 0;
                                    });
                                    if (itemInvalido) {
                                        SNotification.send({
                                            key: "reduccion_inventario",
                                            title: "Reducción de inventario",
                                            body: "La cantidad de \"" + (itemInvalido.descripcion || "un producto") + "\" debe estar completa y ser mayor a 0",
                                            time: 5000,
                                            color: STheme.color.error
                                        });
                                        return;
                                    }

                                    SPopup.open({
                                        key: "confirm_reduccion",
                                        content: <SView col={"xs-12"} center>
                                            <SView style={{
                                                width: 300,
                                                height: 150,
                                                padding: 16,
                                                borderRadius: 8,
                                                backgroundColor: STheme.color.background,
                                            }} withoutFeedback>
                                                <SText bold fontSize={16}>¿Confirmar reducción de inventario?</SText>
                                                <SHr />
                                                <SInput ref={ref => this.detalleReduccionInput = ref} placeholder={"Detalle de la reducción"} />
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
                                                            key: "reduccion_inventario",
                                                            title: "Reducción de inventario",
                                                            body: "Se esta procesando la reducción de inventario",
                                                            type: "loading"

                                                        })
                                                        this.handleReduccion().then(() => {
                                                            SNotification.send({
                                                                key: "reduccion_inventario",
                                                                title: "Reducción de inventario",
                                                                body: "La reducción de inventario se realizo con exito",
                                                                time: 5000,
                                                                color: STheme.color.success
                                                            })
                                                            SPopup.close("confirm_reduccion");
                                                            // this.selectItems = [];
                                                            // this.mainTable.loadData();
                                                            // this.traspasoTable.loadData();
                                                        }).catch(e => {
                                                            SNotification.send({
                                                                key: "reduccion_inventario",
                                                                title: "Reducción de inventario",
                                                                body: "Error al realizar la reducción de inventario: " + e,
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
                                    <SText bold>{"CONFIRMAR REDUCCIÓN"}</SText>
                                </SView>
                            </SView>
                        }}
                    >
                        {/* <DinamicTable.Col key={"key"} label="Key" data={e => e.row.key} /> */}
                        <DinamicTable.Col key={"nombre"} label='Nombre' width={200} data={(e) => e.row.descripcion} wrap
                            textStyle={{ fontWeight: "bold", fontSize: 14 }}
                        />
                        <DinamicTable.Col key={"cantidad"} label='Cantidad' width={70}
                            data={(e) => e.row.cantidad}
                            headerStyle={{
                                justifyContent: "center"
                            }}
                            textStyle={{ textAlign: "center" }}
                            customComponent={e => {
                                return <InputCantidad row={e.row} onChange={() => this.traspasoTable.loadData()} />
                            }}
                        />
                        {/* <DinamicTable.Col key={"precio_compra"} label='Precio de Compra' width={100} data={(e) => e.row.precio_compra} wrap
                            textStyle={{ fontSize: 12 }}
                        />
                        <DinamicTable.Col key={"subtotal"} label='Subtotal' width={100} data={(e) => e.row.precio_compra * e.row.cantidad} wrap
                            textStyle={{ fontSize: 12 }}
                        /> */}

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

const InputCantidad = ({ row, onChange }) => {
    const [value, setValue] = React.useState(row.cantidad);
    React.useEffect(() => {
        setValue(row.cantidad);
    }, [row.cantidad])
    return <SInput height={24} value={value} type="money2" placeholder={row.stock}
        required
        icon={" "} onChangeText={(e) => {
            row.cantidad = e;
            // if (e > row.stock) {
            //     row.cantidad = row.stock;
            // }
            setValue(row.cantidad);
            if (onChange) {
                onChange(row.cantidad);
            }
        }} />
}