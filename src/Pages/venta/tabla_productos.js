import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SNavigation, SDate, SInput, SMath, SNotification } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import { Dimensions } from 'react-native';
import SSocket from 'servisofts-socket';
import SIconApp from '../../Assets/SIconApp';
import Config from '../../Config';
import Model from '../../Model';
import ReciboCarta from '../../Components/PDF/venta/ReciboCarta';
import MDL from '../../MDL';
import ReciboRollo from '../../Components/PDF/venta/ReciboRollo';
import PopupUploadFactura from './Components/PopupUploadFactura';
import { Linking } from 'react-native'
import FechaFullFilter from '../../Components/FechaFullFilter';

const TIPO_PRODUCTO_MAP = {
	servicio: { color: "#2563eb", label: "Servicio" },
	inventario: { color: "#f59e0b", label: "Inventario" },
};

export default class tabla_productos extends Component {

	constructor(props) {
		super(props);
		const hoy = new Date();
		const pad = n => String(n).padStart(2, '0');
		const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		this.state = {
			pdfFiles: {},
			fecha_inicio: fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
			fecha_fin: fmt(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)),
		};
		this._fechaFilterListo = false;
	}

	async loadInitialData() {
		try {
			SNotification.send({
				key: "load_ventas",
				title: "Cargando ventas...",
				type: "loading",
			});
			// const registros = await MDL.compra_venta.getTransaccion("venta", "2025-01-01", "2030-09-05");
			const registros = await MDL.compra_venta.execute_function("reporte_ventas_all", [MDL.empresa.select.key, "2025-01-01", "2030-09-05", null, null, null, "venta"]);

			console.log("Registros obtenidosss:", registros);

			const empresa = await MDL.empresa.getFull();
			if (!registros || !empresa) {
				console.warn("No se encontraron registros o no se pudo obtener la empresa.");
				SNotification.send({
					key: "load_ventas",
					title: "Sin datos",
					body: "No se encontraron ventas en el rango de fechas seleccionado.",
					color: STheme.color.warning,
					time: 3000,
				});
				return [];
			}

			const sucursales = empresa?.sucursales || [];
			console.log("empresa..:", empresa);
			const ventas = Object.values(registros).filter(cv => cv.tipo === "venta");
			if (ventas.length === 0) console.warn("No se encontraron ventas.");
			const keysUsuarios = [...new Set(ventas.map(v => v.key_usuario).filter(Boolean))];
			const usuarios = await MDL.usuario.getByKeys(keysUsuarios);
			const usuariosMap = Array.isArray(usuarios) ? Object.fromEntries(usuarios.map(u => [u.key, u])) : usuarios || {};
			const [proveedores, clientes, habilidadResp, resumenCuotasResp, almacenes, modelo] = await Promise.all([
				MDL.inventario.proveedor.getAllProveedor(),
				MDL.crm.cliente.getAll(),
				MDL.habilidad.getAllWithUsuarios(),
				MDL.compra_venta.getCuotasResumenTotal_ventas(),
				MDL.inventario.getAllAlmacen(),
				MDL.inventario.getAllModeloStock("", "")
			]);

			console.log("modelo:", modelo);
			// if (!proveedores) console.warn("No se pudieron obtener proveedores.");
			// if (!clientes) console.warn("No se pudieron obtener clientes.");
			// const clientesMap = Array.isArray(clientes) ? Object.fromEntries(clientes.map(c => [c.key, c])) : clientes || {};
			// const habilidadArr = Array.isArray(habilidadResp) ? habilidadResp : Object.values(habilidadResp || {});
			// const resumenCuotasArr = Array.isArray(resumenCuotasResp) ? resumenCuotasResp : Object.values(resumenCuotasResp || {});
			// const clienteAgregadoMap = {};
			// ventas.forEach(v => {
			// 	if (Number(v.estado) === 0) return;
			// 	const keyCliente = v.key_cliente;
			// 	if (!keyCliente) return;
			// 	if (!clienteAgregadoMap[keyCliente]) {
			// 		clienteAgregadoMap[keyCliente] = { total_map: {}, pagado_map: {}, mora_map: {}, total_base: 0, pagado_base: 0, mora_base: 0 };
			// 	}
			// 	const acc = clienteAgregadoMap[keyCliente];
			// 	const key = v.key_moneda || 'desconocida';
			// 	const tot = Number(v.cuotas?.total || 0);
			// 	const pag = Number(v.monto_amortizado || 0);
			// 	const mora = Number(v.cuotas_en_mora?.monto || 0);
			// 	if (tot > 0) acc.total_map[key] = (acc.total_map[key] || 0) + tot;
			// 	if (pag > 0) acc.pagado_map[key] = (acc.pagado_map[key] || 0) + pag;
			// 	if (mora > 0) acc.mora_map[key] = (acc.mora_map[key] || 0) + mora;
			// 	acc.total_base += Number(v.cuotas?.total_base || 0);
			// 	acc.pagado_base += Number(v.monto_amortizado_base || 0);
			// 	acc.mora_base += Number(v.cuotas_en_mora?.monto_base || 0);
			// });
			// const getDeudaClienteAgregada = keyCliente => {
			// 	const acc = clienteAgregadoMap[keyCliente];
			// 	if (!acc) return { deuda_por_moneda: {}, mora_por_moneda: {}, totales_base: { deuda: 0, mora: 0 } };
			// 	const deuda_por_moneda = {};
			// 	Object.keys(acc.total_map).forEach(k => {
			// 		const d = (acc.total_map[k] || 0) - (acc.pagado_map[k] || 0);
			// 		if (d > 0) deuda_por_moneda[k] = d;
			// 	});
			// 	return {
			// 		deuda_por_moneda,
			// 		mora_por_moneda: acc.mora_map,
			// 		totales_base: { deuda: acc.total_base - acc.pagado_base, mora: acc.mora_base },
			// 	};
			// };
			// const suscripcionesFull = await MDL.compra_venta.getsuscripciones_full();
			// const suscripcionesMap = {};
			// (suscripcionesFull || []).forEach(row => {
			// 	const key = row.key_compra_venta_detalle;
			// 	if (!key) return;
			// 	if (!suscripcionesMap[key]) {
			// 		const cupos = Number(row.modelo?.cantidad_suscriptores) || 0;
			// 		suscripcionesMap[key] = [{ cupos, suscriptos: 0, disponibles: cupos, suscriptores: [] }];
			// 	}
			// 	const entry = suscripcionesMap[key][0];
			// 	entry.suscriptores.push(row);
			// 	entry.suscriptos += 1;
			// 	entry.disponibles = Math.max(0, entry.cupos - entry.suscriptos);
			// });
			// const totalesMap = {};
			// ventas.forEach(cv => {
			// 	try {
			// 		totalesMap[cv.key] = MDL.compra_venta.getTotales({ ...cv, detalle: cv.detalles }) || {};
			// 	} catch (e) {
			// 		totalesMap[cv.key] = {};
			// 	}
			// });
			// const ventasEnriquecidas = ventas.map(cv => {
			// 	const detallesEnriquecidos = (cv.detalles || []).map(d => {
			// 		const suscripcion = suscripcionesMap[d.key]?.[0] || {};

			// 		return {
			// 			...d,
			// 			...suscripcion,
			// 			suscriptores: (suscripcion.suscriptores || []).map(s => ({ ...s, cliente: clientesMap[s.key_cliente] || {} }))
			// 		};
			// 	});
			// 	const total_disponibles = detallesEnriquecidos.reduce((sum, d) => sum + (Number(d.disponibles) || 0), 0);
			// 	const total_suscriptos = detallesEnriquecidos.reduce((sum, d) => sum + (Number(d.suscriptos) || 0), 0);
			// 	const total_cupos = detallesEnriquecidos.reduce((sum, d) => sum + (Number(d.cupos) || 0), 0);
			// 	const cuotas = cv.cuotas || {};
			// 	const cuotaUnitaria = cuotas.total && cuotas.cantidad ? cuotas.total / cuotas.cantidad : 0;
			// 	const cantidad_pagada = cuotaUnitaria > 0 ? Math.round((cv.monto_amortizado || 0) / cuotaUnitaria) : 0;
			// 	const cantidad_pendiente = Math.max(0, (cuotas.cantidad || 0) - (cv.cuotas_en_mora?.cantidad || 0) - cantidad_pagada);
			// 	return {
			// 		...cv,
			// 		total_disponibles,
			// 		total_suscriptos,
			// 		total_cupos,
			// 		detalles: detallesEnriquecidos,
			// 		moneda: empresa?.monedas?.find(m => m.key === cv.key_moneda) || {},
			// 		sucursal: sucursales.find(s => s?.key === cv?.key_sucursal) || {},
			// 		usuario: usuariosMap[cv?.key_usuario] || {},
			// 		empresa,
			// 		proveedor: (proveedores || []).find(p => p.key === cv.key_proveedor) || {},
			// 		cliente: (() => {
			// 			const clienteBase = clientesMap[cv.key_cliente] || {};
			// 			const { deuda_por_moneda, mora_por_moneda, totales_base } = getDeudaClienteAgregada(clienteBase.key);
			// 			return {
			// 				...clienteBase,
			// 				habilidades: habilidadArr.filter(h => Array.isArray(h.key_usuarios) && h.key_usuarios.includes(clienteBase.key)),
			// 				resumen_cuota: resumenCuotasArr.find(r => r.key_cliente === clienteBase.key) || null,
			// 				deuda_por_moneda,
			// 				mora_por_moneda,
			// 				totales_base,
			// 			};
			// 		})(),
			// 		subtotal: totalesMap[cv.key]?.subtotal || "0",
			// 		cuotas: { ...cuotas, cantidad_pagada, cantidad_pendiente },
			// 	};
			// });

			const ventas_detalle = ventas.map(v => {
				return {
					...v,
					moneda: empresa?.monedas?.find(m => m.key === v.key_moneda) || {},
					sucursal: sucursales.find(s => s?.key === v?.key_sucursal) || {},
					usuario: usuariosMap[v?.key_usuario] || {},
					almacen: almacenes?.find(a => a?.key === v?.key_almacen) || {},
					modelo: modelo?.find(m => m?.key === v?.key_modelo) || {},
				};
			});

			SNotification.send({
				key: "load_ventas",
				title: "Datos cargados",
				body: `Se cargaron ventas`,
				color: STheme.color.success,
				time: 2000,
			});
			console.log("ventas_detalle:", ventas_detalle);

			return ventas_detalle;
		} catch (error) {
			console.error("❌ Error en loadInitialData:", error?.message || error, error);
			SNotification.send({
				key: "load_ventas",
				title: "Error al cargar ventas",
				body: error?.message || "Error desconocido",
				color: STheme.color.danger,
				time: 4000,
			});
			SPopup.alert("Error al cargar los datos. Intenta nuevamente.");
			return [];
		}
	}

	generateRandomCode() { return `F-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`; }

	footerCuotasYMonto(cuotaSelector, montoBaseSelector) {
		return ({ dinamicTable }) => {
			const rows = (dinamicTable?.dataFiltrada || []).map(d => d.__original);
			const totalCuotas = rows.reduce((s, row) => s + (Number(cuotaSelector(row)) || 0), 0);
			const totalMonto = rows.reduce((s, row) => s + (Number(montoBaseSelector(row)) || 0), 0);
			const baseSim = rows[0]?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs';
			return (
				<SView height={40} style={{ padding: 4, alignItems: 'flex-end', width: '100%', borderTopWidth: 1, borderColor: STheme.color.lightGray + '50' }}>
					<SText numberOfLines={1} style={{ fontSize: 10, opacity: 0.8 }}>{totalCuotas} {totalCuotas === 1 ? 'cuota' : 'cuotas'}</SText>
					<SText numberOfLines={1} style={{ fontSize: 12, fontWeight: 'bold', textAlign: 'right', flexShrink: 1, minWidth: 0 }}>{baseSim} {SMath.formatMoney(totalMonto)}</SText>
				</SView>
			);
		};
	}


	mostrarTabla() {
		return (
			<DinamicTable
				indexar
				ref={ref => (this.DinamicTable = ref)}
				loadData={async () => {
					return this.loadInitialData();
				}}
				key="id"
				language="es"
				{...Config.table.applyTheme()}
				selectType="single"
				keyExtractor={(e) => e.key}
				textTitleStyle={{ fontWeight: "bold" }}
				style={{ flex: 1 }}
				iconSize={22}
				padding={8}
				adjustColumnWidth
				hiddenMenu={false}
				hoverStyle={{ backgroundColor: STheme.color.card + "30" }}
				buildRowStyle={({ item }) => Number(item?.__original?.estado) === 0 ? { opacity: 0.45 } : {}}
				listFooterComponent={() => <SHr height={60} />}
				onSelectionChange={() => { }}
				renderHeaderActions={() => null}
				renderLoading={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>Cargando ventas...</SText>
					</SView>
				)}
				renderNoResults={() => (
					<SView col={"xs-12"} center padding={24}>
						<SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron ventas en el rango seleccionado.</SText>
					</SView>
				)}
				renderError={({ error }) => (
					<SView col={"xs-12"} padding={16}>
						<SText fontSize={13} color={STheme.color.danger}>Error: {error?.message || String(error)}</SText>
					</SView>
				)}

				// headerGroups={[
				// 	{
				// 		label: "Cuotas Pagadas", cols: ["cuotas_cantidad_pagadas", "monto_amortizado"],
				// 		style: { backgroundColor: STheme.color.success + '55', borderWidth: 1, borderColor: STheme.color.success },
				// 	},
				// 	{
				// 		label: "Cuotas Pendientes", cols: ["cuotas_cantidad_pendiente_", "monto_deuda"],
				// 		style: { backgroundColor: STheme.color.warning + '55', borderWidth: 1, borderColor: STheme.color.warning },
				// 	},
				// 	{
				// 		label: "Cuotas en Mora", cols: ["cuotas_cantidad_mora", "en_mora"],
				// 		style: { backgroundColor: STheme.color.danger + '55', borderWidth: 1, borderColor: STheme.color.danger },
				// 	},
				// ]}
				onSelect={(e) => {
					// let top = e.evt.nativeEvent.pageY;
					// const h = Dimensions.get("window").height;
					// if (h < top + 300) {
					// 	top = h - 300;
					// }
					// SPopup.open({
					// 	key: "popup_menu_ventas",
					// 	type: "2",
					// 	content: <SView withoutFeedback style={[{ position: "absolute", top: top, left: e.evt.nativeEvent.pageX, width: 250, }]} center>
					// 		{this.renderMenuVentas(e.row)}
					// 	</SView>
					// })
				}}

				loadInitialState={async () => {
					return {
						filters: [
							// { col: "estado_pago", type: "string", value: "Anulada", operator: "!=" }
						],
						sorters: [{ key: "fecha_on", order: "desc", type: "date" }]
					}
				}}
			>
				{/* <DinamicTable.Col key="tipo_producto_" label="Tipos" width={100} height={60}
					data={e => [...new Set((e.row?.detalles ?? []).map(h => h?.data?.tipo_producto))]} wrap
					cellStyle={{ padding: 4, gap: 4 }}
					customComponent={e => [...new Set((e.row?.detalles ?? []).map(h => h?.data?.tipo_producto))].map(tipo => {
						const estilo = TIPO_PRODUCTO_MAP[tipo?.toLowerCase()] || { color: STheme.color.lightGray, label: tipo };
						return (
							<SView key={tipo} style={{ backgroundColor: estilo.color, borderRadius: 4, padding: 5 }}>
								<SText style={{ fontSize: 12, color: STheme.color.text }}>{estilo.label}</SText>
							</SView>
						);
					})}
				/> */}
				<DinamicTable.Col key="tipo_producto" label="Tipo" width={80} height={60}
					data={e => e.row?.data?.tipo_producto ?? ""}
					cellStyle={{ alignItems: "center", justifyContent: "flex-start", }}
					customComponent={e => {
						const tipo = e.row?.data?.tipo_producto || "";
						const estilo = TIPO_PRODUCTO_MAP[tipo?.toLowerCase()] || { color: STheme.color.lightGray, label: tipo };
						return (
							<SView style={{ padding: 2, borderRadius: 4, backgroundColor: STheme.colorFromText(e.data) + "44", borderWidth: 1, borderColor: STheme.colorFromText(e.data) }}>
								<SText fontSize={10} style={{ textTransform: "uppercase" }} >{e.data}</SText>
							</SView>
						);
					}}
				/>

				<DinamicTable.Col key="producto" label="Producto" width={140} height={60} data={(e) => e.row?.producto ?? ""} />
				<DinamicTable.Col key="modelo" label="Tipo producto" width={140} height={60} data={(e) => e.row?.modelo?.tipo_producto?.descripcion ?? ""} />
				<DinamicTable.Col key="codigo" label="Código" width={85} height={60} data={(e) => e.row?.modelo?.tipo_producto?.cod_ref ?? ""} />


				<DinamicTable.Col key={"fecha_on"} label="Fecha" width={90} height={60} dataType="datetime" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.text }} dateFormat="yyyy-MM-dd hh:mm" />

				<DinamicTable.Col key="sucursal" label="Sucursal" width={100} height={60} data={(e) => e.row?.sucursal?.descripcion ?? ""}
					customComponent={e => {
						const nombre = e.row?.sucursal?.descripcion || "";
						const avatarSize = e.filterList ? 16 : 21;
						return (
							<SView col={"xs-12"} center row>
								{nombre ? (
									<SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
										<SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
										{e.row?.key_sucursal ? <SImage src={`${SSocket.api.empresa}sucursal/${e.row?.key_sucursal}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
									</SView>
								) : null}
								{nombre ? <SView width={5} /> : null}
								<SText flex capitalize numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
							</SView>
						);
					}}
				/>

				<DinamicTable.Col key="almacen" label="Almacén" width={100} height={60} data={(e) => e.row?.almacen?.descripcion ?? ""}
					customComponent={e => {
						const nombre = e.row?.almacen?.descripcion || "";
						const avatarSize = e.filterList ? 16 : 21;
						return (
							<SView col={"xs-12"} center row>
								{nombre ? (
									<SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
										<SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
										{e.row?.key_almacen ? <SImage src={`${SSocket.api.empresa}almacen/${e.row?.key_almacen}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
									</SView>
								) : null}
								{nombre ? <SView width={5} /> : null}
								<SText flex capitalize numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
							</SView>
						);
					}}
				/>

				<DinamicTable.Col key="vendedor" label="Vendedor" width={100} height={60} data={(e) => e.row?.usuario?.Nombres ?? ""}
					customComponent={e => {
						const nombre = e.row?.usuario?.Nombres || "";
						const avatarSize = e.filterList ? 16 : 21;
						return (
							<SView col={"xs-12"} center row>
								{nombre ? (
									<SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
										<SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
										{e.row?.usuario?.key ? <SImage src={`${SSocket.api.root}usuario/${e.row?.usuario?.key}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
									</SView>
								) : null}
								{nombre ? <SView width={5} /> : null}
								<SText flex capitalize numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
							</SView>
						);
					}}
				/>

				<DinamicTable.Col key="cliente" label="Cliente" width={120} height={60} data={(e) => e.row?.cliente?.razon_social ?? ""}
					customComponent={e => {
						const nombre = e.row?.cliente?.razon_social || "";
						const avatarSize = e.filterList ? 16 : 21;
						return (
							<SView col={"xs-12"} center row>
								{nombre ? (
									<SView style={{ width: avatarSize, height: avatarSize, borderRadius: 100, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
										<SText style={{ fontSize: avatarSize / 2, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
										{e.row?.cliente?.key ? <SImage src={`${SSocket.api.root}usuario/${e.row?.cliente?.key}`} style={{ width: avatarSize, height: avatarSize, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
									</SView>
								) : null}
								{nombre ? <SView width={5} /> : null}
								<SText flex capitalize numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
							</SView>
						);
					}}
				/>

				<DinamicTable.Col key="moneda" label="Moneda" wrap width={60} height={60} data={(e) => e.row?.moneda?.descripcion ?? ""} />
				<DinamicTable.Col key="cantidad" label="Cantidad" width={80} height={60} data={(e) => e.row?.cantidad ?? 0} dataType="number" textStyle={{ fontSize: 12, color: STheme.color.text }}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + (Number(row.cantidad) || 0), 0);
						return total ? `${total}` : '';
					}}
					sumExcel
				/>
				<DinamicTable.Col key="precio_unitario" label="Precio" width={80} height={60} data={(e) => e.row?.precio_unitario ?? 0} dataType="number" textStyle={{ fontSize: 12, color: STheme.color.text }} format={e => (e.data ? SMath.formatMoney(e.data) : '')}
					customComponent={e => {
						return (
							<>
								{(e.data) ?
									<SView center row style={{ justifyContent: "flex-end", paddingHorizontal: 4 }}>
										<SText fontSize={13} numberOfLines={0}>  {e.row?.moneda ? e.row?.moneda?.observacion : ""} {SMath.formatMoney(e.data)}  </SText>
									</SView> : null}
							</>
						);
					}}
				/>
				<DinamicTable.Col key="total" label="Total" width={80} height={60} data={(e) => e.row?.total ?? 0} dataType="number" textStyle={{ fontSize: 12, color: STheme.color.text }}
					sumTotal={rows => {
						console.log("AQUI", rows);
						const total = rows.reduce((s, row) => s + (Number(row.total) || 0), 0);
						const baseSim = rows[0]?.moneda?.observacion || 'Bs';
						return total ? `${baseSim} ${SMath.formatMoney(total)}` : '';
					}}
					sumExcel
					excelFormat="#,##0.00"
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
					customComponent={e => {
						return (
							<>
								{(e.data) ?
									<SView center row style={{ justifyContent: "flex-end", paddingHorizontal: 4 }}>
										<SText fontSize={13} numberOfLines={0}>  {e.row?.moneda ? e.row?.moneda?.observacion : ""} {SMath.formatMoney(e.data)}  </SText>
									</SView> : null}
							</>
						);
					}}



				/>


				{/* <DinamicTable.Col key="tipo_pago" wrap label="Pago" width={80} height={60}
					data={(e) => e.row?.tipo_pago ?? ""}
					customComponent={e => {
						const tipoPagoMap = {
							"contado": { color: "#2563eb", label: "Contado" },
							"credito": { color: "#f59e0b", label: "Crédito" },
							"transferencia": { color: "#6b7280", label: "Transferencia" },
						};
						const estilo = tipoPagoMap[e.data?.toLowerCase()] || { color: STheme.color.lightGray, label: e.data };
						return (
							<>
								{(e.row?.tipo_pago) ?
									<SView center row>
										<SView backgroundColor={estilo.color} style={{ borderRadius: 4, padding: 5 }}>
											<SText color={STheme.color.text} fontSize={12}>{estilo.label}</SText>
										</SView>
									</SView> : null}
							</>
						);
					}}
				/> */}








				{/*<DinamicTable.Col key="monto_amortizado" wrap label="Monto" width={125} height={60}
					sumTotal={rows => {
						const total = rows.reduce((s, row) => s + (Number(row.monto_amortizado_base) || 0), 0);
						const baseSim = rows[0]?.empresa?.monedas?.find(m => m.tipo === 'base')?.observacion || 'Bs';
						return total ? `${baseSim} ${SMath.formatMoney(total)}` : '';
					}}
					dataType="number"
					sumExcel
					excelFormat="#,##0.00"
					footerComponent={this.footerCuotasYMonto(row => row.cuotas?.cantidad_pagada, row => row.monto_amortizado_base)}
					data={(e) => e.row?.monto_amortizado_base || 0}
					cellStyle={{ backgroundColor: STheme.color.success + "33" }}

					customComponent={e => {
						const monedas = e.row?.empresa?.monedas || [];
						const anulada = Number(e.row?.estado) === 0;
						const color = STheme.color.text;
						const sim = e.row?.moneda?.observacion || 'Bs';
						const monto = e.row?.monto_amortizado || 0;
						const fmt = SMath.formatMoney(monto);
						const num = fmt.startsWith(sim) ? fmt.replace(sim, '').trim() : fmt;
						const baseMonto = e.row?.monto_amortizado_base || 0;
						const baseSim = monedas.find(m => m.tipo === 'base')?.observacion || 'Bs';
						const baseFmt = SMath.formatMoney(baseMonto);
						const baseNum = baseFmt.startsWith(baseSim) ? baseFmt.replace(baseSim, '').trim() : baseFmt;
						const showBase = baseMonto > 0 && sim !== baseSim;
						if (!monto) return null;
						return (
							<SView row style={{ justifyContent: "flex-end", paddingHorizontal: 4 }}>
								<SView  >
									<SText style={{ fontSize: 12, color, textDecorationLine: anulada ? 'line-through' : 'none', opacity: anulada ? 0.6 : 1 }}>{sim} {num}</SText>
								</SView>
								{showBase && (
									<SView style={{ marginTop: 2, }}>
										<SText style={{ fontSize: 9, color, opacity: anulada ? 0.5 : 0.8, textDecorationLine: anulada ? 'line-through' : 'none' }}>({baseSim} {baseNum})</SText>
									</SView>
								)}
							</SView>
						);
					}} /> */}




			</DinamicTable>
		);
	}

	render() {
		return (
			<SPage title="Tabla de Ventas - Productos" disableScroll>
				<SView row col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray + "30", paddingVertical: 8, paddingHorizontal: 12, }} >
					<SView col={"xs-12 sm-8.2 lg-3.3"} row center>
						<FechaFullFilter
							onChange={e => {
								const esPrimerLlamado = !this._fechaFilterListo;
								this._fechaFilterListo = true;
								this.setState({
									fecha_inicio: e.fecha_inicio,
									fecha_fin: e.fecha_fin
								}, () => {
									if (!esPrimerLlamado) this.DinamicTable?.loadData();
								});
							}}
						/>
					</SView>
					<SView width={8} height={"100%"} />
				</SView>{this.mostrarTabla()}
			</SPage>
		);
	}
}