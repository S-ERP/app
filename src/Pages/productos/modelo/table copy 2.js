// import React, { Component } from 'react';
// import { View, Text } from 'react-native';
// import { SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
// import { DinamicTable } from 'servisofts-table';
// import Config from '../../../Config';
// import MDL from '../../../MDL';
// import SSocket from 'servisofts-socket';
// import FormularioModelo from '../Components/FormularioModelo';
// import FloatButtom from '../../../Components/FloatButtom';
// import FloatMenu from '../../../Components/FloatMenu';
// import SIconApp from '../../../Assets/SIconApp';
// import BarcodeIcon from '../../../Components/BarcodeScanner/BarcodeIcon';
// import PopupDetalleModelo from '../Components/PopupDetalleModelo';
// import PopupDesglose from '../Components/PopupDesglose';
// import PopupModeloCardex from '../Components/PopupModeloCardex';
// import PopupCrearProveedor from './Components/PopupCrearProveedor';
 
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
// import PopupCrearProveedor from '../Components/PopupCrearProveedor';
import PopupTag from '../../tag/Components/PopupTag';
import PopupCrearProveedor from './Components/PopupCrearProveedor';

export default class table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().getTime()
        };
    }

    modelos = null;

    async loadData() {
        const modelos = await MDL.inventario.getAllModeloStock();
        this.modelos = modelos;
        return modelos;
    }

    onChangeBarcode(barcode) {
        if (this.modelos && this.table?.filtros) {
            const modelo = this.modelos.find(m => m.barcode === barcode);
            if (modelo) {
                const fil = this.table.filtros.find(f => f.col === "barcode");
                if (fil) {
                    this.table.filtros.splice(this.table.filtros.indexOf(fil), 1);
                }
                this.table.filtros.push({
                    col: "barcode",
                    value: modelo.barcode,
                    operator: "=",
                });
                this.table.applyFilter();

                SNotification.send({
                    title: modelo.descripcion,
                    image: SSocket.api.inventario + "modelo/" + modelo.key + "?date=" + this.state.time,
                    time: 5000,
                });
            }
        }
        console.log("Barcode read:", barcode);
    }

    render() {
        return (
            <SPage title={"Modelos"} disableScroll>
                <BarcodeIcon onChange={this.onChangeBarcode.bind(this)} />

                <DinamicTable
                    key={"tabla_modelo"}
                    ref={ref => this.table = ref}
                    {...Config.table.applyTheme()}
                    selectType='single'
                    language='es'
                    listFooterComponent={() => <SHr height={100} />}
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
                                                    this.setState({ time: new Date().getTime() });
                                                }
                                            }
                                        });
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
                                                    if (this.table) this.table.loadData();
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
                                                });
                                            }
                                        });
                                    }
                                },
                                {
                                    label: "Agregar Tag",
                                    icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                    onPress: () => {
                                        SNavigation.navigate("/tag", {
                                            onSelect: (item) => {
                                                MDL.inventario.modelo_tag.registrar({
                                                    key_modelo: e.row.key,
                                                    key_tag: item.key,
                                                });
                                                if (this.table) this.table.loadData();
                                            }
                                        });
                                    }
                                },
                                {
                                    label: "Ingrediente",
                                    icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                    onPress: () => {
                                        SNavigation.navigate("/productos/modelo/ingrediente", {
                                            key_modelo: e.row.key
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
                                        });
                                    }
                                },
                                {
                                    label: "Ver Cardex",
                                    icon: <SIconApp name='Eyes' fill={STheme.color.text} />,
                                    onPress: () => {
                                        PopupModeloCardex.open({
                                            key_modelo: e.row.key
                                        });
                                    }
                                }
                            ]
                        });
                    }}
                >

                    <DinamicTable.Col key="index" label="#" textStyle={{ color: STheme.color.lightGray }} width={40} data={(e) => e.index + 1} />

                    <DinamicTable.Col key={"tipo_producto"} label='Tipo' width={150} data={(e) => e.row?.tipo_producto?.descripcion}
                        customComponent={e => <ImageLabel {...e}
                            src={e.row?.key_tipo_producto ? SSocket.api.inventario + "tipo_producto/.128_" + e.row.key_tipo_producto + "?date=" + this.state.time : null}
                            srcPreview={e.row?.key_tipo_producto ? SSocket.api.inventario + "tipo_producto/" + e.row.key_tipo_producto + "?date=" + this.state.time : null}
                        />}
                    />

                    <DinamicTable.Col key={"tags"} label='Tags' width={120}
                        data={(e) => (e.row?.tags ?? []).map(p => p?.tags?.descripcion)}
                        customComponent={e => <SView row>
                            {(e.row?.tags ?? []).map(item => (
                                <SView key={item?.key} style={{ padding: 2, borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 4 }}
                                    onPress={() => {
                                        PopupTag.open({
                                            editObject: item,
                                            onSuccess: () => {
                                                if (this.table) this.table.loadData();
                                            }
                                        });
                                    }}>
                                    <SText fontSize={10} numberOfLines={1}>{item?.descripcion}</SText>
                                </SView>
                            ))}
                        </SView>}
                    />

                    <DinamicTable.Col key={"marca"} label='Marca' width={150} data={(e) => e.row?.marca?.descripcion}
                        customComponent={e => <ImageLabel {...e}
                            src={e.row?.key_marca ? SSocket.api.inventario + "marca/.128_" + e.row.key_marca + "?date=" + this.state.time : null}
                            srcPreview={e.row?.key_marca ? SSocket.api.inventario + "marca/" + e.row.key_marca + "?date=" + this.state.time : null}
                        />}
                    />

                    <DinamicTable.Col key={"nombre"} label='Nombre' width={200} data={(e) => e.row.descripcion}
                        textStyle={{ fontWeight: "bold" }}
                        customComponent={e => <ImageLabel {...e}
                            src={e.row?.key ? SSocket.api.inventario + "modelo/.128_" + e.row.key + "?date=" + this.state.time : null}
                            srcPreview={e.row?.key ? SSocket.api.inventario + "modelo/" + e.row.key + "?date=" + this.state.time : null}
                        />}
                    />

                    <DinamicTable.Col key={"observacion"} label='Observacion' width={200} data={(e) => e.row.observacion} />

                    <DinamicTable.Col key={"precio_compra"} label='P. Compra' width={70}
                        textStyle={{ color: STheme.color.danger }}
                        data={(e) => e.row.precio_compra && SMath.formatMoney(e.row.precio_compra)}
                    />

                    <DinamicTable.Col key={"precio_venta"} label='P. Venta'
                        textStyle={{ color: STheme.color.success }}
                        width={70} data={(e) => e.row.precio_venta && SMath.formatMoney(e.row.precio_venta)} />

                    <DinamicTable.Col key={"stock"} label='Stock' dataType='number'
                        width={70} data={(e) => e.row.stock ? parseFloat(e.row.stock) : 0} />

                    <DinamicTable.Col key={"proveedores"} label='Proveedores' width={120}
                        data={(e) => (e.row.proveedores ?? []).map(p => p?.proveedor?.razon_social)}
                        customComponent={e => <SView row>
                            {(e.row.proveedores ?? []).map(p => (
                                <SView key={p?.proveedor?.key}
                                    style={{ padding: 2, borderWidth: 1, borderColor: STheme.color.lightGray, borderRadius: 4 }}
                                    onPress={() => {
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
                                    }}>
                                    <SText fontSize={10} numberOfLines={1}>{p?.proveedor?.razon_social}</SText>
                                </SView>
                            ))}
                        </SView>}
                    />

                    <DinamicTable.Col key={"tipo_producto_tipo"} label='Tipo Contable' width={150}
                        data={(e) => e.row?.tipo_producto?.tipo}
                        cellStyle={{ alignItems: "center", justifyContent: "flex-start", flexDirection: "row" }}
                        customComponent={e => {
                            const color = STheme.colorFromText ? STheme.colorFromText(e.data) : STheme.color.primary;
                            return (
                                <View style={{
                                    padding: 2,
                                    borderRadius: 4,
                                    backgroundColor: color + "44",
                                    borderWidth: 1,
                                    borderColor: color
                                }}>
                                    <SText fontSize={10}>{e.data}</SText>
                                </View>
                            );
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
                                this.setState({ time: new Date().getTime() });
                            }
                        }
                    });
                }} />
            </SPage>
        );
    }
}

// Componente auxiliar para mostrar imagen y texto
const ImageLabel = (props) => {
    if (!props.data) return null;
    return (
        <SView row style={{ alignItems: "center" }}>
            <SView style={{
                width: 30,
                height: 30,
                borderRadius: 4,
                overflow: "hidden",
                backgroundColor: STheme.color.card + "66",
            }}>
                {props.src ? (
                    <SImage src={props.src} enablePreview srcPreview={props.srcPreview}
                        style={{ resizeMode: "cover" }} />
                ) : null}
            </SView>
            <SView width={8} />
            <SText flex style={props.textStyle} numberOfLines={1}>{props.data}</SText>
        </SView>
    );
};
