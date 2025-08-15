import React from "react";
import { SHr, SInput, SNavigation, SNotification, SPage, SText, STheme, SThread, SView } from "servisofts-component";
import MDL from "../../MDL";
import SIconApp from "../../Assets/SIconApp";
import detalle from "../compra/detalle";
import { FlatList } from "react-native";
import SSocket from "servisofts-socket";
import PButtom from "../../Components/PButtom";

export default class root extends React.Component {

    state = {
        sucursales: [],
        modelos: [],
        proveedores: [],
        detalle: [
            { producto: "", cantidad: 1, precio: 0, modelo: null },
        ]
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

    handleSubmit = async () => {
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
                key_sucursal: sucursal.key,
                key_empresa: MDL.empresa.select.key,
                key_usuario: MDL.usuario.session.key,
            }
            data.detalle = this.state.detalle.map(item => (
                {
                    cantidad: item.cantidad,
                    precio_unitario: item.precio,
                    precio_facturado: item.precio,
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
        return <SPage title={"Compras"} disableScroll>
            <SView col={"xs-12"} center>
                <SHr height={15} />
                <SView col={"xs-11"} flex padding={15} card>
                    <SView col={"xs-12"} row  >
                        <SView col={"xs-6"} padding={4}>
                            <SInput
                                ref={ref => this.inputs["sucursal"] = ref}
                                label={"Sucursal"}
                                type="select2"
                                placeholder={"Seleccione una sucursal"}
                                options={this.state.sucursales.map(a => a.descripcion)}
                            />
                        </SView>
                        <SView col={"xs-6"} padding={4}>
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
                        <SView col={"xs-12"} row>
                            {/* <SView width={30} padding={2} center>
                                <SIconApp name="Delete" />
                            </SView> */}
                            <SView flex={2} padding={2}>
                                <SText>Producto</SText>
                            </SView>
                            <SView width={115} padding={2} >
                                <SText>Cantidad</SText>
                            </SView>
                            <SView width={75} padding={2} >
                                <SText>Precio</SText>
                            </SView>
                        </SView>
                        <FlatList data={this.state.detalle}
                            renderItem={({ item }) => <Detalle parent={this} data={item} />}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={() => <SText center>No hay productos agregados</SText>}
                        />
                    </SView>
                    {/* <SView col={"xs-12"} padding={4} center>
                        <SText fontSize={12} padding={8} card onPress={this.handleSubmit.bind(this)}>GUARDAR</SText>
                    </SView> */}
                    <SView col={"xs-12"}  center>
                        <SHr height={15} />
                        <PButtom type='primary' small onPress={this.handleSubmit.bind(this)}>GUARDAR</PButtom>
                    </SView>
                </SView>
            </SView>
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
            <SView col={"xs-12"} row>

                <SView flex={2} padding={2}>
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
                                    // (this.inputs["producto"]).setState({ error: true });
                                    SNotification.send({
                                        title: "El producto seleccionado no esta registrado en el sistema",
                                        time: 4000
                                    });
                                } else {
                                    console.log("PRODUCTOS", producto)
                                    this.props.data.modelo = producto;
                                    this.inputs["precio"].setValue((producto.precio_compra ?? 0).toFixed(2));
                                    // (this.inputs["producto"]).setState({ error: false });
                                }
                            })
                        }}
                    />
                </SView>

                <SView width={100} padding={2}>
                    <SInput
                        ref={ref => this.inputs["cantidad"] = ref}
                        placeholder={"Cantidad"}
                        defaultValue={this.props.data.cantidad.toFixed(2)}
                        onChangeText={e => {
                            this.props.data.cantidad = parseFloat(e ?? 0);
                        }}
                        icon
                        type="money"
                    />
                </SView>
                <SView width={100} padding={2}>
                    <SInput
                        ref={ref => this.inputs["precio"] = ref}
                        icon
                        placeholder={"Precio"}
                        defaultValue={this.props.data.precio}
                        onChangeText={e => {
                            this.props.data.precio = parseFloat(e ?? 0);;
                        }}
                        type="money"
                    />
                </SView>
                <SView width={30} padding={2} center>
                    <SIconApp name="Delete" />
                </SView>
            </SView>
        );
    }
}
