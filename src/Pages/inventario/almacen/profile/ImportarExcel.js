import React, { Component } from 'react';
import { SView, SText, SPage, STheme, SPopup } from 'servisofts-component';
import { DinamicTable } from 'servisofts-table';
import FileChooser from '../../../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";
import MDL from '../../../../MDL';
import FloatMenu from '../../../../Components/FloatMenu';
import SIconApp from '../../../../Assets/SIconApp';
import FormularioModelo from '../../../productos/Components/FormularioModelo';
import sucursal from '../../../sucursal';
import { ref } from 'process';

export default class ImportarExcel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            sucursales: [],
            productosNoEncontrados: []
        };
        this.modelosByBarcode = {}; // Map: barcode => modelo
    }

    async componentDidMount() {
        const modelos = await MDL.inventario.getAllModeloStock();
        // Mapear barcode => descripcion
        modelos.forEach(m => {
            const barcode = (m.barcode + "").trim();
            if (barcode && m.descripcion) {
                this.modelosByBarcode[barcode] = m.descripcion;
            }
        });
    }

    procesarExcel = (rows) => {
        const datosProcesados = [];
        const allSucursales = new Set();
        const productosNoEncontrados = new Set();

        // Detectar nombres de sucursales
        for (const row of rows) {
            const { codigo_producto, nombre_producto, ...rest } = row;
            Object.keys(rest).forEach(k => {
                const clean = k.trim();
                if (clean) allSucursales.add(clean);
            });
        }

        for (const row of rows) {
            const {
                codigo_producto,
                nombre_producto,
                precio_compra,
                precio_venta,
                ...rest
            } = row;

            if (!codigo_producto || !nombre_producto) continue;

            // Asegura que cod siempre sea string
            const cod = (codigo_producto + "").trim();
            const modeloDescripcion = this.modelosByBarcode[cod];

            if (!modeloDescripcion) {
                productosNoEncontrados.add(cod);
            }

            const productoPlano = {
                codigo_producto: cod,
                nombre_producto: nombre_producto.trim(),
                modelo: modeloDescripcion || "❌ NO ENCONTRADO",
                precio_compra: parseFloat(precio_compra) || 0,
                precio_venta: parseFloat(precio_venta) || 0,
            };

            for (const sucursal of allSucursales) {
                let val = null;
                for (const key in row) {
                    if (key.trim() === sucursal) {
                        val = row[key];
                        break;
                    }
                }
                const cantidad = Number(val || 0);
                productoPlano[sucursal] = isNaN(cantidad) ? 0 : cantidad;
            }

            datosProcesados.push(productoPlano);
        }

        const sucursalesArr = Array.from(allSucursales).filter(s => s && s !== "");

        this.setState({
            data: datosProcesados,
            sucursales: sucursalesArr,
            productosNoEncontrados: Array.from(productosNoEncontrados)
        });
    };

    importarDesdeExcel = () => {
        FileChooser({ accept: ".xlsx, .xls" }).then((files) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
                this.procesarExcel(jsonData);
            };
            reader.readAsArrayBuffer(files[0]);
        });
    };
    eliminarFila = (key) => {
        this.setState({ data: this.state.data.filter(d => d.key !== key), sucursales: this.state.sucursales.filter(s => s !== key) });
    };

    render() {
        const { data, sucursales, productosNoEncontrados } = this.state;

        return (
            <SPage title={"Importar Productos desde Excel"} disableScroll>
                <SView col={"xs-12"} center>
                    <SView width={180} height={40} center backgroundColor={"#2a2a2a"} borderRadius={8}
                        onPress={this.importarDesdeExcel}>
                        <SText color="white" bold>📥 Importar Excel</SText>
                    </SView>
                </SView>




                {data.length > 0 && (
                    <DinamicTable loadData={async () => this.state.data}
                        ref={ref => this.table = ref}
                        onSelect={(e) => {
                            FloatMenu.open({
                                e: e.evt,
                                label: e.row.descripcion,
                                options: [
                                    {
                                        label: "Eliminar",
                                        icon: <SIconApp name='Delete' />,
                                        onPress: () => {
                                            SPopup.confirm({
                                                title: "Eliminar columna",
                                                message: "¿Está seguro de eliminar la columna ",
                                                onPress: () => {
                                                    this.state.data = this.state.data.filter(d => d.codigo_producto != e.row.codigo_producto)
                                                    this.table.loadData();
                                                    console.log(e);
                                                    console.log(this.state.data)
                                                }
                                            });
                                        }
                                    },
                                    {
                                        label: "Agregar Modelo",
                                        icon: <SIconApp name='Add' fill={STheme.color.text} />,
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
                                            // SNavigation.navigate("/productos/tipo_producto/profile", { pk: e.row.key_tipo_producto });
                                        }
                                    },
                                ]
                            });
                        }}
                    >
                        {Object.keys(data[0]).map((key, i) => (
                            <DinamicTable.Col

                                key={key}
                                label={key}
                                data={a => a.row[key]}
                                style={a => ({
                                    backgroundColor: a.row.__color || "transparent"
                                })}
                            />
                        ))}
                    </DinamicTable>
                )}
            </SPage>
        );
    }
}
