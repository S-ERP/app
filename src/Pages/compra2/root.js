import React from "react";
import { SHr, SIcon, SInput, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../MDL";
import SIconApp from "../../Assets/SIconApp";
import detalle from "../compra/detalle";
import { FlatList } from "react-native";
import SSocket from "servisofts-socket";
import PButtom from "../../Components/PButtom";
import SelectTipoPago from "../caja2/components/SelectTipoPago";

export default class root extends React.Component {

    state = {
        sucursales: [],
        modelos: [],
        proveedores: [],
        detalle: [
            { producto: "", cantidad: 1, precio: 0, modelo: null },
        ],
        // bookings: [
        //     this.createDefaultCompra(),
        // ],
    }
    inputs = {}
    componentDidMount() {
        MDL.empresa.getAllSucursales().then(sucursales => {
            if (this.inputs["sucursal"]) this.inputs["sucursal"].setValue(sucursales[0]?.descripcion);
            this.setState({ sucursales: sucursales })
        })
        MDL.inventario.getAllModeloStock().then(modelos => {
            this.setState({ modelos: modelos })
        })
        MDL.compra_venta.proveedor.getAllProveedor().then(proveedores => {
            if (this.inputs["proveedor"]) this.inputs["proveedor"].setValue(proveedores[0]?.razon_social);
            this.setState({ proveedores: proveedores })
        })
    }

    // createDefaultCompra() {
    //     return {
    //         "cantidad": 1,
    //         "descripcion": "",
    //         "descripcion_staff_tipo": "",
    //         "hora_fin": "",
    //         "hora_inicio": "",
    //         "fecha_fin": "",
    //         "fecha_inicio": "",
    //         "key_staff_tipo": "",
    //         "nivel_ingles": "NONE",
    //         "observacion": "",

    //     }
    // }

    handleSubmit = async (key_tipo_pago) => {

        console.log("DETALLE ", this.state.detalle)
        try {


            const sucValue = this.inputs["sucursal"].getValue();
            const sucursal = this.state.sucursales.find(a => a.descripcion == sucValue)
            const provValue = this.inputs["proveedor"].getValue();
            const proveedor = this.state.proveedores.find(a => a.razon_social == provValue)

            const data = {
                tipo_pago: "contado",
                descripcion: "Compra rapida",
                observacion: "Sin observacion",
                key_proveedor: proveedor.key,
                // key_sucursal: sucursal.key,
                // key_empresa: MDL.empresa.select.key,
                key_usuario: MDL.usuario.session.key,
                facturar: this.facturar || false,
                key_caja: MDL.caja.activa.key,
                key_tipo_pago: key_tipo_pago
            }
            data.detalle = this.state.detalle.map(item => (
                {
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                    // precio_facturado: item.precio,
                    descuento: 0,
                    descripcion: item.producto,
                    key_modelo: item.modelo?.key,
                }
            ))
            const compraResp = await SSocket.sendPromise({
                service: "compra_venta",
                component: "compra_venta",
                type: "compraRapida",
                data: data,
            })
            SNavigation.navigate("/compra/profile", { pk: compraResp.data.key });
            console.log("compra", compraResp);
        } catch (error) {
            console.error("Error al realizar la compra:", error);
            SNotification.send({
                title: "Error al realizar la compra",
                body: error?.error || "Ocurrió un error inesperado.",
                type: "danger",
                time: 4000
            });
            return;
        }


    }
    render() {
        return <SPage title={"Compras"} >
            <SView col={"xs-12"} center>
                <SHr height={15} />
                <SView col={"xs-10"} flex padding={15} card>
                    <SView col={"xs-12"} row  >
                        <SView col={"xs-12"} padding={4} style={{ alignItems: "flex-end", }} height={30}>
                            <SView width={105} style={{ marginTop: 0 }}>
                                <SInput label={"Con factura"} type='checkBox' defaultValue={false}
                                    onChangeText={(text) => {
                                        this.facturar = text;
                                        this.forceUpdate();
                                    }}
                                    style={{ marginTop: 0 }}
                                />
                            </SView>

                        </SView>
                        <SView col={"xs-12 sm-6"} padding={4}>
                            <SInput
                                ref={ref => this.inputs["sucursal"] = ref}
                                label={"Sucursal"}
                                type="select2"
                                placeholder={"Seleccione una sucursal"}
                                options={this.state.sucursales.map(a => a.descripcion)}
                            />
                        </SView>
                        <SView col={"xs-12 sm-6"} padding={4}>
                            <SInput
                                ref={ref => this.inputs["proveedor"] = ref}
                                label={"Proveedor"}
                                type="select2"
                                placeholder={"Seleccione un proveedor"}
                                options={this.state.proveedores.map(a => a.razon_social)}
                            />
                        </SView>
                    </SView>
                    <SHr />
                    <SHr h={1} color={STheme.color.card} />
                    <SView col={"xs-12"} padding={4} flex>
                        <SView col={"xs-12"} row >
                            {/* <SView width={30} padding={2} center>
                                <SIconApp name="Delete" />
                            </SView> */}
                            <SView col={"xs-4 sm-7"} padding={2}>
                                <SText>Producto</SText>
                            </SView>
                            <SView col={"xs-4 sm-2"} padding={2} center >
                                <SText>Cantidad</SText>
                            </SView>
                            <SView col={"xs-4 sm-3"} padding={2} center >
                                <SText>Precio</SText>
                            </SView>
                        </SView>
                        <FlatList data={this.state.detalle}
                            renderItem={({ item, index }) => <Detalle parent={this} data={item} onDelete={() => {
                                this.state.detalle.splice(index, 1);
                                this.setState({ detalle: this.state.detalle })
                            }} />}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={() => <SText center>No hay productos agregados</SText>}
                        />
                    </SView>
                    <SHr height={5} />
                    <SView col={"xs-12"} style={{ alignItems: "flex-end" }}>
                        <SView width={85} height={35} onPress={() => {
                            // this.state.detalle.push(this.createDefaultCompra());
                            this.state.detalle.push(this.state.detalle);
                            this.setState({ detalle: this.state.detalle })
                            console.log("DETALLE ", this.state.detalle)
                        }} row center
                            style={{
                                backgroundColor: STheme.color.danger,
                                borderRadius: 4,
                                // padding: 8,
                                // justifyContent: "center",
                                // alignItems: "center",
                            }}
                        >
                            <SIcon name='iconAdd' width={15} height={15} fill={STheme.color.white} />
                            <SView width={10} />
                            <SText fontSize={14} color={STheme.color.white} >AÑADIR</SText>
                        </SView>
                    </SView>
                    {/* <SView col={"xs-12"} padding={4} center>
                        <SText fontSize={12} padding={8} card onPress={this.handleSubmit.bind(this)}>GUARDAR</SText>
                    </SView> */}
                    <SView col={"xs-12"} center>
                        <SHr height={25} />
                        <PButtom type='primary' small onPress={() => {
                            SelectTipoPago.openPopup({
                                key_punto_venta: MDL.caja.activa.key_punto_venta,
                                onSelect: (item) => {
                                    this.handleSubmit(item.key_tipo_pago)
                                }
                            });

                        }}>GUARDAR</PButtom>
                    </SView>
                </SView>
            </SView>
            <SHr height={25} />
        </SPage>
    }
}



class Detalle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    inputs = {}
    render() {
        return (
            <SView col={"xs-12"} row style={{ borderBottomWidth: 0.5, borderBottomColor: STheme.color.card, paddingBottom: 8, paddingTop: 8 }}>
                <SView col={"xs-12 sm-7"} padding={4}>
                    {/* <SView flex={2} padding={2}> */}
                    <SInput
                        ref={ref => this.inputs["producto"] = ref}
                        type="select2"
                        placeholder={"Seleccione un producto"}
                        defaultValue={this.props.data.producto}
                        options={this.props.parent.state.modelos.map(a => a.descripcion)}
                        onChangeText={e => {
                            this.props.data.producto = e;
                        }}
                        onBlur={() => {
                            new SThread(100, "test", true).start(() => {
                                const value = this.inputs["producto"].getValue();
                                if (!value) return;
                                const producto = this.props.parent.state.modelos.find(a => a.descripcion == value);
                                if (!producto) {
                                    SNotification.send({
                                        title: "El producto seleccionado no esta registrado en el sistema",
                                        time: 4000
                                    });
                                } else {
                                    console.log("PRODUCTOS", producto)
                                    this.props.data.modelo = producto;
                                    this.inputs["precio"].setValue((producto.precio_compra ?? 0).toFixed(2));
                                }
                            })
                        }}
                    />
                </SView>
                <SView col={"xs-12 sm-5"} row>
                    {/* <SView width={100} padding={2}> */}
                    <SView col={"xs-5"} padding={4}>
                        <SInput
                            ref={ref => this.inputs["cantidad"] = ref}
                            placeholder={"Cantidad"}
                            defaultValue={this.props.data.cantidad || "1"}
                            onChangeText={e => {
                                this.props.data.cantidad = e;
                            }}
                            icon
                            type="number"
                        />
                    </SView>
                    <SView col={"xs-5"} padding={4}>
                        <SInput
                            ref={ref => this.inputs["precio"] = ref}
                            icon
                            placeholder={"Precio"}
                            defaultValue={this.props.data.precio || "0.00"}
                            onChangeText={e => {
                                this.props.data.precio = parseFloat(e ?? 0);;
                            }}
                            type="money"
                        />
                    </SView>
                    {/* <SView width={30} padding={2} center onPress={this.props.onDelete}> */}
                    <SView col={"xs-2"} padding={4} center onPress={this.props.onDelete}>
                        <SIconApp name="Delete" width={30} />
                    </SView>
                </SView>
            </SView>
        );
    }
}
