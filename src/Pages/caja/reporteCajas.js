import React, { Component } from 'react';
import { SView, SPage, SHr, STheme, SDate, SText, SImage, SMath, SNavigation } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import DateTimeBetween from '../../Components/DateTimeBetween';

export default class reporteCajas extends Component {
	constructor(props) {
		super(props);
		const hoy = new Date();
		const pad = n => String(n).padStart(2, '0');
		const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		this.state = {
			fecha_inicio: fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
			fecha_fin: fmt(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)),
			data: [],
			estado_caja: null,
		};
		this._periodoListo = false;
	}

	async loadInitialData() {
		try {
			console.log("📦 Cargando movimientos de caja...");
			const empresaKey = MDL.empresa.select?.key;

			if (!empresaKey) throw new Error("Empresa no seleccionada.");
			const { fecha_inicio, fecha_fin } = this.state;
			const movimientos = await MDL.caja.getAllCajasByEmpresa(empresaKey, fecha_inicio, fecha_fin);
			if (!Array.isArray(movimientos)) {
				console.warn("No se recibieron movimientos válidos.");
				return [];
			}
			const empresa = await MDL.empresa.getFull();

			const base = empresa.monedas.find(a => a.tipo == "base");

			const sucursales = empresa?.sucursales ?? [];
			const puntos_ventas = sucursales.flatMap(s => s.puntos_venta || []);
			const usuarioKeys = [...new Set(movimientos.map(m => m.key_usuario).filter(Boolean))];
			const usuarios = (await MDL.usuario.getByKeys(usuarioKeys)) ?? [];
			const usuarioMap = Object.fromEntries(usuarios.map(u => [u.key, u]));
			let processedData = movimientos.map(mov => ({
				...mov,
				usuario: usuarioMap[mov.key_usuario] ?? null,
				puntos_venta: puntos_ventas.find(pv => pv.key === mov.key_punto_venta) ?? null,
				sucursal: sucursales.find(s => s.key === mov.key_sucursal) ?? null,
				moneda: base,
			}));
			if (this.state.estado_caja) {
				processedData = processedData.filter(mov => mov.estado_caja === this.state.estado_caja);
			}
			return processedData;
		} catch (error) {
			console.error("❌ Error al cargar movimientos:", error);
			return [];
		}
	}

	renderTabla() {
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
				loadInitialState={async () => ({

					filters: [
						{ col: "estado_caja", operator: "=", value: "abierta", type: "string" },
					],

					sorters: [{ key: "fecha_on", order: "desc", type: "date" }

					],
				})}
				{...Config.table.applyTheme()}
				renderLoading={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>Cargando cajas...</SText>
					</SView>
				)}
				renderNoResults={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron cajas en el rango seleccionado.</SText>
					</SView>
				)}
				renderError={({ error }) => (
					<SView col={"xs-12"} padding={16}>
						<SText fontSize={13} color={STheme.color.danger}>Error: {error?.message || String(error)}</SText>
					</SView>
				)}
			>
				<DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />
				<DinamicTable.Col
					key="fecha"
					label="FECHA"
					width={80}
					dataType="date"
					data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}

					textStyle={{ fontSize: 12, color: STheme.color.text }}
					dateFormat="yyyy-MM-dd"
				/>
				<DinamicTable.Col
					key="sucursal"
					label="SUCURSAL"
					width={120}
					data={e => e.row?.sucursal?.descripcion ?? "Sin sucursal"}
					customComponent={e => {
						const key = e.row?.key_sucursal;
						const descripcion = e.row?.sucursal?.descripcion ?? "Sin sucursal";
						return key ? (
							<SView col="xs-12" row center>
								<SView
									style={{
										width: 24,
										height: 24,
										borderRadius: 100,
										overflow: "hidden",
										backgroundColor: STheme.color.card + "66",
									}}
								>
									<SImage
										src={`${SSocket.api.empresa}sucursal/${key}`}
										style={{ resizeMode: "cover" }}
									/>
								</SView>
								<SView width={5} />
								<SText flex numberOfLines={1} style={e.textStyle}>
									{descripcion}
								</SText>
							</SView>
						) : (
							<SText>Sin sucursal</SText>
						);
					}}
				/>

				<DinamicTable.Col
					key="punto"
					label="P.VENTA"
					width={100}
					data={e => e.row?.puntos_venta?.descripcion ?? "Sin punto de venta"}
				/>

				<DinamicTable.Col
					key="admin"
					label="CAJERO"
					width={120}
					data={e => e.row?.usuario?.Nombres ?? "Sin cajero"}
					customComponent={e => {
						const key = e.row?.key_usuario;
						const nombre = e.row?.usuario?.Nombres ?? "Sin cajero";
						return key ? (
							<SView col="xs-12" row center>
								<SView
									style={{
										width: 24,
										height: 24,
										borderRadius: 100,
										overflow: "hidden",
										backgroundColor: STheme.color.card + "66",
									}}
								>
									<SImage
										src={`${SSocket.api.root}usuario/${key}`}
										style={{ resizeMode: "cover" }}
									/>
								</SView>
								<SView width={5} />
								<SText flex numberOfLines={1} style={e.textStyle}>
									{nombre}
								</SText>
							</SView>
						) : (
							<SText>Sin cajero</SText>
						);
					}}
				/>
				<DinamicTable.Col
					key="estado_caja"
					label="ESTADO"
					width={80}
					data={e => e.row?.estado_caja ?? "Desconocido"}
					customComponent={e => {
						const estado = e.row?.estado_caja ?? "Desconocido";
						return (
							<SView col={"xs-12"} row center >
								<SView
									padding={6}
									center
									row
									style={{
										backgroundColor: estado === "cerrada" ? STheme.color.danger + "33" : STheme.color.success + "33",
										borderColor: estado === "cerrada" ? STheme.color.danger : STheme.color.success,
										borderWidth: 1,
										borderRadius: 4,
									}}
									onPress={() => {
										SNavigation.navigate("/caja/detail", { key: e.row?.key })
									}}
								>
									<SView
										width={6}
										height={6}
										style={{
											backgroundColor: estado === "cerrada" ? STheme.color.danger : STheme.color.success,
											borderRadius: 8,
										}}
									/>
									<SView width={4} />
									<SText
										style={{
											textTransform: "uppercase",
											fontSize: 10,
											fontWeight: "bold",
										}}
									>
										{estado}
									</SText>
								</SView>
							</SView>
						);
					}}
				/>

				<DinamicTable.Col
					key="fecha_on"
					label="F.APERTURA"
					width={130}
					dataType="date"
					data={e => (e.row?.fecha_on ? new SDate(e.row.fecha_on, "yyyy-MM-ddThh:mm:ss").date : null)}
					dateFormat="yyyy-MM-dd hh:mm"
				/>

				<DinamicTable.Col
					key="fecha_cierre"
					label="F.CIERRE"
					width={130}
					dataType="date"
					data={e =>
						e.row?.fecha_cierre ? new SDate(e.row.fecha_cierre, "yyyy-MM-ddThh:mm:ss").date : null
					}
					dateFormat="yyyy-MM-dd hh:mm"
				/>

				<DinamicTable.Col
					key="tiempos"
					label="DURACIÓN"
					width={90}
					data={e => {
						const { fecha_on, fecha_cierre } = e.row;
						if (!fecha_on || !fecha_cierre) return null;
						return new Date(fecha_cierre).getTime() - new Date(fecha_on).getTime();
					}}
					format={e => {
						const { fecha_on, fecha_cierre } = e.row;
						if (!fecha_on || !fecha_cierre) {
							return (
								<SView col={"xs-12"} row center>
									<SView
										padding={4}
										center
										row
										style={{
											backgroundColor: "#e8eef0ff",
											borderColor: "#2596be",
											borderWidth: 1,
											borderRadius: 20,
										}}
									>
										<SText style={{ textTransform: "uppercase", fontSize: 10, color: "#159ecfff" }}>
											En curso
										</SText>
									</SView>
								</SView>
							);
						}
						return new SDate(fecha_on).timeSince(new SDate(fecha_cierre));
					}}
					textStyle={{ fontSize: 12, color: STheme.color.text }}
				/>
				{}

				<DinamicTable.Col
					key="total_monto_apertura"
					wrap
					label="MONTO APERTURA"
					width={90}
					data={e => e.row?.total_monto_apertura ?? 0}
					cellStyle={{ backgroundColor: "#007bff33" }}
					textStyle={{ textAlign: "right" }}
					format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
				/>

				<DinamicTable.Col
					key="total_monto_venta"
					wrap
					label="VENTAS TOTALES"
					width={90}
					data={e => e.row?.total_monto_venta ?? 0}
					cellStyle={{ backgroundColor: "#28a74566" }}
					textStyle={{ textAlign: "right" }}
					format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
				/>

				<DinamicTable.Col
					key="total_monto_ingresos"
					wrap
					label="INGRESOS TOTALES"
					width={90}
					data={e => e.row?.total_monto_ingresos ?? 0}
					cellStyle={{ backgroundColor: "#28a74533" }}
					textStyle={{ textAlign: "right" }}
					format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
				/>

				<DinamicTable.Col
					key="total_cantidad_ingresos"
					wrap
					label="CANT. DE INGRESOS"
					width={90}
					data={e => e.row?.total_cantidad_ingresos ?? 0}
					cellStyle={{ backgroundColor: "#28a74533" }}
					textStyle={{ textAlign: "right" }}
					format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
				/>

				<DinamicTable.Col
					key="total_monto_compra"
					wrap
					label="MONTO COMPRAS"
					width={90}
					data={e => e.row?.total_monto_compra ?? 0}
					cellStyle={{ backgroundColor: "#ffc10766" }}
					textStyle={{ textAlign: "right" }}
					format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
				/>

				<DinamicTable.Col
					key="total_monto_egresos"
					wrap
					label="EGRESOS TOTALES"
					width={90}
					data={e => e.row?.total_monto_egresos ?? 0}
					cellStyle={{ backgroundColor: "#ffc10733" }}
					textStyle={{ textAlign: "right" }}
					format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
				/>

				<DinamicTable.Col
					key="total_cantidad_egresos"
					wrap
					label="CANT. DE EGRESOS"
					width={90}
					data={e => e.row?.total_cantidad_egresos ?? 0}
					cellStyle={{ backgroundColor: "#ffc10733" }}
					textStyle={{ textAlign: "right" }}
					format={e => (!e.data ? "" : SMath.formatMoney(e.data))}
				/>

			</DinamicTable>
		);
	}
	render() {
		return (
			<SPage title="Reporte de Cajas por Sucursal" disableScroll>
				<SHr></SHr>
				<SView row col={"xs-12"} style={{ alignItems: 'center', flexWrap: 'wrap', paddingHorizontal: 8, gap: 8 }}>
					<SView width={260} center>
						<DateTimeBetween
							fecha_inicio={this.state.fecha_inicio}
							fecha_fin={this.state.fecha_fin}
							onChange={({ fecha_inicio, fecha_fin }) => {
								const esPrimerLlamado = !this._periodoListo;
								this._periodoListo = true;
								this.setState({ fecha_inicio, fecha_fin }, () => {
									if (!esPrimerLlamado && this.DinamicTable) this.DinamicTable.loadData();
								});
							}}
						/>
					</SView>
					{}
				</SView>
				<SHr></SHr>

				{this.renderTabla()}
				<SHr h={16} />
			</SPage>
		);
	}
}