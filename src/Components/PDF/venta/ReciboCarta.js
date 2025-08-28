import React, { Component } from 'react';
import { SMath, SView, SText, SDate, SImage } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';
import Model from '../../../Model';
const textStyle = {
    font: "Roboto",
    fontSize: 9,
};
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;
export default class ReciboCarta extends Component {
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
                proveedor = await MDL.inventario.proveedor.getByKey(compraVenta.key_proveedor) || {};
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
        try {

            const data = await MDL.compra_venta.getByKeyComraVenta(key);
            console.log('miralo ', data);

            const dataQR = await ReciboCarta.getQR(data?.key);
            console.log('QR ' + dataQR?.data?.b64);

            // return;
            SPDF.create(
                <SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}>
                    <SPDF.View style={{ width: "100%" }}>
                        {ReciboCarta.HeaderRecibo(data)}
                        {ReciboCarta.espacio()}
                        {ReciboCarta.cliente(data)}
                        {ReciboCarta.espacio()}
                        {ReciboCarta.detalle(data)}
                        {ReciboCarta.espacio()}
                        {ReciboCarta.espacio()}
                        {ReciboCarta.FooterRecibo(dataQR?.data?.b64)}
                        {ReciboCarta.espacio()}
                        {ReciboCarta.pagina()}
                    </SPDF.View>
                </SPDF.Page>
            );

        } catch (error) {
            console.error("Error al generar el recibo:", error);
        }

    }


    static getQR(key) {
        if (!key) {
            return Promise.reject(new Error("Key inválida para generar QR"));
        }
        const content = `https://darmotos.servisofts.com/venta/profile?pk=${encodeURIComponent(key)}`;
        // var content = `https://darmotos.servisofts.com/venta/profile?pk=${key}`;
        return SSocket.sendPromise({
            "service": "sqr",
            "component": "qr",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "image_src": "https://darmotos.servisofts.com/logo512.png",
                "framework": "Rounded",
                "header": "Circle",
                // "colorHeader": "#ffffff",
                // "colorBackground":"#000000",
                "body": "Dot",
                "content": content,
                // "colorBody2": "#80D034",
                // "colorBody": "#80D034",
                "type_color": "solid",
            }
        });
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
                    <SPDF.Image src={SSocket.api.empresa + "empresa/" + empresa?.key} style={{ width: 100, height: 50, }} />
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{validarDato(empresa?.razon_social, 'EMPRESA')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Sucursal: {validarDato(sucursal?.descripcion, 'Sin sucursal')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, alignItems: "center" }}>No. Punto de Venta {validarDato(data?.venta, '1')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>{validarDato(sucursal?.direccion, 'Av. Sur Nro. 0')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Teléfono: {validarDato(sucursal?.telefono, 'Tel: (123) 00000000')}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 2 }} />
                <SPDF.View style={{ flex: 3, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"NIT"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{validarDato(empresa.nit, 'S/N')}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"RECIBO N"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{"812"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"CÓD. AUTORIZACIÓN"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90, alignItems: "center" }}>
                            {"212E5B3D5BB840450741FE54CD25A18FFD7F23D2012D8BDDAEA002F74"}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }
    static cliente(data) {
        const cliente = data?.cliente || {};
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: 80 }}>
                <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 16 }}>{"RECIBO DE VENTA"}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>{"(COMPROBANTE DE PAGO RECIBIDO)"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "100%", height: 12 }} />
                <SPDF.View style={{ width: "100%", alignItems: "center", flexDirection: "row" }}>
                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%", }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"FECHA: "}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {new SDate(data?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy")?.toUpperCase()}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center", }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"COD. CLIENTE:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(cliente?.nit, '6356465-2')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>FORMA DE PAGO:</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato((data?.tipo_pago?.toUpperCase()), 'S/D')}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 3 }} />
                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%", }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"NIT:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}> {validarDato(cliente.nit, '0')}  </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"CLIENTE:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato((cliente?.razon_social?.toUpperCase()), 'S/N')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>TELEFONO:</SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(cliente?.telefono, '+591 00000000')}
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
                {ReciboCarta.subtotales(data)}
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
                        {ReciboCarta.renderTotalesDetalle({ label: "SUBTOTAL Bs", monto: formatCurrency(subtotal) })}
                        {ReciboCarta.renderTotalesDetalle({ label: "DESCUENTO Bs", monto: formatCurrency(descuento) })}
                        {ReciboCarta.renderTotalesDetalle({ label: "TOTAL Bs", monto: formatCurrency(total) })}
                        {ReciboCarta.renderTotalesDetalle({ label: "MONTO GIFT CARD Bs", monto: formatCurrency(montoGiftCard) })}
                        {ReciboCarta.renderTotalesDetalle({ label: "MONTO A PAGAR Bs", monto: formatCurrency(total) })}
                        {ReciboCarta.renderTotalesDetalle({ label: "IMPORTE BASE CRÉDITO FISCAL Bs", monto: formatCurrency(total) })}
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
    static FooterRecibo(qr) {
        const empresa = MDL.empresa.select;
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                    <SPDF.View style={{ flex: 1, height: 50 }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>
                            {"ESTE RECIBO CONFIRMA EL PAGO RECIBIDO."}
                        </SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>
                            {"Este documento constituye únicamente una constancia de la operación efectuada entre las partes"}
                        </SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>
                            {"\"Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de registro en línea\""}
                        </SPDF.Text>
                    </SPDF.View>

                    <SPDF.Image src={`data:image/png;base64,${qr}`} style={{ width: 70, height: 70, }} />
                  
                </SPDF.View>
                <SPDF.View style={{ width: "100%", alignItems: "center", height: 40 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>¡Gracias por su compra!</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>Guarde este recibo para devoluciones.</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>Visítenos en www.{validarDato(empresa?.razon_social, 'EMPRESA')}.com</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }
    static pagina() {
        return (
            <SPDF.View style={{ width: "100%", height: 20, alignItems: "center", bottom: 0 }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>1/1</SPDF.Text>
            </SPDF.View>
        );
    }
    render() {
        return (
            <SView onPress={() => ReciboCarta.imprimir(this.props.data?.key)}>
                <Text>PDF CARTA</Text>
            </SView>
        );
    }
}