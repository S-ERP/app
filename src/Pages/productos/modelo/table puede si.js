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
// import PopupTag from '../../tag/Components/PopupTag';
// import PopupAgregarTags from './Components/PopupAgregarTags';

// table.js
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {
    SHr, SIcon, SImage, SMath, SNavigation, SNotification, SPage,
    SPopup, SText, STheme, SView
} from 'servisofts-component';
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
        };
    }

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
                if (fil) this.table.filtros.splice(this.table.filtros.indexOf(fil), 1);
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
    }

    getContrastColor(hex) {
        if (!/^#([A-Fa-f0-9]{6})$/.test(hex)) return "#1a1a1a";
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
    }

    renderColorPreview(nombre, color) {
        const displayName = nombre?.trim() || "Etiqueta";
        return (
            <SView
                height={18}
                center
                style={{
                    backgroundColor: `${color}33`,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: color,
                    paddingHorizontal: 6,
                }}
            >
                <SText color={this.getContrastColor(color)} fontSize={10} bold numberOfLines={1}>
                    {displayName}
                </SText>
            </SView>
        );
    }

    render() {
        return (
            <SPage title={"Modelos"} disableScroll>
                <DinamicTable
                    key={"tabla_modelo"}
                    ref={ref => this.table = ref}
                    {...Config.table.applyTheme()}
                    selectType='single'
                    language='es'
                    listFooterComponent={() => <SHr height={100} />}
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
                                            onSuccess: () => this.table?.loadData()
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
                                                MDL.inventario.saveModelo({ key: e.row.key, estado: 0 }).then(() => {
                                                    this.table?.loadData();
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
                                    icon: <SIconApp name="Tag" fill={STheme.color.text} />,
                                    onPress: () => {
                                        const currentTags = (e.row.tags || [])
                                            .map(t => t?.tags || t)
                                            .filter(t => t?.key);

                                        const rowKey = e.row.key;

                                        PopupAgregarTags.open({
                                            selectedTags: currentTags,
                                            key_modelo: e.row.key,

                                            // CAMBIO EN TIEMPO REAL
                                            onChange: (selected) => {
                                                const nuevos = selected.map(t => t?.tags || t).filter(t => t?.key);
                                                if (this.table?.data) {
                                                    const rowIndex = this.table.data.findIndex(r => r.key === rowKey);
                                                    if (rowIndex !== -1) {
                                                        this.table.data[rowIndex].tags = nuevos.map(tag => ({
                                                            tags: tag,
                                                            key_modelo_tag: currentTags.find(ct => ct.key === tag.key)?.key_modelo_tag || null
                                                        }));
                                                        this.table.forceUpdate();
                                                    }
                                                }
                                            },

                                            // GUARDAR AL ACEPTAR
                                            onSuccess: async (selected) => {
                                                const nuevos = selected.map(t => t?.tags || t).filter(t => t?.key);
                                                const actuales = currentTags;
                                                const nuevosKeys = nuevos.map(t => t.key);
                                                const actualesKeys = actuales.map(t => t.key);

                                                try {
                                                    // AGREGAR
                                                    for (let t of nuevos.filter(t => !actualesKeys.includes(t.key))) {
                                                        await MDL.inventario.modelo_tag.registrar({
                                                            key_modelo: e.row.key,
                                                            key_tag: t.key,
                                                        });
                                                    }

                                                    // ELIMINAR
                                                    for (let t of actuales.filter(t => !nuevosKeys.includes(t.key))) {
                                                        if (t.key_modelo_tag) {
                                                            await MDL.inventario.modelo_tag.editar({
                                                                key: t.key_modelo_tag,
                                                                estado: 0
                                                            });
                                                        }
                                                    }

                                                    this.table?.loadData();
                                                    SNotification.send({
                                                        title: "Etiquetas guardadas",
                                                        color: STheme.color.success,
                                                    });
                                                } catch (err) {
                                                    SNotification.send({
                                                        title: "Error al guardar",
                                                        color: STheme.color.danger,
                                                    });
                                                }
                                            },

                                            // CANCELAR: deshace cambios
                                            onCancel: () => {
                                                this.table?.loadData();
                                            }
                                        });
                                    },
                                },
                                // ... otros items (Ingrediente, Ver Marca, etc.)
                            ]
                        });
                    }}
                >
                    {/* Tus columnas aquí */}
                    <DinamicTable.Col key="index" label="#" width={30} data={(e) => e.index + 1} />
                    <DinamicTable.Col key="tipo_producto" label='Tipo' width={90} data={(e) => e.row?.tipo_producto?.descripcion}
                        customComponent={e => <ImageLabel {...e}
                            src={SSocket.api.inventario + "tipo_producto/.128_" + e.row.key_tipo_producto + "?date=" + this.state.time}
                            srcPreview={SSocket.api.inventario + "tipo_producto/" + e.row.key_tipo_producto + "?date=" + this.state.time}
                        />}
                    />
                    <DinamicTable.Col key="marca" label='Marca' width={90} data={(e) => e.row?.marca?.descripcion}
                        customComponent={e => <ImageLabel {...e}
                            src={SSocket.api.inventario + "marca/.128_" + e.row.key_marca + "?date=" + this.state.time}
                            srcPreview={SSocket.api.inventario + "marca/" + e.row.key_marca + "?date=" + this.state.time}
                        />}
                    />
                    <DinamicTable.Col key="nombre" label='Nombre' width={200} data={(e) => e.row.descripcion} wrap
                        customComponent={e => <ImageLabel {...e}
                            src={SSocket.api.inventario + "modelo/.128_" + e.row.key + "?date=" + this.state.time}
                            srcPreview={SSocket.api.inventario + "modelo/" + e.row.key + "?date=" + this.state.time}
                        />}
                    />
                    <DinamicTable.Col key="precio_compra" label='P. Compra' width={70}
                        textStyle={{ color: STheme.color.danger }}
                        data={(e) => e.row.precio_compra && SMath.formatMoney(e.row.precio_compra)}
                    />
                    <DinamicTable.Col key="precio_venta" label='P. Venta' width={70}
                        textStyle={{ color: STheme.color.success }}
                        data={(e) => e.row.precio_venta && SMath.formatMoney(e.row.precio_venta)}
                    />
                    <DinamicTable.Col key="stock" label='Stock' width={70} data={(e) => e.row.stock ? parseFloat(e.row.stock) : 0} />

                    {/* COL: TAGS */}
                    <DinamicTable.Col
                        key="tags"
                        label="Tags"
                        width={140}
                        data={e => (e.row?.tags ?? []).map(p => p?.tags?.nombre)}
                        customComponent={e => (
                            <SView row style={{ flexWrap: "wrap", gap: 4 }}>
                                {(e.row?.tags ?? []).map(item => {
                                    const tag = item?.tags || item;
                                    if (!tag) return null;
                                    return (
                                        <SView
                                            key={tag.key}
                                            center
                                            row
                                            style={{
                                                backgroundColor: tag.color + "33",
                                                borderRadius: 20,
                                                borderWidth: 1,
                                                borderColor: tag.color,
                                                paddingHorizontal: 6,
                                                paddingVertical: 2,
                                            }}
                                            onPress={() =>
                                                PopupTag.open({
                                                    editObject: { ...tag, quitar: true },
                                                    onSuccess: () => this.table?.loadData(),
                                                })
                                            }
                                        >
                                            <SText color={this.getContrastColor(tag.color)} fontSize={10} bold>
                                                {tag.nombre}
                                            </SText>
                                        </SView>
                                    );
                                })}
                            </SView>
                        )}
                    />

                    <DinamicTable.Col key="barcode" label='BarCode' width={100} data={(e) => e.row?.barcode} />
                </DinamicTable>

                <FloatButtom onPress={() => {
                    PopupDetalleModelo.open({
                        key_modelo: null,
                        editObject: null,
                        onSuccess: () => this.table?.loadData()
                    });
                }} />
            </SPage>
        );
    }
}

const ImageLabel = (props) => {
    return (
        <SView row style={{ alignItems: "center" }}>
            <SView style={{
                width: 25, height: 25, borderRadius: 4, borderWidth: 1,
                borderColor: STheme.color.card, overflow: "hidden",
                backgroundColor: STheme.color.card + "66"
            }}>
                <SImage src={props.src} enablePreview srcPreview={props.srcPreview} style={{ resizeMode: "cover" }} />
            </SView>
            <SView width={8} />
            <SText flex style={props.textStyle} numberOfLines={props.colData.wrap ? 0 : 1}>{props.data}</SText>
        </SView>
    );
}
