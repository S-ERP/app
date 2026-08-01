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
import SelectTipoPagoVenta from '../caja2/components/SelectTipoPagoCompra';
import SInput2 from '../../Components/SForm2/SInput2';

const color_principal = '#1a3c66';

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
				backgroundColor={'#1c1f24'}
				withoutFeedback
				style={{ borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: STheme.color.gray + "66", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 24 }}>

				<SView row col="xs-12" style={{ alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: STheme.color.gray + "66" }}>
					<SView row style={{ alignItems: "center" }}>
						<SView width={36} height={36} center style={{ borderRadius: 10, backgroundColor: color_principal + "22" }}>
							<SIconApp name="pagotarjeta" width={18} height={18} fill={'#4a7ab5'} />
						</SView>
						<SView width={10} />
						<SText bold fontSize={17} color={STheme.color.text}>Amortizar Deuda</SText>
					</SView>
					<SView width={28} height={28} center style={{ borderRadius: 14, backgroundColor: '#2a2e35' }} onPress={onCancel}>
						<SIconApp name="Close" width={12} height={12} fill={STheme.color.lightGray} />
					</SView>
				</SView>

				<SView col="xs-12" padding={20}>
					<SView col="xs-12" style={{ backgroundColor: '#2a2e35', borderRadius: 12, borderWidth: 1, borderColor: STheme.color.gray + "66", paddingVertical: 14, paddingHorizontal: 16, marginBottom: 20, alignItems: "center" }}>
						<SText fontSize={12} color={STheme.color.lightGray}>Saldo pendiente</SText>
						<SHr height={4} />
						<SText bold fontSize={22} color={'#4a7ab5'}>{formatMonto(saldo)}</SText>
					</SView>

					<SText fontSize={12} color={STheme.color.lightGray} style={{ marginBottom: 6 }}>Monto a pagar</SText>
					<SView row col="xs-12" style={{ height: 48, borderRadius: 10, borderWidth: 1, borderColor: error ? STheme.color.danger : STheme.color.gray + "66", backgroundColor: '#2a2e35', alignItems: "center", paddingHorizontal: 12 }}>
						<SText fontSize={13} bold color={STheme.color.lightGray} style={{ marginRight: 8 }}>{simboloBase}</SText>
						<SView flex height center>
							<SInput2
								type="money"
								style={{ width: "100%", textAlign: "right", fontSize: 15, color: STheme.color.text }}
								placeholder="0.00"
								onChangeText={(val) => { this.setState({ monto: parseFloat(val) || 0, error: "" }); }}
							/>
						</SView>
					</SView>
					{!!error && (
						<SView row style={{ alignItems: "center", marginTop: 8 }}>
							<SIconApp name="Alert" width={13} height={13} fill={STheme.color.danger} />
							<SView width={6} />
							<SText fontSize={12} color={STheme.color.danger}>{error}</SText>
						</SView>
					)}

					<SHr height={20} />
					<SView row col="xs-12" style={{ gap: 12 }}>
						<SView flex height={44} borderRadius={10} center backgroundColor={'#2a2e35' + "44"} border={STheme.color.gray + "66"} onPress={onCancel}>
							<SText color={STheme.color.text}>Cancelar</SText>
						</SView>
						<SView flex height={44} borderRadius={10} center backgroundColor={color_principal} onPress={() => this.handleConfirm()}>
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
			backgroundColor={'#1c1f24'}
			withoutFeedback
			style={{ borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: STheme.color.gray + "66", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 24 }}>

			<SView row col="xs-12" style={{ alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: STheme.color.gray + "66" }}>
				<SView row style={{ alignItems: "center" }}>
					<SIconApp name="AlertOutline" width={18} height={18} fill={STheme.color.danger} />
					<SView width={8} />
					<SText bold fontSize={17} color={STheme.color.danger}>Anular Amortización</SText>
				</SView>
				<SView width={28} height={28} center onPress={onCancel} style={{
					transform: [{ rotate: "45deg" }],
				}}

				>
					<SIconApp name="addFoto" width={20} height={20} fill={STheme.color.lightGray}
					/>
				</SView>
			</SView>

			<SView col="xs-12" padding={20}>
				<SText fontSize={14} color={STheme.color.text} style={{ lineHeight: 20 }}>
					¿Estás seguro de anular la última amortización de <SText bold fontSize={14} color={STheme.color.text}>{montoLabel}</SText>? El saldo del cliente volverá a incrementarse.
				</SText>

				<SHr height={20} />
				<SView row col="xs-12" style={{ gap: 12 }}>
					<SView flex height={44} borderRadius={10} center backgroundColor={'#2a2e35'} border={STheme.color.gray + "66"} onPress={onCancel}>
						<SText color={STheme.color.text}>Cancelar</SText>
					</SView>
					<SView flex height={44} borderRadius={10} center backgroundColor={STheme.color.danger} onPress={onConfirm}>
						<SText color={"#fff"}>Sí, anular</SText>
					</SView>
				</SView>
			</SView>
		</SView>
	);
}

export default class TablaTransacciones extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fecha_inicio: new SDate().toString("yyyy-MM-dd"),
			fecha_fin: new SDate().toString("yyyy-MM-dd"),
			moneda: null,
			cliente: null,
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
			const ventas = await MDL.compra_venta.execute_function("_get_detalles_cliente", [keyEmpresa, this.key, fecha_inicio_total, fecha_fin]);
			const cliente = await MDL.crm.cliente.getByKey(this.key);

			const cuotas = await MDL.compra_venta.execute_function("_get_cuotas_pendientes_ventas", [keyEmpresa, this.key]);
			this.cuotasDetalle = cuotas || [];
			this.keysCuotas = this.cuotasDetalle.map(c => c.key_cuota);
			if (this.cuotasDetalle.length === 0) console.warn("No se encontraron cuotas pendientes para el cliente.");

			if (!ventas || ventas.length === 0) {
				this.setState({ cliente: cliente || {}, moneda: null, saldo: 0 });
				return [];
			}

			const [empresa, usuarios = [], almacenes = []] = await Promise.all([
				MDL.empresa.getFull(),
				MDL.usuario.getByKeys([...new Set(ventas.map(v => v?.key_usuario).filter(Boolean))]),
				MDL.inventario.getAllAlmacen(),
			]);

			const sucursalesMap = Object.fromEntries((empresa?.sucursales || []).map(s => [s.key, s]));
			const monedasMap = Object.fromEntries((empresa?.monedas || []).map(m => [m.key, m]));
			const usuariosMap = Object.fromEntries((usuarios || []).map(u => [u.key, u]));
			const almacenesMap = Object.fromEntries((almacenes || []).map(a => [a.key, a]));

			let ventasEnriquecidas = ventas.map((v, idx) => ({
				...v,
				key: `${v?.key_compra_venta || 'row'}_${idx}`,
				moneda: monedasMap[v?.key_moneda] || {},
				sucursal: sucursalesMap[v?.key_sucursal] || {},
				usuario: usuariosMap[v?.key_usuario] || {},
				almacen: almacenesMap[v?.key_almacen] || {},
				cliente: cliente || {},
			}));

			const moneda = ventasEnriquecidas[0]?.moneda || null;
			let saldoAcumulado = 0;
			ventasEnriquecidas = ventasEnriquecidas.map((item) => {
				const debe = item.debe || 0;
				const haber = item.haber || 0;
				saldoAcumulado += (debe - haber);
				return { ...item, saldo: saldoAcumulado };
			});

			let saldoAnterior = 0;
			ventasEnriquecidas.forEach(item => {
				const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
				if (fechaItem < fecha_inicio) {
					saldoAnterior = item.saldo;
				}
			});

			let ventasFiltradas = ventasEnriquecidas.filter(item => {
				const fechaItem = new SDate(item.fecha_on).toString("yyyy-MM-dd");
				return fechaItem >= fecha_inicio && fechaItem <= fecha_fin;
			});

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

			const lastRow = ventasFiltradas[ventasFiltradas.length - 1];
			const saldo = lastRow?.saldo || 0;

			this.setState({
				cliente: cliente || {},
				moneda,
				saldo,
			});

			return ventasFiltradas;
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
			borderTopColor: color_principal,
			backgroundColor: color_principal + '0D',
			alignItems: align,
			justifyContent: 'center',
		};
	}

	tipoBadgeColor(tipo) {
		const t = (tipo || '').toString().toLowerCase();
		if (t.includes('saldo')) return '#42A5F5';
		if (t.includes('venta')) return '#FB8C00';
		if (t.includes('cuota') || t.includes('pago') || t.includes('amortiz')) return STheme.color.success;
		return STheme.color.lightGray;
	}

	openRowMenu(evt, row, dinamicTable) {
		let top = evt.nativeEvent.pageY;
		const h = Dimensions.get("window").height;
		if (h < top + 300) top = h - 300;
		SPopup.open({
			key: "popup_menu_transacciones",
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
					<SView col={"xs-11"} row center onPress={() => { if (onPress) onPress(); SPopup.close("popup_menu_transacciones"); }}>
						<SView col={"xs-2"} center height={32}>
							<SIconApp name={icon} height={18} fill={iconProps?.fill || STheme.color.text} stroke={iconProps?.stroke} />
						</SView>
						<SView width={8} />
						<SView flex> <SText fontSize={14} color={iconProps?.fill || STheme.color.text}>{label}</SText> </SView>
					</SView>
					<SHr height={1} color={STheme.color.gray + "66"} />
				</>
			);
		};
		const keyCliente = row?.cliente?.key || this.key;
		const groups = [
			{
				title: "CONSULTA",
				items: [
					row?.key_compra_venta && {
						label: "Ver detalle venta",
						icon: "ventaCarro",
						onPress: () => { SNavigation.navigate("/venta/profile2", { pk: row.key_compra_venta }); },
					},
					keyCliente && {
						label: "Ver cliente",
						icon: "profile2",
						onPress: () => { SNavigation.navigate("/cliente/perfil", { key: keyCliente, tipo: "cliente" }); },
					},
				].filter(Boolean),
			},
			{
				title: "GESTIÓN",
				items: [
					this.esAmortizacionAnulable(row, dinamicTable) && {
						label: "Anular Amortización",
						icon: "eliminar",
						iconProps: { fill: STheme.color.danger, stroke: STheme.color.danger },
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
			<SView col={"xs-12"} backgroundColor={'#1c1f24CC'} style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: STheme.color.gray + "66", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20 }}>
				{groups.map((group, gi) => (
					<SView key={gi} col={"xs-12"}>
						<SView col={"xs-12"} style={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 1 }}>
							<SText color={STheme.color.lightGray} fontSize={11} style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>{group.title}</SText>
						</SView>
						{group.items.map((opt, i) => (<RenderOption key={i} {...opt} />))}
						{gi !== groups.length - 1 && <SHr height={1} color={STheme.color.gray + "66"} />}
					</SView>
				))}
			</SView>
		);
	}

	mostrarTabla() {
		return (
			<SView col={'xs-12'} flex>
				<SView col={'xs-12'} style={{ width: 920, alignSelf: 'center', backgroundColor: '#1c1f24CC', borderRadius: 20, borderWidth: 1, borderColor: STheme.color.gray + "66", overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.35, shadowRadius: 30 }} flex >

					<DinamicTable
						ref={ref => (this.DinamicTable = ref)}
						loadData={this.loadInitialData.bind(this)}
						key="id"
						language="es"
						center
						{...Config.table.applyTheme({
							colors: {
								text: STheme.color.text, background: '#1c1f24CC', header: color_principal, border: STheme.color.gray + "66", card: STheme.color.gray + "66",

							}
						})}
						keyExtractor={(e) => e?.key}
						textTitleStyle={{ fontWeight: "bold", textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5 }}
						style={{ flex: 1 }}
						iconSize={22}
						padding={8}
						adjustColumnWidth
						listFooterComponent={() => <SHr height={60} />}

						hoverStyle={{ backgroundColor: color_principal + "1F" }}
						buildRowStyle={({ item }) => item?.__original?.descripcion === "Saldo anterior" ? { backgroundColor: color_principal + '14' } : {}}
						renderHeaderActions={() => null}
						renderNoResults={() => (
							<SView col={"xs-12"} center padding={24}>
								<SText fontSize={13} color={STheme.color.lightGray}>No se encontraron transacciones en el rango seleccionado.</SText>
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
								<SText color={STheme.color.text}>
									{e?.row?.descripcion || "-"}
								</SText>
							)}
							footerComponent={() => (
								<SView style={this.footerBarStyle('flex-end')}>
									<SText bold fontSize={13} color={STheme.color.text}>TOTAL</SText>
								</SView>
							)}
						/>
						<DinamicTable.Col key="debe" label="Debe" width={100} data={(e) => e?.row?.debe ?? 0} cellStyle={{ alignItems: "flex-start" }}
							format={(e) => e.data ? this.formatMonto(e.data) : ""}
							footerComponent={(e) => {
								let total = 0;
								e.dinamicTable.data.map(a => { total += a.debe || 0 });
								return <SView style={this.footerBarStyle('flex-start')}><SText bold fontSize={13} color={STheme.color.text}>{this.formatMonto(total)}</SText></SView>
							}}
						/>
						<DinamicTable.Col key="haber" label="Haber" width={100} data={(e) => e?.row?.haber ?? 0} cellStyle={{ alignItems: "flex-start" }}
							format={(e) => e.data ? this.formatMonto(e.data) : ""}
							footerComponent={(e) => {
								let total = 0;
								e.dinamicTable.data.map(a => { total += a.haber || 0 });
								return <SView style={this.footerBarStyle('flex-start')}><SText bold fontSize={13} color={STheme.color.text}>{this.formatMonto(total)}</SText></SView>
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
									<SIconApp name="threeDotsVertical" width={18} height={18} fill={STheme.color.lightGray} />
								</SView>
							)}
							footerComponent={() => <SView style={this.footerBarStyle('center')} />}
						/>
					</DinamicTable>
				</SView>
			</SView>
		);
	}

	async showVentaPopup() {
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
				key: "popup-venta-completada",
				content: (
					<AmortizarModalContent
						saldo={saldo}
						simboloBase={simboloBase}
						formatMonto={(v) => this.formatMonto(v)}
						onCancel={() => SPopup.close("popup-venta-completada")}
						onConfirm={async (monto) => {
							const activa = await MDL.caja.getActiva();
							if (!activa) {
								SNotification.send({ title: 'Caja no aperturada', body: 'Abre la caja primero.', color: STheme.color.danger, time: 5000 });
								return;
							}

							SelectTipoPagoVenta.openPopup({
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
											SNotification.send({ title: "Éxito", body: "Se amortizó correctamente la deuda del cliente.", color: STheme.color.success, time: 3000 });
											this.DinamicTable.loadData();
											if (this.props.onSuccess) this.props.onSuccess(resp)
											SelectTipoPagoVenta.closePopup();
										}
									}).catch(err => {
										SNotification.send({ title: 'Error', body: err?.message || 'Falló el pago.', color: STheme.color.danger });
									});
									SelectTipoPagoVenta.closePopup();
									SPopup.close("popup-venta-completada");
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
		const { cliente } = this.state;
		const clienteNombre = `${cliente?.nombres || ''} ${cliente?.apellidos || ''}` || '-';
		return (
			<SPage title="Kardex Individual Cliente" disableScroll>
				<SView col={'xs-12'} flex style={{ padding: 16 }}>

					<SView col={'xs-12'} center backgroundColor='transparent' row>
						<SView col={'xs-12'} style={{
							width: 920,
							alignSelf: 'center',
							backgroundColor: '#1c1f24CC',
							borderRadius: 16,
							borderWidth: 1,
							borderColor: STheme.color.gray + "66",
							padding: 20,
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 10 },
							shadowOpacity: 0.35,
							shadowRadius: 30,
						}}>
							<SView row center>
								<SView width={48} height={48} center style={{ borderRadius: 14, backgroundColor: color_principal }}>
									<SIconApp name="heading" width={24} height={24} fill={"#fff"} />
								</SView>
								<SView width={12} />
								<SView flex>
									<SText fontSize={18} bold color={STheme.color.text}>Kardex Individual del Cliente</SText>
									<SText fontSize={12} color={STheme.color.lightGray}>Trazabilidad financiera de ventas, pagos y saldos</SText>
								</SView>
							</SView>

							<SHr height={16} />
							<SHr height={1} color={STheme.color.gray + "66"} />
							<SHr height={16} />

							<SView row style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
								<FechaFullFilter2
									label="fecha"
									key_opciones="hoy"
									color={color_principal}
									onChange={e => {
										this.state.fecha_inicio = e.fecha_inicio;
										this.state.fecha_fin = e.fecha_fin;
										this.DinamicTable.loadData();
									}}
								/>
								<SView row center style={{
									backgroundColor: color_principal + '20',
									borderWidth: 1,
									borderColor: color_principal + '55',
									borderRadius: 30,
									paddingVertical: 8,
									paddingHorizontal: 16,
								}}>
									<SIconApp name="profile2" width={14} height={14} fill={'#4a7ab5'} />
									<SView width={8} />
									<SText fontSize={13} color={STheme.color.text}>Cliente: <SText bold>{clienteNombre}</SText></SText>
								</SView>
								<SView
									onPress={() => ComprobanteKardexIndividual.imprimir(this.key, this.state.fecha_inicio, this.state.fecha_fin)}
									backgroundColor={"transparent"}
									style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 30, borderWidth: 1.5, borderColor: STheme.color.danger + '8C' }}
									center
								>
									<SView row center>
										<SIconApp name="pdf" width={14} height={14} fill={STheme.color.danger} />
										<SView width={8} />
										<SText fontSize={13} color={STheme.color.danger} bold>DESCARGAR PDF</SText>
									</SView>
								</SView>
							</SView>
						</SView>
					</SView>

					<SHr height={10} />
					{this.mostrarTabla()}

					<SHr height={20} />

					<SView col={'xs-12'} center backgroundColor='transparent' row>
						<SView col={'xs-12'} style={{ width: 920, alignSelf: 'center' }}>
							<SView row col={'xs-12'} style={{ justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
								{this.state.saldo > 0 && (
									<SView
										onPress={() => this.showVentaPopup()}
										backgroundColor={color_principal}
										style={{
											paddingVertical: 14,
											paddingHorizontal: 24,
											borderRadius: 30,
											shadowColor: color_principal,
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
