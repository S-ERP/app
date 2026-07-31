import React, { Component, createRef } from 'react';
import { SView, SPage, SHr, STheme, SDate, SText, SImage, SPopup, SMath, SNavigation, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import DateTimeBetween from '../../Components/DateTimeBetween';
import SIconApp from '../../Assets/SIconApp';
import FloatMenu from '../../Components/FloatMenu';
import PopupSeeVoucher from '../caja2/components/PopupSeeVoucher';
import { Linking } from 'react-native';
import label from '../ajustes/label';

export default class ventas_caja extends Component {
	constructor(props) {
		super(props);
		const hoy = new Date();
		const pad = n => String(n).padStart(2, '0');
		const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		this.state = {
			fecha_inicio: fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
			fecha_fin: fmt(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)),
			data: [],
			data2: [],
			data3: [],
			sucursales: {},
		};
		this._periodoListo = false;
	}

	colorTipoOperacion(estado) {
		switch (estado?.toUpperCase()) {
			case "APERTURA":
				return "#4dbe52ff";
			case "VENTA":
				return "#3683dbff";
			case "COMPRA":
				return "#e0883fff";
			case "ANULACION_VENTA":
			case "ANULACION_COMPRA":
				return "#8426f0";
			default:
				return "#979797ff";
		}
	}

	esRegistroAnulado(row, dataset) {
		const tipoLower = (row?.tipo || "").toLowerCase();
		const ventaOCompraAnulada = (tipoLower === "venta" || tipoLower === "compra") && Number(row?.estado_venta) === 0;
		return this.estaAnulado(row, dataset) || ventaOCompraAnulada;
	}

	estaAnulado(row, dataset) {
		const key_compra_venta = row?.key_compra_venta;
		if (!key_compra_venta) return false;
		return (dataset || []).some(d =>
			d.key_compra_venta === key_compra_venta &&
			["anulacion_venta", "anulacion_compra"].includes((d.tipo || "").toLowerCase())
		);
	}

	colorTipoPago(estado) {
		switch (estado?.toUpperCase()) {
			case "CAJA":
				return "#388E3C";
			case "CREDITO":
				return "#8E24AA";
			case "BANCO":
				return "#FB8C00";
			default:
				return "#B0BEC5";
		}
	}

	getTurno(caja_fecha_on, caja_fecha_cierre) {
		const parseMinutes = (value) => {
			if (!value) return null;
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return null;
			return date.getHours() * 60 + date.getMinutes();
		};

		const getPeriodo = (minutes) => {
			if (minutes === null) return null;
			if (minutes >= 360 && minutes <= 720) return "Mañana";
			if (minutes >= 721 && minutes <= 1080) return "Tarde";
			if (minutes >= 1081 && minutes <= 1320) return "Noche";
			return null;
		};

		const inicio = getPeriodo(parseMinutes(caja_fecha_on));
		const cierre = getPeriodo(parseMinutes(caja_fecha_cierre));
		if (!inicio && !cierre) return "";
		if (inicio && cierre) {
			return inicio === cierre ? inicio : `${inicio} - ${cierre}`;
		}
		return inicio || cierre || "";
	}

	iconotipoArchivo(_documento_name = "", documento_type = "") {
		if (!documento_type) return null;

		const tipo = documento_type.toLowerCase().trim();

		const extension = (() => {
			const parts = tipo.split(/[/\.]/);
			return parts[parts.length - 1] || "";
		})();

		let bgColor = "#B0B0B0";
		let borderColor = "#3c3d3dff";
		let icon = "crmpdarchivo";
		let iconColor = "#3c3d3dff";

		const tipoMapeo = {
			pdf: { bg: "#fdc4c4ff", border: "#D32F2F", icon: "crmpdf", color: "#D32F2F" },
			document: { bg: "#b2dfffff", border: "#1976D2", icon: "crmword", color: "#1976D2" },
			sheet: { bg: "#affab5ff", border: "#388E3C", icon: "crmexcel", color: "#388E3C" },
			presentation: { bg: "#FFF3E0", border: "#F57C00", icon: "crmpresentacion", color: "#F57C00" },
			png: { bg: "#e895f5ff", border: "#8E24AA", icon: "Galeria", color: "#8E24AA" },
			jpg: { bg: "#F3E5F5", border: "#8E24AA", icon: "Galeria", color: "#8E24AA" },
			jpeg: { bg: "#F3E5F5", border: "#8E24AA", icon: "Galeria", color: "#8E24AA" },
			"x-icon": { bg: "#ECEFF1", border: "#607D8B", icon: "crmpdarchivo", color: "#607D8B" },
			txt: { bg: "#F1F8E9", border: "#689F38", icon: "crmtxt", color: "#689F38" },
			csv: { bg: "#FFFDE7", border: "#FBC02D", icon: "crmexcel", color: "#FBC02D" },
			zip: { bg: "#E0F7FA", border: "#0097A7", icon: "crmzip", color: "#0097A7" },
			rar: { bg: "#E0F7FA", border: "#0097A7", icon: "crmzip", color: "#0097A7" },
			mp4: { bg: "#FBE9E7", border: "#D84315", icon: "crmpvideo", color: "#D84315" },
			mp3: { bg: "#E8EAF6", border: "#3F51B5", icon: "crmpaudio", color: "#3F51B5" }
		};

		const config = tipoMapeo[extension];
		if (config) {
			bgColor = config.bg;
			borderColor = config.border;
			icon = config.icon;
			iconColor = config.color;
		}

		const extensionAlias = {
			"document": "docx",
			"sheet": "xlsx",
			"presentation": "pptx"
		};
		const displayExt = extensionAlias[extension] || extension;

		return (
			<SView row center style={{ padding: 4, backgroundColor: bgColor, borderRadius: 6, marginRight: 4, marginBottom: 4, borderWidth: 1, borderColor: borderColor }} >
				<SIconApp name={icon} fill={iconColor} width={12} height={12} style={{ marginRight: 3 }} />
				<SText fontSize={10} color={iconColor} bold>Voucher.{displayExt}</SText>
				<SIconApp name={"downImgNube"} fill={iconColor} width={12} height={12} style={{ marginLeft: 3 }} />
			</SView>
		);
	}
	async loadInitialData() {
		try {
			const empresaKey = MDL.empresa.select?.key;
			if (!empresaKey) throw new Error("Empresa no seleccionada.");
			const { fecha_inicio, fecha_fin } = this.state;
			//resumen_caja_ventas_por_dia
			// const movimientos = await MDL.caja.getAllMovimientosCajasByEmpresa(empresaKey, fecha_inicio, fecha_fin);
			let movimientos = [];
			if (this._periodoListo) {
				movimientos = await MDL.caja.execute_function("resumen_caja_ventas_por_dia_detalle3", [MDL.empresa.select.key, fecha_inicio, fecha_fin]);

			} else {
				movimientos = await MDL.caja.execute_function("resumen_caja_ventas_por_dia_detalle3", [MDL.empresa.select.key, "2024-01-01", "2030-09-05"]);

			}

			if (!Array.isArray(movimientos)) {
				console.warn("No se recibieron movimientos válidos.");
				return [];
			}
			const empresa = await MDL.empresa.getFull();
			const base = empresa.monedas.find(a => a.tipo == "base");
			const sucursales = empresa?.sucursales ?? [];
			// const puntos_ventas = sucursales.flatMap(s => s.puntos_venta || []);
			// const usuarioKeys = [...new Set(movimientos.map(m => m.key_usuario).filter(Boolean))];
			// const usuarios = (await MDL.usuario.getByKeys(usuarioKeys)) ?? [];
			// const usuarioMap = Object.fromEntries(usuarios.map(u => [u.key, u]));

			// const ventas = (await MDL.compra_venta.getTransaccion("venta", fecha_inicio, fecha_fin)) ?? [];
			// const compras = (await MDL.compra_venta.getTransaccion("compra", fecha_inicio, fecha_fin)) ?? [];
			// const clientes = (await MDL.crm.cliente.getAll()) ?? [];
			// const clientesMap = Object.fromEntries((Array.isArray(clientes) ? clientes : Object.values(clientes)).map(c => [c.key, c]));
			// const ventaClienteMap = Object.fromEntries(
			// 	(Array.isArray(ventas) ? ventas : Object.values(ventas)).map(v => [v.key, clientesMap[v.key_cliente] ?? null])
			// );
			// const compraVentaMap = Object.fromEntries(
			// 	[...(Array.isArray(ventas) ? ventas : Object.values(ventas)), ...(Array.isArray(compras) ? compras : Object.values(compras))]
			// 		.map(v => [v.key, v])
			// );

			// const processedData = movimientos.map(mov => ({
			// 	...mov,
			// 	usuario: usuarioMap[mov.key_usuario] ?? null,
			// 	cajero: usuarioMap[mov.key_cajero] ?? null,
			// 	puntos_venta: puntos_ventas.find(pv => pv.key === mov.key_punto_venta) ?? null,
			// 	sucursal: sucursales.find(s => s.key === mov.key_sucursal) ?? null,
			// 	moneda: empresa.monedas.find(m => m.key === mov.key_moneda) ?? null,
			// 	moneda_base: base,
			// 	turno: this.getTurno(mov.caja_fecha_on, mov.caja_fecha_cierre),
			// 	cliente: mov.key_compra_venta ? (ventaClienteMap[mov.key_compra_venta] ?? null) : null,
			// 	estado_venta: mov.key_compra_venta ? (compraVentaMap[mov.key_compra_venta]?.estado ?? null) : null,
			// }));

			// return processedData;
			this.setState({ sucursales });
			return movimientos;
		} catch (error) {
			console.error("❌ Error al cargar movimientos:", error);
			return [];
		}
	}

	renderTabla() {
		const diasEnEspanol = {
			Sunday: "Domingo",
			Monday: "Lunes",
			Tuesday: "Martes",
			Wednesday: "Miércoles",
			Thursday: "Jueves",
			Friday: "Viernes",
			Saturday: "Sábado"
		};
		return (
			<DinamicTable
				ref={ref => (this.DinamicTable = ref)}
				loadData={() => this.loadInitialData().then(data => {
					this.setState({ data });
					return data;
				})}
				key="id"
				keyExtractor={e => e.key}
				language="es"

				center
				selectType="single"
				{...Config.table.applyTheme()}

				renderLoading={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>Cargando movimientos...</SText>
					</SView>
				)}

				renderNoResults={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron movimientos en el rango seleccionado.</SText>
					</SView>
				)}

				renderError={({ error }) => (
					<SView col={"xs-12"} padding={16}>
						<SText fontSize={13} color={STheme.color.danger}>Error: {error?.message || String(error)}</SText>
					</SView>
				)}

				onSelect={(e) => {
					if (!e.row) {
						console.warn('No row data provided for selection');
						return;
					}
					const tipoLower = (e.row?.tipo || "").toLowerCase();
					const esVenta = tipoLower === "venta";
					const esCompra = tipoLower === "compra";
					const esAnulacion = tipoLower === "anulacion_venta" || tipoLower === "anulacion_compra";
					const dataset = this.DinamicTable?.data || this.state.data || [];
					const yaAnulada = this.estaAnulado(e.row, dataset);
					const puedeAnular = !esAnulacion && !yaAnulada && (
						esVenta ? MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "anular_venta" })
							: esCompra ? MDL.rolesPermisos.getPermiso({ url: "/compra", permiso: "anular_compra" })
								: false
					);

					const menuOptions = [
						...(esVenta && e.row?.key_compra_venta ? [{
							label: 'Ver detalle de venta',
							icon: <SIconApp name="ventaCarro" fill="#e4e4e4ff" width={16} />,
							onPress: () => {
								SNavigation.navigate('/venta/profile2', { pk: e.row.key_compra_venta });
							},
						}] : []),
						{
							label: 'Ver Vouchers',
							icon: <SIconApp name="Arrow" fill="#e4e4e4ff" width={16} />,
							onPress: () => {
								const vouchers = Array.isArray(e.row?.vouchers) ? e.row.vouchers : [];
								if (vouchers.length === 0) {
									SPopup.alert('No hay vouchers disponibles para este movimiento.');
									return;
								}
								PopupSeeVoucher.open(e.row?.key_empresa, e.row?.key, vouchers);
							},
						},
						...(puedeAnular ? [{
							label: esVenta ? 'Anular venta' : 'Anular compra',
							icon: <SIconApp name="cancelado" fill="#db0606ff" width={16} />,
							onPress: () => {
								SPopup.confirm({
									title: esVenta ? "Anular venta" : "Anular compra",
									message: `¿Está seguro de que desea anular esta ${esVenta ? "venta" : "compra"}? Esta acción no se puede deshacer.`,
									onPress: () => {
										const notificationKey = `anular_${e.row?.key_compra_venta}`;
										SNotification.send({ key: notificationKey, title: esVenta ? "Anulando venta..." : "Anulando compra...", type: "loading" });
										const promesa = esVenta
											? MDL.caja.anular_venta({ key_compra_venta: e.row?.key_compra_venta })
											: MDL.caja.anular_compra({ key_compra_venta: e.row?.key_compra_venta });
										promesa
											.then(() => {
												SNotification.send({ key: notificationKey, title: esVenta ? "Venta anulada" : "Compra anulada", body: `La ${esVenta ? "venta" : "compra"} se anuló correctamente.`, color: STheme.color.success });
												if (this.DinamicTable) this.DinamicTable.loadData();
											})
											.catch((error) => {
												SNotification.send({ key: notificationKey, title: "Error al anular", body: error?.error || error?.message || String(error), color: STheme.color.danger });
											});
									}
								});
							},
						}] : []),
						...(e.row?.key_comprobante ? [{
							label: 'Ver Comprobante Contable',
							icon: <SIconApp name="Ajustes" fill="#e4e4e4ff" width={16} />,
							onPress: () => {

								if (e.row?.codigo_comprobante === 0) {
									SPopup.alert('No hay comprobantes.');
									return;
								}
								SNavigation.navigate('/contabilidad/asiento_contable/profile', { pk: e.row.key_comprobante });
							},
						}] : []),
					];
					FloatMenu.open({
						e: e.evt,
						label: 'Opciones',
						options: menuOptions,
					});
				}}

				buildRowStyle={({ item }) => {
					const original = item?.__original ?? item;
					const tipoLower = (original?.tipo || "").toLowerCase();
					const esVentaOCompraAnulada = (tipoLower === "venta" || tipoLower === "compra") && Number(original?.estado_venta) === 0;
					return esVentaOCompraAnulada ? { opacity: 0.45 } : {};
				}}

				loadInitialState={async () => ({
					sorters: [{ key: "fecha", order: "desc", type: "date" }],
				})}

				listFooterComponent={() => {
					return <SHr height={100} />

				}}

			>
				<DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />
				<DinamicTable.Col
					key="fecha"
					label="FECHA"
					width={140}
					center
					dataType="date"
					data={e => (e.row?.fecha ? new SDate(e.row.fecha, "yyyy-MM-dd").date : null)}
					textStyle={{ fontSize: 12, color: STheme.color.text }}
					dateFormat="yyyy-MM-dd"
				/>
				<DinamicTable.Col key="dia" label="DÍA" width={140} height={60} data={(e) => diasEnEspanol[e.row?.dia] ?? ""} />
				<DinamicTable.Col key="total_efectivo" label="EFECTIVO" width={140} height={60} data={(e) => e.row?.total_efectivo > 0 ? (e.row?.total_efectivo || 0) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.total_efectivo) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="total_qr" label="QR" width={140} height={60} data={(e) => e.row?.total_qr > 0 ? (e.row?.total_qr || 0) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.total_qr) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="total_credito" label="CRÉDITO" width={140} height={60} data={(e) => e.row?.total_credito ? (e.row?.total_credito || 0) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.total_credito) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="venta_bruta" label="VENTA BRUTA" width={140} height={60} data={(e) => e.row?.venta_bruta > 0 ? (e.row?.venta_bruta || 0) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.venta_bruta) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="anulaciones" label="ANULACIONES" width={140} height={60} data={(e) => e.row?.anulaciones ? (e.row?.anulaciones || 0) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.venta_bruta) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="venta_neta" label="VENTA NETA" width={140} height={60} data={(e) => e.row?.venta_neta > 0 ? (e.row?.venta_neta || 0) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.venta_bruta) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="nro_ventas" label="NRO. VENTAS" width={140} height={60} data={(e) => e.row?.nro_ventas || 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + (Number(row.nro_ventas) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${(total)}` : '';
					}}
					sumExcel
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>




			</DinamicTable >
		);
	}

	renderTablaFormaPago() {

		return (
			<DinamicTable
				ref={ref => (this.DinamicTable2 = ref)}
				loadData={() => this.loadInitialData().then(data => {
					const data2 = data.reduce((acc, item) => {

						acc.efectivo.venta_bruta += item.total_efectivo;
						acc.efectivo.venta_neta += item.total_efectivo;
						acc.efectivo.nro_ventas += item.total_efectivo > 0 ? item.nro_ventas : 0;

						acc.qr.venta_bruta += item.total_qr;
						acc.qr.venta_neta += item.total_qr;
						acc.qr.nro_ventas += item.total_qr > 0 ? item.nro_ventas : 0;

						acc.credito.venta_bruta += item.total_credito;
						acc.credito.venta_neta += item.total_credito;
						acc.credito.nro_ventas += item.total_credito > 0 ? item.nro_ventas : 0;

						// distribuir anulaciones proporcionalmente
						const totalDia =
							item.total_efectivo +
							item.total_qr +
							item.total_credito;

						if (item.anulaciones !== 0 && totalDia > 0) {

							acc.efectivo.anulaciones += item.anulaciones * (item.total_efectivo / totalDia);
							acc.qr.anulaciones += item.anulaciones * (item.total_qr / totalDia);
							acc.credito.anulaciones += item.anulaciones * (item.total_credito / totalDia);
						}

						return acc;

					}, {
						efectivo: {
							forma_pago: "Efectivo",
							venta_bruta: 0,
							anulaciones: 0,
							venta_neta: 0,
							nro_ventas: 0
						},
						qr: {
							forma_pago: "QR",
							venta_bruta: 0,
							anulaciones: 0,
							venta_neta: 0,
							nro_ventas: 0
						},
						credito: {
							forma_pago: "Crédito",
							venta_bruta: 0,
							anulaciones: 0,
							venta_neta: 0,
							nro_ventas: 0
						}
					});

					const totalNeto =
						data2.efectivo.venta_neta +
						data2.qr.venta_neta +
						data2.credito.venta_neta;

					const resultado = Object.values(data2).map(item => {

						item.venta_bruta = Number(item.venta_bruta.toFixed(2));
						item.anulaciones = Number(item.anulaciones.toFixed(2));
						item.venta_neta = Number((item.venta_bruta + item.anulaciones).toFixed(2));

						item.porcentaje = totalNeto === 0
							? 0
							: Number(((item.venta_neta * 100) / totalNeto).toFixed(1));

						item.ticket_promedio = item.nro_ventas === 0
							? 0
							: Number((item.venta_neta / item.nro_ventas).toFixed(2));

						return item;

					});
					this.setState({ data2: resultado });
					return resultado;
				})}
				key="id2"
				// keyExtractor={e => e.key}
				language="es"

				center
				selectType="single"
				{...Config.table.applyTheme()}

				renderLoading={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>Cargando movimientos...</SText>
					</SView>
				)}

				renderNoResults={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron movimientos en el rango seleccionado.</SText>
					</SView>
				)}

				renderError={({ error }) => (
					<SView col={"xs-12"} padding={16}>
						<SText fontSize={13} color={STheme.color.danger}>Error: {error?.message || String(error)}</SText>
					</SView>
				)}

				onSelect={(e) => {
					if (!e.row) {
						console.warn('No row data provided for selection');
						return;
					}
					const tipoLower = (e.row?.tipo || "").toLowerCase();
					const esVenta = tipoLower === "venta";
					const esCompra = tipoLower === "compra";
					const esAnulacion = tipoLower === "anulacion_venta" || tipoLower === "anulacion_compra";
					const dataset = this.DinamicTable2?.data2 || this.state.data2 || [];
					const yaAnulada = this.estaAnulado(e.row, dataset);
					const puedeAnular = !esAnulacion && !yaAnulada && (
						esVenta ? MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "anular_venta" })
							: esCompra ? MDL.rolesPermisos.getPermiso({ url: "/compra", permiso: "anular_compra" })
								: false
					);

					const menuOptions = [
						...(esVenta && e.row?.key_compra_venta ? [{
							label: 'Ver detalle de venta',
							icon: <SIconApp name="ventaCarro" fill="#e4e4e4ff" width={16} />,
							onPress: () => {
								SNavigation.navigate('/venta/profile2', { pk: e.row.key_compra_venta });
							},
						}] : []),
						{
							label: 'Ver Vouchers',
							icon: <SIconApp name="Arrow" fill="#e4e4e4ff" width={16} />,
							onPress: () => {
								const vouchers = Array.isArray(e.row?.vouchers) ? e.row.vouchers : [];
								if (vouchers.length === 0) {
									SPopup.alert('No hay vouchers disponibles para este movimiento.');
									return;
								}
								PopupSeeVoucher.open(e.row?.key_empresa, e.row?.key, vouchers);
							},
						},
						...(puedeAnular ? [{
							label: esVenta ? 'Anular venta' : 'Anular compra',
							icon: <SIconApp name="cancelado" fill="#db0606ff" width={16} />,
							onPress: () => {
								SPopup.confirm({
									title: esVenta ? "Anular venta" : "Anular compra",
									message: `¿Está seguro de que desea anular esta ${esVenta ? "venta" : "compra"}? Esta acción no se puede deshacer.`,
									onPress: () => {
										const notificationKey = `anular_${e.row?.key_compra_venta}`;
										SNotification.send({ key: notificationKey, title: esVenta ? "Anulando venta..." : "Anulando compra...", type: "loading" });
										const promesa = esVenta
											? MDL.caja.anular_venta({ key_compra_venta: e.row?.key_compra_venta })
											: MDL.caja.anular_compra({ key_compra_venta: e.row?.key_compra_venta });
										promesa
											.then(() => {
												SNotification.send({ key: notificationKey, title: esVenta ? "Venta anulada" : "Compra anulada", body: `La ${esVenta ? "venta" : "compra"} se anuló correctamente.`, color: STheme.color.success });
												if (this.DinamicTable2) this.DinamicTable2.loadData();
											})
											.catch((error) => {
												SNotification.send({ key: notificationKey, title: "Error al anular", body: error?.error || error?.message || String(error), color: STheme.color.danger });
											});
									}
								});
							},
						}] : []),
						...(e.row?.key_comprobante ? [{
							label: 'Ver Comprobante Contable',
							icon: <SIconApp name="Ajustes" fill="#e4e4e4ff" width={16} />,
							onPress: () => {

								if (e.row?.codigo_comprobante === 0) {
									SPopup.alert('No hay comprobantes.');
									return;
								}
								SNavigation.navigate('/contabilidad/asiento_contable/profile', { pk: e.row.key_comprobante });
							},
						}] : []),
					];
					FloatMenu.open({
						e: e.evt,
						label: 'Opciones',
						options: menuOptions,
					});
				}}

				buildRowStyle={({ item }) => {
					const original = item?.__original ?? item;
					const tipoLower = (original?.tipo || "").toLowerCase();
					const esVentaOCompraAnulada = (tipoLower === "venta" || tipoLower === "compra") && Number(original?.estado_venta) === 0;
					return esVentaOCompraAnulada ? { opacity: 0.45 } : {};
				}}

				loadInitialState={async () => ({
					// sorters: [{ key: "fecha", order: "desc", type: "date" }],
				})}

				listFooterComponent={() => {
					return <SHr height={50} />

				}}

			>
				<DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />
				{/* <DinamicTable.Col
					key="fecha"
					label="FECHA"
					width={140}
					center
					dataType="date"
					data={e => (e.row?.fecha ? new SDate(e.row.fecha, "yyyy-MM-dd").date : null)}
					textStyle={{ fontSize: 12, color: STheme.color.text }}
					dateFormat="yyyy-MM-dd"
				/>
				<DinamicTable.Col key="dia" label="DÍA" width={140} height={60} data={(e) => diasEnEspanol[e.row?.dia] ?? ""} />
				<DinamicTable.Col key="total_efectivo" label="EFECTIVO" width={140} height={60} data={(e) => e.row?.total_efectivo > 0 ? SMath.formatMoney((e.row?.total_efectivo || 0)) : 0} />
				<DinamicTable.Col key="total_qr" label="QR" width={140} height={60} data={(e) => e.row?.total_qr > 0 ? SMath.formatMoney((e.row?.total_qr || 0)) : 0} />
				<DinamicTable.Col key="total_credito" label="CRÉDITO" width={140} height={60} data={(e) => e.row?.total_credito > 0 ? SMath.formatMoney((e.row?.total_credito || 0)) : 0} />
				<DinamicTable.Col key="venta_bruta" label="VENTA BRUTA" width={140} height={60} data={(e) => e.row?.venta_bruta > 0 ? SMath.formatMoney((e.row?.venta_bruta || 0)) : 0} />
				<DinamicTable.Col key="anulaciones" label="ANULACIONES" width={140} height={60} data={(e) => e.row?.anulaciones > 0 ? SMath.formatMoney((e.row?.anulaciones || 0)) : 0} />
				<DinamicTable.Col key="venta_neta" label="VENTA NETA" width={140} height={60} data={(e) => e.row?.venta_neta > 0 ? SMath.formatMoney((e.row?.venta_neta || 0)) : 0} />
				<DinamicTable.Col key="nro_ventas" label="NRO. VENTAS" width={140} height={60} data={(e) => e.row?.nro_ventas || 0} /> */}
				<DinamicTable.Col key="forma_pago" label="FORMA DE PAGO" width={140} height={60} data={(e) => e.row?.forma_pago || 0}

				/>
				<DinamicTable.Col key="venta_bruta" label="VENTA BRUTA" width={140} height={60} data={(e) => (e.row?.venta_bruta || 0)}
					sumTotal={rows => {
						console.log("AQUI", rows);
						const total = rows.reduce((s, row) => s + (Number(row.venta_bruta) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="anulaciones" label="ANULACIONES" width={140} height={60} data={(e) => (e.row?.anulaciones || 0)}
					sumTotal={rows => {
						console.log("AQUI", rows);
						const total = rows.reduce((s, row) => s + (Number(row.anulaciones) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="venta_neta" label="VENTA NETA" width={140} height={60} data={(e) => (e.row?.venta_neta || 0)}
					sumTotal={rows => {
						console.log("AQUI", rows);
						const total = rows.reduce((s, row) => s + (Number(row.venta_neta) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="porcentaje" label="% NETA" width={140} height={60} data={(e) => `${e.row?.porcentaje || 0}%`}
					// sumTotal={rows => {
					// 	console.log("AQUI", rows);
					// 	const total = rows.reduce((s, row) => s + (Number(row.porcentaje) || 0), 0);
					// 	// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
					// 	return total ? ` ${(total)} %` : '';
					// }}
					// sumExcel
					// excelFormat="#,##0.00"
					// dataType="number"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
				/>
				<DinamicTable.Col key="nro_ventas" label="N° VENTAS" width={140} height={60} data={(e) => (e.row?.nro_ventas || 0)}
					sumTotal={rows => {
						console.log("AQUI", rows);
						const total = rows.reduce((s, row) => s + (Number(row.nro_ventas) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${(total)}` : '';
					}}
					sumExcel
					// excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>
				<DinamicTable.Col key="ticket_promedio" label="TICKET PROMEDIO" width={140} height={60} data={(e) => (e.row?.ticket_promedio || 0)}
					sumTotal={rows => {
						console.log("AQUI", rows);
						const total = rows.reduce((s, row) => ((s + (Number(row.ticket_promedio)) / rows.length) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${(total)}` : '';
					}}
					sumExcel
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>





			</DinamicTable >
		);
	}

	renderTablaSucursal() {
		const { sucursales } = this.state;
		console.log(sucursales)
		return (
			<DinamicTable
				ref={ref => (this.DinamicTable3 = ref)}
				loadData={() => this.loadInitialData().then(data => {
					console.log(data)
					// const porSucursal = data?.data_ventas.reduce((acc, venta) => {
					const ventas = data.flatMap(item => item.data_ventas || []);

					const porSucursal = ventas.reduce((acc, venta) => {

						const key = venta.key_sucursal;

						if (!acc[key]) {
							acc[key] = {
								key_sucursal: key,
								nro_ventas: 0,
								total_efectivo: 0,
								total_qr: 0,
								total_credito: 0,
								venta_bruta: 0,
								venta_neta: 0,
								anulaciones: 0,
								ticket_promedio: 0,
							};
						}

						const row = acc[key];
						const monto = Number(venta.monto) * Number(venta.tipo_cambio || 1);

						if (venta.estado > 0) {

							row.nro_ventas++;
							row.venta_bruta += monto;
							row.venta_neta += monto;

							console.log(venta.tipo)
							if (venta.tipo === "anulacion_venta") row.anulaciones += monto;

							switch (venta.key_tipo_pago) {

								case "caja":
									row.total_efectivo += monto;
									break;

								case "banco":
									row.total_qr += monto;
									break;

								case "credito":
									row.total_credito += monto;
									break;
							}

						} else {

							row.anulaciones += Math.abs(monto);
							row.venta_neta -= Math.abs(monto);

						}

						return acc;

					}, {});

					const resultado = Object.values(porSucursal).map(item => ({
						...item,
						ticket_promedio:
							item.nro_ventas
								? Number((item.venta_neta / item.nro_ventas).toFixed(2))
								: 0,
						venta_bruta: Number(item.venta_bruta.toFixed(2)),
						venta_neta: Number(item.venta_neta.toFixed(2)) + Number(item.anulaciones.toFixed(2)),
						total_efectivo: Number(item.total_efectivo.toFixed(2)),
						total_qr: Number(item.total_qr.toFixed(2)),
						total_credito: Number(item.total_credito.toFixed(2)),
						anulaciones: Number(item.anulaciones.toFixed(2)),
					}));

					// console.log(resultado);
					console.log("sucursal_resultado", resultado);


					this.setState({ data3: resultado });
					return resultado;
				})}
				key="id3"
				// keyExtractor={e => e.key}
				language="es"

				center
				selectType="single"
				{...Config.table.applyTheme()}

				renderLoading={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>Cargando movimientos...</SText>
					</SView>
				)}

				renderNoResults={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron movimientos en el rango seleccionado.</SText>
					</SView>
				)}

				renderError={({ error }) => (
					<SView col={"xs-12"} padding={16}>
						<SText fontSize={13} color={STheme.color.danger}>Error: {error?.message || String(error)}</SText>
					</SView>
				)}

				onSelect={(e) => {
					if (!e.row) {
						console.warn('No row data provided for selection');
						return;
					}
					const tipoLower = (e.row?.tipo || "").toLowerCase();
					const esVenta = tipoLower === "venta";
					const esCompra = tipoLower === "compra";
					const esAnulacion = tipoLower === "anulacion_venta" || tipoLower === "anulacion_compra";
					const dataset = this.DinamicTable3?.data3 || this.state.data3 || [];
					const yaAnulada = this.estaAnulado(e.row, dataset);
					const puedeAnular = !esAnulacion && !yaAnulada && (
						esVenta ? MDL.rolesPermisos.getPermiso({ url: "/empresa/punto_venta", permiso: "anular_venta" })
							: esCompra ? MDL.rolesPermisos.getPermiso({ url: "/compra", permiso: "anular_compra" })
								: false
					);

					const menuOptions = [
						...(esVenta && e.row?.key_compra_venta ? [{
							label: 'Ver detalle de venta',
							icon: <SIconApp name="ventaCarro" fill="#e4e4e4ff" width={16} />,
							onPress: () => {
								SNavigation.navigate('/venta/profile2', { pk: e.row.key_compra_venta });
							},
						}] : []),
						{
							label: 'Ver Vouchers',
							icon: <SIconApp name="Arrow" fill="#e4e4e4ff" width={16} />,
							onPress: () => {
								const vouchers = Array.isArray(e.row?.vouchers) ? e.row.vouchers : [];
								if (vouchers.length === 0) {
									SPopup.alert('No hay vouchers disponibles para este movimiento.');
									return;
								}
								PopupSeeVoucher.open(e.row?.key_empresa, e.row?.key, vouchers);
							},
						},
						...(puedeAnular ? [{
							label: esVenta ? 'Anular venta' : 'Anular compra',
							icon: <SIconApp name="cancelado" fill="#db0606ff" width={16} />,
							onPress: () => {
								SPopup.confirm({
									title: esVenta ? "Anular venta" : "Anular compra",
									message: `¿Está seguro de que desea anular esta ${esVenta ? "venta" : "compra"}? Esta acción no se puede deshacer.`,
									onPress: () => {
										const notificationKey = `anular_${e.row?.key_compra_venta}`;
										SNotification.send({ key: notificationKey, title: esVenta ? "Anulando venta..." : "Anulando compra...", type: "loading" });
										const promesa = esVenta
											? MDL.caja.anular_venta({ key_compra_venta: e.row?.key_compra_venta })
											: MDL.caja.anular_compra({ key_compra_venta: e.row?.key_compra_venta });
										promesa
											.then(() => {
												SNotification.send({ key: notificationKey, title: esVenta ? "Venta anulada" : "Compra anulada", body: `La ${esVenta ? "venta" : "compra"} se anuló correctamente.`, color: STheme.color.success });
												if (this.DinamicTable3) this.DinamicTable3.loadData();
											})
											.catch((error) => {
												SNotification.send({ key: notificationKey, title: "Error al anular", body: error?.error || error?.message || String(error), color: STheme.color.danger });
											});
									}
								});
							},
						}] : []),
						...(e.row?.key_comprobante ? [{
							label: 'Ver Comprobante Contable',
							icon: <SIconApp name="Ajustes" fill="#e4e4e4ff" width={16} />,
							onPress: () => {

								if (e.row?.codigo_comprobante === 0) {
									SPopup.alert('No hay comprobantes.');
									return;
								}
								SNavigation.navigate('/contabilidad/asiento_contable/profile', { pk: e.row.key_comprobante });
							},
						}] : []),
					];
					FloatMenu.open({
						e: e.evt,
						label: 'Opciones',
						options: menuOptions,
					});
				}}

				buildRowStyle={({ item }) => {
					const original = item?.__original ?? item;
					const tipoLower = (original?.tipo || "").toLowerCase();
					const esVentaOCompraAnulada = (tipoLower === "venta" || tipoLower === "compra") && Number(original?.estado_venta) === 0;
					return esVentaOCompraAnulada ? { opacity: 0.45 } : {};
				}}

				loadInitialState={async () => ({
					// sorters: [{ key: "fecha", order: "desc", type: "date" }],
				})}

				listFooterComponent={() => {
					return <SHr height={100} />

				}}

			>
				<DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />

				<DinamicTable.Col key="key_sucursal" label="SUCURSAL" width={140} height={60}
					data={(e) => {
						const sucursal = this.state.sucursales.find(
							s => s.key === e.row.key_sucursal
						);

						return sucursal?.descripcion || "-";
					}}
				/>
				{/* <DinamicTable.Col key="venta_bruta" label="VENTA BRUTA" width={140} height={60} data={(e) => SMath.formatMoney(e.row?.venta_bruta || 0)} />
				<DinamicTable.Col key="anulaciones" label="ANULACIONES" width={140} height={60} data={(e) => SMath.formatMoney(e.row?.anulaciones || 0)} />
				<DinamicTable.Col key="venta_neta" label="VENTA NETA" width={140} height={60} data={(e) => SMath.formatMoney(e.row?.venta_neta || 0)} />
				<DinamicTable.Col key="porcentaje" label="% NETA" width={140} height={60} data={(e) => `${e.row?.porcentaje || 0}%`} />
				<DinamicTable.Col key="nro_ventas" label="N° VENTAS" width={140} height={60} data={(e) => SMath.formatMoney(e.row?.nro_ventas || 0)} />
				<DinamicTable.Col key="ticket_promedio" label="TICKET PROMEDIO" width={140} height={60} data={(e) => SMath.formatMoney(e.row?.ticket_promedio || 0)} /> */}

				<DinamicTable.Col key="total_efectivo" label="EFECTIVO" width={140} height={60} data={(e) => e.row?.total_efectivo > 0 ? ((e.row?.total_efectivo || 0)) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.total_efectivo) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>
				<DinamicTable.Col key="total_qr" label="QR" width={140} height={60} data={(e) => e.row?.total_qr > 0 ? ((e.row?.total_qr || 0)) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.total_qr) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>
				<DinamicTable.Col key="total_credito" label="CRÉDITO" width={140} height={60} data={(e) => e.row?.total_credito > 0 ? ((e.row?.total_credito || 0)) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.total_credito) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>
				<DinamicTable.Col key="venta_bruta" label="VENTA BRUTA" width={140} height={60} data={(e) => e.row?.venta_bruta > 0 ? ((e.row?.venta_bruta || 0)) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.venta_bruta) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>
				<DinamicTable.Col key="anulaciones" label="ANULACIONES" width={140} height={60} data={(e) => e.row?.anulaciones ? ((e.row?.anulaciones || 0)) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.anulaciones) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>
				<DinamicTable.Col key="venta_neta" label="VENTA NETA" width={140} height={60} data={(e) => e.row?.venta_neta > 0 ? ((e.row?.venta_neta || 0)) : 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.venta_neta) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>
				<DinamicTable.Col key="nro_ventas" label="NRO. VENTAS" width={140} height={60} data={(e) => e.row?.nro_ventas || 0}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + ((row.nro_ventas) || 0), 0);
						// const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? ` ${(total)}` : '';
					}}
					sumExcel
					// excelFormat="#,##0.00"
					dataType="number"
					format={e => (e.data ? (e.data) : '')}
				/>







			</DinamicTable >
		);
	}

	render() {
		return (
			<SPage title="Informe Caja"  >
				<SHr height={8} />
				<SView width={260} center>
					<DateTimeBetween
						fecha_inicio={this.state.fecha_inicio}
						fecha_fin={this.state.fecha_fin}
						onChange={({ fecha_inicio, fecha_fin }) => {
							const esPrimerLlamado = !this._periodoListo;
							this._periodoListo = true;
							this.setState({ fecha_inicio, fecha_fin }, () => {
								if (!esPrimerLlamado && this.DinamicTable) this.DinamicTable.loadData();
								if (!esPrimerLlamado && this.DinamicTable2) this.DinamicTable2.loadData();
								if (!esPrimerLlamado && this.DinamicTable3) this.DinamicTable3.loadData();

							});
						}}
					/>
				</SView>
				<SHr height={8} />
				<SText fontSize={16} bold >INGRESO POR DÍA</SText>
				{this.renderTabla()}
				<SHr height={20} />
				<SText fontSize={16} bold >RESUMEN POR FORMA DE PAGO</SText>
				{this.renderTablaFormaPago()}
				<SHr height={10} />
				<SText fontSize={16} bold >VENTA POR SUCURSAL</SText>
				{this.renderTablaSucursal()}
				<SHr h={16} />
			</SPage>
		);
	}
}