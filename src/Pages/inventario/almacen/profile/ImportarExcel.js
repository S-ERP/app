import React, { Component } from 'react';
import { SView, SText, STable2, SPage } from 'servisofts-component';
import STable, { DinamicTable } from 'servisofts-table';
import FileChooser from '../../../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";

export default class ImportarExcel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            sucursales: []
        };
    }

    procesarExcel = (rows) => {
        const datosProcesados = [];
        const allSucursales = new Set();

        // Detectar y limpiar nombres de sucursales
        for (const row of rows) {
            const { nombre_producto, precio_compra, precio_venta, ...rest } = row;
            Object.keys(rest).forEach(k => {
                const clean = k.trim();
                if (clean) allSucursales.add(clean);
            });
        }

        for (const row of rows) {
            const {
                nombre_producto,
                precio_compra,
                precio_venta,
                ...rest
            } = row;

            if (!nombre_producto) continue;

            const productoPlano = {
                nombre_producto: nombre_producto.trim(),
                precio_compra: parseFloat(precio_compra) || 0,
                precio_venta: parseFloat(precio_venta) || 0,
            };

            for (const sucursal of allSucursales) {
                // Buscar la clave real en el row (puede tener espacios)
                let val = null;
                for (const key in row) {
                    if (key.trim() === sucursal) {
                        val = row[key];
                        break;
                    }
                }
                if (val === "" || val === null || val === undefined) val = "0";
                const cantidad = Number(val);
                productoPlano[sucursal] = isNaN(cantidad) ? 0 : cantidad;
            }

            datosProcesados.push(productoPlano);
        }

        const sucursalesArr = Array.from(allSucursales).filter(s => s && s !== "");
        console.log("Columnas para tabla:", sucursalesArr);
        console.log("Datos para tabla:", JSON.stringify(datosProcesados, null, 2));
        this.setState({
            data: datosProcesados,
            sucursales: sucursalesArr
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

    render() {
        const { data, sucursales } = this.state;

        return (
            <SPage title={"Importar Productos desde Excel"} disableScroll>
                <SView col={"xs-12"} center>
                    <SView width={180} height={40} center backgroundColor={"#2a2a2a"} borderRadius={8}
                        onPress={this.importarDesdeExcel}>
                        <SText color="white" bold>📥 Importar Excel</SText>
                    </SView>
                </SView>
                {data.length > 0 && (

                    <DinamicTable loadData={async () => {
                        return data;
                    }}>
                        {Object.keys(data[0]).map(sucursal => (
                            <DinamicTable.Col key={sucursal} label={sucursal} data={a => a.row[sucursal]} />
                        ))}
                    </DinamicTable>



                )}
            </SPage>
        );
    }
}
