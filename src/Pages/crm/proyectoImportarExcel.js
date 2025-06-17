import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";


// import React, { Component } from 'react';
// import {
//     SPage, SView, SIcon, SText,
//     STable, STheme, SNavigation
// } from 'servisofts-component';
// import FileChooser from '../../Components/SUpload/FileChooser';
// import * as XLSX from "xlsx";

export default class ProyectoImportarExcel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null
        };
        this.key_campana = SNavigation.getParam("key_campana");
        this.key_proyecto = SNavigation.getParam("key_proyecto");
    }

    handleExcelImport = () => {
        FileChooser({
            accept: ".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
        }).then((files) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                const filtrado = jsonData
                    .map((row, index) => ({
                        key: `row_${index}`,
                        index: index + 1,
                        cliente: row["nombres"] || row["clienteqqqqqqqq"] || "Sin nombre",
                        telefono: row["telefono"] || row["telefonossswwww"] || "Sin teléfono",
                        key_campana: this.key_campana,
                        key_proyecto: this.key_proyecto
                    }))
                    .filter(e => e.telefono && e.telefono.toString().length >= 8);

                console.log("📊 Excel importado:", filtrado);
                this.setState({ data: filtrado });
            };
            reader.readAsArrayBuffer(files[0]);
        });
    };

    renderImportButton = () => (
        <SView
            backgroundColor='white'
            style={{
                position: "absolute",
                top: 20,
                right: "30%",
                borderRadius: 8,
                elevation: 4,
                padding: 8,
                shadowColor: "#00000040"
            }}
            width={160}
            height={50}
            center
            onPress={this.handleExcelImport}
        >
            <SView row center>
                <SIcon name='Reload' width={18} />
                <SView width={10} />
                <SText color='black' fontSize={16}>Importar Excel</SText>
            </SView>
        </SView>
    );

    renderTable = () => {
        if (!this.state.data) {
            return (
                <SView center flex>
                    <SText color={STheme.color.lightGray}>📂 Aún no se ha importado ningún archivo</SText>
                </SView>
            );
        }

        return (
            <STable
                header={[
                    { key: "index", label: "#", width: 40 },
                    { key: "cliente", label: "Nombre completo", width: 250 },
                    { key: "telefono", label: "Teléfono", width: 250 },
                    {
                        key: "key_campana",
                        label: "Campaña",
                        width: 320,
                        render: (val, row) => row.key_campana || "Sin campaña"
                    },
                    {
                        key: "key_proyecto",
                        label: "Proyecto",
                        width: 320,
                        render: (val, row) => row.key_proyecto || "Sin proyecto"
                    }
                ]}
                data={this.state.data}
            />
        );
    };

    render() {
        return (
            <SPage title="Importar contactos desde Excel" disableScroll>
                {this.renderTable()}
                {this.renderImportButton()}
            </SPage>
        );
    }
}
