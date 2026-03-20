import React from "react";
import { SHr, SIcon, SInput, SLoad, SNotification, SPage, SPopup, SText, STheme, SUtil, SView, SViewProps } from "servisofts-component";
import Label from "./Label";
import { Factura, FacturaDetalle } from "../../../MDL/factura/type";
import { FlatList } from "react-native";
import { Parametricas } from "../../../MDL/factura/typeParametricas";
import MDL from "../../../MDL";
import FiltroSelector from "../../productos/modelo/Components/FiltroSelector";


type DetalleProps = {
    factura: Factura,
    parametricas: Parametricas
}

const customStyle: any = "factura";

// Componente de celda
const Cell = ({ label = "", flex = 1, children, style = {} }: { label?: string, flex?: number, children?: any, style?: SViewProps["style"] }) => {
    return <SView flex={flex} style={[{
        borderWidth: 0.5,
        padding: 8,
        borderColor: STheme.color.gray,
        overflow: "hidden",
    }, style]} center>
        {children ?? <SText fontSize={10} center>{label}</SText>}
    </SView>
}

// Componente Item
const Item = ({ item, reload, onDelete, state }: {
    item: FacturaDetalle,
    reload: () => void,
    onDelete: any,
    state: any
}) => {
    const useRef = React.useRef<SInput | null>(null);

    const calcularSubTotal = () => {
        const cantidad = parseFloat(item.cantidad ?? "0");
        const precioUnitario = parseFloat(item.precioUnitario ?? "0");
        const montoDescuento = parseFloat(item.montoDescuento ?? "0");

        const cantidadValida = isNaN(cantidad) ? 0 : cantidad;
        const precioUnitarioValido = isNaN(precioUnitario) ? 0 : precioUnitario;
        const montoDescuentoValido = isNaN(montoDescuento) ? 0 : montoDescuento;

        item.subTotal = ((cantidadValida * precioUnitarioValido) - montoDescuentoValido).toString();
    }

    return <SView col={"xs-12"} row>
        {/* Producto / Servicio */}
        <Cell>
            <FiltroSelector
                ref={(ref) => (state.filtroProductoRef = ref)}
                label="Producto / Servicio"
                loadData={async () => {
                    try {
                        const data = await MDL.factura.getParametrica({
                            ambiente: MDL.factura.ambiente,
                            parametrica: "productosServicios"
                        });
                        return Array.isArray(data) ? data : [];
                    } catch (e) {
                        console.error("Error cargando productos/servicios:", e);
                        return [];
                    }
                }}
                mapOption={(a) => ({
                    key: String(a?.codigoProducto ?? ""),
                    nombre: `${a?.codigoProducto ?? ""} - ${a?.descripcionProducto ?? ""}`.trim(),
                })}
                onSelect={(prd) => {

                    item.codigoProducto = prd.key;
                    // item.descripcion = prd?.descripcionProducto ?? "";
                    // item.codigoProductoSin = prd?.codigoProducto ?? "";
                    // item.actividadEconomica = prd?.codigoActividad?.toString() ?? "";
                    console.clear();
                    console.log("%c" + JSON.stringify(item), `color: #2ECC40; font-weight: bold;`);
                    reload();
                }}
            />
        </Cell>

        {/* Cantidad */}
        <Cell>
            <SInput customStyle={customStyle} defaultValue={item.cantidad} onChangeText={e => {
                item.cantidad = e;
                calcularSubTotal();
                reload();
            }} />
        </Cell>

        {/* Unidad de Medida */}
        <Cell>
            <FiltroSelector
                ref={(ref) => (state.filtroUnidadMedidaRef = ref)}
                label="Unidad de Medida"
                loadData={async () => {
                    try {
                        const data = await MDL.factura.getParametrica({
                            ambiente: MDL.factura.ambiente,
                            parametrica: "unidadMedida"
                        });
                        return Array.isArray(data) ? data : [];
                    } catch (e) {
                        console.error("Error cargando unidades de medida:", e);
                        return [];
                    }
                }}
                mapOption={(a) => ({
                    key: String(a?.codigoClasificador ?? ""),
                    nombre: a?.descripcion ?? "",
                })}
                onSelect={(um) => {
                    item.unidadMedida = um?.key ?? "";
                    reload();
                }}
            />
        </Cell>


        <Cell flex={3} style={{ padding: 2 }}>
            <SInput
                ref={useRef}
                customStyle={customStyle}
                type="textArea"
                height={"100%"}
                style={{ fontSize: 10 }}
                value={item.descripcion ?? ""} // 🔹 controlado desde item.descripcion
                onChangeText={text => {
                    const nuevo = text.replace(/"/g, "'"); // reemplaza automáticamente
                    item.descripcion = nuevo;
                    reload(); // 🔹 fuerza re-render para que se vea el cambio
                }}
            />
        </Cell>
        {/* Precio Unitario */}
        <Cell>
            <SInput customStyle={customStyle} defaultValue={item.precioUnitario} onChangeText={e => {
                item.precioUnitario = e;
                calcularSubTotal();
                reload();
            }} />
        </Cell>

        {/* Monto Descuento */}
        <Cell>
            <SInput customStyle={customStyle} defaultValue={item.montoDescuento} onChangeText={e => {
                item.montoDescuento = e;
                calcularSubTotal();
                reload();
            }} />
        </Cell>

        {/* Subtotal y eliminar */}
        <Cell>
            <Label>{item.subTotal}</Label>
            <SView style={{ position: "absolute", right: 2, top: 2 }} onPress={onDelete}>
                <SIcon name="eliminarI" width={20} height={20} />
            </SView>
        </Cell>
    </SView>
}

// Componente Detalle
export default class Detalle extends React.Component<DetalleProps> {

    state = {
        ambiente: MDL.factura.ambiente,
        selectedProductoServicio: null,
        selectedUnidadMedida: null,
        filtroProductoRef: null,
        filtroUnidadMedidaRef: null,
    }

    // Validación antes de emitir factura
    validarAntesDeEmitir() {
        if (!this.props.factura.data.leyenda || this.props.factura.data.leyenda.trim() === "") {
            SNotification.error("Debe ingresar una leyenda antes de emitir la factura");
            return false;
        }
        return true;
    }

    renderHeader() {
        return <SView col={"xs-12"} row>
            <Cell label="CÓDIGO PRODUCTO / SERVICIO" />
            <Cell label="CANTIDAD" />
            <Cell label="UNIDAD DE MEDIDA" />
            <Cell label="DESCRIPCIÓN" flex={3} />
            <Cell label="PRECIO UNITARIO" />
            <Cell label="DESCUENTO" />
            <Cell label="SUBTOTAL" />
        </SView>
    }

    handleAddItem() {
        this.props.factura.data.detalle.push({
            codigoProducto: "",
            codigoProductoSin: "",
            actividadEconomica: "",
            cantidad: "1",
            unidadMedida: "1",
            descripcion: "",
            precioUnitario: "0",
            montoDescuento: "0",
            subTotal: "0",
            numeroImei: "",
            numeroSerie: ""
        });
        this.setState({ ...this.state });
    }

    handleDeleteItem = (index: number) => {
        this.props.factura.data.detalle.splice(index, 1);
        this.setState({ ...this.state });
    }

    calcularSubTotal = () => {
        let subTotal = 0;
        this.props.factura.data.detalle.forEach((item) => {
            const cantidad = parseFloat(item.cantidad ?? "0");
            const precioUnitario = parseFloat(item.precioUnitario ?? "0");
            const montoDescuento = parseFloat(item.montoDescuento ?? "0");

            const cantidadValida = isNaN(cantidad) ? 0 : cantidad;
            const precioUnitarioValido = isNaN(precioUnitario) ? 0 : precioUnitario;
            const montoDescuentoValido = isNaN(montoDescuento) ? 0 : montoDescuento;

            subTotal += (cantidadValida * precioUnitarioValido) - montoDescuentoValido;
        });
        return subTotal;
    }

    renderFooter() {
        let subTotal = this.calcularSubTotal();
        let descuento = parseFloat(this.props.factura.data.descuentoAdicional ?? "0");
        descuento = isNaN(descuento) ? 0 : descuento;
        if (descuento > subTotal) descuento = subTotal;

        let total = subTotal - descuento;
        total = isNaN(total) ? 0 : total;

        this.props.factura.data.montoTotal = total.toString();
        this.props.factura.data.montoTotalSujetoIva = total.toString();

        return <SView col={"xs-12"}>
            <SView col={"xs-12"} row>
                <SView flex={6} />
                <Cell flex={2} label="SUBTOTAL" style={{ padding: 2 }} />
                <Cell label={subTotal.toString()} style={{ padding: 2 }} />
            </SView>
            <SView col={"xs-12"} row>
                <SView flex={6} />
                <Cell flex={2} label="DESCUENTO" style={{ padding: 2 }} />
                <Cell style={{ padding: 1 }}>
                    <SInput customStyle={customStyle} height={16} defaultValue={this.props.factura.data.descuentoAdicional} style={{ textAlign: "center", fontSize: 10 }} onChangeText={e => {
                        this.props.factura.data.descuentoAdicional = e ?? "0";
                        this.setState({ ...this.state });
                    }} />
                </Cell>
            </SView>
            <SView col={"xs-12"} row>
                <SView flex={6} />
                <Cell flex={2} label="TOTAL" style={{ padding: 2 }} />
                <Cell label={total.toString()} style={{ padding: 2 }} />
            </SView>
            <SView col={"xs-12"} row>
                <SView flex={6} />
                <Cell flex={2} label="MONTO GIFT CARD" style={{ padding: 2 }} />
                <Cell label={this.props.factura.data.montoGiftCard + ""} style={{ padding: 2 }} />
            </SView>
            <SView col={"xs-12"} row>
                <SView flex={6} />
                <Cell flex={2} label="MONTO A PAGAR" style={{ padding: 2 }} />
                <Cell label={this.props.factura.data.montoTotal + ""} style={{ padding: 2 }} />
            </SView>
            <SView col={"xs-12"} row>
                <SView flex={6} />
                <Cell flex={2} label="IMPORTE BASE CRÉDITO FISCAL" style={{ padding: 2 }} />
                <Cell label={this.props.factura.data.montoTotalSujetoIva} style={{ padding: 2 }} />
            </SView>
        </SView>
    }

    render() {
        return <SView style={{ width: "100%" }}>
            <SView col={"xs-12"} style={{ alignItems: "flex-end" }}>
                <SView width={120} height={30} row center backgroundColor={STheme.color.barColor} padding={8} onPress={this.handleAddItem.bind(this)}
                    style={{ borderRadius: 4 }}
                >
                    <SIcon name="adicionar" fill={STheme.color.white} width={15} height={15} />
                    <SView width={8} />
                    <SText color={STheme.color.white} >{"ADD ITEM"}</SText>
                </SView>
            </SView>

            <SHr height={8} />
            {this.renderHeader()}

            <FlatList
                style={{ width: "100%" }}
                scrollEnabled={false}
                data={this.props.factura.data.detalle}
                renderItem={({ item, index }) => <Item
                    item={item}
                    reload={() => this.setState({ ...this.state })}
                    onDelete={() => this.handleDeleteItem(index)}
                    state={this.state}
                />}
            />

            {this.renderFooter()}
        </SView>
    }
}