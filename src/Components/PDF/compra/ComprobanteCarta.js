import React, { Component } from 'react';
import { SMath, SView, SText, SDate, SImage } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import MDL from '../../../MDL';
import Model from '../../../Model';
const textStyle = { font: "Roboto", fontSize: 9};
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;
export default class ComprobanteCarta extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    static async fetchCompraVentaData(keyVenta) {
        try {
            const compraVenta = await MDL.compra_venta.getByKeyComraVenta(keyVenta);
            if (!compraVenta) {
                throw new Error(`compraVenta not found for ID: ${keyVenta}`);
            }
            let sucursal = {};
            if (compraVenta.key_sucursal?.trim()) {
                sucursal = await Model.sucursal.Action.getByKey({ key: compraVenta.key_sucursal }) || {};
            }
            let proveedor = {};
            if (compraVenta.key_proveedor?.trim()) {
                proveedor = await MDL.compra_venta.proveedor.getByKey(compraVenta.key_proveedor) || {};
            }
            let cliente = {};
            if (compraVenta.key_cliente?.trim()) {
                cliente = await MDL.crm.cliente.getByKey(compraVenta.key_cliente) || {};
            }
            const empresa = MDL.empresa.select;
            if (!empresa?.key) {
                throw new Error('empresa data is missing or invalid');
            }
            const compraVentaData = {
                ...compraVenta,
                sucursal,
                empresa,
                ...(compraVenta.key_proveedor ? { proveedor } : {}),
                ...(compraVenta.key_cliente ? { cliente } : {})
            };
            return compraVentaData;
        } catch (error) {
            throw new Error(`Failed to fetch compraVenta data: ${error.message}`);
        }
    }
    static async imprimir(key) {
        const data = await MDL.compra_venta.getByKeyComraVenta(key);
        console.log('miralo ', data);
        SPDF.create(
            <SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}>
                <SPDF.View style={{ width: "100%" }}>
                    {ComprobanteCarta.HeaderRecibo(data)}
                    {ComprobanteCarta.espacio()}
                    {ComprobanteCarta.proveedor(data)}
                    {ComprobanteCarta.espacio()}
                    {ComprobanteCarta.detalle(data)}
                    {ComprobanteCarta.espacio()}
                    {ComprobanteCarta.espacio()}
                    {ComprobanteCarta.firmas()}
                    {ComprobanteCarta.espacio()}
                    {ComprobanteCarta.FooterRecibo(data)}
                </SPDF.View>
            </SPDF.Page>
        );
    }
    static espacio() {
        return <SPDF.View style={{ width: "100%", height: 16 }} />;
    }
    static HeaderRecibo(data) {
        const empresa = MDL.empresa.select;
        const sucursal = Model.sucursal.Action.getByKey({ key: data?.key_sucursal });
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 110, alignItems: "center" }}>
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 50, borderWidth: 1, }}>
                        {/* <SImage src={SSocket.api.empresa + "empresa/" + empresa?.key} /> */}
                    </SPDF.View>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{validarDato(empresa?.razon_social, 'MI EMPRESA')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Sucursal: {validarDato(sucursal?.descripcion, 'Mi Sucursal')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>{validarDato(sucursal?.direccion, 'Av. Sur Nro. 0')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Teléfono: {validarDato(sucursal?.telefono, 'Tel: (123) 00000000')}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 2 }} />
                <SPDF.View style={{ flex: 3, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"NIT"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{validarDato(empresa?.nit, 'S/N')}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"ORDEN NRO."}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{"001-001-000001"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }
    static proveedor(data) {
        const proveedor = data?.proveedor || {};
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: 80 }}>
                <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 16 }}>{"ORDEN DE COMPRA"}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 10 }}>{"(COMPROBANTE DE PAGO COMPRADO)"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "100%", height: 12 }} />
                <SPDF.View style={{ width: "100%", alignItems: "center", flexDirection: "row" }}>
                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%", }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"FECHA: "}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {new SDate(data?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy").toUpperCase()}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center", }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"COD. PROVEEDOR:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.nit, '6356465-2')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>FORMA DE PAGO:</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato((data?.tipo_pago.toUpperCase()), 'S/D')}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 3 }} />
                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%", }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"NIT: "}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}> {validarDato(proveedor.nit, '0')}  </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"PROVEEDOR:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato((proveedor?.razon_social.toUpperCase()), '6356465-2')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>CONTACTO:</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(data?.telefono, '+591 00000000')}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }
    static detalle(data) {
        const detalles = data?.detalle || {};
        const items = Object.values(detalles).length
            ? Object.values(detalles)
            : [
                {
                    key: 'PINT-001',
                    descripcion: 'Bote de Pintura Acrílica, Blanco Mate, 5 Litros',
                    cantidad: 1,
                    precio_unitario: 25.0,
                },
            ];
        return (
            <SPDF.View style={{ width: "100%" }}>
                <SPDF.View style={{ width: "100%", height: 44, flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"CÓDIGO PRODUCTO / SERVICIO"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"CANTIDAD"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"UNIDAD DE MEDIDA"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"DESCRIPCION"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"PRECIO UNITARIO"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"DESCUENTO"}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                            {"SUBTOTAL"}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                {items.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    const descuentoItem = toNumber(item.descuento || 0); // Asumiendo que cada ítem puede tener un descuento
                    return (
                        <SPDF.View key={i} style={{ width: "100%", height: 44, flexDirection: "row" }}>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{i + 1}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.Text style={{ ...textStyle, fontSize: 8, alignItems: "center" }}>{parseFloat(cantidad).toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{"unidad"}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 8 }}>
                                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{item.descripcion}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{parseFloat(precio).toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{parseFloat(descuentoItem).toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                                <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{((cantidad * precio) - descuentoItem).toFixed(2)}</SPDF.Text>
                            </SPDF.View>
                        </SPDF.View>
                    );
                })}
                {ComprobanteCarta.subtotales(data)}
            </SPDF.View>
        );
    }
    static subtotales(data) {
        const detalles = data?.detalle || {};
        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }
        const descuento = toNumber(data?.descuento);
        const montoGiftCard = toNumber(data?.monto_gift_card);
        const total = subtotal - descuento - montoGiftCard;
        return (
            <SPDF.View style={{ width: "100%", height: 98, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 6, height: "100%", justifyContent: "center" }}>
                    <SPDF.View style={{ width: "100%", height: "100%" }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, fontWeight: "bold" }}>
                            {"Son: "}{SMath.numberToLetter(total, { p: "", s: "" }).toLowerCase()}{"00/100 Bolivianos"}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: "100%" }}>
                        {ComprobanteCarta.renderTotalesDetalle({ label: "SUBTOTAL Bs", monto: formatCurrency(subtotal) })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "DESCUENTO Bs", monto: formatCurrency(descuento) })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "TOTAL Bs", monto: formatCurrency(total) })}
                        {ComprobanteCarta.renderTotalesDetalle({ label: "MONTO A PAGAR Bs", monto: formatCurrency(total) })}
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }
    static renderTotalesDetalle({ label, monto }) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 16 }}>
                <SPDF.View style={{ flex: 2, height: "100%", borderWidth: 1, alignItems: "center", flexDirection: "row" }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 7, alignItems: "center" }}>{label}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, height: "100%", borderWidth: 1, alignItems: "center", flexDirection: "row" }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 7, alignItems: "center" }}>{monto}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }
    static FooterRecibo(data) {
        const empresa = MDL.empresa.select;
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                    <SPDF.View style={{ flex: 1, height: 50 }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>
                            {"ESTA ORDEN DE COMPRA DOCUMENTA EL PEDIDO REALIZADO. POR FAVOR PROCÉSELA SEGÚN LOS TÉRMINOS ACORDADOS."}
                        </SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>
                            {"PARA CONSULTAS, CONTÁCTENOS EN EL TELÉFONO O CORREO INDICADOS EN EL ENCABEZADO."}
                        </SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>
                            {"\"ESTE DOCUMENTO NO CONSTITUYE UN COMPROBANTE DE PAGO.\""}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: 70, height: 70, justifyContent: "center", alignItems: "center", borderWidth: 1 }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{"QR"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: "100%", alignItems: "center", height: 20 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>Visítenos en www.{validarDato(empresa?.razon_social, 'EMPRESA')}.com</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }
    static firmas() {
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: 100, flexDirection: "row", }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 0.3, borderWidth: 1, }} />
                    <SPDF.Text style={{ ...textStyle }}>AUTORIZADO</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 0.5, borderWidth: 1, }} />
                    <SPDF.Text style={{ ...textStyle }}>Solicitante</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1 }} />
            </SPDF.View>
        );
    }
    render() {
        return (
            <SView onPress={() => ComprobanteCarta.imprimir(this.props.data.key)}>
                <Text>PDF CARTA</Text>
            </SView>
        );
    }
}