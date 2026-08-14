import React from "react";
import { SHr, SIcon, SInput, SMath, SText, STheme, SView, SViewProps, SUuid } from "servisofts-component";
import Label from "./Label";
import { Factura, FacturaDetalle } from "../../../MDL/factura/type";
import { Parametricas } from "../../../MDL/factura/typeParametricas";
import { FlatList } from "react-native";
import MDL from "../../../MDL";
import FiltroSelector from "../../productos/modelo/Components/FiltroSelector";
import SInput2 from "../../../Components/SForm2/SInput2";

type DetalleProps = {
    factura: Factura,
    parametricas?: Parametricas,
    mostrarErrores?: boolean,
}

const customStyle: any = "facturaDuplicar";


const Cell = ({ label = "", flex = 1, children, style = {}, error = false }: {
    label?: string,
    flex?: number,
    children?: any,
    style?: SViewProps["style"],
    error?: boolean,
}) => {
    return <SView flex={flex} style={[{
        borderWidth: 0.5,
        padding: 8,
        borderColor: STheme.color.gray,
        overflow: "hidden",
    }, style, error ? { borderWidth: 2, borderColor: STheme.color.danger, borderRadius: 4 } : null]} center>
        {children ?? <SText fontSize={10} center>{label}</SText>}
    </SView>
}
const Item = ({ item, reload, onDelete, mostrarErrores }: {
    item: FacturaDetalle,
    reload: () => void,
    onDelete: any,
    mostrarErrores?: boolean
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

        <Cell style={{ padding: 2 }} error={mostrarErrores && !item.codigoProducto}>
            <FiltroSelector
                label=""
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

                    calcularSubTotal();
                    reload();
                }}
            />
        </Cell>

        <Cell error={mostrarErrores && !item.cantidad}>
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

        {/* <Cell style={{ padding: 2 }}  > */}
        <Cell style={{ padding: 2 }} error={mostrarErrores && !item.unidadMedida}>
            <FiltroSelector
                label=""
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

        <Cell flex={3} style={{ padding: 2 }} error={mostrarErrores && !item.descripcion}>
            <SInput
                customStyle={customStyle}
                type="textArea"
                height={"100%"}
                style={{ fontSize: 10 }}
                value={item.descripcion ?? ""}
                onChangeText={text => {
                    item.descripcion = text.replace(/"/g, "'");
                    reload();
                }}
            />
        </Cell>

        <Cell style={{ padding: 8 }} error={mostrarErrores && (!item.precioUnitario || item.precioUnitario.trim() === "" || parseFloat(item.precioUnitario) <= 0)}>
            <SView style={{ width: "100%", borderWidth: 1, borderColor: STheme.color.card, borderRadius: 4, paddingHorizontal: 2, paddingVertical: 3.5, backgroundColor: STheme.color.card }}>
                <SInput2
                    type="money"
                    style={{ width: "100%", fontSize: 12, textAlign: "right", paddingRight: 2, color: STheme.color.text }}
                    value={(parseFloat(item.precioUnitario ?? "0") || 0).toFixed(2)}
                    onChangeText={e => {
                        item.precioUnitario = e;
                        calcularSubTotal();
                        reload();
                    }}
                />
            </SView>
        </Cell>

        <Cell style={{ padding: 8 }} error={mostrarErrores && !item.montoDescuento}>
            <SView style={{ width: "100%", borderWidth: 1, borderColor: STheme.color.card, borderRadius: 4, paddingHorizontal: 2, paddingVertical: 3.5, backgroundColor: STheme.color.card }}>
                <SInput2
                    type="money"
                    style={{ width: "100%", fontSize: 12, textAlign: "right", paddingRight: 2, color: STheme.color.text }}
                    value={(parseFloat(item.montoDescuento ?? "0") || 0).toFixed(2)}
                    onChangeText={e => {
                        item.montoDescuento = e;
                        calcularSubTotal();
                        reload();
                    }}
                />
            </SView>
        </Cell>

        <Cell>
            <Label>{SMath.formatMoney(parseFloat(item.subTotal ?? "0") || 0)}</Label>

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

export default class Detalle extends React.Component<DetalleProps> {

    state = {
        filtroProductoRef: null,
        filtroUnidadMedidaRef: null,
    }
    handleAddItem() {
        this.props.factura.data.detalle.push({
            _id: SUuid(),
            codigoProducto: "",
            codigoProductoSin: "",
            actividadEconomica: "",
            cantidad: "1",
            unidadMedida: "",
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
                <SView flex={7} />
                <Cell flex={2} label="SUBTOTAL" />
                <Cell label={SMath.formatMoney(subTotal)} />
            </SView>

            <SView col={"xs-12"} row>
                <SView flex={7} />
                <Cell flex={2} label="DESCUENTO" />
                <Cell style={{ padding: 2 }}>
                    <SInput2
                        type="money"
                        style={{ width: "100%", fontSize: 11, textAlign: "center", color: STheme.color.text }}
                        value={(parseFloat(this.props.factura.data.descuentoAdicional ?? "0") || 0).toFixed(2)}
                        onChangeText={e => {
                            this.props.factura.data.descuentoAdicional = e ?? "0";
                            this.setState({ ...this.state });
                        }}
                    />
                </Cell>
            </SView>

            <SView col={"xs-12"} row>
                <SView flex={7} />
                <Cell flex={2} label="TOTAL" />
                <Cell label={SMath.formatMoney(total)} />
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
                keyExtractor={(item, _) => item._id ?? String(_)}
                renderItem={({ item, index }) => (
                    <Item
                        item={item}
                        reload={() => this.setState({ ...this.state })}
                        onDelete={() => this.handleDeleteItem(index)}
                        mostrarErrores={this.props.mostrarErrores}
                    />
                )}
            />

            {this.renderFooter()}
        </SView>
    }
}
