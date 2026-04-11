import React, { Component } from 'react';
import { SMath, SView, SText, SDate, SImage, SPopup } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';

const textStyle = { font: "Roboto", fontSize: 9 };
const headerStyle = { font: "Roboto", fontSize: 12, fontWeight: "bold" };
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;
const formatFechaES = (fecha) => {
    if (!fecha) return "";
    return new SDate(fecha).toString("dd/MM/yyyy");
};
const tableCols = {
    fecha: 60,
    tipo: 40,
    nro: 40,
    detalle: 238,
    debe: 60,
    haber: 60,
    saldo: 60,
};

export default class ComprobanteKardexIndividual extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fecha_inicio: new SDate().toString("yyyy-MM-dd"),
            fecha_fin: new SDate().toString("yyyy-MM-dd"),
            saldo: 0,
        };
    }



    static async imprimir(keyCliente, fechaInicio = null, fechaFin = null) {
        try {
            const keyEmpresa = MDL?.empresa?.select?.key;
            if (!keyEmpresa || !keyCliente) {
                SPopup.alert("No se encontró la empresa o el cliente.");
                return;
            }

            // Fechas por defecto
            const fecha_inicio_real = fechaInicio || new SDate().toString("yyyy-MM-dd");
            const fecha_fin_real = fechaFin || new SDate().toString("yyyy-MM-dd");

            console.clear();
            console.log("%c" + fecha_inicio_real, `color: #2ECC40; font-weight: bold;`);
            console.log("%c" + fecha_fin_real, `color: #2ECC40; font-weight: bold;`);

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


            // MDL.sucursales
            // MDL.usuario.session.

            // MDL.usuario.session?.key,
            // Enriquecer ventas
            let saldoAcumulado = 0;
            let ventasEnriquecidas = ventas.map(v => {
                const debe = v.debe || 0;
                const haber = v.haber || 0;
                saldoAcumulado += (debe - haber);
                return {
                    ...v,
                    saldo: saldoAcumulado
                };
            });

            // Calcular saldo anterior
            let saldoAnterior = 0;
            ventasEnriquecidas.forEach(item => {
                const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
                if (fechaItem < fecha_inicio_real) {
                    saldoAnterior = item.saldo;
                }
            });

            // Filtrar ventas por rango de fechas
            let ventasFiltradas = ventasEnriquecidas.filter(item => {
                const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
                return fechaItem >= fecha_inicio_real && fechaItem <= fecha_fin_real;
            });

            // Agregar saldo anterior si existe
            const moneda = ventasEnriquecidas[0]?.moneda || empresa.monedas[0] || {};
            if (saldoAnterior !== 0) {
                ventasFiltradas = [
                    {
                        key: `saldo_anterior_${new Date().getTime()}`,
                        fecha_on: "",
                        tipo: "saldo",
                        descripcion: "Saldo anterior",
                        debe: 0,
                        haber: 0,
                        saldo: saldoAnterior,
                        moneda,
                        sucursal: {},
                        usuario: {},
                        almacen: {},
                        cliente: cliente || {}
                    },
                    ...ventasFiltradas
                ];
            }

            const compraVentaData = {
                cliente: cliente || {},
                empresa: empresa || {},
                moneda: empresa.monedas[0] || {},
                detalle: [...ventasFiltradas],
                fecha_inicio: fecha_inicio_real,
                fecha_fin: fecha_fin_real
            };
            // console.clear();
            // console.log("%c" + JSON.stringify(empresa, null, 2), "color: #e6c510; font-weight: bold;");
            // console.log("%c" + JSON.stringify(compraVentaData, null, 2), "color: #e6c510; font-weight: bold;");


            //    {
            //         key: 'PINT-001',
            //         descripcion: 'Bote de Pintura Acrílica, Blanco Mate, 5 Litros',
            //         cantidad: 1,
            //         precio_unitario: 25.0,
            //     },

            SPDF.create(
                <SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}>
                    <SPDF.View style={{ width: "100%" }}>
                        {ComprobanteKardexIndividual.HeaderRecibo(compraVentaData)}
                        {ComprobanteKardexIndividual.espacio()}
                        {ComprobanteKardexIndividual.TituloKardex(compraVentaData)}
                        {ComprobanteKardexIndividual.proveedor(compraVentaData)}
                        {ComprobanteKardexIndividual.espacio()}
                        {ComprobanteKardexIndividual.detalle(compraVentaData)}
                        {ComprobanteKardexIndividual.espacio()}
                        <SPDF.View style={{ width: '100%', height: 16 }} />

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
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>Empresa: {validarDato(data?.empresa?.razon_social, 'MI EMPRESA')}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle }}>Sucursal: {validarDato(data?.sucursal?.descripcion, 'Mi Sucursal')}</SPDF.Text>
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



    static TituloKardex(data) {
        const fechaInicio = formatFechaES(data?.fecha_inicio);
        const fechaFin = formatFechaES(data?.fecha_fin);
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", marginBottom: 12 }}>
                <SPDF.Text style={{ ...headerStyle }}>KARDEX INDIVIDUAL</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 9 }}>Del {fechaInicio} al {fechaFin}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 9 }}>Expresado en {data?.moneda?.descripcion || 'Bs.'}</SPDF.Text>
            </SPDF.View>
        );
    }


    static proveedor(data) {
        const cliente = data?.cliente || {};
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1, alignItems: "center", height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold" }}>Deudor: </SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10 }}>
                            {validarDato(cliente?.nombres, '')} {validarDato(cliente?.apellidos, '')}
                        </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", height: 8 }} />
                    <SPDF.View style={{ width: "100%", height: 1, backgroundColor: "#666" }} />
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalle(data) {
        const items = data?.detalle || [];
        return (
            <SPDF.View style={{ width: "100%" }}>
                <SPDF.View style={{ width: "100%", height: 22, flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                    <SPDF.View style={{ width: tableCols.fecha, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}> {"FECHA"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ width: tableCols.tipo, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}> {"TIPO"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ width: tableCols.nro, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "center" }}> {"NRO"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ width: tableCols.detalle, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold" }}> {"DESCRIPCION"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ width: tableCols.debe, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}> {"DEBE"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ width: tableCols.haber, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}> {"HABER"} </SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ width: tableCols.saldo, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}> {"SALDO"} </SPDF.Text> </SPDF.View>
                </SPDF.View>
                {items.map((item, i) => {
                    const debe = SMath.formatMoney(item.debe);
                    const haber = SMath.formatMoney(item.haber);
                    const saldo = SMath.formatMoney(item.saldo);
                    const fecha = item?.fecha_on ? new SDate(item.fecha_on).toString("dd/MM/yyyy") : "";
                    const isSaldoAnterior = item?.tipo === "saldo";

                    return (
                        <SPDF.View key={i} style={{ width: "100%", height: 20, flexDirection: "row", backgroundColor: isSaldoAnterior ? "#eef6ff" : "white" }}>
                            <SPDF.View style={{ width: tableCols.fecha, borderWidth: 1, height: "100%", justifyContent: "center" }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "center" }}>{fecha}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ width: tableCols.tipo, borderWidth: 1, height: "100%", justifyContent: "center" }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "center" }}>{item?.tipo || "-"}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ width: tableCols.nro, borderWidth: 1, height: "100%", justifyContent: "center" }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "center" }}>{i + 1}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ width: tableCols.detalle, borderWidth: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8 }}>{item?.descripcion || "-"}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ width: tableCols.debe, borderWidth: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "right" }}>{debe}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ width: tableCols.haber, borderWidth: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "right" }}>{haber}</SPDF.Text> </SPDF.View>
                            <SPDF.View style={{ width: tableCols.saldo, borderWidth: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, textAlign: "right", fontWeight: "bold" }}>{saldo}</SPDF.Text> </SPDF.View>
                        </SPDF.View>
                    );
                })}
                {ComprobanteKardexIndividual.subtotales(data)}
            </SPDF.View>
        );
    }

    static subtotales(data) {
        const items = data?.detalle || [];
        let totalDebe = 0;
        let totalHaber = 0;
        let saldoFinal = 0;

        items.forEach(item => {
            if (item.tipo !== "saldo") {
                totalDebe += toNumber(item.debe);
                totalHaber += toNumber(item.haber);
            }
        });

        const lastItem = items[items.length - 1];
        saldoFinal = toNumber(lastItem?.saldo);

        return (
            <SPDF.View style={{ width: "100%", marginTop: 2 }}>
                <SPDF.View style={{ width: "100%", height: 22, flexDirection: "row", backgroundColor: "#F3F3F3" }}>
                    <SPDF.View style={{ width: tableCols.fecha, borderWidth: 1, height: "100%" }} />
                    <SPDF.View style={{ width: tableCols.tipo, borderWidth: 1, height: "100%" }} />
                    <SPDF.View style={{ width: tableCols.nro, borderWidth: 1, height: "100%" }} />
                    <SPDF.View style={{ width: tableCols.detalle, borderWidth: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold" }}>TOTALES</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: tableCols.debe, borderWidth: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}>{SMath.formatMoney(totalDebe)}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: tableCols.haber, borderWidth: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}>{SMath.formatMoney(totalHaber)}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: tableCols.saldo, borderWidth: 1, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}>{SMath.formatMoney(saldoFinal)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                {/* <SPDF.View style={{ width: "100%", marginTop: 8 }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 9, fontWeight: "bold" }}>
                        {"Son: "}{SMath.numberToLetter(saldoFinal, { p: "", s: "" }).toLowerCase()}{" 00/100 Bolivianos"}
                    </SPDF.Text>
                </SPDF.View> */}
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