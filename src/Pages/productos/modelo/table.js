import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
import FormularioModelo from '../Components/FormularioModelo';
import FloatButtom from '../../../Components/FloatButtom';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
import PopupDetalleModelo from '../Components/PopupDetalleModelo';
import PopupDesglose from '../Components/PopupDesglose';
import PopupModeloCardex from '../Components/PopupModeloCardex';
import PopupCrearProveedor from './Components/PopupCrearProveedor';
import PopupTag from '../../tag/Components/PopupTag';
import PopupAgregarTags from './Components/PopupAgregarTags';

export default class table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime(),
            allTags: [],
            selectedTags: props.selectedTags || [], // ✅ aquí llegan los preseleccionados
            search: "",
        };
    }

    // listenerQr = null;
    modelos = null;

    async loadData() {
        const modelos = await MDL.inventario.getAllModeloStock();
        this.modelos = modelos;
        return modelos;
    }

    onChangeBarcode(barcode) {
        if (this.modelos) {
            const modelo = this.modelos.find(m => m.barcode === barcode);
            if (modelo) {
                const fil = this.table.filtros.find(f => f.col === "barcode");
                this.table.filtros.splice(this.table.filtros.indexOf(fil), 1);
                this.table.filtros.push({
                    col: "barcode",
                    value: modelo.barcode,
                    operator: "=",

                })
                this.table.applyFilter();
                SNotification.send({
                    title: modelo.descripcion,
                    // body: `El modelo ${modelo.descripcion} ha sido encontrado.`,
                    image: SSocket.api.inventario + "modelo/" + modelo.key + "?date=" + this.state.time,
                    time: 5000,
                })
                // this.table.setSelect(modelo.key);
            }
        }
        console.log("Barcode read:", barcode);



    }


    getContrastColor(hex: string): string {
        if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return "#1a1a1a"; // Validación básica

        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
    }

    renderColorPreview(nombre: string, color: string) {
        const displayName = nombre?.trim() || "Etiqueta de ejemplo";
        const backgroundColor = `${color}33`; // color con transparencia

        return (
            <SView
                height={18}
                center
                style={{
                    backgroundColor,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: color,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 6,
                }}
            >
                <SText color="white" fontSize={10} numberOfLines={1}>
                    {displayName}
                </SText>
            </SView>
        );
    }

    render() {
        return <SPage title={"Modelos"} disableScroll >
            {/* <BarcodeIcon onChange={this.onChangeBarcode.bind(this)} /> */}
            <DinamicTable
                key={"tabla_modelo"}
                ref={ref => this.table = ref}
                {...Config.table.applyTheme()}
                // colors={Config.table.colors()}
                // cellStyle={Config.table.cellStyle()}
                // textStyle={Config.table.textStyle()}
                selectType='single'
                language='es'
                listFooterComponent={() => {
                    return <SHr height={100} />

                }}
                cellStyle={{
                    ...Config.table.cellStyle(),
                    padding: 2, borderWidth: 0
                }}
                loadData={this.loadData.bind(this)}
                onSelect={e => {
                    FloatMenu.open({
                        e: e.evt,
                        height: 330,
                        label: e.row.descripcion,
                        options: [
                            // {
                            //     label: "Agregar inventario",
                            //     icon: <SIconApp name='Add' fill={STheme.color.text} />,
                            //     onPress: () => {
                            //         FormularioAgregarInventario.open({
                            //             editObject: e.row,
                            //             onSuccess: () => {
                            //                 if (this.table) {
                            //                     this.table.loadData();
                            //                     // this.state.time = new Date().getTime();
                            //                 }
                            //             }
                            //         })
                            //         // SNavigation.navigate("/productos/tipo_producto/profile", { pk: e.row.key_tipo_producto });
                            //     }
                            // },
                            {
                                label: "Editar",
                                icon: <SIconApp name='Edit' />,
                                onPress: () => {
                                    FormularioModelo.open({
                                        editObject: e.row,
                                        onSuccess: () => {
                                            if (this.table) {
                                                this.table.loadData();
                                                // this.state.time = new Date().getTime();
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

                                        console.log("gamboa "+JSON.stringify(currentTags))
                                    PopupAgregarTags.open({
                                        selectedTags: currentTags,
                                        key_modelo: e.row.key,
                                        onSuccess: async (selected) => {
                                            const nuevos = selected.map(t => t?.tags || t).filter(t => t?.key);
                                            const actuales = currentTags;

                                            const nuevosKeys = nuevos.map(t => t.key);
                                            const actualesKeys = actuales.map(t => t.key);

                                            // LOGS CLAROS
                                            console.log("TODOS LOS TAGS:", actuales.map(t => ({ key: t.key, nombre: t.nombre })));
                                            console.log("NUEVOS:", nuevos.filter(t => !actualesKeys.includes(t.key)).map(t => ({ key: t.key, nombre: t.nombre })));
                                            console.log("QUITADOS:", actuales.filter(t => !nuevosKeys.includes(t.key)).map(t => ({ key: t.key, nombre: t.nombre, key_modelo_tag: t.key_modelo_tag })));

                                            // AGREGAR
                                            for (let t of nuevos.filter(t => !actualesKeys.includes(t.key))) {
                                                await MDL.inventario.modelo_tag.registrar({
                                                    key_modelo: e.row.key,
                                                    key_tag: t.key,
                                                });
                                            }

                                            // ELIMINAR (estado: 0)
                                            for (let t of actuales.filter(t => !nuevosKeys.includes(t.key))) {
                                                if (t.key_modelo_tag) {
                                                    await MDL.inventario.modelo_tag.editar({
                                                        key: t.key_modelo_tag,
                                                        estado: 0
                                                    }).catch(() => SPopup.alert("Error al quitar etiqueta"));
                                                }
                                            }

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
                    textStyle={{
                        fontSize: 10,
                        color: STheme.color.lightGray,
                    }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "tipo_producto/.128_" + e.row.key_tipo_producto + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row.key_tipo_producto + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"marca"} label='Marca' width={90} data={(e) => e.row?.marca?.descripcion}
                    textStyle={{
                        fontSize: 10,
                        color: STheme.color.lightGray,
                    }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "marca/.128_" + e.row.key_marca + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "marca/" + e.row.key_marca + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"nombre"} label='Nombre' width={200} data={(e) => e.row.descripcion}
                    wrap
                    textStyle={{ fontWeight: "bold" }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "modelo/.128_" + e.row.key + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "modelo/" + e.row.key + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"observacion"} label='Observacion' width={150} data={(e) => e.row.observacion}

                />
                <DinamicTable.Col key={"precio_compra"} label='P. Compra' width={70}
                    textStyle={{ color: STheme.color.danger }}
                    data={(e) => e.row.precio_compra && SMath.formatMoney(e.row.precio_compra)}
                />
                <DinamicTable.Col key={"precio_venta"} label='P. Venta'
                    textStyle={{ color: STheme.color.success }}
                    width={70} data={(e) => e.row.precio_venta && SMath.formatMoney(e.row.precio_venta)} />
                <DinamicTable.Col key={"stock"} label='stock'
                    dataType='number'
                    // textStyle={{ color: STheme.color.success }}
                    width={70} data={(e) => e.row.stock ? parseFloat(e.row.stock) : 0} />
                <DinamicTable.Col key={"proveedores"} label='proveedores'
                    // textStyle={{ color: STheme.color.success }}
                    width={120}
                    data={(e) => (e.row.proveedores ?? []).map(p => p?.proveedor?.razon_social)}
                    customComponent={e => <SView row>
                        {(e.row.proveedores ?? []).map(p => {
                            return <SView style={{ padding: 2, borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 4 }}
                                onPress={() => {

                                    // console.log("todoooooooooooooooooooooooooo  " + JSON.stringify(e?.row))


                                    // PopupCrearCliente.open({
                                    //     editObject: p?.proveedor,
                                    //     // key_empresa: cliente.key_empresa,
                                    //     // onSuccess: async () => {
                                    //     //     this.DinamicTable.loadData();
                                    //     // },
                                    // })
                                    PopupCrearProveedor.open({
                                        proveedor: p?.proveedor,
                                        producto_key: e?.row?.key,
                                        precio_compra: e?.row?.precio_compra,
                                        producto_descripcion: e?.row?.descripcion,
                                        key_empresa: e?.row?.key_empresa,

                                        onSuccess: async () => {
                                            this.table.loadData();
                                        },

                                    });


                                }}

                            //     PopupInfoProv.open({
                            //         proveedor: p?.proveedor,
                            //         producto_key: e?.row?.key,
                            //         precio_compra : e?.row?.precio_compra,
                            //         producto_descripcion : e?.row?.descripcion
                            //     });
                            // }}
                            >
                                <SText fontSize={10} numberOfLines={1} >{p?.proveedor?.razon_social}</SText>
                            </SView>
                        })}
                    </SView>
                    }
                />




                <DinamicTable.Col
                    key="tags"
                    label="Tagssssssssssss"
                    width={120}
                    data={e => (e.row?.tags ?? []).map(p => p?.tags?.nombre)}
                    customComponent={e => (
                        <SView row>
                            {(e.row?.tags ?? []).map(item => (
                                <SView
                                    key={item?.key}
                                    center
                                    row
                                    style={{ marginRight: 4, marginBottom: 4 }}
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
                    cellStyle={{
                        alignItems: "center",
                        justifyContent: "flex-start",
                        flexDirection: "row"
                    }}
                    customComponent={e => {
                        return <View style={{
                            padding: 2,
                            borderRadius: 4,
                            backgroundColor: STheme.colorFromText(e.data) + "44",
                            borderWidth: 1,
                            borderColor: STheme.colorFromText(e.data)
                        }}>
                            <SText fontSize={10}>{e.data}</SText>
                        </View>
                    }}
                />
                <DinamicTable.Col key={"barcode"} label='BarCode' width={100} data={(e) => e.row?.barcode} />
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
    return <SView row style={{
        alignItems: "center",
    }}>
        <SView style={{
            width: 25,
            height: 25,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: STheme.color.card,
            overflow: "hidden",
            backgroundColor: STheme.color.card + "66",
        }}>
            <SImage src={props.src} enablePreview
                srcPreview={props.srcPreview}
                style={{
                    resizeMode: "cover",
                }} />
        </SView>
        <SView width={8} />
        <SText flex style={props.textStyle} numberOfLines={props.colData.wrap ? 0 : 1} >{props.data}</SText>
    </SView>
}