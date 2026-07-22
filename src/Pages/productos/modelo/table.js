import React, { Component, createRef } from 'react';
import { SHr, SImage, SMath, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
import FormularioModelo from '../Components/FormularioModelo';
import FloatButtom from '../../../Components/FloatButtom';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import PopupDetalleModelo from '../Components/PopupDetalleModelo';
import PopupDesglose from '../Components/PopupDesglose';
import PopupModeloCardex from '../Components/PopupModeloCardex';
import PopupTag from '../../tag/Components/PopupTag';
import PopupAgregarTags from './Components/PopupAgregarTags';
import FiltroSelector from './Components/FiltroSelector';
import PopupDesgloseTipoCosto from './Components/PopupDesgloseTipoCosto';
import FormularioTipoProducto from '../Components/FormularioTipoProducto';
import PopupAgregarMarca from '../marca/Components/PopupAgregarMarca';
export default class table extends Component {
	constructor(props) {
		super(props);
		this.state = {
			time: new Date().getTime(),
			allTags: [],
			selectedTags: props.selectedTags || [],
			search: "",
			selectedAlmacen: null,
			selectedSucursal: null,
			selectedStock: null,
			selectedTipoCuenta: null,
			selectedTipoModelo: null,

		};
		this.selectorRef = createRef();
		this.modelos = null;
	}
	componentDidMount() {
		window.addEventListener("keydown", this.handleKeyDown);
	}
	componentWillUnmount() {
		window.removeEventListener("keydown", this.handleKeyDown);
	}
	handleKeyDown = (e) => {
		if (e.key === "Escape") {
			this.filtroSucursalRef?.reset();
			this.filtroAlmacenRef?.reset();
			this.filtroStockRef?.reset();
			this.filtroTipoContableRef?.reset();
			this.filtroTipoProductoRef?.reset();
			this.setState({ selectedSucursal: null, selectedAlmacen: null, selectedStock: null, selectedTipoCuenta: null, selectedTipoModelo: null, }, () => {
				this.table?.loadData();
			});
		}
	};

	async loadData() {
		try {
			const [monedas, clientes, tipo_costos, modelos] = await Promise.all([
				MDL.empresa.getMonedas().catch(() => []),
				MDL.crm.cliente.getAll().catch(() => []),
				MDL.inventario.getAllTipoCosto().catch(() => []),
				MDL.inventario.getAllModeloStock(this.state?.selectedAlmacen?.key ?? "", this.state?.selectedSucursal?.key ?? ""
				).catch(() => [])
			]);
			const monedasByKey = Object.fromEntries((monedas ?? []).map(m => [m?.key, m]));
			const clientesByKey = Object.fromEntries((clientes ?? []).map(c => [c?.key, c]));
			const tipoCostoByKey = Object.fromEntries((tipo_costos ?? []).map(tc => [tc?.key, tc]));

			let data_mejorada = (modelos ?? []).map(e => ({
				...e,
				compra_moneda: monedasByKey[e?.precio_compra_moneda] || {},
				venta_moneda: monedasByKey[e?.precio_venta_moneda] || {},
				contactos: (e?.contactos ?? []).map(c => ({
					...c,
					cliente: clientesByKey[c?.key_cliente] || {},
					tipo_costo: tipoCostoByKey[c?.key_tipo_costo] || {},
				})),
				proveedores: (e?.proveedores ?? []).map(p => ({
					...p,
					proveedor: clientesByKey[p?.key_proveedor] || {},
				})),
				tipo_producto: e?.tipo_producto || {},
				marca: e?.marca || {},
				tags: e?.tags ?? [],
				stock: Number(e?.stock ?? 0),
			}));

			if (this.state.selectedStock?.key === "con_stock") {
				data_mejorada = data_mejorada.filter(m => m.stock > 0);
			}

			if (this.state.selectedStock?.key === "sin_stock") {
				data_mejorada = data_mejorada.filter(m => m.stock <= 0);
			}
			if (this.state.selectedTipoCuenta?.key && this.state.selectedTipoCuenta.key !== "Todos") {
				data_mejorada = data_mejorada.filter(
					m => m?.tipo_producto?.tipo === this.state.selectedTipoCuenta.key
				);
			}
			if (this.state.selectedTipoModelo?.key && this.state.selectedTipoModelo.key !== "Todos") {
				data_mejorada = data_mejorada.filter(
					m => m?.tipo_producto?.descripcion === this.state.selectedTipoModelo.key
				);
			}
			this.modelos = data_mejorada;
			return data_mejorada;
		} catch (error) {
			console.error("Error real en loadData:", error);

			SPopup.alert(
				"Error al cargar modelos",
				error?.message || "Error desconocido"
			);

			return [];
		}
	}
	renderColorPreview(nombre: string, color: string) {
		const displayName = nombre?.trim() || "Etiqueta de ejemplo";
		const backgroundColor = `${color}33`;
		return (
			<SView height={18} center style={{ backgroundColor, borderRadius: 4, borderWidth: 1, borderColor: color, flexDirection: "row", alignItems: "center", paddingHorizontal: 6, }} >
				<SText color={STheme.color.text} fontSize={10} numberOfLines={1}> {displayName} </SText>
			</SView>
		);
	}
	render() {
		return <SPage title={"Modelos"} disableScroll >
			<SView row col={"xs-12"} style={{
				backgroundColor: "transparent",
				borderBottomWidth: 1,
				borderTopWidth: 1,
				borderColor: STheme.color.lightGray + "30",
				paddingVertical: 12,
				paddingHorizontal: 12,
			}}
			>
				<SView col={"xs-12 sm-5 lg-1.6"} row center style={{ flexWrap: "wrap", gap: 12 }}>

					<FiltroSelector
						ref={ref => this.filtroSucursalRef = ref}
						label="Sucursal"
						loadData={MDL.empresa.getAllSucursales}
						mapOption={a => ({ key: a.key, nombre: a.descripcion })}
						onSelect={item => {
							this.filtroAlmacenRef?.reset(false);
							this.setState({ selectedSucursal: item, selectedAlmacen: null, }, () => {
								this.table?.loadData();
							});
						}}
					/>
				</SView>
				<SView width={8} height={8} />
				<SView col={"xs-12 sm-5 lg-1.6"} row center style={{ flexWrap: "wrap", gap: 12 }}>
					<FiltroSelector
						ref={ref => this.filtroAlmacenRef = ref}
						label="Almacén"
						loadData={MDL.inventario.getAllAlmacen}
						mapOption={a => ({ key: a.key, nombre: a.descripcion })}
						onSelect={item => {
							this.filtroSucursalRef?.reset(false);
							this.setState({ selectedAlmacen: item, selectedSucursal: null, }, () => {
								this.table?.loadData();
							});
						}}
					/>

				</SView>
				<SView width={8} height={8} />
				<SView col={"xs-12 sm-5 lg-1"} row center style={{ flexWrap: "wrap", gap: 12 }}>
					<FiltroSelector
						ref={ref => this.filtroStockRef = ref}
						label="Stock"
						loadData={async () => [
							{ key: "con_stock", nombre: "Con stock" },
							{ key: "sin_stock", nombre: "Sin stock" },
						]}
						mapOption={a => ({ key: a.key, nombre: a.nombre })}
						onSelect={item => this.setState({ selectedStock: item }, () => this.table.loadData())}
					/>
				</SView>
				<SView width={8} height={8} />
				<SView col={"xs-12 sm-5 lg-1.6"} row center style={{ flexWrap: "wrap", gap: 12 }}>
					<FiltroSelector
						ref={ref => this.filtroTipoContableRef = ref}
						label="Tipo"
						loadData={async () => MDL.inventario.TIPOS_DE_PRODUCTOS.map(a => ({ key: a.key, nombre: a.key }))}
						mapOption={a => ({ key: a.key, nombre: a.nombre })}
						onSelect={item => this.setState({ selectedTipoCuenta: item }, () => this.table.loadData())}
					/>
				</SView>
				<SView width={8} height={8} />
				<SView col={"xs-12 sm-5 lg-1.6"} row center style={{ flexWrap: "wrap", gap: 12 }}>
					<FiltroSelector
						ref={ref => this.filtroTipoProductoRef = ref}
						label="Tipo Producto"
						loadData={MDL.inventario.getAllTipoProducto}
						mapOption={a => ({ key: a.descripcion, nombre: a.descripcion })}
						onSelect={item => this.setState({ selectedTipoModelo: item }, () => this.table.loadData())}
					/>
				</SView>
			</SView>
			<SHr height={8} />
			{/* <SView row style={{ gap: 16, flexWrap: "wrap", paddingHorizontal: 4 }}>
				<SText fontSize={13} color={STheme.color.lightGray}> Almacén: <SText fontSize={13} bold color={STheme.color.text}> {this.state.selectedAlmacen?.nombre || "Todos"} </SText> </SText>
				<SText fontSize={13} color={STheme.color.lightGray}> Stock: <SText fontSize={13} bold color={STheme.color.text}> {this.state.selectedStock?.nombre || "Todos"} </SText> </SText>
				<SText fontSize={13} color={STheme.color.lightGray}> Tipo cuenta: <SText fontSize={13} bold color={STheme.color.text}> {this.state.selectedTipoCuenta?.nombre || "Todos"} </SText> </SText>
				<SText fontSize={13} color={STheme.color.lightGray}> otr: <SText fontSize={13} bold color={STheme.color.text}> {this.state.selectedTipoModelo?.nombre || "Todos"} </SText> </SText>
			</SView>
			<SHr height={8} /> */}
			<DinamicTable key={"tabla_modelo"}
				ref={ref => this.table = ref}
				{...Config.table.applyTheme()}
				selectType='single'
				language='es'
				listFooterComponent={() => {
					return <SHr height={100} />
				}}
				cellStyle={{ ...Config.table.cellStyle(), padding: 2, borderWidth: 0 }}
				loadData={this.loadData.bind(this)}
				onSelect={e => {
					FloatMenu.open({
						e: e.evt,
						height: 330,
						style: { width: 400 },
						numColumns: 2,
						label: e.row.descripcion,
						options: [
							{
								label: "Editar",
								icon: <SIconApp name='Pencil' fill={STheme.color.text} />,
								onPress: () => {
									FormularioModelo.open({
										editObject: e.row,
										onSuccess: () => {
											if (this.table) {
												this.table.loadData();
											}
										}
									})
								}
							},
							{
								label: "Eliminar",
								icon: <SIconApp name='crmeliminar' fill={STheme.color.danger} />,
								onPress: () => {
									SPopup.confirm({
										title: "Eliminar Modelo",
										message: "¿Está seguro de eliminar el modelo " + e.row.descripcion + "?",
										onPress: () => {
											MDL.inventario.saveModelo({
												key: e.row.key,
												estado: 0,
											}).then(() => {
												if (this.table) {
													this.table.loadData();
												}
											});
										}
									});
								}
							},
							{
								label: "Agregar Proveedor",
								icon: <SIconApp name="addFoto" fill={STheme.color.card} />,
								onPress: () => {
									SNavigation.navigate("/proveedor", {
										onSelect: (prov) => {
											if (!prov?.key) return;
											const key_modelo = e.row.key;
											const key_proveedor = prov.key;
											MDL.inventario
												.saveModeloProveedor({ key_modelo, key_proveedor, })
												.then(() => {
													this.table?.loadData();
												})
												.catch((err: any) => {
													console.error("Error al guardar proveedor:", err);
												});
										},
									});
								},
							},
							{
								label: "Ver Desglose Tipo Costos",
								icon: <SIconApp name='Eyes' fill={STheme.color.card} />,
								onPress: () => {
									PopupDesgloseTipoCosto.open({
										key_modelo: e.row.key,
										onSuccess: () => {
											if (this.table) {
												this.table.loadData();
											}
										}
									})
								}
							},
							{
								label: "Agregar Tag",
								icon: <SIconApp name='addFoto' fill={STheme.color.card} />,
								onPress: () => {
									const currentTags = (e.row.tags || [])
										.map(t => t?.tags || t)
										.filter(t => t?.key);
									PopupAgregarTags.open({
										selectedTags: currentTags,
										key_modelo: e.row.key,
										onSuccess: async (selected) => {
											this.table?.loadData();
										},
										onCancel: () => { }
									});
								},
							},
							{
								label: "Ver Desglose Lotes",
								icon: <SIconApp name='Eyes' fill={STheme.color.card} />,
								onPress: () => {
									PopupDesglose.open({
										key_modelo: e.row.key
									})
								}
							},

							{
								label: "Ingredientes",
								icon: <SIconApp name='addFoto' fill={STheme.color.card} />,
								onPress: () => {
									SNavigation.navigate("/productos/modelo/ingrediente", {
										key_modelo: e.row.key
									})
								}
							},
							{
								label: "Ver Desglose Cardex",
								icon: <SIconApp name='Eyes' fill={STheme.color.card} />,
								onPress: () => {
									PopupModeloCardex.open({
										key_modelo: e.row.key
									})
								}
							},
						]
					});
				}}
				loadInitialState={async () => {
					return {
						sorters: [{ key: "tipo_producto_tipo", order: "asc", type: "string" }, { key: "nombre", order: "asc", type: "string" }],
					}
				}}
			>
				<DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray, fontSize: 10 }} width={30} data={(e) => e.index + 1} />

				<DinamicTable.Col key={"codigo_ref"} label='Cod. Ref.' width={60} data={(e) => e.row.codigo_ref} />

				<DinamicTable.Col key="nombre" label="Nombre" headerStyle={{ paddingLeft: 4 }} width={150} height={60}
					data={(e) => e.row.descripcion ?? ""}
					customComponent={e => {
						const esVenta = (e.row?.key);
						const nombre = esVenta ? (e.row?.descripcion || "") : "";
						return (
							<SView col={"xs-12"} center row>
								{nombre ? (
									<SView style={{ width: 24, height: 24, borderRadius: 3, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
										<SText style={{ fontSize: 11, color: STheme.color.text, opacity: 0.7 }}>{nombre[0].toUpperCase()}</SText>
										{e.row?.key ? <SImage
											src={SSocket.api.inventario + "modelo/.128_" + e.row.key + "?date=" + this.state.time}
											enablePreview
											srcPreview={SSocket.api.inventario + "modelo/" + e.row.key + "?date=" + this.state.time}
											style={{ width: 24, height: 24, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} /> : null}
									</SView>
								) : null}
								{nombre ? <SView width={5} /> : null}
								<SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombre}</SText>
							</SView>
						);
					}}
				/>

				<DinamicTable.Col key={"marca"} label='Marca' width={130} data={(e) => e.row?.marca?.descripcion} wrap textStyle={{ fontSize: 10, color: STheme.color.lightGray, }}
					customComponent={e => {
						const nombreMarca = e.row?.marca?.descripcion || "";
						return <>
							{(e.row.key_marca) ?
								<SView col={"xs-12"} center row onPress={() => {
									PopupAgregarMarca.open({
										editObject: { ...e.row?.marca, quitar: true, key_modelo: e.row?.key },
										onSuccess: () => {
											if (this.table) {
												this.table.loadData();
												this.state.time = new Date().getTime();
											}
										}
									})
								}}>
									{nombreMarca ? (
										<SView style={{ width: 24, height: 24, borderRadius: 3, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
											<SText style={{ fontSize: 11, color: STheme.color.text, opacity: 0.7 }}>{nombreMarca[0].toUpperCase()}</SText>
											<SImage
												src={SSocket.api.inventario + "marca/.128_" + e.row.key_marca + "?date=" + this.state.time}
												enablePreview
												srcPreview={SSocket.api.inventario + "marca/" + e.row.key_marca + "?date=" + this.state.time}
												style={{ width: 24, height: 24, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} />
										</SView>
									) : null}
									{nombreMarca ? <SView width={5} /> : null}
									<SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombreMarca}</SText>
								</SView> : null}
						</>;
					}}
				/>

				<DinamicTable.Col key={"tipo_producto"} label='Tipo' width={130}
					data={(e) => e.row?.tipo_producto?.descripcion}
					textStyle={{ fontSize: 10, color: STheme.color.lightGray, }}
					customComponent={e => {
						if (!e.data) return;
						const nombreTipo = e.row?.tipo_producto?.descripcion || "";
						return <>
							{(e.row.key_tipo_producto) ?
								<SView col={"xs-12"} center row onPress={() => {
									FormularioTipoProducto.open({
										editObject: e.row.tipo_producto,
										onSuccess: () => {
											if (this.table) {
												this.table.loadData();
												this.state.time = new Date().getTime();
											}
										}
									})
								}}>
									{nombreTipo ? (
										<SView style={{ width: 24, height: 24, borderRadius: 3, backgroundColor: STheme.color.text + "20", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
											<SText style={{ fontSize: 11, color: STheme.color.text, opacity: 0.7 }}>{nombreTipo[0].toUpperCase()}</SText>
											<SImage
												src={SSocket.api.inventario + "tipo_producto/.128_" + e.row.key_tipo_producto + "?date=" + this.state.time}
												enablePreview
												srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row.key_tipo_producto + "?date=" + this.state.time}
												style={{ width: 24, height: 24, resizeMode: "cover", position: "absolute", top: 0, left: 0 }} />
										</SView>
									) : null}
									{nombreTipo ? <SView width={5} /> : null}
									<SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{nombreTipo}</SText>
								</SView> : null}
						</>
					}
					}
				/>
				<DinamicTable.Col key={"observacion"} label='Observación' width={150}
					textStyle={{
						fontSize: 12,
						color: STheme.color.lightGray,
					}}
					data={(e) => e.row.observacion} />

				<DinamicTable.Col key="stock" label="Stock" width={70}
					dataType="number"
					sumExcel
					cellStyle={{ alignItems: "center", justifyContent: "center" }}
					data={(e) => e.row?.stock ?? 0}
					customComponent={e => {
						const stock = e.row?.stock ?? 0;
						const color = stock > 0 ? STheme.color.success : STheme.color.danger;
						return (
							<SText color={color} fontSize={13} bold numberOfLines={1}>{stock}</SText>
						);
					}}
				/>

				<DinamicTable.Col wrap key="precio_c"
					label="P. Compra"
					width={110} height={60}
					dataType="number"
					sumExcel
					data={(e) => e.row?.precio_compra ?? ""}
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
					customComponent={e => {
						return (
							<>
								{(e.data) ?
									<SView center row style={{ justifyContent: "flex-end", paddingHorizontal: 4 }}>
										<SText color={"#4120ff"} fontSize={13} numberOfLines={0}>  {e.row?.precio_compra ? e.row?.venta_moneda?.observacion : ""} {SMath.formatMoney(e.data)}  </SText>
									</SView> : null}
							</>
						);
					}}
				/>

				<DinamicTable.Col wrap key="precio_v"
					label="P. Venta"
					width={110} height={60}
					dataType="number"
					sumExcel
					data={(e) => e.row?.precio_venta ?? ""}
					format={e => (e.data ? SMath.formatMoney(e.data) : '')}
					customComponent={e => {
						return (
							<>
								{(e.data) ?
									<SView center row style={{ justifyContent: "flex-end", paddingHorizontal: 4 }}>
										<SText color={STheme.color.success} fontSize={13} numberOfLines={0}>  {e.row?.precio_venta ? e.row?.venta_moneda?.observacion : ""} {SMath.formatMoney(e.data)}  </SText>
									</SView> : null}
							</>
						);
					}}
				/>

				<DinamicTable.Col key="tags" label="Tags" width={100} data={e => (e.row?.tags ?? []).map(p => p?.tags?.nombre)}
					customComponent={e => (
						<SView row>
							{(e.row?.tags ?? []).map(item => (
								<SView key={item?.key} center row style={{ marginRight: 4, marginBottom: 4 }}
									onPress={() =>
										PopupTag.open({
											editObject: { ...item, quitar: true },
											onSuccess: () => this.table?.loadData(),
										})
									}
								>
									{this.renderColorPreview(item?.nombre, item?.color)}
								</SView>
							))}
						</SView>
					)}
				/>

				<DinamicTable.Col key={"tipo_producto_tipo"} label='Tipo Producto' width={85}
					data={(e) => e.row?.tipo_producto?.tipo}
					cellStyle={{ alignItems: "center", justifyContent: "flex-start", }}
					customComponent={e => {
						if (!e.data) return;
						return <SView style={{ padding: 2, borderRadius: 4, backgroundColor: STheme.colorFromText(e.data) + "44", borderWidth: 1, borderColor: STheme.colorFromText(e.data) }}>
							<SText fontSize={10} style={{ textTransform: "uppercase" }} >{e.data}</SText>
						</SView>
					}}
				/>

				<DinamicTable.Col key={"barcode"} label='BarCode' width={100} data={(e) => e.row.barcode ? "#" + e.row.barcode : null} />

				<DinamicTable.Col key={"activo"} label='Estado' width={70}
					cellStyle={{ alignItems: "center", justifyContent: "flex-start", }}
					data={(e) => e.row.activo == null ? "" : (e.row.activo ? "Activo" : "Inactivo")}
					customComponent={e => {
						if (e.row.activo == null) return;
						const color = e.row.activo ? "#017aff" : STheme.color.danger;
						return <SView style={{ padding: 2, borderRadius: 4, backgroundColor: color + "99", borderWidth: 1, borderColor: color }}>
							<SText fontSize={10} style={{ textTransform: "uppercase" }} >{e.data}</SText>
						</SView>
					}}
				/>

				{/* <DinamicTable.Col
					key={"contactos_"}
					label='Contactos'
					width={300}
					data={(e) => (e.row.contactos ?? []).map(p => p?.key_cliente)}
					customComponent={e => (
						<SView row>
							{(e.row.contactos ?? []).map((p, index) => {
								return <SView center row>
									<SView style={{ width: 24, height: 24, borderRadius: 24, overflow: "hidden", backgroundColor: STheme.color.card + "66", borderWidth: 1, borderColor: STheme.color.card }} center row >
										{p?.key_cliente ? (<SImage src={`${SSocket.api.root}usuario/${p?.key_cliente}`} style={{ resizeMode: "cover" }} />) : null}
									</SView>
									<SView width={5} />
								</SView>
							})}
						</SView>
					)}
				/> */}

				{/* <DinamicTable.Col
					key={"contactos2_"}
					label='Contactos'
					width={350}
					data={(e) => (e.row.contactos ?? []).map(p => p?.key_cliente)}
					customComponent={e => (
						<SView row>
							{(e.row.contactos ?? []).map((p, index) => {
								return <SView center row>
									<SView style={{ padding: 2, borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 4 }} center row >
										<SText fontSize={10} numberOfLines={1} style={{ textTransform: "uppercase" }} >{p?.cliente?.nombres}</SText>
									</SView>
									<SView width={5} />
								</SView>
							})}
						</SView>
					)}
				/> */}
			</DinamicTable>
			<FloatButtom onPress={() => {
				PopupDetalleModelo.open({
					key_modelo: null,
					editObject: null,
					onSuccess: () => {
						if (this.table) {
							this.table.loadData();
							this.state.time = new Date().getTime();
						}
					}
				});
			}} />
		</SPage >
	}
}