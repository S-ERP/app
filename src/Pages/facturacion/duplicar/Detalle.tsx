
import React from "react";
import { SHr, SIcon, SInput, SNotification, SText, STheme, SView, SViewProps } from "servisofts-component";
import Label from "./Label";
import { Factura, FacturaDetalle } from "../../../MDL/factura/type";
import { FlatList } from "react-native";
import MDL from "../../../MDL";
import FiltroSelector from "../../productos/modelo/Components/FiltroSelector";

type DetalleProps = {
    factura: Factura,
}

const customStyle: any = "factura";


// CELDA
const Cell = ({ label = "", flex = 1, children, style = {} }: {
    label?: string,
    flex?: number,
    children?: any,
    style?: SViewProps["style"]
}) => {
    return <SView flex={flex} style={[{
        borderWidth: 0.5,
        padding: 8,
        borderColor: STheme.color.gray,
        overflow: "hidden",
    }, style]} center>
        {children ?? <SText fontSize={10} center>{label}</SText>}
    </SView>
}

// ITEM
const Item = ({ item, reload, onDelete, state }: {
    item: FacturaDetalle,
    reload: () => void,
    onDelete: any,
    state: any
}) => {

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

        {/* PRODUCTO */}
        <Cell>
            <FiltroSelector
                ref={(ref) => (state.filtroProductoRef = ref)}
                label="Producto / Servicio"
                defaultOption={item.codigoProducto ? String(item.codigoProducto) : "todos"}
                skipInitialOnSelect
                loadData={async () => {
                    const data = await MDL.factura.getParametrica({
                        ambiente: MDL.factura.ambiente,
                        parametrica: "productosServicios"
                    });
                    return Array.isArray(data) ? data : [];
                }}
                mapOption={(a) => ({
                    key: String(a?.codigoProducto ?? ""),
                    nombre: `${a?.codigoProducto ?? ""} - ${a?.descripcionProducto ?? ""}`,
                    data: a
                })}
                onSelect={(prd) => {
                    const data = prd.data;

                    item.codigoProducto = prd.key;
                    item.codigoProductoSin = data?.codigoProducto ?? "";
                    item.descripcion = data?.descripcionProducto ?? "";
                    item.actividadEconomica = data?.codigoActividad?.toString() ?? "";

                    // opcional si tienes estos campos
                    // item.precioUnitario = data?.precio ?? "0";
                    // item.unidadMedida = data?.unidadMedida ?? "1";

                    calcularSubTotal();
                    reload();
                }}
            />
        </Cell>

        {/* CANTIDAD */}
        <Cell>
            <SInput
                customStyle={customStyle}
                value={item.cantidad ?? ""}
                onChangeText={e => {
                    item.cantidad = e;
                    calcularSubTotal();
                    reload();
                }}
            />
        </Cell>

        {/* UNIDAD */}
        <Cell>
            <FiltroSelector
                ref={(ref) => (state.filtroUnidadMedidaRef = ref)}
                label="Unidad de Medida"
                defaultOption={item.unidadMedida ? String(item.unidadMedida) : "todos"}
                skipInitialOnSelect
                loadData={async () => {
                    const data = await MDL.factura.getParametrica({
                        ambiente: MDL.factura.ambiente,
                        parametrica: "unidadMedida"
                    });
                    return Array.isArray(data) ? data : [];
                }}
                mapOption={(a) => ({
                    key: String(a?.codigoClasificador ?? ""),

                    nombre: `${a?.codigoClasificador ?? ""} - ${a?.descripcion ?? ""}`,

                    // nombre: a?.descripcion ?? "",
                    data: a
                })}
                onSelect={(um) => {
                    item.unidadMedida = um?.key ?? "";
                    reload();
                }}
            />
        </Cell>

        {/* DESCRIPCIÓN */}
        <Cell flex={3} style={{ padding: 2 }}>
            <SInput
                customStyle={customStyle}
                type="textArea"
                height={"100%"}
                style={{ fontSize: 10 }}
                value={item.descripcion ?? ""}
                // onChangeText={text => {
                //     item.descripcion = text.replace(/"/g, "'");
                //     reload();
                // }}
                onChangeText={text => {
                    let value = text.replace(/"/g, "'");

                    // Mantener solo la primera comilla simple
                    const firstIndex = value.indexOf("'");
                    if (firstIndex !== -1) {
                        value =
                            value.substring(0, firstIndex + 1) +
                            value.substring(firstIndex + 1).replace(/'/g, "");
                    }

                    item.descripcion = value;
                    reload();
                }}

            />
        </Cell>

        {/* PRECIO */}
        <Cell>
            <SInput
                customStyle={customStyle}
                value={item.precioUnitario ?? ""}
                onChangeText={e => {
                    item.precioUnitario = e;
                    calcularSubTotal();
                    reload();
                }}
            />
        </Cell>

        {/* DESCUENTO */}
        <Cell>
            <SInput
                customStyle={customStyle}
                value={item.montoDescuento ?? ""}
                onChangeText={e => {
                    item.montoDescuento = e;
                    calcularSubTotal();
                    reload();
                }}
            />
        </Cell>

        {/* SUBTOTAL */}
        <Cell>
            <Label>{item.subTotal}</Label>

            <SView
                style={{
                    position: "absolute",
                    right: 2,
                    top: 2,
                }}
                onPress={onDelete}
            >
                <SIcon name="eliminarI" width={20} height={20} />
            </SView>
        </Cell>

    </SView>
}

// MAIN COMPONENT
export default class Detalle extends React.Component<DetalleProps> {

    state = {
        filtroProductoRef: null,
        filtroUnidadMedidaRef: null,
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
                <Cell flex={2} label="SUBTOTAL" />
                <Cell label={subTotal.toString()} />
            </SView>

            <SView col={"xs-12"} row>
                <SView flex={6} />
                <Cell flex={2} label="DESCUENTO" />
                <Cell>
                    <SInput
                        customStyle={customStyle}
                        value={this.props.factura.data.descuentoAdicional ?? ""}
                        onChangeText={e => {
                            this.props.factura.data.descuentoAdicional = e ?? "0";
                            this.setState({ ...this.state });
                        }}
                    />
                </Cell>
            </SView>

            <SView col={"xs-12"} row>
                <SView flex={6} />
                <Cell flex={2} label="TOTAL" />
                <Cell label={total.toString()} />
            </SView>
        </SView>
    }

    render() {
        return <SView style={{ width: "100%" }}>

            <SView col={"xs-12"} style={{ alignItems: "flex-end" }}>
                <SView
                    width={120}
                    height={30}
                    row
                    center
                    backgroundColor={STheme.color.barColor}
                    padding={8}
                    onPress={this.handleAddItem.bind(this)}
                    style={{ borderRadius: 4 }}
                >
                    <SIcon name="adicionar" fill={STheme.color.white} width={15} height={15} />
                    <SView width={8} />
                    <SText color={STheme.color.white}>ADD ITEM</SText>
                </SView>
            </SView>

            <SHr height={8} />
            {this.renderHeader()}

            <FlatList
                scrollEnabled={false}
                data={this.props.factura.data.detalle}
                renderItem={({ item, index }) => (
                    <Item
                        item={item}
                        reload={() => this.setState({ ...this.state })}
                        onDelete={() => this.handleDeleteItem(index)}
                        state={this.state}
                    />
                )}
            />

            {this.renderFooter()}
        </SView>
    }
}
