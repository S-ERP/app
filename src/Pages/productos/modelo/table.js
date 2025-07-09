import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import Config from '../../../Config';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
import FormularioModelo from '../Components/FormularioModelo';
import FloatButtom from '../../../Components/FloatButtom';
import FloatMenu from '../../../Components/FloatMenu';
import SIconApp from '../../../Assets/SIconApp';
import FormularioAgregarInventario from '../Components/FormularioAgregarInventario';
import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
import PopupDetalleModelo from '../Components/PopupDetalleModelo';
import PopupDesglose from '../Components/PopupDesglose';

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
                colors={Config.table.colors()}
                cellStyle={Config.table.cellStyle()}
                textStyle={Config.table.textStyle()}
                selectType='single'
                language='es'
                loadData={this.loadData.bind(this)}
                onSelect={e => {
                    FloatMenu.open({
                        e: e.evt,
                        label: e.row.descripcion,
                        options: [
                            {
                                label: "Agregar inventario",
                                icon: <SIconApp name='Add' fill={STheme.color.text} />,
                                onPress: () => {
                                    FormularioAgregarInventario.open({
                                        editObject: e.row,
                                        onSuccess: () => {
                                            if (this.table) {
                                                this.table.loadData();
                                                // this.state.time = new Date().getTime();
                                            }
                                        }
                                    })
                                    // SNavigation.navigate("/productos/tipo_producto/profile", { pk: e.row.key_tipo_producto });
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



                                     SPopup.open({
                                                key: "popup_config_horario",
                                                content: (
                                                    <SView col={"xs-11  "} backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 700 }} padding={16} withoutFeedback >
                                                        <SView col={"xs-12"} height={470} center >
                                                            <PopupDesglose key_modelo={e.row.key}  ></PopupDesglose>
                                                        </SView>
                                                    </SView>
                                                )
                                     });

                                    // PopupDetalleModelo.open({
                                    //     editObject: null,
                                    //     onSuccess: () => {
                                    //         if (this.table) {
                                    //             this.table.loadData();
                                    //             this.state.time = new Date().getTime();
                                    //         }
                                    //     }
                                    // });

                                    // SNavigation.navigate("/productos/tipo_producto/profile", { pk: e.row.key_tipo_producto });
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


                <DinamicTable.Col key={"tipo_producto_tipo"} label='Tipo Contable sd' width={150} data={(e) => e.row?.tipo_producto?.tipo} />
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
        </SPage>
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