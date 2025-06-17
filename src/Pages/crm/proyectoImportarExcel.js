import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2 } from 'servisofts-component';
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
                this.setState({ excelData: jsonData, columnasDetectadas: columnas, data: null }, this.openMappingPopup);
            };
            reader.readAsArrayBuffer(files[0]);
        });
    };

    formatearTelefono = (telefono) => {
        if (!telefono) return "";
        // convertir a string por si es número o algo más
        let telStr = String(telefono);
        // quitar todo lo que no sea dígito
        telStr = telStr.replace(/\D/g, "");
        // Si ya tiene código 591 al inicio, lo eliminamos para evitar repetidos
        if (telStr.startsWith("591")) {
            telStr = telStr.slice(3);
        }
        // Si el número resultante tiene 8 dígitos, le ponemos +591 al inicio
        if (telStr.length === 8) {
            return "+591 " + telStr;
        }
        return telStr; // si no tiene 8 dígitos, devuelve solo los números para validar luego
    };

    validarTelefono = (telefono) => {
        if (!telefono || telefono.toString().trim() === "") {
            return "No hay número de teléfono";
        }
        let telStr = String(telefono).replace(/\D/g, "");
        if (telStr.length < 8) {
            return `Error en el teléfono, lleva ${telStr.length} dígitos`;
        }
        if (telStr.length > 8) {
            return `Error en el teléfono, lleva ${telStr.length} dígitos, no pertenece a Bolivia`;
        }
        // Si tiene 8 dígitos, no hay error
        return "";
    }

    validarCliente = (cliente) => {
        if (!cliente || cliente.toString().trim() === "" || cliente.toString().toLowerCase().includes("sin nombre")) {
            return "El campo nombre tiene error";
        }
        return "";
    }

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
        let data = excelData.map((row, index) => {
            const clienteRaw = row[mapeo["cliente"]] ?? "";
            const telefonoRaw = row[mapeo["telefono"]] ?? "";

            const telefonoFormateado = this.formatearTelefono(telefonoRaw);
            const descripcionCliente = this.validarCliente(clienteRaw);
            const descripcionTelefono = this.validarTelefono(telefonoRaw);

            let descripcion = "";
            if (descripcionCliente) descripcion = descripcionCliente;
            else if (descripcionTelefono) descripcion = descripcionTelefono;

            return {
                key: `row_${index}`,
                index: index + 1,
                cliente: clienteRaw,
                telefono: telefonoRaw,
                telefonoFormateado,
                descripcion,
            };
        });

        // Ordenar: los que tienen descripción (error) van al final
        data = data.sort((a, b) => {
            if (a.descripcion && !b.descripcion) return 1;
            if (!a.descripcion && b.descripcion) return -1;
            return 0;
        });

        this.setState({ data });
    };

    eliminarFila = (key) => {
        const data = this.state.data.filter(row => row.index !== key);
        this.setState({ data });
    };

    render() {
        return (
            <SPage title="Importar contactos desde Excel" disableScroll>
                {this.state.data ? (
                    <STable2
                        header={[
                            { key: "index", label: "#", width: 40 },
                            { key: "cliente", label: "Nombre completo", width: 250 },
                            { key: "telefono", label: "Teléfono original", width: 150 },
                            { key: "telefonoFormateado", label: "Teléfono formateado", width: 180 },
                            { key: "descripcion", label: "Descripción", width: 280 },
                            {
                                key: "-descripcion", label: "Descripción", width: 280,

                                component: (c) => {
                                    return <SText underLine fontSize={12} color={STheme.color.link} onPress={() => {


                                        this.eliminarFila(c.index)

                                        console.log("Descripción:", c.descripcion);
                                    }}>Eliminar</SText>
                                }
                            },



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
