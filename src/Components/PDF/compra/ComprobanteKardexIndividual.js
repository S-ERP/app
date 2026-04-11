import React, { Component } from 'react';
import { SMath, SView, SText, SDate, SPopup } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';

const textStyle = { font: "Roboto", fontSize: 9 };
const headerStyle = { font: "Roboto", fontSize: 12, fontWeight: "bold" };
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
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

            const [ventas, cliente] = await Promise.all([
                MDL.compra_venta.execute_function("_get_detalles_bycliente4", [keyEmpresa, keyCliente, fecha_inicio_real, fecha_fin_real]),
                MDL.crm.cliente.getByKey(keyCliente),
            ]);

            if (!ventas || ventas.length === 0) {
                SPopup.alert("No hay ventas para este cliente en el rango de fechas.");
                return [];
            }

            const [empresa, usuarios = [], almacenes = []] = await Promise.all([
                MDL.empresa.getFull(),
                MDL.usuario.getByKeys([...new Set(ventas.map(v => v?.key_usuario).filter(Boolean))]),
                MDL.inventario.getAllAlmacen()
            ]);

            let saldoAcumulado = 0;
            const ventasEnriquecidas = ventas.map(v => {
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

            const moneda = ventasEnriquecidas[0]?.moneda || empresa.monedas[0] || {};
            if (saldoAnterior !== 0) {
                ventasFiltradas = [
                    {
                        key: '001',
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

            SPDF.create(
                <SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}
                    footer={ComprobanteKardexIndividual.pagina()}
                >
                    {ComprobanteKardexIndividual.HeaderRecibo(compraVentaData)}
                    {ComprobanteKardexIndividual.espacio()}
                    {ComprobanteKardexIndividual.TituloKardex(compraVentaData)}
                    {ComprobanteKardexIndividual.espacio()}
                    {ComprobanteKardexIndividual.proveedor(compraVentaData)}
                    {ComprobanteKardexIndividual.espacio()}
                    {ComprobanteKardexIndividual.detalleHeader()}
                    {ComprobanteKardexIndividual.espacio()}
                    {ComprobanteKardexIndividual.detalleBody(compraVentaData)}
                    {ComprobanteKardexIndividual.espacio()}
                    {ComprobanteKardexIndividual.detalleFooter(compraVentaData)}
                </SPDF.Page>
            );
        } catch (error) {
            console.error("Error en ComprobanteKardexIndividual.imprimir:", error);
            SPopup.alert("Error al cargar los datos del Kardex.");
            return [];
        }
    }


    static espacio() {
        return <SPDF.View style={{ width: "100%", height: 8 }} />;
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
            <SPDF.View style={{ width: "100%", alignItems: "center", }}>
                <SPDF.Text style={{ ...headerStyle }}>KARDEX INDIVIDUAL</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 9 }}>Del {fechaInicio} al {fechaFin}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 9 }}>Expresado en {data?.moneda?.descripcion || 'Bs.'}</SPDF.Text>
            </SPDF.View>
        );
    }


    static proveedor(data) {
        const cliente = data?.cliente || {};
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row" }}>
                <SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold" }}>Deudor: </SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontSize: 10 }}> {validarDato(cliente?.nombres, '')} {validarDato(cliente?.apellidos, '')} </SPDF.Text>
            </SPDF.View>
        );
    }

    static renderHeaderCell(label, width, textAlign = "center", isLast = false) {
        return (
            <SPDF.View
                style={{
                    width,
                    height: "100%",
                    padding: 1,
                    borderRightWidth: isLast ? 0 : 1, // 👈 evitar doble borde al final
                    borderColor: "#7F7F7F",
                }}
            >
                <SPDF.View
                    style={{
                        width: "100%",
                        height: "100%",
                        borderWidth: 1,
                        borderColor: "#9A9A9A",
                        justifyContent: "center",
                    }}
                >
                    <SPDF.Text
                        style={{
                            ...textStyle,
                            width: "100%",
                            fontSize: 8,
                            fontWeight: "bold",
                            textAlign,
                        }}
                    >
                        {label}
                    </SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static detalleHeader() {
        return (
   

            <SPDF.View style={{ width: "100%", height: 18, flexDirection: "row", backgroundColor: "#D0D0D0" }}>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                        {"Fecha"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                        {"Tipo"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                        {"Nro"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                        {"Detalle"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                        {"Debe"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center" }}>
                        {"Haber"}
                    </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", textAlign: "right" }} >
                        {"Saldo"}
                    </SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }
  


    static detalleBody(data) {
        const items = data?.detalle || [];
        return items.map((item, i) => {
            const debeValue = toNumber(item?.debe);
            const haberValue = toNumber(item?.haber);
            const saldoValue = toNumber(item?.saldo);
            const debe = SMath.formatMoney(debeValue);
            const haber = SMath.formatMoney(haberValue);
            const saldo = SMath.formatMoney(saldoValue);
            const fecha = item?.fecha_on ? new SDate(item.fecha_on).toString("dd/MM/yyyy") : "";
            const isSaldoAnterior = item?.tipo === "saldo";
            const fechaText = isSaldoAnterior ? "" : fecha;
            const tipoText = isSaldoAnterior ? "" : (item?.tipo || "");
            const nroText = isSaldoAnterior ? "" : (item?.key || "");
            const debeText = isSaldoAnterior ? "" : debe;
            const haberText = isSaldoAnterior ? "" : haber;
            return (<SPDF.View style={{ width: "100%", height: 22, flexDirection: "row", }}>

                <SPDF.View
                    key={i}
                    style={{
                        width: "100%",
                        height: 18,
                        flexDirection: "row",
                        // backgroundColor: "#0e8ee4",
                        // borderBottomWidth: 2,
                        borderColor: "#7F7F7F",
                        borderStyle: "dashed"
                    }}
                >
                    <SPDF.View style={{ width: tableCols.fecha, height: "100%", justifyContent: "center" }}> {fechaText ? <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 7, textAlign: "center" }}>{fechaText}</SPDF.Text> : null} </SPDF.View>
                    <SPDF.View style={{ width: tableCols.tipo, height: "100%", justifyContent: "center" }}> {tipoText ? <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 7, textAlign: "center" }}>{tipoText}</SPDF.Text> : null} </SPDF.View>
                    <SPDF.View style={{ width: tableCols.nro, height: "100%", justifyContent: "center" }}> {nroText ? <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 7, textAlign: "center" }}>{nroText}</SPDF.Text> : null} </SPDF.View>
                    <SPDF.View style={{ width: tableCols.detalle, height: "100%", justifyContent: "center", paddingHorizontal: 3 }}> <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 7 }}>{item?.descripcion || (isSaldoAnterior ? "Saldo anterior" : "")}</SPDF.Text> </SPDF.View>
                    <SPDF.View style={{ width: tableCols.debe, height: "100%", justifyContent: "center", paddingHorizontal: 3 }}> {debeValue >= 1 ? <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 7, textAlign: "right" }}>{debeText}</SPDF.Text> : null} </SPDF.View>
                    <SPDF.View style={{ width: tableCols.haber, height: "100%", justifyContent: "center", paddingHorizontal: 3 }}> {haberValue >= 1 ? <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 7, textAlign: "right" }}>{haberText}</SPDF.Text> : null} </SPDF.View>
                    <SPDF.View style={{ width: tableCols.saldo, height: "100%", justifyContent: "center", paddingHorizontal: 3 }}>   <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 7, textAlign: "right" }}>{saldo}</SPDF.Text>  </SPDF.View>
                </SPDF.View>

                {/* <SPDF.Text style={{ width: '100%', fontSize: 2 }}>
                    <SPDF.Text style={{ width: '100%', fontSize: 14, fontWeight: 'bold' }}>
                        {'- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'}
                    </SPDF.Text>
                    {'.....................................................................................................................'}
                </SPDF.Text> */}
            </SPDF.View>
            );
        });
    }

    static detalleFooter(data) {
        return (
            <SPDF.View style={{ width: "100%" }}>
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

        const lastItem = items[items.length - 1] || {};
        saldoFinal = toNumber(lastItem.saldo);

        return (
            <SPDF.View style={{ width: "100%", height: 22, flexDirection: "row", }}>
                <SPDF.View style={{ width: tableCols.fecha + tableCols.tipo + tableCols.nro + tableCols.detalle, height: "100%", justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}>Totales Bs. :</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: tableCols.debe, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}>{SMath.formatMoney(totalDebe)}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: tableCols.haber, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}>{SMath.formatMoney(totalHaber)}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: tableCols.saldo, height: "100%", justifyContent: "center", paddingHorizontal: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", textAlign: "right" }}>{SMath.formatMoney(saldoFinal)}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
        );
    }

    static pagina() {
        const fechaPie = new SDate().toString("dd/MM/yyyy");
        return (
            <SPDF.View style={{ width: "100%", height: 16, borderWidth: 1, borderColor: "#7F7F7F", padding: 2 }} >
                <SPDF.View style={{ width: "100%", height: "100%", borderWidth: 1, borderColor: "#7F7F7F", flexDirection: "row", alignItems: "center", paddingHorizontal: 8, }} >
                    <SPDF.View style={{ width: 8, height: "100%", }} />
                    <SPDF.Text style={{ ...textStyle, fontSize: 7, paddingLeft: 4 }}> {fechaPie} </SPDF.Text>
                    <SPDF.View style={{ flex: 1 }} />
                    <SPDF.Text style={{ ...textStyle, fontSize: 7, paddingRight: 4 }}> Pag. 1 </SPDF.Text>
                    <SPDF.View style={{ width: 8, height: "100%", }} />
                </SPDF.View>
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