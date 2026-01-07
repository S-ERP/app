import React from "react";
import { SHr, SImage, SInput, SMath, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import { FlatList } from "react-native";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
import InputSelector from "../Selectores/InputSelector";
type PopupCarritoProps = {
}
export default class PopupCarrito extends React.Component<PopupCarritoProps> {
    static open(props: PopupCarritoProps) {
        SPopup.open({
            key: "PopupCarrito",
            type: "3",
            content:
                <SView style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: "100%",
                    maxWidth: 300,
                    height: 500,
                    maxHeight: "100%",
                    backgroundColor: STheme.color.background,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: STheme.color.card,
                    cursor: "default",
                    userSelect: "text"
                }} withoutFeedback>
                    <PopupCarrito {...props} />
                </SView>
        })
    }
    handleChange = () => {
        this.forceUpdate();
    }
    componentDidMount(): void {
        MDL.carrito.addEventListener("handleChange", this.handleChange.bind(this))
    }
    componentWillUnmount(): void {
        MDL.carrito.removeEventListener(this.handleChange.bind(this))
    }
    render() {
        const items = MDL.carrito.carrito_venta.items;
        return <SView col={"xs-12"} height>
            <SHr />
            <SText center color={STheme.color.lightGray} bold>{"Carrito de ventas"}</SText>
            <SView style={{
                padding: 4,
                width: 33, height: 33,
                position: "absolute",
                right: 0,
                top: 0,
            }} onPress={() => {
                SPopup.close("PopupCarrito")
            }}>
                <SIconApp name="Close" fill={STheme.color.text} />
            </SView>
            <SHr />
            <SView row col={"xs-12"} style={{
                paddingHorizontal: 8
            }}>
                <SText color={STheme.color.lightGray} fontSize={12}>{"Productos"} ({MDL.carrito.carrito_venta.cantidad_items})</SText>
                <SView flex />
                <SText color={STheme.color.lightGray} fontSize={12}>{"Sub Total"}</SText>
            </SView>
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <FlatList
                data={items}
                renderItem={({ item, index }) => {
                    return <ItemComp item={item} />
                }}
            />
            <SHr h={1} color={STheme.color.card} />
            <SView padding={8}>
                <SText col={"xs-12"} style={{ textAlign: "right" }}>{"Total:"} {SMath.formatMoney(MDL.carrito.carrito_venta.monto_total)}</SText>
            </SView>
            <SHr h={1} color={STheme.color.card} />
            <SView padding={8}>
                <SView col={"xs-12"} row flex center>
                    <SView padding={4} card style={{
                        backgroundColor: STheme.color.danger
                    }} onPress={() => {
                        SPopup.confirm({
                            title: "Seguro que quieres limpiar el carrito?",
                            onPress: () => {
                                MDL.carrito.limpiarCarritoVentas();
                                SPopup.close("PopupCarrito")
                            }
                        })
                    }}>
                        <SText fontSize={12}>{"Limpiar carrito"}</SText>
                    </SView>
                    <SView flex />
                    <SView
                        style={{
                            backgroundColor: STheme.color.success
                        }}
                        padding={4} card onPress={() => {
                            PopupCarritoConfirmar.open({
                            })
                        }}>
                        <SText fontSize={12}>{"Confirmar la venta"}</SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }
}
const ItemComp = (props: any) => {
    const cantidadRef = React.useRef<any>(null);
    const precioRef = React.useRef<any>(null);
    const { item } = props;
    if (cantidadRef.current) {
        if (cantidadRef.current.getValue() != item.cantidad) {
            cantidadRef.current.setValue(item.cantidad);
        }
    }
    if (precioRef.current) {
        if (precioRef.current.getValue() != item.precio) {
            precioRef.current.setValue(item.precio);
        }
    }
    return <SView padding={8}>
        <SView row center>
            <SView center style={{
                width: 20,
                height: 20,
                padding: 2,
            }} onPress={() => {
                MDL.carrito.removerItemAlCarritoDeVentas(item);
            }}>
                <SIconApp name="Close" fill={STheme.color.warning} />
            </SView>
            <SView center style={{
                width: 35,
                height: 35,
                borderRadius: 4, overflow: "hidden",
                borderColor: STheme.color.card,
                borderWidth: 1,
            }}>
                <SImage src={SSocket.api.inventario + "modelo/" + item.modelo.key} style={{
                    resizeMode: "cover"
                }} />
            </SView>
            <SView width={4} />
            <SView flex>
                <SText fontSize={14} bold>{item?.modelo?.descripcion}</SText>
                <SHr h={2} />
                <SView row col={"xs-12"} style={{
                    alignItems: "center"
                }} >
                    <SView width={60}>
                        <SInput ref={precioRef} style={{
                            height: 16,
                            fontSize: 12,
                            padding: 0,
                            paddingRight: 4,
                            textAlign: "right",
                        }}
                            type="money2"
                            icon={<SText width={15} fontSize={10} color={STheme.color.lightGray}>{"BS"}</SText>}
                            defaultValue={item.precio}
                            onChangeText={e => {
                                if (!e) {
                                    item.precio = 0
                                } else {
                                    item.precio = parseFloat(e ?? "1")
                                }
                                MDL.carrito.calcularValoresCarritDeVentas();
                            }}
                        />
                    </SView>
                    <SView width={4} />
                    <SView width={60}>
                        <SInput ref={cantidadRef} style={{
                            height: 16,
                            fontSize: 12,
                            padding: 0,
                            paddingRight: 4,
                            textAlign: "right",
                        }}
                            type="money2"
                            icon={<SText width={15} fontSize={10} color={STheme.color.lightGray}>{"x"}</SText>}
                            defaultValue={item.cantidad}
                            onChangeText={e => {
                                if (!e) {
                                    item.cantidad = 0
                                } else {
                                    item.cantidad = parseFloat(e ?? "1")
                                }
                                MDL.carrito.calcularValoresCarritDeVentas();
                            }}
                        />
                    </SView>
                    <SView flex />
                    <SView width={80} style={{
                        justifyContent: "center"
                    }}>
                        <SText fontSize={12} bold style={{
                            textAlign: "right"
                        }}>BS {SMath.formatMoney(item.precio * item.cantidad)} </SText>
                    </SView>
                </SView>

                <SView height={4} />
                {item?.modelo?.contactos?.length > 0 && (
                    <SView style={{ width: 200, height: 24, backgroundColor: STheme.color.card }}>
                        <InputSelector
                            style={{ fontSize: 12, }}
                            type="custom"
                            customStyle="erp"
                            label="Contactos:"
                            placeholder="Selecciona un contacto"
                            options={item.modelo.contactos.map((c) => ({ label: c.nombre, value: c.key, }))}
                            defaultValue={item.contactoSeleccionado || ""}
                            onChange={(selected) => {
                                item.contactoSeleccionado = selected;
                            }}
                        />
                    </SView>
                )}
            </SView>
        </SView>
    </SView >
}