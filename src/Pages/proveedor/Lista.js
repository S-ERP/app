import React, { Component } from 'react';
import { SPage, SView, SText, STheme, SNavigation, SPopup, SHr, SNotification, SDate, SMath, SIcon, SImage } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import { DinamicTable } from 'servisofts-table';
import MDL from '../../MDL';
import FloatButtom from '../../Components/FloatButtom';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import PopupCrearProveedor from './Components/PopupCrearProveedor';
import FiltroSelector from '../productos/modelo/Components/FiltroSelector';

export default class Lista extends Component {
	onSelect = SNavigation.getParam('onSelect');

	constructor(props) {
		super(props);
		this.state = { selectedEstadoPago: null, selectedTipoCliente: null };
		this.DinamicTable = null;
	}

	componentDidMount() {
		window.addEventListener("keydown", this.handleKeyDown);
	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.handleKeyDown);
	}

	handleKeyDown = (e) => {
		if (e.key === "Escape") {
			this.filtroEstadoRef?.reset();
			this.filtroTipoRef?.reset();
			this.setState({ selectedEstadoPago: null, selectedTipoCliente: null }, () => {
				this.DinamicTable?.loadData();
			});
		}
	};

	async loadInitialData() {
		try {
			const [proveedores, transacciones, empresa] = await Promise.all([
				MDL.crm.cliente.getAll(),
				MDL.compra_venta.getTransaccion('compra', '2024-09-01', '2036-09-05'),
				MDL.empresa.getFull(),
			]);
			if (!proveedores || !Object.keys(proveedores).length) {
				SNotification.send({ title: 'Advertencia', body: 'No se encontraron proveedores.', time: 3000, color: STheme.color.warning });
				return [];
			}
			const transaccionesArr = Array.isArray(transacciones)
				? transacciones
				: Object.values(transacciones || {});
			if (!transaccionesArr.length) {
				SNotification.send({ title: 'Advertencia', body: 'No se encontraron compras en el rango de fechas especificado.', time: 3000, color: STheme.color.warning });
			}
			const keysUsuarios = Object.values(proveedores).map(p => p.key_usuario).filter(Boolean);
			const [usuarios, registros] = await Promise.all([
				MDL.usuario.getByKeys(keysUsuarios),
				MDL.compra_venta.getCuotasResumenTotal_compras(),
			]);
			const usuariosArr = Array.isArray(usuarios) ? usuarios : Object.values(usuarios || {});
			const registrosArr = Array.isArray(registros) ? registros : Object.values(registros || {});
			let data = Object.values(proveedores).map(proveedor => {
				const p = { ...proveedor };
				p.usuario = usuariosArr.find(u => u.key === p.key_usuario) || null;
				p.resumen_cuota = registrosArr.find(r => r.key_proveedor === p.key || r.key_cliente === p.key) || null;
				p.compras = transaccionesArr.filter(t => t.key_proveedor === p.key);
				p.empresa = empresa;
				const total_map = {}, pagado_map = {}, mora_map = {};
				let total_base = 0, pagado_base = 0, mora_base = 0;
				p.compras.forEach(v => {
					const key = v.key_moneda || 'desconocida';
					const tot = Number(v.cuotas?.total || 0);
					const pag = Number(v.monto_amortizado || 0);
					const mora = Number(v.cuotas_en_mora?.monto || 0);
					if (tot > 0) total_map[key] = (total_map[key] || 0) + tot;
					if (pag > 0) pagado_map[key] = (pagado_map[key] || 0) + pag;
					if (mora > 0) mora_map[key] = (mora_map[key] || 0) + mora;
					total_base += Number(v.cuotas?.total_base || 0);
					pagado_base += Number(v.monto_amortizado_base || 0);
					mora_base += Number(v.cuotas_en_mora?.monto_base || 0);
				});
				const deuda_map = {};
				Object.keys(total_map).forEach(k => {
					const d = (total_map[k] || 0) - (pagado_map[k] || 0);
					if (d > 0) deuda_map[k] = d;
				});
				p.total_por_moneda = total_map;
				p.pagado_por_moneda = pagado_map;
				p.deuda_por_moneda = deuda_map;
				p.mora_por_moneda = mora_map;
				p.totales_base = { total: total_base, pagado: pagado_base, mora: mora_base, deuda: total_base - pagado_base };
				return p;
			});
			if (this.state.selectedEstadoPago?.key) {
				const filtro = this.state.selectedEstadoPago.key;
				data = data.filter(p => {
					const r = p.resumen_cuota;
					if (!r) return filtro === "Sin Deuda";
					if (r.cantidad_en_mora > 0 || r.monto_en_mora > 0) return filtro === "En Mora";
					if (r.monto_pendiente <= 0) return filtro === "Sin Deuda";
					return filtro === "Deudor";
				});
			}
			if (this.state.selectedTipoCliente?.key) {
				const keyTipo = this.state.selectedTipoCliente.key;
				data = data.filter(p => (p.tipo_cliente ?? []).some(tc => tc.key === keyTipo));
			}
			return data;
		} catch (error) {

			SNotification.send({ title: 'Error', body: 'No se pudo cargar la lista de proveedores.', time: 3000, color: STheme.color.danger });
			return [];
		}
	}

	formatMap(map, monedas) {
		return Object.entries(map || {}).map(([k, monto]) => {
			const mon = (monedas || []).find(m => m.key === k);
			const sim = mon?.observacion || 'Bs';
			const fmt = SMath.formatMoney(monto);
			return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
		}).join('\n') || '';
	}

	formatBase(monto, monedas) {
		if (!monto) return '';
		const sim = (monedas || []).find(m => m.tipo === 'base')?.observacion || 'Bs';
		const fmt = SMath.formatMoney(monto);
		return fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
	}

	renderMontoCell(map, baseMonto, monedas) {
		const entries = Object.entries(map || {});
		if (!entries.length && !baseMonto) return null;

		const baseText = this.formatBase(baseMonto, monedas);
		return (
			<SView col style={{ padding: 4, alignItems: 'flex-end' }}>
				{baseText ? <SText style={{ fontSize: 13, fontWeight: 'bold', color: STheme.color.text }}>{baseText}</SText> : null}
				{entries.length > 0 && (
					<SView row style={{ flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: baseText ? 2 : 0 }}>
						{entries.map(([key_moneda, monto], i) => {
							const mon = (monedas || []).find(m => m.key === key_moneda);
							const sim = mon?.observacion || 'Bs';
							const fmt = SMath.formatMoney(monto);
							const text = fmt.startsWith(sim) ? fmt : `${sim} ${fmt}`;
							return (
								<SText key={key_moneda} style={{ fontSize: 9, opacity: 0.7, color: STheme.color.text, marginLeft: i > 0 ? 6 : 0 }}>
									{text}
								</SText>
							);
						})}
					</SView>
				)}
			</SView>
		);
	}

	footerSum(selector, formatter) {
		return ({ dinamicTable }) => {
			const rows = (dinamicTable?.dataFiltrada || []).map(d => d.__original);
			const total = rows.reduce((s, row) => s + (Number(selector(row)) || 0), 0);
			return (
				<SView style={{ padding: 4, alignItems: 'flex-end', width: '100%', borderTopWidth: 1, borderColor: STheme.color.lightGray + '50' }}>
					<SText style={{ fontSize: 12, fontWeight: 'bold' }}>{formatter ? formatter(total) : (total || '')}</SText>
				</SView>
			);
		};
	}

	footerSumMap(selector, baseSelector) {
		return ({ dinamicTable }) => {
			const rows = (dinamicTable?.dataFiltrada || []).map(d => d.__original);
			const monedas = rows[0]?.empresa?.monedas || [];
			const totalMap = {};
			let totalBase = 0;
			rows.forEach(row => {
				Object.entries(selector(row) || {}).forEach(([k, v]) => {
					totalMap[k] = (totalMap[k] || 0) + Number(v || 0);
				});
				totalBase += Number(baseSelector ? baseSelector(row) : 0) || 0;
			});
			return (
				<SView style={{ padding: 4, alignItems: 'flex-end', width: '100%', borderTopWidth: 1, borderColor: STheme.color.lightGray + '50' }}>
					<SText style={{ fontSize: 11, fontWeight: 'bold' }}>{this.formatMap(totalMap, monedas)}</SText>
					{totalBase > 0 && <SText style={{ fontSize: 9, opacity: 0.8 }}>({this.formatBase(totalBase, monedas)})</SText>}
				</SView>
			);
		};
	}

	footerCuotasYMonto(cuotaSelector, montoBaseSelector) {
		return ({ dinamicTable }) => {
			const rows = (dinamicTable?.dataFiltrada || []).map(d => d.__original);
			const totalCuotas = rows.reduce((s, row) => s + (Number(cuotaSelector(row)) || 0), 0);
			const totalMonto = rows.reduce((s, row) => s + (Number(montoBaseSelector(row)) || 0), 0);
			const monedas = rows[0]?.empresa?.monedas || [];
			return (
				<SView style={{ padding: 4, alignItems: 'flex-end', width: '100%', borderTopWidth: 1, borderColor: STheme.color.lightGray + '50' }}>
					<SText style={{ fontSize: 10, opacity: 0.8 }}>{totalCuotas} {totalCuotas === 1 ? 'cuota' : 'cuotas'}</SText>
					<SText style={{ fontSize: 12, fontWeight: 'bold' }}>{this.formatBase(totalMonto, monedas)}</SText>
				</SView>
			);
		};
	}

	renderUsuario(e) {
		const usuario = e.row?.usuario || {};
		const nombre = `${usuario?.Nombres || "Sin"} ${usuario?.Apellidos || "usuario"}`;
		const inicial = (usuario?.Nombres || "?")[0].toUpperCase();
		const avatarSize = e.filterList ? 16 : 21;
		return (
			<SView col="xs-12" center row>
				<SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
					<SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{inicial}</SText>
					{usuario?.key ? <SImage src={`${SSocket.api.root}usuario/${usuario.key}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
				</SView>
				<SView width={5} />
				<SText flex numberOfLines={1} style={{ fontSize: 13 }} color={STheme.color.lightGray}>{nombre}</SText>
			</SView>
		);
	}

	renderProveedor(e) {
		const proveedor = e.row || {};
		const nombre = `${proveedor?.nombres || "Sin Nombre"} ${proveedor?.apellidos || ""}`;
		const inicial = (proveedor?.nombres || "?")[0].toUpperCase();
		const avatarSize = e.filterList ? 16 : 21;
		return (
			<SView col="xs-12" center row>
				<SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
					<SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{inicial}</SText>
					{proveedor?.key ? <SImage src={`${SSocket.api.root}usuario/${proveedor.key}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
				</SView>
				<SView width={4} />
				<SText flex numberOfLines={1} style={{ fontSize: 12 }}>{nombre}</SText>
			</SView>
		);
	}

	mostrarTabla() {
		return (
			<DinamicTable
				indexar
				key="tabla"
				{...Config.table.applyTheme()}
				ref={ref => (this.DinamicTable = ref)}

				language="es"
				selectType="single"
				colors={Config.table.colors()}
				cellStyle={Config.table.cellStyle()}
				textStyle={Config.table.textStyle()}

				loadInitialState={async () => ({
					cols: {},
					sorters: [
						{ key: "estado_pago", order: "asc", type: "string" },
						{ key: "nombre_completo", order: "asc", type: "string" },
					]
				})}

				textTitleStyle={{ fontWeight: "bold" }}
				style={{ flex: 1 }}
				iconSize={22}
				padding={8}
				adjustColumnWidth
				hiddenMenu={false}
				hoverStyle={{ backgroundColor: STheme.color.card + "30" }}
				buildRowStyle={({ item }) => Number(item?.__original?.estado) === 0 ? { opacity: 0.45 } : {}}
				listFooterComponent={() => <SHr height={60} />}
				onEvent={(e) => { if (e.evt === "render") {  } }}
				onSelectionChange={() => {  }}
				renderHeaderActions={() => null}
				renderLoading={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>Cargando proveedores...</SText>
					</SView>
				)}
				renderNoResults={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron proveedores en el rango seleccionado.</SText>
					</SView>
				)}
				renderError={({ error }) => (
					<SView col={"xs-12"} padding={16}>
						<SText fontSize={13} color={STheme.color.danger}>Error: {error?.message || String(error)}</SText>
					</SView>
				)}

				headerGroups={[
					{
						label: "Cuotas Pendientes", cols: ["cuota_pen", "monto_pen"],
						style: { backgroundColor: STheme.color.warning + '55', borderWidth: 1, borderColor: STheme.color.warning },
					},
					{
						label: "Cuotas en Mora", cols: ["cuota_mor", "monto_mor"],
						style: { backgroundColor: STheme.color.danger + '55', borderWidth: 1, borderColor: STheme.color.danger },
					},
				]}
				onSelect={e => {
					if (this.onSelect) {
						this.onSelect(e.row);
						SNavigation.goBack();
						return;
					}
					FloatMenu.open({
						e: e.evt,
						label: `Proveedor: ${e.row.razon_social ?? e.row.nombres ?? 'Sin nombre'}`,
						options: [
							{
								label: 'Ver perfil',
								icon: <SIcon name="Eyes" fill={STheme.color.text} />,
								onPress: () => SNavigation.navigate("/cliente/perfil", { key: e.row.key, tipo: "proveedor" }),
							},
							{
								label: 'Ver trasabilidad proveedor',
								icon: <SIcon name="Eyes" fill={STheme.color.text} />,
								onPress: () => SNavigation.navigate("/proveedor/transacciones", { key: e.row.key }),
							},
							{
								icon: <SIconApp name="Edit" />,
								label: 'Actualizar Proveedor',
								onPress: () => PopupCrearProveedor.open({
									editObject: { ...e.row, key_usuario: MDL.usuario.session?.key },
									key_empresa: e.row.key_empresa,
									onSuccess: () => this.DinamicTable.loadData(),
								}),
							},
							e.row.compras?.length > 0 && {
								icon: <SIconApp name="Ajustes" />,
								label: 'Pagar Deuda',
								onPress: () => SNavigation.navigate('/caja/cuotas', { key_proveedor: e.row?.key }),
							},
							{
								icon: <SIconApp name="Delete" />,
								label: 'Eliminar Proveedor',
								onPress: () => SPopup.confirm({
									title: 'Eliminar Proveedor',
									message: '¿Estás seguro de eliminar este proveedor?',
									onPress: () => MDL.inventario.proveedor
										.editar({ ...e.row, estado: 0 })
										.then(() => {
											this.DinamicTable.loadData();
											SNotification.send({ title: 'Éxito', body: 'Proveedor eliminado correctamente.', time: 3000, color: STheme.color.success });
										})
										.catch(() => {

											SNotification.send({ title: 'Error', body: 'No se pudo eliminar el proveedor.', time: 3000, color: STheme.color.danger });
										}),
								}),
							},
						].filter(Boolean),
					});
				}}
				loadData={() => this.loadInitialData()}
			>
				{}
				<DinamicTable.Col key="nombre_completo"
					label="Proveedor" width={200} height={60} data={e => e.row?.nombres ?? "Sin Nombre"} customComponent={e => this.renderProveedor(e)} />

				<DinamicTable.Col key="tipo_cliente" label="Tipo proveedor"
					width={120}
					data={e => (e.row.tipo_cliente ?? []).map(a => a.titulo)}
					format={e => (e.data ?? []).join(', ')}

					cellStyle={{
						flexDirection: "row",
						justifyContent: "flex-start",
						flexWrap: "wrap",
						alignItems: "flex-start",
						gap: 4,
						overflow: "hidden",
					}}
					customComponent={e => {
						const tipos = e.row.tipo_cliente ?? [];
						const MAX_TAGS = 4;
						const visibles = tipos.slice(0, MAX_TAGS);
						const restantes = tipos.length - visibles.length;
						return (
							<>
								{visibles.map(tc => (
									<SView key={tc.key} style={{
										borderWidth: 1,
										backgroundColor: (tc.color ?? STheme.colorFromText(tc.titulo)) + "15",
										borderColor: (tc.color ?? STheme.colorFromText(tc.titulo)) + "50",

										borderRadius: 4,
										justifyContent: "center", alignItems: "center", gap: 2,
									}} row>
										<SView style={{ width: 12, height: 12, borderRadius: 100, backgroundColor: tc.color ?? STheme.colorFromText(tc.titulo) }} />
										<SText fontSize={10}>{tc.titulo}</SText>
									</SView>
								))}
								{restantes > 0 && (
									<SView style={{
										borderWidth: 1,
										backgroundColor: STheme.color.text + "15",
										borderColor: STheme.color.text + "50",

										borderRadius: 4,
										justifyContent: "center", alignItems: "center",
									}}>
										<SText fontSize={10}>{`+${restantes}`}</SText>
									</SView>
								)}
							</>
						);
					}}
				/>

				<DinamicTable.Col key="estado_pago" wrap label="Estado de Pago" width={90} height={60}
					data={e => {
						const r = e.row?.resumen_cuota;
						if (!r) return 'Sin Deuda';
						if (r.cantidad_en_mora > 0 || r.monto_en_mora > 0) return 'En Mora';
						if (r.monto_pendiente <= 0) return 'Sin Deuda';
						return 'Deudor';
					}}
					customComponent={e => {
						const s = { 'Sin Deuda': { color: STheme.color.gray, label: 'Sin Deuda' }, 'Deudor': { color: STheme.color.warning, label: 'Deudor' }, 'En Mora': { color: STheme.color.danger, label: 'En Mora' } }[e.data] || { color: STheme.color.gray, label: 'Desconocido' };
						return <SView row center><SView backgroundColor={s.color} style={{ borderRadius: 4, padding: 5 }}><SText color={STheme.color.text} fontSize={10}>{s.label}</SText></SView></SView>;
					}}
				/>
				<DinamicTable.Col key="nit" label="NIT" width={90} height={60} data={e => e.row?.nit} />
				<DinamicTable.Col key="razon_social" label="Razón Social" width={150} height={60} data={e => e.row?.razon_social} />
				<DinamicTable.Col key="telefono" label="Teléfono" width={130} height={60} data={e => e.row?.telefono} />
				<DinamicTable.Col key="cuota_pen" wrap label="# Cuotas" sumTotal={['', 0]} width={70} height={60} data={e => e.row?.resumen_cuota?.cantidad_pendiente ?? ''} cellStyle={{ alignItems: 'center', backgroundColor: `${STheme.color.warning}33` }} format={e => (e.data ? SMath.formatMoney(e.data) : '')} />
				<DinamicTable.Col key="monto_pen" wrap label="Monto" sumTotal={rows => this.formatBase(rows.reduce((s, row) => s + Number(row.totales_base?.deuda || 0), 0), rows[0]?.empresa?.monedas)}
					width={110} height={60}
					footerComponent={this.footerCuotasYMonto(row => row.resumen_cuota?.cantidad_pendiente, row => row.totales_base?.deuda)}
					data={e => {
						const monedas = e.row?.empresa?.monedas || [];
						const baseSim = monedas.find(m => m.tipo === 'base')?.observacion || 'Bs';
						const entries = Object.entries(e.row?.deuda_por_moneda || {});
						const baseMonto = e.row?.totales_base?.deuda || 0;
						const showBase = baseMonto > 0 && entries.some(([key_moneda]) => (monedas.find(m => m.key === key_moneda)?.observacion || 'Bs') !== baseSim);
						return [this.formatMap(e.row?.deuda_por_moneda, monedas), showBase ? this.formatBase(baseMonto, monedas) : null].filter(Boolean).join(' => ');
					}}
					cellStyle={{ alignItems: 'flex-end', backgroundColor: STheme.color.warning + '33' }}
					customComponent={e => this.renderMontoCell(e.row?.deuda_por_moneda, e.row?.totales_base?.deuda, e.row?.empresa?.monedas)} />

				<DinamicTable.Col key="cuota_mor" wrap label="# Cuotas"

					sumTotal={['', 0]}

					width={70} height={60} data={e => e.row?.resumen_cuota?.cantidad_en_mora ?? ''} cellStyle={{ alignItems: 'center', backgroundColor: `${STheme.color.danger}33` }} format={e => (e.data ? SMath.formatMoney(e.data) : '')} />

				<DinamicTable.Col
					key="monto_mor"
					wrap
					sumTotal={rows => this.formatBase(rows.reduce((s, row) => s + Number(row.totales_base?.mora || 0), 0), rows[0]?.empresa?.monedas)}
					label="Monto"
					width={110}
					height={60}
					footerComponent={this.footerCuotasYMonto(row => row.resumen_cuota?.cantidad_en_mora, row => row.totales_base?.mora)}
					data={e => {
						const monedas = e.row?.empresa?.monedas || [];
						const baseSim = monedas.find(m => m.tipo === 'base')?.observacion || 'Bs';
						const entries = Object.entries(e.row?.mora_por_moneda || {});
						const baseMonto = e.row?.totales_base?.mora || 0;
						const showBase = baseMonto > 0 && entries.some(([key_moneda]) => (monedas.find(m => m.key === key_moneda)?.observacion || 'Bs') !== baseSim);
						return [this.formatMap(e.row?.mora_por_moneda, monedas), showBase ? this.formatBase(baseMonto, monedas) : null].filter(Boolean).join(' => ');
					}}
					cellStyle={{
						alignItems: 'flex-end',
						backgroundColor: `${STheme.color.danger}33`,
					}}
					customComponent={e => this.renderMontoCell(e.row?.mora_por_moneda, e.row?.totales_base?.mora, e.row?.empresa?.monedas)}
				/>

				<DinamicTable.Col key="fecha_on" label="F. Creación" width={120} height={60} dataType="date" data={e => new SDate(e.row?.fecha_on, 'yyyy-MM-ddThh:mm:ss').date} textStyle={{ fontSize: 12, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm" />
				<DinamicTable.Col key="key_usuario" label="Responsable" width={100} height={60} data={e => e.row?.usuario?.Nombres ?? ""} customComponent={e => this.renderUsuario(e)} />
			</DinamicTable>
		);
	}

	render() {
		return (
			<SPage title="Gestión de Proveedores" disableScroll>
				<SView row col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", paddingVertical: 8, paddingHorizontal: 12 }}>
					<SView col={"xs-12 sm-5 lg-2"} row center style={{ flexWrap: "wrap" }}>
						<FiltroSelector
							ref={ref => this.filtroEstadoRef = ref}
							label="Estado de Pago"
							loadData={async () => [
								{ key: "Sin Deuda", nombre: "Sin Deuda" },
								{ key: "Deudor", nombre: "Deudor" },
								{ key: "En Mora", nombre: "En Mora" },
							]}
							mapOption={a => ({ key: a.key, nombre: a.nombre })}
							onSelect={item => {

								const sinCambio = (item?.key ?? null) === (this.state.selectedEstadoPago?.key ?? null);
								this.setState({ selectedEstadoPago: item }, () => {
									if (!sinCambio) this.DinamicTable?.loadData();
								});
							}}
						/>
					</SView>
					<SView width={8} />
					<SView col={"xs-12 sm-5 lg-2"} row center style={{ flexWrap: "wrap" }}>
						<FiltroSelector
							ref={ref => this.filtroTipoRef = ref}
							label="Tipo de Proveedor"
							loadData={async () => await MDL.crm.tipoCliente.getAll()}
							mapOption={a => ({ key: a.key, nombre: a.titulo })}
							onSelect={item => {
								const sinCambio = (item?.key ?? null) === (this.state.selectedTipoCliente?.key ?? null);
								this.setState({ selectedTipoCliente: item }, () => {
									if (!sinCambio) this.DinamicTable?.loadData();
								});
							}}
						/>
					</SView>
					<SHr height={8} />
				</SView>
				{this.mostrarTabla()}
				<SHr height={20} />
				<FloatButtom onPress={() => PopupCrearProveedor.open({ onSuccess: () => this.DinamicTable.loadData() })} />
			</SPage>
		);
	}
}