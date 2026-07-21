import React, { Component, createRef } from 'react';
import { SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
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
import PopupCrearProveedor from '../../proveedor/Components/PopupCrearProveedor';
import PopupAgregarMarca from '../marca/Components/PopupAgregarMarca';
import Model from '../../../Model';
import FormularioModelo2 from '../Components/FormularioModelo2';
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
            // 🔹 Traer datos en paralelo
            const [monedas, clientes, tipo_costos, modelos] = await Promise.all([
                MDL.empresa.getMonedas().catch(() => []),
                MDL.crm.cliente.getAll().catch(() => []),
                MDL.inventario.getAllTipoCosto().catch(() => []),
                MDL.inventario.getAllModeloStock(this.state?.selectedAlmacen?.key ?? "", this.state?.selectedSucursal?.key ?? ""
                ).catch(() => [])
            ]);
            // 🔹 Indexar para acceso O(1)
            const monedasByKey = Object.fromEntries((monedas ?? []).map(m => [m?.key, m]));
            const clientesByKey = Object.fromEntries((clientes ?? []).map(c => [c?.key, c]));
            const tipoCostoByKey = Object.fromEntries((tipo_costos ?? []).map(tc => [tc?.key, tc]));

            // 🔹 Mejorar modelos
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

            // 🔹 Filtro por stock
            if (this.state.selectedStock?.key === "con_stock") {
                data_mejorada = data_mejorada.filter(m => m.stock > 0);
            }

            if (this.state.selectedStock?.key === "sin_stock") {
                data_mejorada = data_mejorada.filter(m => m.stock <= 0);
            }
            // 🔹 Filtro por tipo contable
            if (this.state.selectedTipoCuenta?.key && this.state.selectedTipoCuenta.key !== "Todos") {
                data_mejorada = data_mejorada.filter(
                    m => m?.tipo_producto?.tipo === this.state.selectedTipoCuenta.key
                );
            }
            // 🔹 Filtro por tipo modelo
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

            <DinamicTable key={"tabla_modelo"}
                ref={ref => this.table = ref}
                listFooterComponent={() => {
                    return <SHr height={100} />
                }}
                cellStyle={{ ...Config.table.cellStyle(), padding: 2, borderWidth: 0 }}
                loadData={this.loadData.bind(this)}
                language='es'

                selectType='single'
                {...Config.table.applyTheme()}
                // renderLoading={() => (
                //     <SView col={"xs-12"} center padding={24}>
                //         <SText fontSize={13} color={STheme.color.text + "99"}>Cargando movimientos...</SText>
                //     </SView>
                // )}

                renderNoResults={() => (
                    <SView col={"xs-12"} center padding={24}>
                        <SText fontSize={13} color={STheme.color.text + "99"}>No se encontraron movimientos en el rango seleccionado.</SText>
                    </SView>
                )}

                buildRowStyle={({ item }) => {
                    const original = item;
                    const esVentaOCompraAnulada = Number(original?.activo) === 0;
                    return esVentaOCompraAnulada ? { opacity: 0.35 } : {};
                }}

            // loadInitialState={async () => {
            //     return {
            //         sorters: [{ key: "tipo_producto_tipo", order: "asc", type: "string" }, { key: "nombre", order: "asc", type: "string" }],
            //     }
            // }}



            >
                <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray, fontSize: 10 }} width={30} data={(e) => e.index + 1} />

                <DinamicTable.Col key={"activo"} label='activo' width={150}
                    textStyle={{
                        fontSize: 12,
                        color: STheme.color.lightGray,
                    }}
                    data={(e) => e.row.activo} />

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
                                    // const marcaa = { ...e.row?.marca, quitar: true, key_modelo: e.row?.key };
                                    PopupAgregarMarca.open({
                                        editObject: { ...e.row?.marca, quitar: true, key_modelo: e.row?.key },
                                        // TODO
                                        // tiene que ir todo el e.row
                                        // para que edirte el
                                        // MDL.inventario.saveModelo(modelo).then(async (resp: any) => {
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
                <DinamicTable.Col key={"precio_compra_"} label='P. Compra' width={100}
                    textStyle={{ color: STheme.color.danger }}
                    data={(e) => e.row?.precio_compra} wrap
                    customComponent={e =>
                        <SView row center>
                            <SText flex style={{ color: STheme.color.danger, fontSize: 14 }} numberOfLines={0} >{e.row?.precio_compra ? SMath.formatMoney(e.row?.precio_compra) : ""}{e.row?.compra_moneda?.observacion ? e.row?.compra_moneda?.observacion : ""}</SText>
                        </SView>}
                />
                <DinamicTable.Col key={"precio_venta_"} label='P. Venta' width={100}
                    textStyle={{ color: STheme.color.success }}
                    data={(e) => e.row?.precio_venta} wrap
                    customComponent={e => <SText style={{ color: STheme.color.success, fontSize: 14 }} numberOfLines={0} >{e.row?.precio_venta ? SMath.formatMoney(e.row?.precio_venta) : ""}{e.row?.precio_venta ? e.row?.venta_moneda?.observacion : ""}</SText>
                    }
                />
                <DinamicTable.Col key={"stock"} label='Stock'
                    dataType='number'
                    width={70} data={(e) => e.row.stock ? parseFloat(e.row.stock) : 0} />
                <DinamicTable.Col
                    key="proveedores"
                    label="Proveedores"
                    width={120}
                    data={(e) => (e.row.proveedores ?? []).map(p => p?.proveedor?.razon_social)}
                    customComponent={e => (
                        <SView row>
                            {(e.row.proveedores ?? []).map((p, index) => (
                                <SView key={p?.proveedor?.key || index} center row>
                                    <SView style={{ padding: 2, borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 4, }} center row
                                        onPress={() => {
                                            const proveedor = { ...p.proveedor, quitar: true, key_modelo_proveedor: p.key, key_modelo: p.key_modelo };
                                            PopupCrearProveedor.open({
                                                editObject: proveedor,
                                                key_empresa: p.key_empresa,
                                                onSuccess: () => this.table.loadData(),
                                            });
                                        }}
                                    >
                                        <SText fontSize={10} numberOfLines={1} style={{ textTransform: "uppercase" }} > {p?.proveedor?.razon_social} </SText>
                                    </SView>
                                    <SView width={5} />
                                </SView>
                            ))}
                        </SView>
                    )}
                />

                <DinamicTable.Col
                    key={"proveedores2_"}
                    label='Proveedores'
                    width={120}
                    data={(e) => (e.row.proveedores ?? []).map(p => p?.proveedor?.key)}
                    customComponent={e => (
                        <SView row>
                            {(e.row.proveedores ?? []).map((p, index) => {
                                return <SView center row>
                                    <SView style={{ width: 24, height: 24, borderRadius: 24, overflow: "hidden", backgroundColor: STheme.color.card + "66", borderWidth: 1, borderColor: STheme.color.card }} center row >
                                        {p?.key_proveedor ? (<SImage src={`${SSocket.api.root}usuario/${p?.key_proveedor}`} style={{ resizeMode: "cover" }} />) : null}
                                    </SView>
                                    <SView width={5} />
                                </SView>
                            })}
                        </SView>
                    )}
                />

                <DinamicTable.Col key="tags" label="Tags" width={120} data={e => (e.row?.tags ?? []).map(p => p?.tags?.nombre)}
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
                <DinamicTable.Col key={"tipo_producto_tipo"} label='Tipo Producto' width={150}
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

                {/* <DinamicTable.Col
                    key={"contactos2_"}
                    label='Contactos'
                    width={300}
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