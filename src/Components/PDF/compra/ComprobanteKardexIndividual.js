import React, { Component } from 'react';
import { SMath, SView, SText, SDate, SImage, SPopup } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';

const textStyle = { font: "Roboto", fontSize: 9 };
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;

export default class ComprobanteKardexIndividual extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }



    static async imprimir(keyCliente, fechaInicio = null, fechaFin = null) {
        try {
            const keyEmpresa = MDL?.empresa?.select?.key;
            if (!keyEmpresa || !keyCliente) {
                SPopup.alert("No se encontró la empresa o el cliente.");
                return;
            }

            // Fechas por defecto
            // const fecha_inicio_total = "2024-01-01";
            const fecha_inicio_real = fechaInicio || new SDate().toString("yyyy-MM-dd");
            const fecha_fin_real = fechaFin || new SDate().toString("yyyy-MM-dd");

            // Obtener datos del cliente y sus ventas
            const [ventas, cliente, cuotas] = await Promise.all([
                MDL.compra_venta.execute_function("_get_detalles_bycliente4", [keyEmpresa, keyCliente, fecha_inicio_real, fecha_fin_real]),
                MDL.crm.cliente.getByKey(keyCliente),
                MDL.compra_venta.execute_function("_get_cuotas_pendientes", [keyEmpresa, keyCliente])
            ]);

            if (!ventas || ventas.length === 0) {
                SPopup.alert("No hay ventas para este cliente en el rango de fechas.");
                return [];
            }

            // Obtener datos relacionados
            const [empresa, usuarios = [], almacenes = []] = await Promise.all([
                MDL.empresa.getFull(),
                MDL.usuario.getByKeys([...new Set(ventas.map(v => v?.key_usuario).filter(Boolean))]),
                MDL.inventario.getAllAlmacen()
            ]);

            // Mapas de referencia
            const sucursalesMap = Object.fromEntries((empresa?.sucursales || []).map(s => [s.key, s]));
            const monedasMap = Object.fromEntries((empresa?.monedas || []).map(m => [m.key, m]));
            const usuariosMap = Object.fromEntries((usuarios || []).map(u => [u.key, u]));
            const almacenesMap = Object.fromEntries((almacenes || []).map(a => [a.key, a]));

            // Enriquecer ventas
            let saldoAcumulado = 0;
            let ventasEnriquecidas = ventas.map(v => {
                const debe = v.debe || 0;
                const haber = v.haber || 0;
                saldoAcumulado += (debe - haber);
                return {
                    ...v,
                    moneda: monedasMap[v?.key_moneda] || {},
                    sucursal: sucursalesMap[v?.key_sucursal] || {},
                    usuario: usuariosMap[v?.key_usuario] || {},
                    almacen: almacenesMap[v?.key_almacen] || {},
                    cliente: cliente || {},
                    saldo: saldoAcumulado
                };
            });

            //    {
            //         key: 'PINT-001',
            //         descripcion: 'Bote de Pintura Acrílica, Blanco Mate, 5 Litros',
            //         cantidad: 1,
            //         precio_unitario: 25.0,
            //     },

            SPDF.create(
                <SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}>
                    <SPDF.View style={{ width: "100%" }}>
                        {/* {ComprobanteKardexIndividual.HeaderRecibo(ventasEnriquecidas)} */}
                        {ComprobanteKardexIndividual.espacio()}
                        {/* {ComprobanteKardexIndividual.proveedor(ventasEnriquecidas)} */}
                        {ComprobanteKardexIndividual.espacio()}
                        {ComprobanteKardexIndividual.detalle(ventasEnriquecidas)}
                        {ComprobanteKardexIndividual.espacio()}
                        <SPDF.View style={{ width: '100%', height: 70 }}></SPDF.View>.
                        {ComprobanteKardexIndividual.firmas()}
                        {ComprobanteKardexIndividual.espacio()}
                        {/* {ComprobanteKardexIndividual.FooterRecibo(dataQR?.data?.b64, data)} */}
                        {ComprobanteKardexIndividual.espacio()}
                        {ComprobanteKardexIndividual.pagina()}
                    </SPDF.View>
                </SPDF.Page>
            );

            // Aquí iría la lógica para generar el PDF o imprimir
            // console.log("Ventas filtradas para imprimir:", ventasEnriquecidas);
            // SPopup.alert("Kardex generado correctamente. (Revisa consola para datos)");

            // return ventasEnriquecidas;

        } catch (error) {
            console.error("Error en ComprobanteKardexIndividual.imprimir:", error);
            SPopup.alert("Error al cargar los datos del Kardex.");
            return [];
        }
    }

    static getQR(key) {
        if (!key) {
            return Promise.reject(new Error("Key inválida para generar QR"));
        }
        const content = `https://darmotos.servisofts.com/venta/profile?pk=${encodeURIComponent(key)}`;
        return SSocket.sendPromise({
            "service": "sqr",
            "component": "qr",
            "type": "registro",
            "estado": "cargando",
            "data": {
                "image_src": "https://darmotos.servisofts.com/logo512.png",
                "framework": "Rounded",
                "header": "Circle",
                "body": "Dot",
                "content": content,
                "type_color": "solid",
            }
        });
    }

    static espacio() {
        return <SPDF.View style={{ width: "100%", height: 16 }} />;
    }

    static HeaderRecibo(data) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 110, alignItems: "center" }}>
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.Image src={`${SSocket.api.empresa}empresa/${data?.empresa?.key}`} style={{ width: 100, height: 50 }} />
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{validarDato(data?.empresa?.razon_social, 'MI EMPRESA')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Sucursal: {validarDato(data?.sucursal?.descripcion, 'Mi Sucursal')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, alignItems: "center" }}>No. Punto de Venta {validarDato(data?.venta, '1')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>{validarDato(data?.sucursal?.direccion, 'Av. Sur Nro. 0')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Teléfono: {validarDato(data?.sucursal?.telefono, 'Tel: (123) 00000000')}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 2 }} />
                <SPDF.View style={{ flex: 3, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"NIT"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{validarDato(data?.empresa?.nit, 'S/N')}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"ORDEN NRO."}</SPDF.Text>
                        <SPDF.View style={{ flex: 1 }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{validarDato(data?.numero_recibo, '001-001-000001')}</SPDF.Text>
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


                    <SPDF.View style={{ flex: 1, alignItems: "center", height: "100%" }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"FECHA: "}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {new SDate(data?.fecha_on, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy")?.toUpperCase() || 'Sin fecha'}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"COD. PROVEEDOR:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.codigo, '0001')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"FORMA DE PAGO:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(data?.tipo_pago?.toUpperCase(), 'S/D')}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                    <SPDF.View style={{ flex: 3 }} />
                    <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%" }}>
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 95, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"NIT:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.nit, '0')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 95, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"PROVEEDOR:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.razon_social?.toUpperCase(), 'S/N')}
                            </SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ height: 4 }} />
                        <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                            <SPDF.Text style={{ ...textStyle, width: 95, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>
                                {"CONTACTO:"}
                            </SPDF.Text>
                            <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>
                                {validarDato(proveedor?.telefono, '+591 00000000')}
                            </SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalle(data) {
        const detalles = data?.detalle || {};
        const items = data
        // const items = Object.values(detalles).length
        // ? Object.values(detalles)
        // : [
        //     {
        //         key: 'PINT-001',
        //         descripcion: 'Bote de Pintura Acrílica, Blanco Mate, 5 Litros',
        //         cantidad: 1,
        //         precio_unitario: 25.0,
        //     },
        // ];

        console.clear();
        console.log("%c" + JSON.stringify(data, null, 2), "color: #ab14e7; font-weight: bold;");
        return (
            <SPDF.View style={{ width: "100%" }}>
                <SPDF.View style={{ width: "100%", height: 22, flexDirection: "row", backgroundColor: "#D0D0D0" }}>

                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}> {"FECHA"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}> {"TIPO"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}> {"NRO"} </SPDF.Text> </SPDF.View>

                    <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}> {"DESCRIPCION"} </SPDF.Text> </SPDF.View>

                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}> {"DEBE"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}> {"HABER"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}> {"SALDO"} </SPDF.Text> </SPDF.View>


                </SPDF.View>
                {items.map((item, i) => {
                    const debe = toNumber(item.debe);
                    const haber = toNumber(item.haber);
                    const saldo = toNumber(item.saldo);
                    const fecha = new SDate(item.fecha_on).toString("yyyy-MM-dd");

                    return (
                        <SPDF.View key={i} style={{ width: "100%", height: 20, flexDirection: "row" }}>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{fecha}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{"cuota"}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{item.key || (i + 1)}</SPDF.Text> </SPDF.View>

                            <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, alignItems: "center" }}>{item.descripcion}</SPDF.Text> </SPDF.View>

                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}> <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{SMath.formatMoney(debe)}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}> <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{parseFloat(haber).toFixed(2)}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}> <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>{parseFloat(saldo).toFixed(2)}</SPDF.Text> </SPDF.View>
                        </SPDF.View>
                    );
                })}
                {ComprobanteKardexIndividual.subtotales(data)}
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
        const montoPagado = toNumber(data?.monto_pagado);
        const cambio = montoPagado - total;
        return (
            <SPDF.View style={{ width: "100%", height: 120, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 6, height: "100%", justifyContent: "center" }}>
                    <SPDF.View style={{ width: "100%", height: "100%" }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, fontWeight: "bold" }}>
                            {"Son: "}{SMath.numberToLetter(total, { p: "", s: "" }).toLowerCase()}{"00/100 Bolivianos"}
                        </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: "100%" }}>
                        {ComprobanteKardexIndividual.renderTotalesDetalle({ label: "SUBTOTAL Bs", monto: formatCurrency(subtotal) })}
                        {ComprobanteKardexIndividual.renderTotalesDetalle({ label: "DESCUENTO Bs", monto: formatCurrency(descuento) })}
                        {ComprobanteKardexIndividual.renderTotalesDetalle({ label: "MONTO GIFT CARD Bs", monto: formatCurrency(montoGiftCard) })}
                        {ComprobanteKardexIndividual.renderTotalesDetalle({ label: "TOTAL Bs", monto: formatCurrency(total) })}
                        {ComprobanteKardexIndividual.renderTotalesDetalle({ label: "MONTO A PAGAR Bs", monto: formatCurrency(total) })}
                        {ComprobanteKardexIndividual.renderTotalesDetalle({ label: "MONTO PAGADO Bs", monto: formatCurrency(montoPagado) })}
                        {ComprobanteKardexIndividual.renderTotalesDetalle({ label: "CAMBIO Bs", monto: formatCurrency(cambio >= 0 ? cambio : 0) })}
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static renderTotalesDetalle({ label, monto }) {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", height: 15 }}>
                <SPDF.View style={{ flex: 2, height: "100%", borderWidth: 1, alignItems: "center", flexDirection: "row" }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 7, alignItems: "center" }}>{label}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, height: "100%", borderWidth: 1, alignItems: "center", flexDirection: "row" }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 7, alignItems: "center" }}>{monto}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static FooterRecibo(qr, data) {
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
                    {qr ? (
                        <SPDF.Image src={`data:image/png;base64,${qr}`} style={{ width: 70, height: 70 }} />
                    ) : (
                        <SPDF.Text style={{ ...textStyle, fontSize: 8, color: 'red' }}>{"QR no disponible"}</SPDF.Text>
                    )}
                </SPDF.View>
                <SPDF.View style={{ width: "100%", alignItems: "center", height: 40 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8 }}>Visítenos en www.{validarDato(data?.empresa?.razon_social, 'EMPRESA')}.com</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static firmas() {
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", height: 100, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 0.3, borderWidth: 1 }} />
                    <SPDF.Text style={{ ...textStyle }}>AUTORIZADO</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.View style={{ flex: 3, alignItems: "center" }}>
                    <SPDF.View style={{ width: "100%", height: 0.3, borderWidth: 1 }} />
                    <SPDF.Text style={{ ...textStyle }}>SOLICITANTE</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1 }} />
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
            <SView onPress={() => ComprobanteKardexIndividual.imprimir(this.props.data?.key)}>
                <SText>PDF CARTA</SText>
            </SView>
        );
    }
}