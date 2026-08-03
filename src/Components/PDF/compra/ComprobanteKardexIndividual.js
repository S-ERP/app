import React, { Component } from 'react';
import { SMath, SDate, SPopup } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf';
import SSocket from 'servisofts-socket';
import MDL from '../../../MDL';

const textStyle = { font: "Roboto", fontSize: 9 };
const headerStyle = { font: "Roboto", fontSize: 12, fontWeight: "bold" };
const borderColorProfessional = "#B5B5B5";
const colorPrincipal = "#1a3c66";
const colorBorderLight = "#E5E7EB";
const colorTextMuted = "#6B7280";
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const toUpper = (value, fallback = '') => validarDato(value, fallback).toString().toUpperCase();
const formatMontoPDF = (moneda, value) => {
	const sim = (moneda?.observacion || 'Bs').toString();
	const fmt = SMath.formatMoney(value || 0, 2);
	return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
};
const formatFechaES = (fecha) => {
	if (!fecha) return "";
	return new SDate(fecha).toString("dd/MM/yyyy");
};
const tableCols = {
	fecha: 60,
	tipo: 40,
	detalle: 238,
	debe: 60,
	haber: 60,
	saldo: 60,
};

export default class ComprobanteKardexIndividual extends Component {
	static async imprimir({ cliente, moneda, detalle, fecha_inicio, fecha_fin, tipo }) {
		try {
			if (!cliente || !detalle || detalle.length === 0) {
				SPopup.alert("NO HAY REGISTROS PARA EL RANGO DE FECHAS SELECCIONADO.");
				return [];
			}

			const fecha_inicio_real = fecha_inicio || new SDate().toString("yyyy-MM-dd");
			const fecha_fin_real = fecha_fin || new SDate().toString("yyyy-MM-dd");

			const empresa = await MDL.empresa.getFull();

			const compraVentaData = {
				cliente: cliente || {},
				empresa: empresa || {},
				moneda,
				detalle: [...detalle],
				fecha_inicio: fecha_inicio_real,
				fecha_fin: fecha_fin_real,
				tipo
			};

			SPDF.create(
				<SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}
					footer={ComprobanteKardexIndividual.pagina(compraVentaData)}
				>
					{ComprobanteKardexIndividual.HeaderRecibo(compraVentaData)}
					{ComprobanteKardexIndividual.espacio()}
					{ComprobanteKardexIndividual.TituloKardex(compraVentaData)}
					{ComprobanteKardexIndividual.espacio()}
					{ComprobanteKardexIndividual.proveedor(compraVentaData)}
					{ComprobanteKardexIndividual.espacio()}
					{ComprobanteKardexIndividual.detalleHeader()}
					{ComprobanteKardexIndividual.detalleBody(compraVentaData)}
					{ComprobanteKardexIndividual.detalleFooter(compraVentaData)}
				</SPDF.Page>
			);
		} catch (error) {
			console.warn("Error en ComprobanteKardexIndividual.imprimir:", error);
			SPopup.alert("ERROR AL CARGAR LOS DATOS DEL KARDEX.");
			return [];
		}
	}

	static espacio() {
		return <SPDF.View style={{ width: "100%", height: 8 }} />;
	}

	static HeaderRecibo(data) {
		return (
			<SPDF.View style={{ width: "100%", flexDirection: "row", height: 85, alignItems: "center" }}>
				<SPDF.View style={{ flex: 3, alignItems: "center" }}>
					<SPDF.Image src={`${SSocket.api.empresa}empresa/${data?.empresa?.key}`} style={{ width: 100, height: 50 }} />
					<SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>EMPRESA: {toUpper(data?.empresa?.razon_social, 'MI EMPRESA')}</SPDF.Text>
					<SPDF.Text style={{ ...textStyle }}>SUCURSAL: {toUpper(data?.sucursal?.descripcion, 'MI SUCURSAL')}</SPDF.Text>
					<SPDF.Text style={{ ...textStyle }}>TELEFONO: {toUpper(data?.sucursal?.telefono, 'TEL: (123) 00000000')}</SPDF.Text>
				</SPDF.View>
				<SPDF.View style={{ flex: 2 }} />
				<SPDF.View style={{ flex: 3, height: "100%" }}>
					<SPDF.View style={{ width: "100%", flexDirection: "row" }}>
						<SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"NIT"}</SPDF.Text>
						<SPDF.View style={{ flex: 1 }} />
						<SPDF.Text style={{ ...textStyle, width: 90 }}>{toUpper(data?.empresa?.nit, 'S/N')}</SPDF.Text>
					</SPDF.View>
					<SPDF.View style={{ width: "100%", flexDirection: "row" }}>
						<SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"ORDEN NRO."}</SPDF.Text>
						<SPDF.View style={{ flex: 1 }} />
						<SPDF.Text style={{ ...textStyle, width: 90 }}>{toUpper(data?.numero_recibo, '001-001-000001')}</SPDF.Text>
					</SPDF.View>
				</SPDF.View>
			</SPDF.View>
		);
	}

	static TituloKardex(data) {
		const fechaInicio = formatFechaES(data?.fecha_inicio);
		const fechaFin = formatFechaES(data?.fecha_fin);
		return (
			<SPDF.View style={{ width: "100%", alignItems: "center" }}>
				<SPDF.Text style={{ ...headerStyle }}>KARDEX INDIVIDUAL</SPDF.Text>
				<SPDF.Text style={{ ...textStyle, fontSize: 9 }}>DEL {fechaInicio} AL {fechaFin}</SPDF.Text>
				<SPDF.Text style={{ ...textStyle, fontSize: 9 }}>EXPRESADO EN {toUpper(data?.moneda?.descripcion, 'BS.')}</SPDF.Text>
			</SPDF.View>
		);
	}

	static proveedor(data) {
		const cliente = data?.cliente || {};
		const etiqueta = data?.tipo === "compra" ? "PROVEEDOR: " : "DEUDOR: ";
		return (
			<SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
				<SPDF.View style={{ flexDirection: "row" }}>
					<SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold" }}>{etiqueta}</SPDF.Text>
					<SPDF.Text style={{ ...textStyle, fontSize: 10 }}> {toUpper(cliente?.nombres, '')} {toUpper(cliente?.apellidos, '')} </SPDF.Text>
				</SPDF.View>
				<SPDF.Text style={{ ...textStyle, fontSize: 8, color: "#787D84" }}>{`Generado: ${new SDate().toString("dd/MM/yyyy HH:mm")}`}</SPDF.Text>
			</SPDF.View>
		);
	}

	static detalleHeader() {
		const cellStyle = { height: "100%", justifyContent: "center", paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: "#33587F" };
		const labelStyle = { ...textStyle, width: "100%", fontSize: 8.5, fontWeight: "bold", color: "#FFFFFF" };
		return (
			<SPDF.View style={{ width: "100%", height: 26, flexDirection: "row", backgroundColor: colorPrincipal, borderRadius: 6 }}>

				<SPDF.View style={{ ...cellStyle, width: "4%" }}>
					<SPDF.Text style={{ ...labelStyle, textAlign: "center" }}>{"NRO"}</SPDF.Text>
				</SPDF.View>

				<SPDF.View style={{ ...cellStyle, width: "11%" }}>
					<SPDF.Text style={{ ...labelStyle, textAlign: "left" }}>{"FECHA"}</SPDF.Text>
				</SPDF.View>
				<SPDF.View style={{ ...cellStyle, width: "11%" }}>
					<SPDF.Text style={{ ...labelStyle, textAlign: "left" }}>{"TIPO"}</SPDF.Text>
				</SPDF.View>
				<SPDF.View style={{ ...cellStyle, width: "37%" }}>
					<SPDF.Text style={labelStyle}>{"DETALLE"}</SPDF.Text>
				</SPDF.View>

				<SPDF.View style={{ ...cellStyle, width: "12%" }}>
					<SPDF.Text style={{ ...labelStyle, textAlign: "right" }}>{"DEBE"}</SPDF.Text>
				</SPDF.View>
				<SPDF.View style={{ ...cellStyle, width: "12%" }}>
					<SPDF.Text style={{ ...labelStyle, textAlign: "right" }}>{"HABER"}</SPDF.Text>
				</SPDF.View>
				<SPDF.View style={{ ...cellStyle, width: "13%" }}>
					<SPDF.Text style={{ ...labelStyle, textAlign: "right" }}>{"SALDO"}</SPDF.Text>
				</SPDF.View>
			</SPDF.View>
		);
	}

	static detalleBody(data) {
		const items = data?.detalle || [];
		const moneda = data?.moneda;
		return items.map((item, i) => {
			const debeValue = toNumber(item?.debe);
			const haberValue = toNumber(item?.haber);
			const saldoValue = toNumber(item?.saldo);
			const debe = formatMontoPDF(moneda, debeValue);
			const haber = formatMontoPDF(moneda, haberValue);
			const saldo = formatMontoPDF(moneda, saldoValue);
			const fecha = item?.fecha_on ? new SDate(item.fecha_on).toString("dd/MM/yyyy") : "";
			const isSaldoAnterior = item?.tipo === "saldo";
			const fechaText = isSaldoAnterior ? "" : fecha;
			const tipoText = isSaldoAnterior ? "" : toUpper(item?.tipo, "");
			const debeText = isSaldoAnterior ? "" : debe;
			const haberText = isSaldoAnterior ? "" : haber;
			const cellTextStyle = { ...textStyle, width: "100%", fontSize: 8, color: "#22262B", fontStyle: isSaldoAnterior ? "italic" : "normal" };
			const bodyCellStyle = { height: "100%", justifyContent: "center", paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: colorBorderLight };
			return (
				<SPDF.View key={i} style={{ width: "100%", height: 26, flexDirection: "row" }}>
					<SPDF.View style={{ ...bodyCellStyle, width: "4%" }}>
						<SPDF.Text style={{ ...cellTextStyle, color: colorTextMuted, textAlign: "center" }}>{i + 1}</SPDF.Text>
					</SPDF.View>
					<SPDF.View style={{ ...bodyCellStyle, width: "11%" }}> {fechaText ? <SPDF.Text style={{ ...cellTextStyle, textAlign: "left" }}>{fechaText}</SPDF.Text> : null} </SPDF.View>
					<SPDF.View style={{ ...bodyCellStyle, width: "11%" }}> {tipoText ? <SPDF.Text style={{ ...cellTextStyle, textAlign: "left" }}>{tipoText}</SPDF.Text> : null} </SPDF.View>
					<SPDF.View style={{ ...bodyCellStyle, width: "37%" }}> <SPDF.Text style={cellTextStyle}>{toUpper(item?.descripcion || (isSaldoAnterior ? "SALDO ANTERIOR" : ""), "")}</SPDF.Text> </SPDF.View>
					<SPDF.View style={{ ...bodyCellStyle, width: "12%" }}> {debeValue >= 1 ? <SPDF.Text style={{ ...cellTextStyle, textAlign: "right" }}>{debeText}</SPDF.Text> : null} </SPDF.View>
					<SPDF.View style={{ ...bodyCellStyle, width: "12%" }}> {haberValue >= 1 ? <SPDF.Text style={{ ...cellTextStyle, textAlign: "right" }}>{haberText}</SPDF.Text> : null} </SPDF.View>
					<SPDF.View style={{ ...bodyCellStyle, width: "13%" }}><SPDF.Text style={{ ...cellTextStyle, fontWeight: "bold", textAlign: "right" }}>{saldo}</SPDF.Text></SPDF.View>
				</SPDF.View>
			);
		});
	}

	static detalleFooter(data) {
		return (
			<SPDF.View style={{ width: "100%", borderTopWidth: 2, borderColor: colorPrincipal }}>
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
			<SPDF.View style={{ width: "100%", height: 28, flexDirection: "row", }}>
				<SPDF.View style={{ width: "59%", height: "100%", justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 8 }}>
					<SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, fontWeight: "bold", color: colorPrincipal, textAlign: "right" }}>{`TOTALES ${(data?.moneda?.observacion || 'Bs').toUpperCase()}. :`}</SPDF.Text>
				</SPDF.View>
				<SPDF.View style={{ width: "13%", height: "100%", justifyContent: "center", paddingHorizontal: 8 }}>
					<SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, fontWeight: "bold", color: colorPrincipal, textAlign: "right" }}>{formatMontoPDF(data?.moneda, totalDebe)}</SPDF.Text>
				</SPDF.View>
				<SPDF.View style={{ width: "13%", height: "100%", justifyContent: "center", paddingHorizontal: 8 }}>
					<SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, fontWeight: "bold", color: colorPrincipal, textAlign: "right" }}>{formatMontoPDF(data?.moneda, totalHaber)}</SPDF.Text>
				</SPDF.View>
				<SPDF.View style={{ width: "15%", height: "100%", justifyContent: "center", paddingHorizontal: 8 }}>
					<SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9.5, fontWeight: "bold", color: colorPrincipal, textAlign: "right" }}>{formatMontoPDF(data?.moneda, saldoFinal)}</SPDF.Text>
				</SPDF.View>
			</SPDF.View>
		);
	}

	static pagina(data) {
		const fechaPie = data?.fecha_fin ? new SDate(data.fecha_fin).toString("dd/MM/yyyy") : new SDate().toString("dd/MM/yyyy");
		return (
			<SPDF.View style={{ width: "100%", height: 16, padding: 2 }}>
				<SPDF.View style={{ width: "100%", height: "100%", borderWidth: 1, borderColor: borderColorProfessional, flexDirection: "row", alignItems: "center", paddingHorizontal: 8 }}>
					<SPDF.View style={{ width: 8, height: "100%" }} />
					<SPDF.Text style={{ ...textStyle, fontSize: 7, }}> {fechaPie} </SPDF.Text>
					<SPDF.View style={{ flex: 1 }} />
					<SPDF.Text style={{ ...textStyle, fontSize: 7, paddingRight: -20 }}>{"${current_page}/${cant_page}"}</SPDF.Text>
				</SPDF.View>
			</SPDF.View>
		);
	}
}