import React from "react";
import { SHr, SIcon, SInput, SLoad, SNotification, SPage, SPopup, SText, STheme, SUtil, SView, SViewProps } from "servisofts-component";
import Label from "./Label";
import { Factura, FacturaDetalle } from "../../../MDL/factura/type";
import { FlatList } from "react-native";
import { Parametricas } from "../../../MDL/factura/typeParametricas";
import item from "../../compra/item";



type DetalleProps = {
    factura: Factura,
    parametricas: Parametricas
}

const customStyle: any = "factura";

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

const Item = ({ item, parametricas, reload, onDelete }: { item: FacturaDetalle, parametricas: Parametricas, reload: () => void, onDelete: any }) => {
    console.log("onDelete");
    console.log(item);
    const useRef = React.useRef<SInput | null>(null)
    const calcularSubTotal = () => {
        const cantidad = parseFloat(item.cantidad ?? "0")
        const precioUnitario = parseFloat(item.precioUnitario ?? "0")
        const montoDescuento = parseFloat(item.montoDescuento ?? "0")

        // Si parseFloat da NaN, lo convertimos en 0
        const cantidadValida = isNaN(cantidad) ? 0 : cantidad
        const precioUnitarioValido = isNaN(precioUnitario) ? 0 : precioUnitario
        const montoDescuentoValido = isNaN(montoDescuento) ? 0 : montoDescuento

        const subTotal = (cantidadValida * precioUnitarioValido) - montoDescuentoValido
        item.subTotal = subTotal.toString()
    }
    return <SView col={"xs-12"} row >
        <Cell  >
            {!parametricas?.productosServicios ? <SLoad /> : <>
                <SInput customStyle={customStyle} defaultValue={item.codigoProductoSin}
                    type="select"
                    options={(parametricas?.productosServicios ?? []).map(a => {
                        return {
                            key: a.codigoProducto,
                            content: a.codigoProducto + " - " + SUtil.limitString(a.descripcionProducto, 70),
                            renderResult: (v: string) => {
                                return v.split("-")[0]
                            }
                        }
                    })}
                    onChangeText={e => {
                        console.log(e);
                        const prd = (parametricas?.productosServicios ?? []).find(a => a.codigoProducto + "" == e);
                        item.descripcion = prd?.descripcionProducto ?? ""
                        useRef.current?.setValue(item.descripcion)
                        item.actividadEconomica = prd?.codigoActividad ? prd.codigoActividad.toString() : "";
                        item.codigoProductoSin = e
                        // item.unidadMedida = prd
                        reload()
                        // this.props.factura.data.codigoTipoDocumentoIdentidad = e
                        // this.setState({ ...this.state })
                    }} />
            </>}
        </Cell>
        <Cell  >
            <SInput customStyle={customStyle}
                defaultValue={item.cantidad} onChangeText={e => {
                    item.cantidad = e;
                    calcularSubTotal();
                    reload()
                }} />
        </Cell>
        {/* <Cell label={item.unidadMedida} /> */}
        <Cell label={item.unidadMedida} >
            {!parametricas?.unidadMedida ? <SLoad /> : <>
                <SInput customStyle={customStyle} defaultValue={item.unidadMedida}
                    type="select"
                    options={(parametricas?.unidadMedida ?? []).map(a => {
                        return {
                            key: a.codigoClasificador,
                            content: a.codigoClasificador + " - " + SUtil.limitString(a.descripcion, 70),
                            renderResult: (v: string) => {
                                return v.split("-")[1]
                            }
                        }
                    })}
                    onChangeText={e => {
                        // console.log(e);
                        // const prd = (parametricas?.productosServicios ?? []).find(a => a.codigoProducto + "" == e);
                        // item.descripcion = prd?.descripcionProducto ?? ""
                        // useRef.current?.setValue(item.descripcion)
                        // item.actividadEconomica = prd?.codigoActividad ? prd.codigoActividad.toString() : "";
                        // item.codigoProductoSin = e
                        item.unidadMedida = e
                        // reload()
                        // this.props.factura.data.codigoTipoDocumentoIdentidad = e
                        // this.setState({ ...this.state })
                    }} />
            </>}
        </Cell>
        <Cell flex={3} style={{ padding: 2 }} >
            <SInput ref={useRef} customStyle={customStyle}
                type="textArea"
                height={"100%"}
                style={{
                    fontSize: 10
                }}
                defaultValue={item.descripcion} onChangeText={e => {
                    item.descripcion = e;
                }} />
        </Cell>
        <Cell  >
            <SInput customStyle={customStyle}
                defaultValue={item.precioUnitario} onChangeText={e => {
                    item.precioUnitario = e;
                    calcularSubTotal();
                    reload()
                }} />
        </Cell>
        <Cell  >
            <SInput customStyle={customStyle}
                defaultValue={item.montoDescuento} onChangeText={e => {
                    item.montoDescuento = e;
                    calcularSubTotal();
                    reload()
                }} />

        </Cell>
        <Cell  >
            <Label>{item.subTotal}</Label>
            <SView style={{
                position: "absolute",
                right: 2,
                top: 2,
            }}
                onPress={onDelete} >
                <SIcon name="eliminarI" width={20} height={20} />

            </SView>
        </Cell>
        {/* <Cell label={item.subTotal} /> */}

    </SView>
}


export default class Detalle extends React.Component<DetalleProps> {

    renderHeader() {
        return <SView col={"xs-12"} row >
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
        })
        this.setState({ ...this.state })
    }

    handleDeleteItem = (index: number) => {
        console.log("Eliminar", index);
        console.log(this.props.factura.data.detalle);

        this.props.factura.data.detalle.splice(index, 1); // Eliminar el elemento
        this.setState({ ...this.state }); // Forzar actualización del estado
    }

    calcularSubTotal = () => {
        let subTotal = 0;
        this.props.factura.data.detalle.forEach((item) => {
            const cantidad = parseFloat(item.cantidad ?? "0")
            const precioUnitario = parseFloat(item.precioUnitario ?? "0")
            const montoDescuento = parseFloat(item.montoDescuento ?? "0")

            // Si parseFloat da NaN, lo convertimos en 0
            const cantidadValida = isNaN(cantidad) ? 0 : cantidad
            const precioUnitarioValido = isNaN(precioUnitario) ? 0 : precioUnitario
            const montoDescuentoValido = isNaN(montoDescuento) ? 0 : montoDescuento

            subTotal += (cantidadValida * precioUnitarioValido) - montoDescuentoValido
        })
        return subTotal
    }

    renderFooter() {
        let subTotal = this.calcularSubTotal()
        let descuento = parseFloat(this.props.factura.data.descuentoAdicional ?? "") ?? 0

        if (isNaN(subTotal)) {
            subTotal = 0;
        }
        if (isNaN(descuento)) {
            descuento = 0;
        }
        if (descuento > subTotal) {
            descuento = subTotal;
        }
        let total = (subTotal - descuento);
        if (isNaN(total)) {
            total = 0;
        }
        this.props.factura.data.montoTotal = total.toString()
        this.props.factura.data.montoTotalSujetoIva = total.toString()


        return <SView col={"xs-12"}>
            <SView col={"xs-12"} row >
                <SView flex={6} />
                <Cell flex={2} label="SUBTOTAL" style={{ padding: 2 }} />
                <Cell label={subTotal + ""} style={{ padding: 2 }} />
            </SView>
            <SView col={"xs-12"} row >
                <SView flex={6} />
                <Cell flex={2} label="DESCUENTO" style={{ padding: 2 }} />

                <Cell style={{ padding: 1 }} >
                    <SInput customStyle={customStyle}
                        height={16}
                        defaultValue={this.props.factura.data.descuentoAdicional}
                        style={{ textAlign: "center", fontSize: 10 }}
                        onChangeText={e => {
                            this.props.factura.data.descuentoAdicional = e ?? "0"
                            this.setState({ ...this.state })
                        }}
                    />
                </Cell>
            </SView>
            <SView col={"xs-12"} row >
                <SView flex={6} />
                <Cell flex={2} label="TOTAL" style={{ padding: 2 }} />
                <Cell label={(total).toString()} style={{ padding: 2 }} />
            </SView>
            <SView col={"xs-12"} row >
                <SView flex={6} />
                <Cell flex={2} label="MONTO GIFT CARD" style={{ padding: 2 }} />
                <Cell label={this.props.factura.data.montoGiftCard + ""} style={{ padding: 2 }} />
            </SView>
            <SView col={"xs-12"} row >
                <SView flex={6} />
                <Cell flex={2} label="MONTO A PAGAR" style={{ padding: 2 }} />
                <Cell label={this.props.factura.data.montoTotal + ""} style={{ padding: 2 }} />
            </SView>
            <SView col={"xs-12"} row >
                <SView flex={6} />
                <Cell flex={2} label="IMPORTE BASE CRÉDITO FISCAL" style={{ padding: 2 }} />
                <Cell label={this.props.factura.data.montoTotalSujetoIva} style={{ padding: 2 }} />
            </SView>
        </SView>
    }

    render() {
        return <SView style={{
            width: "100%",
        }} >
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
                style={{
                    width: "100%"
                }}
                scrollEnabled={false}
                data={this.props.factura.data.detalle}
                renderItem={({ item, index }) => <Item item={item}
                    parametricas={this.props.parametricas}
                    reload={() => this.setState({ ...this.state })}
                    onDelete={() => this.handleDeleteItem(index)}
                />}
            />
            {this.renderFooter()}
        </SView>
    }
}