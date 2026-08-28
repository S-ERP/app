import React, { Component } from 'react';
import { SPage, SPopup, SView, SText, STheme, SHr, SImage, SDate, SMath, SNotification, } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import SSocket from 'servisofts-socket';
import MDL from '../../MDL';
import Config from '../../Config';
import FloatMenu from '../../Components/FloatMenu';
import SIconApp from '../../Assets/SIconApp';
import FormRegistroSuscriptor from './Components/FormRegistroSuscriptor';
const URL = "/suscriptores";

export default class Suscriptores extends Component {

	constructor(props) {
		super(props);
		this.state = {
			time: new Date().getTime(),
		};
	}

	renderUsuario(usuario = {}) {
		const nombre = `${usuario?.Nombres || "Sin"} ${usuario?.Apellidos || "usuario"}`;

		return (
			<SView col="xs-12" center row>
				<SView
					style={{
						width: 24,
						height: 24,
						borderRadius: 100,
						overflow: "hidden",
						backgroundColor: STheme.color.card + "66",
					}}
				>
					{usuario?.key ? (
						<SImage
							src={`${SSocket.api.root}usuario/${usuario.key}`}
							style={{ resizeMode: "cover" }}
						/>
					) : null}
				</SView>

				<SView width={5} />
				<SText flex numberOfLines={1} style={{ fontSize: 10 }}>
					{nombre}
				</SText>
			</SView>
		);
	}

	renderCliente(cliente = {}) {
		const nombre = `${cliente?.nombres || "Sin"} ${cliente?.apellidos || "cliente"}`;

		return (
			<SView col="xs-12" center row>
				<SView
					style={{
						width: 24,
						height: 24,
						borderRadius: 100,
						overflow: "hidden",
						backgroundColor: STheme.color.card + "66",
					}}
				>
					{cliente?.key ? (
						<SImage
							src={`${SSocket.api.root}usuario/${cliente.key}`}
							style={{ resizeMode: "cover" }}
						/>
					) : null}
				</SView>

				<SView width={5} />
				<SText flex numberOfLines={1} style={{ fontSize: 10 }}>
					{nombre}
				</SText>
			</SView>
		);
	}

	renderValidofecha(obj) {
		if (!obj) return null;

		const now = new Date();
		const fechaInicio = obj.fecha_inicio ? new Date(obj.fecha_inicio) : null;
		const fechaFin = obj.fecha_fin ? new Date(obj.fecha_fin) : null;

		let mensaje = "—";
		let backgroundColor = "#F0F0F0";

		if (fechaFin && fechaFin < now) {
			mensaje = "Vencido";
			backgroundColor = "#FF4D4F";
		} else if (fechaInicio && fechaInicio <= now && fechaFin && fechaFin >= now) {
			mensaje = "Activo";
			backgroundColor = "#52C41A";
		} else if (fechaInicio && fechaInicio > now) {
			mensaje = "Futuro";
			backgroundColor = "#595959";
		}

		return (
			<SView col="xs-12" center row style={{ justifyContent: "center" }}>
				<SView
					style={{
						backgroundColor: backgroundColor,
						borderRadius: 12,
						paddingHorizontal: 10,
						paddingVertical: 4,
						minWidth: 60,
						alignItems: "center",
						justifyContent: "center",
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 1 },
						shadowOpacity: 0.2,
						shadowRadius: 1,
						elevation: 1,
					}}
				>
					<SText
						numberOfLines={1}
						style={{
							fontSize: 11,
							color: "white",
							fontWeight: "bold",
							textAlign: "center",
						}}
					>
						{mensaje}
					</SText>
				</SView>
			</SView>
		);
	}

	renderSucursal(sucursal = {}) {
		if (!sucursal?.key) return null;

		return (
			<SView col="xs-12" center row>
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
						src={`${SSocket.api.empresa}sucursal/${sucursal.key}`}
						style={{ resizeMode: "cover" }}
					/>
				</SView>

				<SView width={5} />
				<SText flex numberOfLines={1} style={{ fontSize: 10 }}> {sucursal?.descripcion || "Sucursal"} </SText>
			</SView>
		);
	}

	renderEmpresa(empresa = {}) {
		if (!empresa?.key) return null;

		return (
			<SView col="xs-12" center row>
				<SView
					style={{
						width: 24,
						height: 24,
						borderRadius: 100,
						overflow: "hidden",
						backgroundColor: STheme.color.card + "66",
					}}
				>

					<SImage src={`${SSocket.api.empresa}empresa/${empresa?.key}`} style={{ resizeMode: "cover" }} />

				</SView>

				<SView width={5} />
				<SText flex numberOfLines={1} style={{ fontSize: 10 }}> {empresa?.razon_social || "empresa"} </SText>
			</SView>
		);
	}

	async loadInitialData() {
		const notificationKey = "suscriptores_load";
		try {
			SNotification.send({
				key: notificationKey,
				title: "Cargando suscripciones...",
				type: "loading",
			});

			const empresaKey = MDL.empresa.select?.key;

			const res = await MDL.compra_venta.getsuscripciones_full();
			if (!Array.isArray(res)) return [];

			const empresa = await MDL.empresa.getFull();
			const sucursales = Object.values(empresa?.sucursales || {});

			const keysUsuarios = [
				...new Set(
					res.flatMap(e => [e.key_usuario, e.key_cliente]).filter(Boolean)
				)
			];

			const usuariosArrRaw = await MDL.usuario.getByKeys(keysUsuarios);
			const usuariosArr = Array.isArray(usuariosArrRaw) ? usuariosArrRaw : [];
			const usuariosMap = Object.fromEntries(
				usuariosArr.map(u => [u.key, u])
			);

			const clientesArrRaw = await MDL.crm.cliente.getAll();
			if (!Array.isArray(clientesArrRaw)) {
				console.error("No se pudieron obtener clientes.");
			}
			const clientesArr = Array.isArray(clientesArrRaw) ? clientesArrRaw : [];

			const clientesMap = Object.fromEntries(
				clientesArr.map(c => [c.key, c])
			);

			const data_mejorada = res.map(e => ({
				...e,
				sucursal: sucursales.find(s => s.key === e.key_sucursal) || {},
				usuario: usuariosMap[e.key_usuario] || {},
				cliente: clientesMap[e.key_cliente] || {},
				empresa,
			}));

			SNotification.send({
				key: notificationKey,
				title: "Suscripciones cargadas",
				color: STheme.color.success,
				time: 2000,
			});

			return data_mejorada;

		} catch (error) {
			console.error("❌ Error en loadInitialData:", error);
			SNotification.send({
				key: notificationKey,
				title: "Error al cargar datos",
				body: error?.message || "No se pudieron cargar las suscripciones.",
				color: STheme.color.danger,
				time: 5000,
			});
			SPopup.alert("Error al cargar los datos.");
			return [];
		}
	}

	mostrarTabla() {
		return (
			<DinamicTable
				ref={ref => (this.DinamicTable = ref)}
				loadData={async () => {
					return this.loadInitialData();
				}}
				key="id"
				language="es"
				center
				{...Config.table.applyTheme()}
				selectType="single"
				keyExtractor={(e) => e.key}

				loadInitialState={async () => {
					return { sorters: [{ key: "fecha_on", order: "desc", type: "date" }] }
				}}

				onSelect={(e) => {

					SNotification.send({
						key: "suscriptor_edit_open",
						title: "Abriendo editor...",
						type: "loading",
						time: 1000,
					});

					console.log("Selected project:", e.row);
					const { row, evt } = e;
					const nombreTurno = `Suscripción: ${row?.cliente?.nombres ?? 'Sin nombre'}`;
					const options = [];

					if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'edit' })) {
						options.push({
							label: 'Editar Fechas',
							icon: <SIconApp name="Edit" fill={STheme.color.text} />,
							onPress: () => {
								FormRegistroSuscriptor.open({
									defaultData: row,
									onActualizar: (nuevoDato) => {
										this.DinamicTable.loadData();
										console.log("Cliente actualizado:", nuevoDato);
										SNotification.send({
											key: "suscriptor_update",
											title: "Suscripción actualizada",
											color: STheme.color.success,
											time: 3000,
										});

									}
								});
							}
						});
					}

					if (MDL.rolesPermisos.getPermiso({ url: URL, permiso: 'delete' })) {
						console.log(row)
						options.push({
							label: 'Eliminar',
							icon: <SIconApp name="Delete" fill={STheme.color.text} />,
							onPress: () => {
								const notificationKey = `suscripcion_${row.key}`;

								SPopup.confirm({
									title: "Eliminar Suscripción",
									message: `¿Estás seguro de eliminar a ${nombreTurno}?`,
									onPress: async () => {
										try {
											SNotification.send({
												key: notificationKey,
												title: "Actualizando suscripción...",
												type: "loading",
											});

											const datosParaEnviar = {
												key: row.key,
												key_cliente: row.key_cliente,
												fecha_inicio: row.fecha_inicio,
												fecha_fin: row.fecha_fin,
												estado: 0,
											};

											console.log("Datos para enviar:", datosParaEnviar);

											await MDL.inventario.editSuscripcion(datosParaEnviar);

											this.DinamicTable?.loadData?.();

											SNotification.send({
												key: notificationKey,
												title: "Éxito",
												message: `Esta acción desactivará la suscripción de ${nombreTurno}`,
												color: STheme.color.success,
												time: 3000,
											});
										} catch (err) {
											console.error("Error al eliminar el artículo del cliente", err);

											SNotification.send({
												key: notificationKey,
												title: "Error",
												body: err?.message || "Suscripción no actualizada.",
												color: STheme.color.danger,
												time: 3000,
											});
										}
									},
								});
							},
						});
					}

					FloatMenu.open({
						e: evt,
						label: nombreTurno,
						options,
					});

				}}
			>

				<DinamicTable.Col key="index" label="N°" width={30} data={(e) => e.index + 1} />
				<DinamicTable.Col key={"fecha_on"} label="Fecha de registro" width={120} dataType="date" data={e => new SDate(e.row?.fecha_on, "yyyy-MM-ddThh:mm:ss").date} textStyle={{ fontSize: 12, color: STheme.color.lightGray }} dateFormat="yyyy-MM-dd hh:mm" />
				<DinamicTable.Col key="key_cliente_" label="Cliente" width={100} data={(e) => e.row?.key_cliente ?? ""} customComponent={e => this.renderCliente(e.row?.cliente)} />
				<DinamicTable.Col key="key_sucursal" label="key_sucursal" width={100} data={(e) => e.row?.key_sucursal ?? ""} customComponent={e => this.renderSucursal(e.row?.sucursal)} />
				{ }

				<DinamicTable.Col key="descripcion" label="descripcion" width={100} data={(e) => e.row?.descripcion ?? ""} />

				{ }

				{ }
				{ }

				{ }

				{ }
				<DinamicTable.Col key={"modelo_"} label='modelo' width={120} data={(e) => e.row?.modelo?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
					<SView style={{ width: 25, height: 25, borderRadius: 4, borderWidth: 1, borderColor: STheme.color.card, overflow: "hidden", backgroundColor: STheme.color.card + "66", }}>
						<SImage src={SSocket.api.inventario + "modelo/.128_" + e.row?.modelo?.key} enablePreview srcPreview={SSocket.api.inventario + "modelo/" + e.row?.modelo?.key} style={{ resizeMode: "cover", }} />
					</SView>
					<SView width={8} />
					<SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.modelo?.descripcion}</SText>
				</SView>} />

				<DinamicTable.Col key={"duracion_"} label='duracion' width={120} data={(e) => e.row?.modelo?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
					<SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.modelo?.duracion} {e.row?.modelo?.duracion_medida}</SText>
				</SView>} />

				<DinamicTable.Col key={"cant_suscriptores_"} label='suscriptores' width={120} data={(e) => e.row?.modelo?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
					<SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.modelo?.cantidad_suscriptores}</SText>
				</SView>} />

				<DinamicTable.Col key={"marca_"} label='marca' width={120} data={(e) => e.row?.marca?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
					<SView style={{ width: 25, height: 25, borderRadius: 4, borderWidth: 1, borderColor: STheme.color.card, overflow: "hidden", backgroundColor: STheme.color.card + "66", }}>
						<SImage src={SSocket.api.inventario + "marca/.128_" + e.row?.marca?.key} enablePreview srcPreview={SSocket.api.inventario + "marca/" + e.row?.marca?.key} style={{ resizeMode: "cover", }} />
					</SView>
					<SView width={8} />
					<SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.marca?.descripcion}</SText>
				</SView>} />
				<DinamicTable.Col key={"tipo_producto_"} label='tipo_producto' width={120} data={(e) => e.row?.tipo_producto?.key} wrap textStyle={{ fontWeight: "bold" }} customComponent={e => <SView row style={{ alignItems: "center", }}>
					<SView style={{ width: 25, height: 25, borderRadius: 4, borderWidth: 1, borderColor: STheme.color.card, overflow: "hidden", backgroundColor: STheme.color.card + "66", }}>
						<SImage src={SSocket.api.inventario + "tipo_producto/.128_" + e.row?.tipo_producto?.key} enablePreview srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row?.tipo_producto?.key} style={{ resizeMode: "cover", }} />
					</SView>
					<SView width={8} />
					<SText flex style={{ fontSize: 10 }} numberOfLines={0} >{e.row?.tipo_producto?.descripcion}</SText>
				</SView>} />

				{ }
				<DinamicTable.Col key={"var1_"} label='Precio' width={70} data={(e) => e.row?.producto?.precio && SMath.formatMoney(e.row?.producto?.precio)} />
				<DinamicTable.Col key="var2_" label="Modelo" width={120} data={e => e.row?.modelo?.descripcion} />

				<DinamicTable.Col key="estado_fecha_" label="Estado" width={100} data={(e) => e.row?.fecha_fin ?? ""} customComponent={e => this.renderValidofecha(e.row)} />

				{ }
				{ }
				{ }

				{ }
				<DinamicTable.Col key="fecha_inicio" label="Fecha de inicio" width={120} data={e => e.row?.fecha_inicio?.substring(0, 10)} />
				<DinamicTable.Col key="fecha_fin" label="Fecha de fin" width={120} data={e => e.row?.fecha_fin?.substring(0, 10)} />

				{ }
				{ }

				<DinamicTable.Col key="key_usuario" label="Administrador" width={100} data={(e) => e.row?.key_usuario ?? ""} customComponent={e => this.renderUsuario(e.row?.usuario)} />

			</DinamicTable>
		);
	}
	render() {
		return (
			<SPage title="Suscriptores" disableScroll>
				{this.mostrarTabla()}
				<SHr height={20} />
			</SPage>
		);
	}
}
