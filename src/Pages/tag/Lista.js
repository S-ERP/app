import React, { Component } from 'react';
import { SHr, SNavigation, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import PopupTag from './Components/PopupTag';
import SIconApp from '../../Assets/SIconApp';
import MDL from '../../MDL';
import FloatMenu from '../../Components/FloatMenu';
import Config from '../../Config';
import FloatButtom from '../../Components/FloatButtom';

export default class Lista extends Component {
    constructor(props) {
        super(props);
        // Obtener el callback si fue pasado por navegación
        this.onSelect = SNavigation.getParam('onSelect');
    }

    modelos = null;

    async loadData() {
        const modelos = await MDL.inventario.tag.getAll();
        this.modelos = modelos;
        return modelos;
    }


    aclararColor(hex, porcentaje) {
        hex = hex.replace("#", "");
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        r = Math.round(r + (255 - r) * porcentaje);
        g = Math.round(g + (255 - g) * porcentaje);
        b = Math.round(b + (255 - b) * porcentaje);

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    oscurecerColor(hex, porcentaje) {
        hex = hex.replace("#", "");
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        r = Math.round(r * (1 - porcentaje));
        g = Math.round(g * (1 - porcentaje));
        b = Math.round(b * (1 - porcentaje));

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }


    getContrastColor(hex: string) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
    }


    renderColorPreview(nombre, color) {
        // const { color, nombrePreview } = this.state;
        const textColor = this.getContrastColor(color ?? "transparent");
        const displayName = nombre.trim() || "etiqueta de ejemplo";

        return (
            <SView col={"xs-12"} center>

                <SView height={24} width={100} center style={{ backgroundColor: color + "33", borderRadius: 20, borderWidth: 1, borderColor: color, flexDirection: "row", alignItems: "center", }} >
                    <SText color={STheme.color.text} fontSize={10}  >
                        {/* <SText color={textColor} fontSize={10} bold> */}
                        {displayName}
                    </SText>
                </SView>
            </SView>
        );
    }


    render() {
        return (
            <SPage title="TABLA DE ETIQUETAS / TAG" disableScroll>
                <DinamicTable
                    key={"tabla_modelo"}
                    ref={ref => this.table = ref}
                    {...Config.table.applyTheme()}
                    keyExtractor={e => e.key}
                    selectType='single'
                    language='es'
                    center
                    listFooterComponent={() => <SHr height={100} />}
                    loadData={this.loadData.bind(this)}
                    onSelect={e => {
                        if (this.onSelect) {
                            this.onSelect(e.row);
                            SNavigation.goBack();
                            return;
                        }

                        FloatMenu.open({
                            e: e.evt,
                            height: 330,
                            label: e.row?.descripcion,
                            options: [
                                {
                                    label: "Editar",
                                    icon: <SIconApp name='Edit' />,
                                    onPress: () => {
                                        PopupTag.open({
                                            editObject: e.row,
                                            onSuccess: () => {
                                                if (this.table) this.table.loadData();
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
                                            message: "¿Está seguro de eliminar el modelo " + e.row?.descripcion + "?",
                                            onPress: () => {
                                                MDL.inventario.tag.editar({
                                                    key: e.row.key,
                                                    estado: 0,
                                                }).then(() => {
                                                    if (this.table) this.table.loadData();
                                                });
                                            }
                                        });
                                    }
                                }
                            ]
                        });
                    }}
                >
                    <DinamicTable.Col key="index" label="N°" width={30} data={e => e.index + 1} />
                    <DinamicTable.Col
                        key="nombre"
                        label="Nombre"
                        width={150}
                        textStyle={{ fontSize: 10 }}
                        data={e => e.row?.nombre}
                    />
                    <DinamicTable.Col
                        key="descripcion"
                        label="Descripcion"
                        width={150}
                        textStyle={{ fontSize: 10 }}
                        data={e => e.row?.descripcion}
                    />
                    <DinamicTable.Col
                        key="color"
                        label="Color"
                        width={150}
                        textStyle={{ fontSize: 10 }}
                        data={e => e.row?.color}
                    />

                    <DinamicTable.Col
                        key="color_"
                        label="Vista previa"
                        width={150}
                        textStyle={{ fontSize: 10 }}
                        data={e => e.row?.color}

                        customComponent={e => {
                            if (!e.data) return;

                            const colorClaro = this.aclararColor(e.row?.color, 0.5); // 30% más claro
                            const colorOscuro = this.oscurecerColor(e.row?.color, 0.3); // 30% más oscuro

                            return this.renderColorPreview(e.row?.nombre, e.row?.color)



                            return <SView backgroundColor={e.row?.color} style={{ borderColor: colorOscuro, borderWidth: 2, borderRadius: 4 }} center>
                                <SText >{e.row?.descripcion}</SText>
                            </SView>
                        }}

                    />


                    <DinamicTable.Col
                        key="key_usuario"
                        label="Administrador"
                        width={150}
                        textStyle={{ fontSize: 10 }}
                        data={e => e.row?.key_usuario}
                    />
                </DinamicTable>

                <FloatButtom onPress={() => {
                    PopupTag.open({
                        editObject: null, // nuevo registro
                        onSuccess: () => {
                            if (this.table) this.table.loadData();
                        }
                    });
                }} />
            </SPage>
        );
    }
}
