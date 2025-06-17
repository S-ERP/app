import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";

// import React, { Component } from 'react';
// import { SPage, SView, SIcon, SText, STable, STheme, SNavigation, SPopup, SInput } from 'servisofts-component';
// import FileChooser from '../../Components/SUpload/FileChooser';
// import * as XLSX from "xlsx";

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
                this.setState({ excelData: jsonData, columnasDetectadas: columnas, data: null }, this.openMappingPopup);
            };
            reader.readAsArrayBuffer(files[0]);
        });
    };

    openMappingPopup = () => {
        const { columnasDetectadas = [], mapeo = {} } = this.state;
        const camposEsperados = ["cliente", "telefono"];
        const tempMapeo = { ...mapeo };

        SPopup.open({
            key: "popup-mapeo",
            content: (
                <SView backgroundColor={STheme.color.black} style={{ borderRadius: 8, maxWidth: 300 }} padding={16} withoutFeedback col={"xs-11"}>
                    <SText bold fontSize={18}>📋 Mapear columnas</SText>
                    <SView height={12} />
                    {camposEsperados.map((campo) => (
                        <SView key={campo} marginBottom={12}>
                            <SText color={STheme.color.text} fontSize={14}>{campo.charAt(0).toUpperCase() + campo.slice(1)}</SText>
                            <SInput
                                type="select"
                                defaultValue={tempMapeo[campo] ?? "none"}
                                center
                                options={[
                                    { key: "none", content: "-" },
                                    ...columnasDetectadas.map(col => ({ key: col, content: col }))
                                ]}
                                onChangeText={(val) => {
                                    tempMapeo[campo] = val;
                                }}
                                style={{
                                    textAlign: "center",
                                    ...(tempMapeo[campo] && tempMapeo[campo] !== "none" ? {
                                        borderWidth: 1,
                                        borderColor: "#f7c548",
                                        // backgroundColor: "#fffde7"
                                    } : {})
                                }}
                            />
                        </SView>
                    ))}
                    <SView height={20} />
                    <SView row center>
                        <SView
                            backgroundColor={"#ffdddd"}
                            padding={10}
                            borderRadius={8}
                            onPress={() => {
                                this.setState({ mapeo: {}, data: null });
                                SPopup.close("popup-mapeo");
                            }}
                        >
                            <SText color={"black"}>Cancelar</SText>
                        </SView>
                        <SView flex />
                        <SView
                            backgroundColor={"white"}
                            padding={10}
                            borderRadius={8}
                            onPress={() => {
                                this.setState({ mapeo: tempMapeo, data: null }, this.applyMapping);
                                SPopup.close("popup-mapeo");
                            }}
                        >
                            <SText color={"black"}>Importar lista</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    };

    applyMapping = () => {
        const { excelData = [], mapeo = {} } = this.state;
        const data = excelData.map((row, index) => {
            return {
                key: `row_${index}`,
                index: index + 1,
                cliente: row[mapeo["cliente"]] ?? "",
                telefono: row[mapeo["telefono"]] ?? ""
            };
        });
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
                            // {
                            //     key: "key_campana",
                            //     label: "key_campana",
                            //     width: 320,
                            //     render: () => this.key_campana || "Sin key_campana"
                            // },
                            // {
                            //     key: "key_proyecto",
                            //     label: "key_proyecto",
                            //     width: 320,
                            //     render: () => this.key_proyecto || "Sin proyecto"
                            // }
                        ]}
                        data={this.state.data}
                    />
                ) : (
                    <SView center flex>
                        <SText color={STheme.color.lightGray}>📂 Aún no se ha importado ningún archivo</SText>
                    </SView>
                )}

                <SView
                    style={{ position: "absolute", top: 20, right: "20%", backgroundColor: "white" }}
                    width={180}
                    height={50}
                    center
                    onPress={this.handleExcelImport}
                >
                    <SView row center>
                        <SIcon name="Excel" width={18} height={18} fill={"black"} stroke={"blue"} />
                        <SView width={8} />
                        <SText color='black' fontSize={18}>Importar Excel</SText>
                    </SView>
                </SView>

                <SView
                    style={{ position: "absolute", top: 20, right: "8%", backgroundColor: "white" }}
                    width={180}
                    height={50}
                    center
                    onPress={() => {
                        this.setState({ mapeo: {}, data: null });
                        SPopup.close("popup-mapeo");
                    }}
                >
                    <SView row center>
                        <SView width={8} />
                        <SText color='black' fontSize={18}>Limpiar</SText>
                    </SView>
                </SView>
            </SPage>
        );
    }
}
