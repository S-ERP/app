import React from "react";
import { SHr, SImage, SInput, SMath, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import { FlatList } from "react-native";

type PopupCarritoProps = {

}
export default class PopupCarrito extends React.Component<PopupCarritoProps> {
    static open(props: PopupCarritoProps) {
        SPopup.open({
            key: "PopupCarrito",
            type: "1",
            content: <SView style={{
                width: "100%",
                maxWidth: 500,
                height: 500,
                maxHeight: "100%",
                backgroundColor: STheme.color.background,
                borderRadius: 8,
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
        const items = MDL.carrito.carrito_compra.items;
        return <SView col={"xs-12"} height>
            <SText center color={STheme.color.lightGray} bold>{"Carrito de compras"}</SText>
            <SHr />
            <SView row col={"xs-12"} style={{
                paddingHorizontal: 8
            }}>
                <SText color={STheme.color.lightGray}>{"Productos"} ({MDL.carrito.carrito_compra.cantidad_items})</SText>
                <SView flex />
                <SText color={STheme.color.lightGray}>{"Sub Total"}</SText>

            </SView>
            <SHr />
            <SHr h={1} color={STheme.color.card} />
            <FlatList
                data={items}
                renderItem={({ item, index }) => {
                    return <ItemComp item={item} />
                }}
            />
            <SView height={40}  >
                <SHr h={1} color={STheme.color.card} />
                <SView col={"xs-12"} row flex center>
                    <SView padding={8} card onPress={() => {
                        console.log("ee");
                    }}>
                        <SText>{"Confirmar la compra"}</SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }
}

const ItemComp = (props: any) => {
    const { item } = props;
    return <SView padding={8}>
        <SView row center>
            <SView center style={{
                width: 20,
                height: 20,
                padding: 2,
            }} onPress={() => {
                MDL.carrito.removerItemAlCarritoDeCompras(item);
            }}>
                <SIconApp name="Close" fill={STheme.color.warning} />
            </SView>
            <SView center style={{
                width: 40,
                height: 40,
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
                        <SInput style={{
                            height: 20,
                            fontSize: 12,
                            padding: 0,
                            paddingRight: 4,
                            textAlign: "right",
                        }}
                            type="money2"
                            icon={<SText width={15} fontSize={10} color={STheme.color.lightGray}>{"BS"}</SText>} defaultValue={item.precio}
                            onChangeText={e => {
                                if (!e) {
                                    item.precio = 0
                                } else {
                                    item.precio = parseFloat(e ?? "1")
                                }

                                MDL.carrito.calcularValoresCarritDeCompras();
                            }}
                        />
                    </SView>
                    <SView width={4} />
                    {/* <SText fontSize={12} color={STheme.color.lightGray}>{"\t"}x{"\t"}</SText> */}
                    <SView width={60}>
                        <SInput style={{
                            height: 20,
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
                                    item.cantidad = 1
                                } else {
                                    item.cantidad = parseFloat(e ?? "1")
                                }

                                MDL.carrito.calcularValoresCarritDeCompras();
                            }}
                        />
                    </SView>
                </SView>
            </SView>
            <SView width={4} />
            <SView width={80} style={{
                justifyContent: "center"
            }}>
                <SText fontSize={14} bold style={{
                    textAlign: "right"
                }}>BS {SMath.formatMoney(item.precio * item.cantidad)} </SText>
            </SView>

        </SView>
        {/* <SHr /> */}
        {/* <SHr h={1} color={STheme.color.card} /> */}
    </SView >
}