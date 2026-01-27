import React from "react";
import { SHr, SImage, SInput, SMath, SPage, SPopup, SText, STheme, SView } from "servisofts-component";
import MDL from "../../MDL";
import SSocket from "servisofts-socket";
import SIconApp from "../../Assets/SIconApp";
import { FlatList } from "react-native";
import PopupCarritoConfirmar from "./PopupCarritoConfirmar";
import InputSelector from "../Selectores/InputSelector";

type PopupCarritoProps = {}
const DEFAULT_MONEDA_KEY = "";

export default class PopupCarrito extends React.Component<PopupCarritoProps> {

    state = { selectedMoneda: null, options: [] };
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
                }} withoutFeedback>
                    <PopupCarrito {...props} />
                </SView>
        })
    }

    handleChange = () => {
        this.forceUpdate();
    }

    componentDidMount(): void {
        MDL.carrito.addEventListener("handleChange", this.handleChange.bind(this));
        this.evento = MDL.compra_venta.addEventListener("moneda_seleccionada", () => {
            const moneda = MDL.compra_venta.getMonedaSeleccionada();
            console.log("%c" + JSON.stringify(moneda), `color: #2ECC40; font-weight: bold;`);
            this.rapido.setValue(moneda?.key)
            this.setState({ selectedMoneda: moneda || null });
        });
        this.cargarMonedas();

    }

    async cargarMonedas() {
        try {
            const monedas = await MDL.empresa.getMonedas();
            if (!Array.isArray(monedas)) return;

            const monedaDefault = monedas.find(
                m => m.key === DEFAULT_MONEDA_KEY
            );

            console.log("aquiiii")
            console.log("%c" + JSON.stringify(monedas), `color: #2ECC40; font-weight: bold;`);

            console.log("aquiiii")
            this.setState({
                options: monedas,
                selectedMoneda: monedaDefault ?? null
            });
        } catch (e) {
            console.error("Error cargando monedas:", e);
        }
    }

    componentWillUnmount(): void {
        MDL.carrito.removeEventListener(this.handleChange.bind(this))
        if (this.evento) {
            MDL.compra_venta.removeEventListener(this.evento);
        }
    }

    render() {
        const items = MDL.carrito.carrito_venta.items;
        const { selectedMoneda, options } = this.state;

        return <SView col={"xs-12"} height>
            <SHr />
            <SText center color={STheme.color.lightGray} bold>{"Carrito de ventas"}</SText>

            {/* Moneda seleccionada */}
            <SText center color={STheme.color.lightGray} bold> {"moneda "}{selectedMoneda?.observacion ?? "-"} </SText>
            <SView row col={"xs-12"} style={{ height: "50" }} backgroundColor="#009ca1">
                {/* {options.length > 0 && ( */}
                <InputSelector
                    ref={(ref: any) => this.rapido = ref}
                    type="custom"
                    customStyle="erp"
                    placeholder="Seleccione moneda"
                    // defaultValue={selectedMoneda?.key}
                    value={selectedMoneda?.key}
                    options={options.map(o => ({
                        label: o.descripcion,
                        value: o.key,
                        data: o
                    }))}
                    onSelect={(item) => {
                        this.setState({ selectedMoneda: item.data });
                        MDL.compra_venta.setMonedaSeleccionada(item.data)
                    }}
                />
                {/* )} */}
            </SView>

            <SView style={{ padding: 4, width: 33, height: 33, position: "absolute", right: 0, top: 0 }} onPress={() => { SPopup.close("PopupCarrito") }}>
                <SIconApp name="Close" fill={STheme.color.text} />
            </SView>

            <SHr />

            <SView row col={"xs-12"} style={{ paddingHorizontal: 8 }}>
                <SText color={STheme.color.lightGray} fontSize={12}>{"Productos"} ({MDL.carrito.carrito_venta.cantidad_items})</SText>
                <SView flex />
                <SText color={STheme.color.lightGray} fontSize={12}>{"Sub Total"}</SText>
            </SView>

            <SHr h={1} color={STheme.color.card} />

            {/* Lista de items */}
            <FlatList
                data={items}
                renderItem={({ item }) => <ItemComp item={item} moneda={selectedMoneda} />}
                keyExtractor={(item) => item.modelo.key}
            />

            <SHr h={1} color={STheme.color.card} />

            {/* Total */}
            <SView padding={8}>
                <SText col={"xs-12"} style={{ textAlign: "right" }}>
                    {"Total: "}
                    {SMath.formatMoney(
                        items.reduce((acc, item) => {
                            const precio = selectedMoneda
                                ? item.modelo.precio_venta_moneda / (selectedMoneda.tipo_cambio || 1)
                                : item.modelo.precio_venta_moneda;
                            return acc + precio * item.cantidad;
                        }, 0)
                    )}
                </SText>
            </SView>

            <SHr h={1} color={STheme.color.card} />

            {/* Acciones */}
            <SView padding={8}>
                <SView col={"xs-12"} row flex center>
                    <SView padding={4} card style={{ backgroundColor: STheme.color.danger }} onPress={() => {
                        SPopup.confirm({
                            title: "Seguro que quieres limpiar el carrito?",
                            onPress: () => {
                                MDL.carrito.limpiarCarritoVentas();
                                SPopup.close("PopupCarrito");
                            }
                        })
                    }}>
                        <SText fontSize={12}>{"Limpiar carrito"}</SText>
                    </SView>

                    <SView flex />

                    <SView style={{ backgroundColor: STheme.color.success }} padding={4} card onPress={() => { PopupCarritoConfirmar.open({}) }}>
                        <SText fontSize={12}>{"Confirmar la venta"}</SText>
                    </SView>
                </SView>
            </SView>
        </SView>
    }
}

/* ------------------ ItemComp ------------------ */
const ItemComp = (props: any) => {
    const cantidadRef = React.useRef<any>(null);
    const precioRef = React.useRef<any>(null);
    const monedaRef = React.useRef<any>(null);

    const { item, moneda } = props;

    // Sincronizar cantidad
    React.useEffect(() => {
        if (cantidadRef.current && cantidadRef.current.getValue() !== item.cantidad) {
            cantidadRef.current.setValue(item.cantidad);
        }
    }, [item.cantidad]);

    // Sincronizar precio
    React.useEffect(() => {
        if (precioRef.current) {
            const valor = moneda
                ? item.modelo.precio_venta_moneda / (moneda.tipo_cambio || 1)
                : item.modelo.precio_venta_moneda;
            if (precioRef.current.getValue() !== valor) {
                precioRef.current.setValue(valor);
            }
        }
        if (monedaRef.current) {
            monedaRef.current.setValue(moneda);
        }
    }, [moneda, item.modelo.precio_venta_moneda]);

    return (
        <SView padding={8}>
            <SView row center>
                {/* Botón remover */}
                <SView center style={{ width: 20, height: 20, padding: 2 }} onPress={() => MDL.carrito.removerItemAlCarritoDeVentas(item)}>
                    <SIconApp name="Close" fill={STheme.color.warning} />
                </SView>

                {/* Imagen */}
                <SView center style={{ width: 35, height: 35, borderRadius: 4, overflow: "hidden", borderColor: STheme.color.card, borderWidth: 1 }}>
                    <SImage src={SSocket.api.inventario + "modelo/" + item.modelo.key} style={{ resizeMode: "cover" }} />
                </SView>

                <SView width={4} />
                <SView flex>
                    {/* Descripción */}
                    <SText fontSize={14} bold>
                        {item?.modelo?.descripcion}
                    </SText>

                    <SHr h={2} />

                    <SView row col={"xs-12"} style={{ alignItems: "center" }}>
                        {/* Precio editable */}
                        <SView width={60}>
                            <SInput
                                ref={precioRef}
                                style={{ height: 16, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                type="money2"
                                icon={<SText width={20} fontSize={10} numberOfLines={1} color={STheme.color.lightGray}>{moneda ? moneda.observacion : "BS"}</SText>}
                                value={moneda ? item.modelo.precio_venta_moneda / (moneda.tipo_cambio || 1) : item.modelo.precio_venta_moneda}
                                onChangeText={(e) => {
                                    const valor = parseFloat(e || "0");
                                    item.modelo.precio_venta_moneda = moneda ? valor * (moneda.tipo_cambio || 1) : valor;
                                    MDL.carrito.calcularValoresCarritDeVentas();
                                }}
                            />
                        </SView>

                        <SView width={4} />

                        {/* Cantidad editable */}
                        <SView width={60}>
                            <SInput
                                ref={cantidadRef}
                                style={{ height: 16, fontSize: 12, padding: 0, paddingRight: 4, textAlign: "right" }}
                                type="money2"
                                icon={<SText width={15} fontSize={10} color={STheme.color.lightGray}>x</SText>}
                                defaultValue={item.cantidad}
                                onChangeText={(e) => {
                                    item.cantidad = parseFloat(e || "0");
                                    MDL.carrito.calcularValoresCarritDeVentas();
                                }}
                            />
                        </SView>

                        <SView flex />

                        {/* Total del item */}
                        <SView width={80} style={{ justifyContent: "center" }}>
                            <SText fontSize={12} bold style={{ textAlign: "right" }}>
                                {SMath.formatMoney(
                                    (moneda ? item.modelo.precio_venta_moneda / (moneda.tipo_cambio || 1) : item.modelo.precio_venta_moneda) * item.cantidad
                                )}
                            </SText>
                        </SView>
                    </SView>

                    <SView height={4} />

                    {/* Selector de contactos */}
                    {item?.modelo?.contactos?.length > 0 && (
                        <SView style={{ width: 280, height: 24, backgroundColor: STheme.color.danger }}>
                            <InputSelector
                                style={{ fontSize: 12 }}
                                type="custom"
                                customStyle="erp"
                                label="Contactos:"
                                placeholder="Selecciona un contacto"
                                options={item.modelo.contactos.map((c) => ({
                                    label: c.nombre,
                                    customComponent: (e) => <SText style={{ fontSize: 11, color: STheme.color.lightGray }}>Comisión ({e.data.comision})%</SText>,
                                    value: c.key_modelo_cliente,
                                    data: c,
                                }))}
                                defaultValue={item.contactoSeleccionado || ""}
                                onSelect={(selected) => {
                                    item.key_modelo_cliente = selected.value;
                                }}
                            />
                        </SView>
                    )}
                </SView>
            </SView>
        </SView>
    );
};
