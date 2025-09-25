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
// import PopupInfoProv from './Components/PopupInfoProv';
import PopupCrearProveedor from './Components/PopupCrearProveedor';

export default class table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime()
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
    render() {
        return <SPage title={"Modelos"} disableScroll >
            <BarcodeIcon onChange={this.onChangeBarcode.bind(this)} />
            <DinamicTable
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
                loadData={this.loadData.bind(this)}
                onSelect={e => {
                    FloatMenu.open({
                        e: e.evt,
                        height:330,
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
                                                this.state.time = new Date().getTime();
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
                <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray }} width={40} data={(e) => e.index + 1} />
                <DinamicTable.Col key={"tipo_producto"} label='Tipo' width={150} data={(e) => e.row?.tipo_producto?.descripcion}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "tipo_producto/.128_" + e.row.key_tipo_producto + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row.key_tipo_producto + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"marca"} label='Marca' width={150} data={(e) => e.row?.marca?.descripcion}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "marca/.128_" + e.row.key_marca + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "marca/" + e.row.key_marca + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"nombre"} label='Nombre' width={200} data={(e) => e.row.descripcion}
                    textStyle={{ fontWeight: "bold" }}
                    customComponent={e => <ImageLabel {...e}
                        src={SSocket.api.inventario + "modelo/.128_" + e.row.key + "?date=" + this.state.time}
                        srcPreview={SSocket.api.inventario + "modelo/" + e.row.key + "?date=" + this.state.time}
                    />}
                />
                <DinamicTable.Col key={"observacion"} label='Observacion' width={200} data={(e) => e.row.observacion}
               
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



                <DinamicTable.Col key={"tipo_producto_tipo"} label='Tipo Contable sd' width={150}
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
                <DinamicTable.Col key={"barcode"} label='BarCodeqqqqq' width={100} data={(e) => e.row?.barcode} />
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
            width: 30,
            height: 30,
            borderRadius: 4,
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
        <SText flex style={props.textStyle} numberOfLines={1} >{props.data}</SText>
    </SView>
}