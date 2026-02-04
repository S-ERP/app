import React, { Component } from 'react';
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
import PopupAgregarTipoCosto from './Components/PopupAgregarTipoCosto';
import PopupDesgloseTipoCosto from './Components/PopupDesgloseTipoCosto';
import FormularioTipoProducto from '../Components/FormularioTipoProducto';
export default class table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime(),
            allTags: [],
            selectedTags: props.selectedTags || [],
            search: "",
            selectedAlmacen: null,
            selectedStock: null,
            selectedTipoCuenta: null,
            selectedTipoModelo: null,
        };
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
            this.filtroAlmacenRef?.reset();
            this.filtroStockRef?.reset();
            this.filtroTipoContableRef?.reset();
            this.filtroTipoProductoRef?.reset();
        }
    };
    async loadData() {
        try {
            const monedas = await MDL.empresa.getMonedas() ?? [];
            const modelos = await MDL.inventario.getAllModeloStock(this.state?.selectedAlmacen?.key ?? "") ?? [];
            const clientes = await MDL.crm.cliente.getAll() ?? [];
            const tipo_costos = await MDL.inventario.getAllTipoCosto() ?? []; // <-- traes todos los tipos de costo
            let data_mejorada = modelos.map(e => ({
                ...e,
                compra_moneda: monedas.find(m => m?.key === e?.precio_compra_moneda) || {},
                venta_moneda: monedas.find(m => m?.key === e?.precio_venta_moneda) || {},
                contactos: (e?.contactos ?? []).map(contacto => ({
                    ...contacto,
                    cliente: clientes.find(a => a?.key === contacto?.key_cliente) || {},
                    tipo_costo: tipo_costos.find(tc => tc.key === contacto.key_tipo_costo) || {}, // <-- agregamos tipo_costo
                })),
                tipo_producto: e?.tipo_producto || {},
                marca: e?.marca || {},
                proveedores: e?.proveedores ?? [],
                tags: e?.tags ?? [],
                stock: e?.stock ?? 0,
            }));
            if (this.state.selectedStock?.key === "con_stock") {
                data_mejorada = data_mejorada.filter(m => Number(m.stock) > 0);
            }
            if (this.state.selectedStock?.key === "sin_stock") {
                data_mejorada = data_mejorada.filter(m => !m.stock || Number(m.stock) === 0);
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
            console.error("Error grave en loadData():", error);
            SPopup.alert(
                "Error al cargar modelos",
                "No se pudieron cargar los datos.\n\n" + (error?.message || "Error desconocido")
            );
            SPopup.alert(
                "Error al cargar modelos: " + (error?.message || "Error desconocido")
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
                        ref={ref => this.filtroAlmacenRef = ref}
                        label="Almacén"
                        loadData={MDL.inventario.getAllAlmacen}
                        mapOption={a => ({ key: a.key, nombre: a.descripcion })}
                        onSelect={item => this.setState({ selectedAlmacen: item }, () => this.table.loadData())}
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
                        label: e.row.descripcion,
                        options: [
                            {
                                label: "Configurar costos",
                                icon: <SIconApp name='Ajustes' />,
                                onPress: () => {
                                    PopupAgregarTipoCosto.open({
                                        key_modelo: e.row.key,
                                        modelo_descripcion: e.row.descripcion,
                                        onSuccess: () => {
                                            if (this.table) {
                                                this.table.loadData();
                                            }
                                        }
                                    });
                                }
                            }, {
                                label: "Ver desglose costos",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
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
                                label: "Editar",
                                icon: <SIconApp name='Edit' />,
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
                                icon: <SIconApp name='Delete' />,
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
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/proveedor", {
                                        onSelect: (prov) => {
                                            MDL.inventario.saveModeloProveedor({
                                                key_modelo: e.row.key,
                                                key_proveedor: prov.key,
                                            })
                                        }
                                    });
                                }
                            },
                            {
                                label: "Agregar Tag",
                                icon: <SIconApp name="Tag" fill={STheme.color.text} />,
                                onPress: () => {
                                    const currentTags = (e.row.tags || [])
                                        .map(t => t?.tags || t)
                                        .filter(t => t?.key);
                                    console.log("gamboa " + JSON.stringify(currentTags))
                                    PopupAgregarTags.open({
                                        selectedTags: currentTags,
                                        key_modelo: e.row.key,
                                        onSuccess: async (selected) => {
                                            this.table?.loadData();
                                        },
                                        onCancel: () => { }
                                    });
                                },
                            }, {
                                label: "Ingrediente",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/productos/modelo/ingrediente", {
                                        key_modelo: e.row.key
                                    })
                                }
                            },
                            {
                                label: "Ver desglose",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    PopupDesglose.open({
                                        key_modelo: e.row.key
                                    })
                                }
                            },
                            {
                                label: "Ver Cardex",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    PopupModeloCardex.open({
                                        key_modelo: e.row.key
                                    })
                                }
                            },
                        ]
                    });
                }}
            >
                <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray, fontSize: 10 }} width={30} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"tipo_producto"} label='Tipo' width={90}
                    data={(e) => e.row?.tipo_producto?.descripcion}
                    textStyle={{ fontSize: 10, color: STheme.color.lightGray, }}
                    customComponent={e => <>
                        {(e.row.key_tipo_producto) ?
                            <SView col={"xs-12"} center row onPress={() => {

                                console.clear();
                                console.log("%c" + "viva", `color: #2ECC40; font-weight: bold;`);
                                console.log("%c" + JSON.stringify(e.row.tipo_producto, null, 2), "color: #2ECC40; font-weight: bold;");


                                FormularioTipoProducto.open({
                                    editObject: e.row.tipo_producto,
                                    onSuccess: () => {
                                        if (this.table) {
                                            this.table.loadData();
                                            this.state.time = new Date().getTime();
                                        }
                                    }

                                })

                                // SNavigation.navigate("/productos/tipo_producto/profile", { pk: e.row.key_tipo_producto }); 

                            }}>
                                <SView style={{ width: 25, height: 25, overflow: "hidden", }}>
                                    <ImageLabel {...e} src={SSocket.api.inventario + "tipo_producto/.128_" + e.row.key_tipo_producto + "?date=" + this.state.time} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={8} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.tipo_producto?.descripcion}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key={"marca"} label='Marca' width={90} data={(e) => e.row?.marca?.descripcion}
                    textStyle={{ fontSize: 10, color: STheme.color.lightGray, }}
                    customComponent={e => <>
                        {(e.row.key_marca) ?
                            <SView col={"xs-12"} center row onPress={() => { SNavigation.navigate("/productos/marca/edit", { pk: e.row.key_marca }); }}>
                                <SView style={{ width: 25, height: 25, overflow: "hidden", }}>
                                    <ImageLabel {...e} src={SSocket.api.inventario + "marca/.128_" + e.row.key_marca + "?date=" + this.state.time} style={{ resizeMode: "cover" }} />
                                </SView>
                                <SView width={8} />
                                <SText flex numberOfLines={e.colData.wrap ? 0 : 1} style={e.textStyle}>{e.row?.marca?.descripcion ? e.row?.marca?.descripcion : ""}</SText>
                            </SView> : null}
                    </>}
                />
                <DinamicTable.Col key={"codigo_ref"} label='Cod. Ref.' width={60} data={(e) => e.row.codigo_ref} />
                <DinamicTable.Col key={"nombre"} label='Nombre' width={200} data={(e) => e.row.descripcion} wrap textStyle={{ fontWeight: "bold" }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "modelo/.128_" + e.row.key + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "modelo/" + e.row.key + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"observacion"} label='Observación' width={150} data={(e) => e.row.observacion} />
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
                <DinamicTable.Col key={"proveedores"} label='Proveedores'
                    width={120}
                    data={(e) => (e.row.proveedores ?? []).map(p => p?.proveedor?.razon_social)}
                    customComponent={e => <SView row>
                        {(e.row.proveedores ?? []).map(p => {
                            return <SView center row>
                                <SView style={{ padding: 2, borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 4 }} center row >
                                    <SText fontSize={10} numberOfLines={1} style={{ textTransform: "uppercase" }} >{p?.proveedor?.razon_social}</SText>
                                </SView>
                                <SView width={5} />
                            </SView>
                        })}
                    </SView>}
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
                        return <SView style={{ padding: 2, borderRadius: 4, backgroundColor: STheme.colorFromText(e.data) + "44", borderWidth: 1, borderColor: STheme.colorFromText(e.data) }}>
                            <SText fontSize={10} style={{ textTransform: "uppercase" }} >{e.data}</SText>
                        </SView>
                    }}
                />
                <DinamicTable.Col key={"barcode"} label='BarCode' width={100} data={(e) => e.row.barcode ? "#" + e.row.barcode : null} />
                <DinamicTable.Col
                    key={"contactos_"}
                    label='Contactos'
                    width={120}
                    data={(e) => (e.row.contactos ?? []).map(p => p?.key_cliente)}
                    customComponent={e => (
                        <SView row>
                            {(e.row.contactos ?? []).map((p, index) => {
                                return <SView center row>
                                    <SView style={{ width: 24, height: 24, borderRadius: 100, overflow: "hidden", backgroundColor: STheme.color.card + "66", }} center row >
                                        {p?.key_cliente ? (<SImage src={`${SSocket.api.root}usuario/${p?.key_cliente}`} style={{ resizeMode: "cover" }} />) : null}
                                    </SView>
                                    <SView width={5} />
                                </SView>
                            })}
                        </SView>
                    )}
                />
                <DinamicTable.Col
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
                />
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
const ImageLabel = (props) => {
    return <SView row style={{ alignItems: "center", }}>
        <SView style={{ width: 25, height: 25, borderRadius: 4, borderWidth: 1, borderColor: STheme.color.card, overflow: "hidden", backgroundColor: STheme.color.card + "66", }}>
            <SImage src={props.src} enablePreview srcPreview={props.srcPreview} style={{ resizeMode: "cover", }} /> </SView>
        <SView width={8} />
        <SText flex style={props.textStyle} numberOfLines={props.colData.wrap ? 0 : 1} >{props.data}</SText>
    </SView>
}