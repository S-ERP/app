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
import PopupCrearProveedor from './Components/PopupCrearProveedor';
import PopupTag from '../../tag/Components/PopupTag';
import PopupAgregarTags from './Components/PopupAgregarTags';
import FiltroAlmacen from './Components/FiltroAlmacen';
import FiltroStock from './Components/FiltroStock';
export default class table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime(),
            allTags: [],
            selectedTags: props.selectedTags || [],
            search: "",
            selectedAlmacen: null, // <-- aquí guardamos el almacén seleccionado
            selectedStock: null, // <-- aquí guardamos el almacén seleccionado
        };
    }
    modelos = null;
    async loadData() {
        try {
            const monedas = await MDL.empresa.getMonedas();
            const modelos = await MDL.inventario.getAllModeloStock(this.state?.selectedAlmacen?.key ?? "");
            const clientes = await MDL.crm.cliente.getAll();

            let data_mejorada = modelos.map(e => ({
                ...e,
                compra_moneda: monedas.find(m => m.key === e.precio_compra_moneda) || {},
                venta_moneda: monedas.find(m => m.key === e.precio_venta_moneda) || {},
                contactos: e.contactos?.map(contacto => ({
                    ...contacto,
                    cliente: clientes.find(a => a?.key === contacto.key_cliente) || {},
                }))
            })
            );

            // 🧠 Resumen rápido
            //
            // Caso                          let    const
            // Se reasigna la variable       ✅     ❌
            // Se modifica contenido interno ❌     ✅
            // Estilo funcional              ❌     ✅
            //
            // 👉 En este caso se usa `let` porque `data_mejorada`
            //    se reasigna más abajo al aplicar filtros condicionales.

            if (this.state.selectedStock === "con_stock") {
                data_mejorada = data_mejorada.filter(m => m.stock > 0);
            }

            if (this.state.selectedStock === "sin_stock") {
                data_mejorada = data_mejorada.filter(
                    m => !m.stock || m.stock === 0
                );
            }

            this.modelos = data_mejorada;
            return data_mejorada;
        } catch (error) {
            console.log(error)
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

            <SView
                row
                col={"xs-12"}
                style={{
                    backgroundColor: "transparent",
                    // backgroundColor: STheme.color.card,
                    // backgroundColor: STheme.color.background,s
                    borderBottomWidth: 1,
                    borderTopWidth: 1,
                    borderColor: STheme.color.lightGray + "30",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                }}
            >
                <SView col={"xs-12 sm-5 lg-1.6"} row center style={{ flexWrap: "wrap", gap: 12 }}>
                    <FiltroAlmacen onSelect={(almacen) => {
                        this.state.selectedAlmacen = almacen;
                        this.forceUpdate();
                        this.table.loadData();
                    }} />
                </SView>
                <SView width={8} height={8} />
                <SView col={"xs-12 sm-5 lg-1"} row center style={{ flexWrap: "wrap", gap: 12 }}>
                    <FiltroStock onSelect={(item) => {
                        this.setState({ selectedStock: item.key }, () => {
                            this.table.loadData();
                        });
                    }} />
                </SView>
            </SView>

            <SHr height={8} />
            {/* <SView row style={{ gap: 16, flexWrap: "wrap", paddingHorizontal: 4 }}>
                <SText fontSize={13} color={STheme.color.lightGray}> Almacén: <SText fontSize={13} bold color={STheme.color.text}> {this.state.selectedAlmacen?.nombre || "Todos"} </SText> </SText>
                <SText fontSize={13} color={STheme.color.lightGray}> Stock: <SText fontSize={13} bold color={STheme.color.text}> {this.state.selectedStock || "Todos"} </SText> </SText>
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
                            },
                            {
                                label: "Ingrediente",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/productos/modelo/ingrediente", {
                                        key_modelo: e.row.key
                                    })
                                }
                            },
                            {
                                label: "Ver Marca",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/productos/marca/edit", { pk: e.row.key_marca });
                                }
                            },
                            {
                                label: "Ver Tipo",
                                icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                onPress: () => {
                                    SNavigation.navigate("/productos/tipo_producto/profile", { pk: e.row.key_tipo_producto });
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
                <DinamicTable.Col key={"tipo_producto"} label='Tipo' width={90} data={(e) => e.row?.tipo_producto?.descripcion}
                    textStyle={{ fontSize: 10, color: STheme.color.lightGray, }}
                    customComponent={e => <ImageLabel {...e} src={SSocket.api.inventario + "tipo_producto/.128_" + e.row.key_tipo_producto + "?date=" + this.state.time} srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row.key_tipo_producto + "?date=" + this.state.time} />}
                />
                <DinamicTable.Col key={"marca"} label='Marca' width={90} data={(e) => e.row?.marca?.descripcion}
                    textStyle={{ fontSize: 10, color: STheme.color.lightGray, }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "marca/.128_" + e.row.key_marca + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "marca/" + e.row.key_marca + "?date=" + this.state.time}
                    />}
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
                <DinamicTable.Col key={"tipo_producto_tipo"} label='Tipo Contable' width={150}
                    data={(e) => e.row?.tipo_producto?.tipo}
                    cellStyle={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row" }}
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
                                    {/* <SText fontSize={10} numberOfLines={1} >{p?.cliente?.nombres}</SText> */}
                                </SView>
                                // return <SView style={{ padding: 2, borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 4 }} >
                                //     <SText fontSize={10} numberOfLines={1} >{p?.cliente?.nombres}</SText>
                                // </SView>
                            })}
                        </SView>
                    )}
                />

                <DinamicTable.Col
                    key={"contactos2_"}
                    label='Contactos'
                    width={120}
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

                                // return <SView center row>
                                //     <SText fontSize={10} numberOfLines={1} >{p?.cliente?.nombres}</SText>
                                // </SView>
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