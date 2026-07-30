
import React from "react";
import { SHr, SIcon, SInput, SMath, SText, STheme, SView, SViewProps } from "servisofts-component";
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
const errorStyle = { borderWidth: 2, borderColor: STheme.color.danger };


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

const Item = ({ item, reload, onDelete, state, mostrarErrores }: {
    item: FacturaDetalle,
    reload: () => void,
    onDelete: any,
    state: any,
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

        <Cell style={{ padding: 2 }}>
            <FiltroSelector
                ref={(ref) => (state.filtroProductoRef = ref)}
                label=""
                error={mostrarErrores && !item.codigoProducto}
                defaultOption={item.codigoProducto ? String(item.codigoProducto) : "Seleecionar"}
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

                    calcularSubTotal();
                    reload();
                }}
            />
        </Cell>

        <Cell >
            <SInput
                customStyle={customStyle}
                style={mostrarErrores && !item.cantidad ? errorStyle : undefined}
                value={item.cantidad ?? ""}
                onChangeText={e => {
                    item.cantidad = e;
                    calcularSubTotal();
                    reload();
                }}
            />
        </Cell>

        <Cell>
            <SInput
                customStyle={customStyle}
                style={mostrarErrores && !item.actividadEconomica ? errorStyle : undefined}
                value={item.actividadEconomica ?? ""}
                onChangeText={e => {
                    item.actividadEconomica = e;
                    reload();
                }}
            />
        </Cell>

        <Cell style={{ padding: 2 }}>
            <FiltroSelector
                ref={(ref) => (state.filtroUnidadMedidaRef = ref)}
                label=""
                error={mostrarErrores && !item.unidadMedida}
                defaultOption={item.unidadMedida ? String(item.unidadMedida) : "Seleecionar"}
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
                    data: a
                })}
                onSelect={(um) => {
                    item.unidadMedida = um?.key ?? "";
                    reload();
                }}
            />
        </Cell>

        <Cell flex={3} style={{ padding: 2 }}>
            <SInput
                customStyle={customStyle}
                type="textArea"
                height={"100%"}
                style={{ fontSize: 10, ...(mostrarErrores && !item.descripcion ? errorStyle : {}) }}
                value={item.descripcion ?? ""}
                onChangeText={text => {
                    let value = text.replace(/"/g, "'");

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

        <Cell style={{ padding: 2 }}>
            <SInput2
                type="money"
                style={{ width: "100%", fontSize: 11, textAlign: "right", paddingRight: 4, color: STheme.color.text, ...(mostrarErrores && !((parseFloat(item.precioUnitario ?? "0") || 0) > 0) ? errorStyle : {}) }}
                defaultValue={(parseFloat(item.precioUnitario ?? "0") || 0).toFixed(2)}
                onChangeText={e => {
                    item.precioUnitario = e;
                    calcularSubTotal();
                    reload();
                }}
            />
        </Cell>

        <Cell style={{ padding: 2 }}>
            <SInput2
                type="money"
                style={{ width: "100%", fontSize: 11, textAlign: "right", paddingRight: 4, color: STheme.color.text, ...(mostrarErrores && !item.montoDescuento ? errorStyle : {}) }}
                defaultValue={(parseFloat(item.montoDescuento ?? "0") || 0).toFixed(2)}
                onChangeText={e => {
                    item.montoDescuento = e;
                    calcularSubTotal();
                    reload();
                }}
            />
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
            <Cell label="CÓD. ACTIVIDAD ECONÓMICA" />
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
                        defaultValue={(parseFloat(this.props.factura.data.descuentoAdicional ?? "0") || 0).toFixed(2)}
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
                    border={STheme.color.gray}
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
                        mostrarErrores={this.props.mostrarErrores}
                    />
                )}
            />

            {this.renderFooter()}
        </SView>
    }
}
