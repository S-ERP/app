import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";


export default class ProyectoImportarExcel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            columnasDetectadas: [],
            mapeo: {}
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
                const columnas = Object.keys(jsonData[0] || {});
                this.setState({ excelData: jsonData, columnasDetectadas: columnas }, this.openMappingPopup);
            };
            reader.readAsArrayBuffer(files[0]);
        });
    };

    openMappingPopup = () => {
        const { columnasDetectadas, mapeo = {} } = this.state;
        const tempMapeo = { ...mapeo };

        SPopup.open({
            key: "popup-mapeo",
            content: (
                     <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}    >

                {/* <SView width={350} padding={20} backgroundColor={STheme.color.card} borderRadius={10}> */}
                    <SText bold fontSize={18}>📋 Mapear columnas</SText>
                    <SView height={12} />
                    {columnasDetectadas.map((col, i) => (
                        <SView key={col} marginBottom={12}>
                            <SText color={STheme.color.text} fontSize={14}>{col}</SText>
                            <SInput
                                type="select"
                                defaultValue={tempMapeo[col] ?? "none"}
                                center
                                options={[
                                    { key: "none", content: "-" },
                                    // { key: "none", content: "--- Ignorar ---" },
                                    // { key: "index", content: "Index" },
                                    { key: "cliente", content: "Cliente" },
                                    { key: "telefono", content: "Teléfono" },
                                ]}
                                onChangeText={(val) => {
                                    tempMapeo[col] = val;

                                }}
                                style={{ textAlign: "center" }}
                            />
                        </SView>
                    ))}
                    <SView height={20} />
                    <SView row center>
                        <SView flex />
                        <SView
                            backgroundColor={STheme.color.primary}
                            padding={10}
                            borderRadius={8}
                            onPress={() => {
                                this.setState({ mapeo: tempMapeo }, this.applyMapping);
                                SPopup.close("popup-mapeo");
                            }}
                        >
                            <SText color={"#fff"}>Aceptar</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    };

    applyMapping = () => {
        const { excelData = [], mapeo = {} } = this.state;
        const data = excelData.map((row, index) => {
            const newRow = { key: `row_${index}`, index: index + 1 };
            for (let col in mapeo) {
                const mappedKey = mapeo[col];
                if (mappedKey && mappedKey !== "none") {
                    newRow[mappedKey] = row[col] || "";
                }
            }
            return newRow;
        });
        // }).filter(e => e.telefono && e.telefono.toString().length >= 8);

        this.setState({ data });
    };

    render() {
        return (
            <SPage title="Importar contactos desde Excel" disableScroll>
                {this.state.data ? (
                    <STable
                        header={[
                            { key: "index", label: "#", width: 40 },
                            { key: "cliente", label: "Nombre completo", width: 250 },
                            { key: "telefono", label: "Teléfono", width: 250 },
                            {
                                key: "key_campana",
                                label: "key_campana",
                                width: 320,
                                render: () => this.key_campana || "Sin key_campana"
                            },
                            {
                                key: "key_proyecto",
                                label: "key_proyecto",
                                width: 320,
                                render: () => this.key_proyecto || "Sin proyecto"
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
