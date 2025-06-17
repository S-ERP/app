import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";

export default class Root extends Component {
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
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                const filtrado = jsonData
                    .map((row, index) => ({
                        key: `row_${index}`,
                        index: index + 1,
                        nombres: row["Nombre completo"] || "Sin nombre",
                        telefono: row["Teléfono"] || ""
                    }))
                    .filter(e => e.telefono && e.telefono.toString().length >= 8);

                console.log("📊 Excel importado:", filtrado);
                this.setState({ data: filtrado });
            };
            reader.readAsArrayBuffer(files[0]);
        });
    };

    render() {
        return (
            <SPage title="Importar contactos desde Excel" disableScroll>
                {this.state.data ? (
                    <STable
                        header={[
                            { key: "index", label: "#", width: 40 },
                            { key: "nombres", label: "Nombre completo", width: 250 },
                            { key: "telefono", label: "Teléfono", width: 250 },

                            {
                                key: "key_campana",
                                label: "key_campana",
                                width: 320,
                                render: key => this.key_campana || "Sin key_campana"
                            },
                            {
                                key: "key_proyecto",
                                label: "key_proyecto",
                                width: 320,
                                render: key => this.key_proyecto || "Sin proyecto"
                            }
                        ]}
                        data={this.state.data}
                    />
                ) : (
                    <SView center flex>
                        <SText color={STheme.color.lightGray}>📂 Aún no se ha importado ningún archivo</SText>
                    </SView>
                )}

                <SView
                    backgroundColor='white'
                    style={{
                        position: "absolute",
                        top: 20,
                        right: "30%",
                        borderRadius: 4,
                        overflow: "hidden",
                    }}
                    width={140}
                    height={50}
                    center
                    onPress={this.handleExcelImport}
                >
                    <SView row>
                        <SIcon name='Reload' width={15} />
                        <SView width={10} />
                        <SText color='black' fontSize={18}>Importar</SText>
                    </SView>
                </SView>
            </SPage>
        );
    }
}
