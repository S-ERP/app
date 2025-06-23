import React, { Component } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { SButtom, SDate, SForm, SHr, SIcon, SImage, SInput, SList, SLoad, SMath, SNavigation, SText, STheme, SThread, SView } from "servisofts-component";
import SSocket from "servisofts-socket";
import MDL from "../../../../MDL";
export default class Producto extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }


    onChange() {
        this.unsavedChange = true;
        new SThread(4000, "edit_carrito", true).start(() => {
            this.saveChanges();
        })
    }
    componentWillUnmount() {
        this.saveChanges();
        // clearTimeout(this.timeout);
    }

    saveChanges() {
        if (!this.unsavedChange) return;
        this.unsavedChange = false;

        MDL.crm.clienteProyecto.editarCarrito(this.props.cliente_proyecto.carrito, this.props.cliente_proyecto.key).then((resp) => {
            this.props.cliente_proyecto.carrito = resp;
            console.log("Carrito guardado", resp);
            // if (resp) {
            //     SNavigation.goBack();
            // } else {
            //     SNavigation.alert("Error al guardar el carrito");
            // }
        }).catch((e) => {
            console.error(e);
            // SNavigation.alert("Error al guardar el carrito");
        });
    }
    renderItem(item, item_in_carrito) {
        const producto_key = item?.key;

        console.log("item", item);
        console.log("item_in_carrito", item_in_carrito);
        // const producto = this.props.productos.find(e => e.key == item.key_producto)
        const active = item_in_carrito?.cantidad > 0
        const calcularSubtotal = () => {
            item_in_carrito.subtotal = (item_in_carrito?.cantidad * item.producto.precio) || 0;
        }

        if (item_in_carrito?.nombre !== item?.producto?.nombre) {
            item_in_carrito.nombre = item.producto?.nombre || "";
        }
        return <SView key={producto_key} row center style={{ width: "100%", marginBottom: 8, height: 65 }}>
            <SView width={20} height={20}>
                <SInput type="checkBox" value={active} onChangeText={e => {
                    if (e) {
                        item_in_carrito.cantidad = 1;
                        calcularSubtotal();
                        this.forceUpdate();
                        this.onChange();
                    } else {
                        item_in_carrito.cantidad = 0;
                        item_in_carrito.subtotal = 0;
                        this.forceUpdate();
                        this.onChange();
                    }
                }} />
            </SView>
            <SView width={8} />
            <SView flex style={{ alignItems: "flex-start", justifyContent: "center" }} >
                <SText style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: active ? STheme.color.text : STheme.color.gray,
                }}>{item?.producto?.nombre}</SText>
            </SView>
            <SView width={8} />
            <SView width={90}>
                <SInput
                    type="number" min={1}
                    value={item_in_carrito?.cantidad ?? 0}
                    style={{
                        backgroundColor: "transparent",
                        textAlign: "center",
                        paddingStart: 0,
                        paddingEnd: 0,
                        color: active ? STheme.color.text : STheme.color.gray,
                    }}
                    icon={<SText card width={30} center height={30}
                        style={{
                            backgroundColor: active ? STheme.color.text : STheme.color.gray,
                            color: active ? STheme.color.primary : STheme.color.text,
                        }}
                        bold
                        onPress={() => {
                            if (item_in_carrito.cantidad > 0) {
                                item_in_carrito.cantidad -= 1;
                                calcularSubtotal();
                                this.forceUpdate();
                                this.onChange();
                            }
                        }}>{"-"}</SText>}
                    iconR={<SText card width={30} center height={30}
                        style={{
                            backgroundColor: active ? STheme.color.text : STheme.color.gray,
                            color: active ? STheme.color.primary : STheme.color.text,
                        }}
                        onPress={() => {
                            item_in_carrito.cantidad = (item_in_carrito.cantidad ?? 0) + 1;
                            calcularSubtotal();
                            this.forceUpdate();
                            this.onChange();
                        }}>{"+"}</SText>}
                    // style={{ width: 40, height: 25, textAlign: "center" }}
                    disabled={!item.key}
                    onChangeText={v => {
                        item_in_carrito.cantidad = parseInt(v) || 0
                        calcularSubtotal();
                        this.forceUpdate();
                        this.onChange();
                    }}
                />
            </SView>
            <SView width={16} />
            <SView width={60}>
                <SInput type="number"
                    min={1}
                    value={item_in_carrito.subtotal}
                    icon={<SView />}
                    style={{
                        textAlign: "right",
                        opacity: active ? 1 : 0.7,

                    }}

                    // style={{ width: 40, height: 25, textAlign: "center" }}
                    onChangeText={v => {
                        item_in_carrito.subtotal = v;
                        // producto.precio = (producto.subtotal / (producto.cantidad || 1)) || 0;

                        this.forceUpdate();
                        this.onChange();
                    }}
                    disabled={!active}
                />
            </SView>

        </SView>;
    }
    renderItems() {
        if (!this.props.productos) return <SLoad />
        if (!this.props?.cliente_proyecto?.carrito) {
            this.props.cliente_proyecto.carrito = []
        }
        const carrito = this.props?.cliente_proyecto?.carrito

        return (this.props?.productos ?? []).map((proyecto_producto) => {

            let item_in_carrito = carrito.find((carrito_item) => carrito_item.key_producto === proyecto_producto.key_producto);
            if (!item_in_carrito) {
                const producto = this.props.productos.find(e => e.key_producto == proyecto_producto.key_producto)
                // const producto = this.props.productos[proyecto_producto.key_producto];
                item_in_carrito = {
                    key_proyecto_producto: proyecto_producto.key,
                    key_producto: proyecto_producto.key_producto,
                    key_cliente_proyecto: this.props.cliente_proyecto.key,
                    nombre: producto?.nombre || "",
                    cantidad: 0,
                    subtotal: producto?.precio || 0,
                };
                carrito.push(item_in_carrito);
            }
            return this.renderItem(proyecto_producto, item_in_carrito);
        })
    }
    renderHeaders() {
        return <SView row>
            {/* <SView width={20} /> */}
            <SView flex style={{ alignItems: "flex-start" }}>
                <SText bold>Producto</SText>
            </SView>
            <SView width={8} />
            <SView width={80} center>
                <SText bold>Cantidad</SText>
            </SView>
            <SView width={16} />
            <SView width={60} center>
                <SText bold>Precio</SText>
            </SView>
        </SView>
    }
    render() {
        return (
            <SView col={"xs-12"}>
                <SHr height={20} />
                {this.renderHeaders()}
                <SHr />
                {this.renderItems()}
                {/* <SText onPress={() => {
                  
                    // console.log("Guardar carrito", this.props.cliente_proyecto.carrito);    
                }}>{"SAVE"}</SText> */}
            </SView>
        );
    }
}
