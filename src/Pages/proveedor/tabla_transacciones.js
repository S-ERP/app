import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SNavigation, SDate, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import { Dimensions } from 'react-native';
import Config from '../../Config';
import MDL from '../../MDL';
import FechaFullFilter2 from '../../Components/FechaFullFilter2';
import SIconApp from '../../Assets/SIconApp';
import ComprobanteKardexIndividual from '../../Components/PDF/compra/ComprobanteKardexIndividual';
import SSocket from 'servisofts-socket';
import SelectTipoPagoCompra from '../caja2/components/SelectTipoPagoCompra';
import SInput2 from '../../Components/SForm2/SInput2';

const DARK = {
	card: '#1c1f24',
	cardAlt: '#1c1f24' + "CC",
	cardAlt1: '#1c1f24' + "40",
	cardAlt2: '#1c1f24' + "80",
	cardAlt3: '#1c1f24' + "FF",
	cardSoft: '#2a2e35',
	border: STheme.color.gray + "66",
	text: STheme.color.text,
	textMuted: STheme.color.lightGray,
	principal: '#1a3c66',
	greenLight: '#4a7ab5',
	danger: STheme.color.danger,
};

class AmortizarModalContent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			monto: 0,
			error: "",
		};
	}

	handleConfirm() {
		const { saldo, onConfirm } = this.props;
		const { monto } = this.state;
		if (monto <= 0) {
			this.setState({ error: "El monto debe ser mayor a 0." });
			return;
		}
		if (monto > saldo) {
			this.setState({ error: "El monto no puede ser mayor al saldo pendiente." });
			return;
		}
		this.setState({ error: "" });
		onConfirm(monto);
	}

	render() {
		const { saldo, simboloBase, formatMonto, onCancel } = this.props;
		const { error } = this.state;
		return (
			<SView col="xs-11 md-4"
				backgroundColor={DARK.card}
				withoutFeedback
				style={{ borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: DARK.border, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 24 }}>

				<SView row col="xs-12" style={{ alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: DARK.border }}>
					<SView row style={{ alignItems: "center" }}>
						<SView width={36} height={36} center style={{ borderRadius: 10, backgroundColor: DARK.principal + "22" }}>
							<SIconApp name="pagotarjeta" width={18} height={18} fill={DARK.greenLight} />
						</SView>
						<SView width={10} />
						<SText bold fontSize={17} color={DARK.text}>Amortizar Deuda</SText>
					</SView>
					<SView width={28} height={28} center style={{ borderRadius: 14, backgroundColor: DARK.cardSoft }} onPress={onCancel}>
						<SIconApp name="Close" width={12} height={12} fill={DARK.textMuted} />
					</SView>
				</SView>

				<SView col="xs-12" padding={20}>
					<SView col="xs-12" style={{ backgroundColor: DARK.cardSoft, borderRadius: 12, borderWidth: 1, borderColor: DARK.border, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 20, alignItems: "center" }}>
						<SText fontSize={12} color={DARK.textMuted}>Saldo pendiente</SText>
						<SHr height={4} />
						<SText bold fontSize={22} color={DARK.greenLight}>{formatMonto(saldo)}</SText>
					</SView>

					<SText fontSize={12} color={DARK.textMuted} style={{ marginBottom: 6 }}>Monto a pagar</SText>
					<SView row col="xs-12" style={{ height: 48, borderRadius: 10, borderWidth: 1, borderColor: error ? DARK.danger : DARK.border, backgroundColor: DARK.cardSoft, alignItems: "center", paddingHorizontal: 12 }}>
						<SText fontSize={13} bold color={DARK.textMuted} style={{ marginRight: 8 }}>{simboloBase}</SText>
						<SView flex height center>
							<SInput2
								type="money"
								style={{ width: "100%", textAlign: "right", fontSize: 15, color: DARK.text }}
								placeholder="0.00"
								onChangeText={(val) => { this.setState({ monto: parseFloat(val) || 0, error: "" }); }}
							/>
						</SView>
					</SView>
					{!!error && (
						<SView row style={{ alignItems: "center", marginTop: 8 }}>
							<SIconApp name="Alert" width={13} height={13} fill={DARK.danger} />
							<SView width={6} />
							<SText fontSize={12} color={DARK.danger}>{error}</SText>
						</SView>
					)}

					<SHr height={20} />
					<SView row col="xs-12" style={{ gap: 12 }}>
						<SView flex height={44} borderRadius={10} center backgroundColor={DARK.cardSoft + "44"} border={DARK.border} onPress={onCancel}>
							<SText color={DARK.text}>Cancelar</SText>
						</SView>
						<SView flex height={44} borderRadius={10} center backgroundColor={DARK.principal} onPress={() => this.handleConfirm()}>
							<SText color={"#fff"}>Confirmar</SText>
						</SView>
					</SView>
				</SView>
			</SView>
		);
	}
}

function ConfirmarAnularModalContent({ montoLabel, onCancel, onConfirm }) {
	return (
		<SView col="xs-11 md-4"
			backgroundColor={DARK.card}
			withoutFeedback
			style={{ borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: DARK.border, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 24 }}>

			<SView row col="xs-12" style={{ alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: DARK.border }}>
				<SView row style={{ alignItems: "center" }}>
					<SIconApp name="AlertOutline" width={18} height={18} fill={DARK.danger} />
					<SView width={8} />
					<SText bold fontSize={17} color={DARK.danger}>Anular Amortización</SText>
				</SView>
				<SView width={28} height={28} center onPress={onCancel} style={{
					transform: [{ rotate: "45deg" }],
				}}

				>
					<SIconApp name="addFoto" width={20} height={20} fill={DARK.textMuted}
					/>
				</SView>
			</SView>

			<SView col="xs-12" padding={20}>
				<SText fontSize={14} color={DARK.text} style={{ lineHeight: 20 }}>
					¿Estás seguro de anular la última amortización de <SText bold fontSize={14} color={DARK.text}>{montoLabel}</SText>? El saldo del proveedor volverá a incrementarse.
				</SText>

				<SHr height={20} />
				<SView row col="xs-12" style={{ gap: 12 }}>
					<SView flex height={44} borderRadius={10} center backgroundColor={DARK.cardSoft} border={DARK.border} onPress={onCancel}>
						<SText color={DARK.text}>Cancelar</SText>
					</SView>
					<SView flex height={44} borderRadius={10} center backgroundColor={DARK.danger} onPress={onConfirm}>
						<SText color={"#fff"}>Sí, anular</SText>
					</SView>
				</SView>
			</SView>
		</SView>
	);
}

export default class TablaTransaccionesProveedor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fecha_inicio: new SDate().toString("yyyy-MM-dd"),
			fecha_fin: new SDate().toString("yyyy-MM-dd"),
			moneda: null,
			proveedor: null,
			saldo: 0,
		};
		this.key = SNavigation.getParam("key");
		this.keysCuotas = [];
	}

	componentDidMount() {
		this.loadInitialData();
	}

	async loadInitialData() {
		try {
			const keyEmpresa = await MDL?.empresa?.select?.key;
			const fecha_inicio_total = "2024-01-01";
			const fecha_inicio = this.state.fecha_inicio;
			const fecha_fin = this.state.fecha_fin;
			if (!keyEmpresa || !this.key) return;
			const compras = await MDL.compra_venta.execute_function("_get_detalles_proveedor", [keyEmpresa, this.key, fecha_inicio_total, fecha_fin]);
			const proveedor = await MDL.crm.cliente.getByKey(this.key);

			const cuotas = await MDL.compra_venta.execute_function("_get_cuotas_pendientes_compras", [keyEmpresa, this.key]);
			this.cuotasDetalle = cuotas || [];
			this.keysCuotas = this.cuotasDetalle.map(c => c.key_cuota);
			if (this.cuotasDetalle.length === 0) console.warn("No se encontraron cuotas pendientes para el proveedor.");

			if (!compras || compras.length === 0) {
				this.setState({ proveedor: proveedor || {}, moneda: null, saldo: 0 });
				return [];
			}

			const [empresa, usuarios = [], almacenes = []] = await Promise.all([
				MDL.empresa.getFull(),
				MDL.usuario.getByKeys([...new Set(compras.map(v => v?.key_usuario).filter(Boolean))]),
				MDL.inventario.getAllAlmacen(),
			]);

			const sucursalesMap = Object.fromEntries((empresa?.sucursales || []).map(s => [s.key, s]));
			const monedasMap = Object.fromEntries((empresa?.monedas || []).map(m => [m.key, m]));
			const usuariosMap = Object.fromEntries((usuarios || []).map(u => [u.key, u]));
			const almacenesMap = Object.fromEntries((almacenes || []).map(a => [a.key, a]));

			let comprasEnriquecidas = compras.map((v, idx) => ({
				...v,
				key: `${v?.key_compra_venta || 'row'}_${idx}`,
				moneda: monedasMap[v?.key_moneda] || {},
				sucursal: sucursalesMap[v?.key_sucursal] || {},
				usuario: usuariosMap[v?.key_usuario] || {},
				almacen: almacenesMap[v?.key_almacen] || {},
				proveedor: proveedor || {},
			}));

			const moneda = comprasEnriquecidas[0]?.moneda || null;
			let saldoAcumulado = 0;
			comprasEnriquecidas = comprasEnriquecidas.map((item) => {
				const debe = item.debe || 0;
				const haber = item.haber || 0;
				saldoAcumulado += (debe - haber);
				return { ...item, saldo: saldoAcumulado };
			});

			let saldoAnterior = 0;
			comprasEnriquecidas.forEach(item => {
				const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
				if (fechaItem < fecha_inicio) {
					saldoAnterior = item.saldo;
				}
			});

			let comprasFiltradas = comprasEnriquecidas.filter(item => {
				const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
				return fechaItem >= fecha_inicio && fechaItem <= fecha_fin;
			});

			if (saldoAnterior !== 0) {
				comprasFiltradas = [
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
						proveedor: proveedor || {}
					},
					...comprasFiltradas
				];
			}

			const lastRow = comprasFiltradas[comprasFiltradas.length - 1];
			const saldo = lastRow?.saldo || 0;

			this.setState({
				proveedor: proveedor || {},
				moneda,
				saldo,
			});

			return comprasFiltradas;
		} catch (error) {
			console.warn("Error en loadInitialData:", error);
			SPopup.alert("Error al cargar los datos.");
			return [];
		}
	}

	formatMonto(value) {
		const sim = this.state.moneda?.observacion || 'Bs';
		const fmt = SMath.formatMoney(value || 0, 2);
		return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
	}

	footerBarStyle(align = 'center') {
		return {
			flex: 1,
			width: '100%',
			height: '100%',
			paddingVertical: 12,
			borderTopWidth: 2,
			borderTopColor: DARK.principal,
			backgroundColor: DARK.principal + '0D',
			alignItems: align,
			justifyContent: 'center',
		};
	}

	tipoBadgeColor(tipo) {
		const t = (tipo || '').toString().toLowerCase();
		if (t.includes('saldo')) return '#42A5F5';
		if (t.includes('compra')) return '#FB8C00';
		if (t.includes('cuota') || t.includes('pago') || t.includes('amortiz')) return STheme.color.success;
		return STheme.color.lightGray;
	}

	openRowMenu(evt, row, dinamicTable) {
		let top = evt.nativeEvent.pageY;
		const h = Dimensions.get("window").height;
		if (h < top + 300) top = h - 300;
		SPopup.open({
			key: "popup_menu_transacciones_proveedor",
			type: "2",
			content: (
				<SView withoutFeedback style={{ position: "absolute", top, left: evt.nativeEvent.pageX, width: 250 }} center>
					{this.renderMenuTransacciones(row, dinamicTable)}
				</SView>
			)
		});
	}

	esAmortizacionAnulable(row, dinamicTable) {
		const rows = dinamicTable?.dataFiltrada || [];
		const esUltimo = rows.length > 0 && rows[rows.length - 1]?.__original?.key === row?.key;
		const esAmortizacion = Number(row?.haber) > 0;
		return esUltimo && esAmortizacion;
	}

	renderMenuTransacciones(row, dinamicTable) {
		const RenderOption = ({ label, icon, iconProps, onPress }) => {
			return (
				<>
					<SView col={"xs-11"} row center onPress={() => { if (onPress) onPress(); SPopup.close("popup_menu_transacciones_proveedor"); }}>
						<SView col={"xs-2"} center height={32}>
							<SIconApp name={icon} height={18} fill={iconProps?.fill || DARK.text} stroke={iconProps?.stroke} />
						</SView>
						<SView width={8} />
						<SView flex> <SText fontSize={14} color={iconProps?.fill || DARK.text}>{label}</SText> </SView>
					</SView>
					<SHr height={1} color={DARK.border} />
				</>
			);
		};
		const keyProveedor = row?.proveedor?.key || this.key;
		const groups = [
			{
				title: "CONSULTA",
				items: [
					row?.key_compra_venta && {
						label: "Ver detalle compra",
						icon: "receipt",
						onPress: () => { SNavigation.navigate("/venta/profile2", { pk: row.key_compra_venta }); },
					},
					keyProveedor && {
						label: "Ver proveedor",
						icon: "personBadge",
						onPress: () => { SNavigation.navigate("/cliente/perfil", { key: keyProveedor, tipo: "proveedor" }); },
					},
				].filter(Boolean),
			},
			{
				title: "GESTIÓN",
				items: [
					this.esAmortizacionAnulable(row, dinamicTable) && {
						label: "Anular Amortización",
						icon: "anular",
						iconProps: { fill: DARK.danger, stroke: DARK.danger },
						onPress: () => {
							SPopup.open({
								key: "popup-confirmar-anular-amortizacion",
								content: (
									<ConfirmarAnularModalContent
										montoLabel={this.formatMonto(row?.haber)}
										onCancel={() => SPopup.close("popup-confirmar-anular-amortizacion")}
										onConfirm={() => {
											SPopup.close("popup-confirmar-anular-amortizacion");
											SPopup.alert('Trabajando en la función de anulación...');
										}}
									/>
								)
							});
						},
					},
				].filter(Boolean),
			},
		].filter(group => group && group.items.length > 0);
		return (
			<SView col={"xs-12"} backgroundColor={DARK.cardAlt} style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: DARK.border, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20 }}>
				{groups.map((group, gi) => (
					<SView key={gi} col={"xs-12"}>
						<SView col={"xs-12"} style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 1 }}>
							<SText color={DARK.textMuted} fontSize={11} style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>{group.title}</SText>
						</SView>
						{group.items.map((opt, i) => (<RenderOption key={i} {...opt} />))}
						{gi !== groups.length - 1 && <SHr height={1} color={DARK.border} />}
					</SView>
				))}
			</SView>
		);
	}

	mostrarTabla() {
		return (
			<SView col={'xs-12'} flex>
				<SView col={'xs-12'} style={{ width: 920, alignSelf: 'center', backgroundColor: DARK.cardAlt, borderRadius: 20, borderWidth: 1, borderColor: DARK.border, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 30 }} flex >

					<DinamicTable
						ref={ref => (this.DinamicTable = ref)}
						loadData={this.loadInitialData.bind(this)}
						key="id"
						language="es"
						center
						{...Config.table.applyTheme({
							colors: {
								text: STheme.color.text, background: DARK.cardAlt, header: DARK.principal, border: DARK.border, card: DARK.border,

							}
						})}
						keyExtractor={(e) => e?.key}
						textTitleStyle={{ fontWeight: "bold", textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5 }}
						style={{ flex: 1 }}
						iconSize={22}
						padding={8}
						adjustColumnWidth
						listFooterComponent={() => <SHr height={60} />}

						hoverStyle={{ backgroundColor: DARK.principal + "1F" }}
						buildRowStyle={({ item }) => item?.__original?.descripcion === "Saldo anterior" ? { backgroundColor: DARK.principal + '14' } : {}}
						renderHeaderActions={() => null}
						renderNoResults={() => (
							<SView col={"xs-12"} center padding={24}>
								<SText fontSize={13} color={DARK.textMuted}>No se encontraron transacciones en el rango seleccionado.</SText>
							</SView>
						)}
						onSelect={(e) => this.openRowMenu(e.evt, e.row, e.dinamicTable)}
					>
						<DinamicTable.Col key="index" label="N°" width={30} data={(e) => (e?.index ?? 0) + 1}
							footerComponent={() => <SView style={this.footerBarStyle('center')} />}
						/>
						<DinamicTable.Col key="fecha" label="Fecha" width={80} data={e => e?.row?.fecha_on ? new SDate(e.row.fecha_on).toString("dd/MM/yyyy") : ""}
							footerComponent={() => <SView style={this.footerBarStyle('center')} />}
						/>
						<DinamicTable.Col key="tipo" label="Tipo" width={80} data={(e) => e?.row?.tipo || "-"} customComponent={(e) => {
							const color = this.tipoBadgeColor(e?.row?.tipo);
							return <SView style={{ paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, backgroundColor: color + "26", borderWidth: 1, borderColor: color + "59" }} center >
								<SText fontSize={10} bold color={color} style={{ textTransform: "uppercase", letterSpacing: 0.3 }} >{e.data}</SText>
							</SView>
						}}
							footerComponent={() => <SView style={this.footerBarStyle('center')} />}
						/>

						<DinamicTable.Col key="detalle" label="Detalle" width={340} data={(e) => e?.row?.descripcion || "-"}
							customComponent={(e) => (
								<SText color={DARK.text}>
									{e?.row?.descripcion || "-"}
								</SText>
							)}
							footerComponent={() => (
								<SView style={this.footerBarStyle('flex-end')}>
									<SText bold fontSize={13} color={DARK.text}>TOTAL</SText>
								</SView>
							)}
						/>
						<DinamicTable.Col key="debe" label="Debe" width={100} data={(e) => e?.row?.debe ?? 0} cellStyle={{ alignItems: "flex-start" }}
							format={(e) => e.data ? this.formatMonto(e.data) : ""}
							footerComponent={(e) => {
								let total = 0;
								e.dinamicTable.data.map(a => { total += a.debe || 0 });
								return <SView style={this.footerBarStyle('flex-start')}><SText bold fontSize={13} color={DARK.text}>{this.formatMonto(total)}</SText></SView>
							}}
						/>
						<DinamicTable.Col key="haber" label="Haber" width={100} data={(e) => e?.row?.haber ?? 0} cellStyle={{ alignItems: "flex-start" }}
							format={(e) => e.data ? this.formatMonto(e.data) : ""}
							footerComponent={(e) => {
								let total = 0;
								e.dinamicTable.data.map(a => { total += a.haber || 0 });
								return <SView style={this.footerBarStyle('flex-start')}><SText bold fontSize={13} color={DARK.text}>{this.formatMonto(total)}</SText></SView>
							}}
						/>
						<DinamicTable.Col key="saldo" label="Saldo" width={120} data={(e) => e?.row?.saldo ?? 0} cellStyle={{ alignItems: "flex-end" }}
							format={(e) => this.formatMonto(e.data)}
							footerComponent={(e) => {
								const lastRow = e.dinamicTable.data[e.dinamicTable.data.length - 1];
								const totalSaldo = lastRow?.saldo || 0;
								return (
									<SView style={this.footerBarStyle('flex-end')}>
										<SText bold fontSize={14} color={STheme.color.text}>{this.formatMonto(totalSaldo)}</SText>
										{/* <SText bold fontSize={14} color={DARK.principal}>{this.formatMonto(totalSaldo)}</SText> */}
									</SView>
								);
							}}
						/>
						<DinamicTable.Col key="acciones" label="" width={40} data={() => ""} cellStyle={{ alignItems: "center" }}
							customComponent={(e) => (
								<SView
									onPress={(evt) => this.openRowMenu(evt, e.row, e.dinamicTable)}
									width={32}
									height={32}
									center
									style={{ borderRadius: 8 }}
								>
									<SIconApp name="threeDotsVertical" width={18} height={18} fill={DARK.textMuted} />
								</SView>
							)}
							footerComponent={() => <SView style={this.footerBarStyle('center')} />}
						/>
					</DinamicTable>
				</SView>
			</SView>
		);
	}

	async showPagoPopup() {
		try {
			const activa = await MDL.caja.getActiva();
			const saldo = this.state.saldo || 0;
			const moneda = this.state.moneda || {};
			const simboloBase = moneda?.observacion || 'BOB';
			const cuotas = this.keysCuotas || [];
			if (!activa) {
				SNotification.send({
					title: 'Caja no aperturada',
					body: 'Abre la caja primero.',
					color: STheme.color.danger,
					time: 5000
				});
				return;
			}
			SPopup.open({
				key: "popup-compra-completada",
				content: (
					<AmortizarModalContent
						saldo={saldo}
						simboloBase={simboloBase}
						formatMonto={(v) => this.formatMonto(v)}
						onCancel={() => SPopup.close("popup-compra-completada")}
						onConfirm={async (monto) => {
							const activa = await MDL.caja.getActiva();
							if (!activa) {
								SNotification.send({ title: 'Caja no aperturada', body: 'Abre la caja primero.', color: STheme.color.danger, time: 5000 });
								return;
							}

							SelectTipoPagoCompra.openPopup({
								key_punto_venta: activa.key_punto_venta,
								key_moneda: moneda.key,
								montoMaximo: monto,
								monedaSymbol: simboloBase,
								onSelect: (item) => {
									const enviar = { tipos_pago: item, cuotas: cuotas };
									SSocket.sendPromise({
										service: "caja",
										component: "caja_detalle",
										type: "amortizarCuotaCompra",
										data: enviar,
										key_usuario: MDL.usuario.session?.key,
										key_empresa: MDL.empresa.select?.key,
										key_caja: MDL.caja.activa?.key,
									}).then(resp => {
										if (resp?.estado === "exito") {
											SNotification.send({ title: "Éxito", body: "Se amortizó correctamente la deuda del proveedor.", color: STheme.color.success, time: 3000 });
											this.DinamicTable.loadData();
											if (this.props.onSuccess) this.props.onSuccess(resp)
											SelectTipoPagoCompra.closePopup();
										}
									}).catch(err => {
										SNotification.send({ title: 'Error', body: err?.message || 'Falló el pago.', color: STheme.color.danger });
									});
									SelectTipoPagoCompra.closePopup();
									SPopup.close("popup-compra-completada");
								}
							});
						}}
					/>
				)
			});
		} catch (e) {
			console.warn("No se pudo verificar la caja:", e);
			SNotification.send({
				title: 'Error',
				body: 'No se pudo verificar la caja.',
				color: STheme.color.danger,
				time: 5000
			});
		}
	}

	render() {
		const { proveedor } = this.state;
		const proveedorNombre = `${proveedor?.nombres || ''} ${proveedor?.apellidos || ''}` || '-';
		return (
			<SPage title="Kardex Proveedor" disableScroll>
				<SView col={'xs-12'} flex style={{ padding: 16 }}>

					<SView col={'xs-12'} center backgroundColor='transparent' row>
						<SView col={'xs-12'} style={{
							width: 920,
							alignSelf: 'center',
							backgroundColor: DARK.cardAlt,
							borderRadius: 16,
							borderWidth: 1,
							borderColor: DARK.border,
							padding: 20,
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 10 },
							shadowOpacity: 0.35,
							shadowRadius: 30,
						}}>
							<SView row center>
								<SView width={48} height={48} center style={{ borderRadius: 14, backgroundColor: DARK.principal }}>
									<SIconApp name="heading" width={24} height={24} fill={"#fff"} />
								</SView>
								<SView width={12} />
								<SView flex>
									<SText fontSize={18} bold color={DARK.text}>Kardex Individual del Proveedor</SText>
									<SText fontSize={12} color={DARK.textMuted}>Trazabilidad financiera de compras, pagos y saldos</SText>
								</SView>
							</SView>

							<SHr height={16} />
							<SHr height={1} color={DARK.border} />
							<SHr height={16} />

							<SView row style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
								<FechaFullFilter2
									label="fecha"
									key_opciones="hoy"
									color={DARK.principal}
									onChange={e => {
										this.state.fecha_inicio = e.fecha_inicio;
										this.state.fecha_fin = e.fecha_fin;
										this.DinamicTable.loadData();
									}}
								/>
								<SView row center style={{
									backgroundColor: DARK.principal + '20',
									borderWidth: 1,
									borderColor: DARK.principal + '55',
									borderRadius: 30,
									paddingVertical: 8,
									paddingHorizontal: 16,
								}}>
									<SIconApp name="personBadge" width={14} height={14} fill={DARK.greenLight} />
									<SView width={8} />
									<SText fontSize={13} color={DARK.text}>Proveedor: <SText bold>{proveedorNombre}</SText></SText>
								</SView>
								<SView
									onPress={() => ComprobanteKardexIndividual.imprimir(this.key, this.state.fecha_inicio, this.state.fecha_fin, "compra")}
									backgroundColor={"transparent"}
									style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 30, borderWidth: 1.5, borderColor: DARK.danger + '8C' }}
									center
								>
									<SView row center>
										<SIconApp name="pdf" width={14} height={14} fill={DARK.danger} />
										<SView width={8} />
										<SText fontSize={13} color={DARK.danger} bold>DESCARGAR PDF</SText>
									</SView>
								</SView>
							</SView>
						</SView>
					</SView>



					<SHr height={10} />

					{/* <SView col={'xs-12'} center backgroundColor='transparent' row>
						<SView width={80} height={80} backgroundColor={DARK.cardAlt1} />
						<SView width={80} height={80} backgroundColor={DARK.cardAlt2} />
						<SView width={80} height={80} backgroundColor={DARK.cardAlt} />
						<SView width={80} height={80} backgroundColor={DARK.cardAlt3} />
					</SView> */}

					<SHr height={10} />
					{this.mostrarTabla()}

					<SHr height={20} />

					<SView col={'xs-12'} center backgroundColor='transparent' row>
						<SView col={'xs-12'} style={{ width: 920, alignSelf: 'center' }}>
							<SView row col={'xs-12'} style={{ justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
								{this.state.saldo > 0 && (
									<SView
										onPress={() => this.showPagoPopup()}
										backgroundColor={DARK.principal}
										style={{
											paddingVertical: 14,
											paddingHorizontal: 24,
											borderRadius: 30,
											shadowColor: DARK.principal,
											shadowOffset: { width: 0, height: 8 },
											shadowOpacity: 0.5,
											shadowRadius: 16,
										}}
										center
									>
										<SView row center>
											<SIconApp name="pagotarjeta" width={16} height={16} fill={"#fff"} />
											<SView width={6} />
											<SText color={"#fff"} bold>AMORTIZAR</SText>
										</SView>
									</SView>
								)}
							</SView>
						</SView>
					</SView>
				</SView>
			</SPage>
		);
	}
}
