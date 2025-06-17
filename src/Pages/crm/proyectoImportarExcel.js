import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2 } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";



export default class ProyectoImportarExcel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            excelData: [],
            columnasDetectadas: [],
            mapeo: {},
            data: []
        };
        this.key_campana = SNavigation.getParam("key_campana");
        this.key_proyecto = SNavigation.getParam("key_proyecto");
    }

    formatearTelefono = (telefono) => {
        if (!telefono) return { telefonoFormateado: "", descripcion: "Teléfono vacío" };

        const original = telefono.toString();
        const contieneLetras = /[a-zA-Z]/.test(original);
        const contieneCaracteresEspeciales = /[^0-9\s+]/.test(original);

        let tel = original.replace(/\D/g, ""); // elimina todo excepto números

        if (tel.startsWith("591")) tel = tel.substring(3);

        let descripcion = "";

        if (contieneLetras) {
            descripcion = "El teléfono contiene letras";
        } else if (contieneCaracteresEspeciales) {
            descripcion = "El teléfono contiene caracteres no válidos";
        } else if (tel.length < 8) {
            descripcion = `Error en el teléfono, lleva ${tel.length} dígitos`;
        } else if (tel.length > 8) {
            descripcion = `Error en el teléfono, lleva ${tel.length} dígitos. No pertenece a Bolivia`;
        }

        return {
            telefonoFormateado: `+591 ${tel}`,
            descripcion
        };
    };


    validarCliente = (cliente) => {
        if (!cliente || cliente.trim().toLowerCase() === "sin nombre") {
            return "El campo nombre tiene error";
        }
        return "";
    };

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
                const columnas = Object.keys(jsonData[0] || {});
                this.setState({ excelData: jsonData, columnasDetectadas: columnas }, this.openMappingPopup);
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
                <SView withoutFeedback backgroundColor={STheme.color.black} padding={16} col={"xs-11"} style={{ borderRadius: 8, maxWidth: 300 }}>
                    <SText bold fontSize={18}>📋 Mapear columnas</SText>
                    <SView height={12} />
                    {camposEsperados.map((campo) => (
                        <SView key={campo} marginBottom={12}>
                            <SText color={STheme.color.text} fontSize={14}>{campo}</SText>
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
                                style={{ textAlign: "center" }}
                            />
                        </SView>
                    ))}
                    <SView height={20} />
                    <SView row center>
                        <SView backgroundColor={"#ffdddd"} padding={10} borderRadius={8} onPress={() => SPopup.close("popup-mapeo")}>
                            <SText color={"black"}>Cancelar</SText>
                        </SView>
                        <SView flex />
                        <SView backgroundColor={"white"} padding={10} borderRadius={8} onPress={() => {
                            this.setState({ mapeo: tempMapeo }, this.applyMapping);
                            SPopup.close("popup-mapeo");
                        }}>
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
            const cliente = row[mapeo["cliente"]] ?? "";
            const telefono = row[mapeo["telefono"]] ?? "";

            const { telefonoFormateado, descripcion: descTel } = this.formatearTelefono(telefono);
            const descCliente = this.validarCliente(cliente);

            return {
                key: `row_${index}`,
                index: index + 1,
                cliente,
                telefono,
                telefonoFormateado,
                descripcion: [descCliente, descTel].filter(Boolean).join(" · ")
            };
        });

        const ordenado = [...data].sort((a, b) => (a.descripcion ? 1 : -1));
        this.setState({ data: ordenado });
    };

    eliminarFila = (key) => {
        const data = this.state.data.filter(d => d.key !== key);
        this.setState({ data });
    };

    abrirEditarPopup = (item) => {
        const nuevo = { ...item };
        SPopup.open({
            key: "editar-popup",
            content: (
                <SView withoutFeedback backgroundColor={STheme.color.background} padding={16} col={"xs-11"} style={{ borderRadius: 8, maxWidth: 300 }}>
                    <SText bold fontSize={16}>✏️ Editar fila</SText>
                    <SView height={8} />
                    <SInput defaultValue={item.cliente} placeholder="Nombre completo" onChangeText={v => nuevo.cliente = v} />
                    <SView height={8} />
                    <SInput defaultValue={item.telefono} placeholder="Teléfono" onChangeText={v => nuevo.telefono = v} />
                    <SView height={16} />
                    <SView row>
                        <SView flex />
                        <SView padding={10} backgroundColor={"white"} borderRadius={8} onPress={() => {
                            const { telefonoFormateado, descripcion: descTel } = this.formatearTelefono(nuevo.telefono);
                            const descCliente = this.validarCliente(nuevo.cliente);
                            nuevo.telefonoFormateado = telefonoFormateado;
                            nuevo.descripcion = [descCliente, descTel].filter(Boolean).join(" · ");

                            const newData = this.state.data.map(d => d.key === nuevo.key ? nuevo : d);
                            // const ordenado = [...newData].sort((a, b) => (a.descripcion ? 1 : -1));
                            this.setState({ data: newData });
                            SPopup.close("editar-popup");
                        }}>
                            <SText color={"black"}>Actualizar</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    };



    render() {
        return (
            <SPage title="Importar contactos desde Excel" disableScroll>
                <SView center flex>
                    {this.state.data.length > 0 ? (
                        <STable2
                            header={[
                                { key: "index", label: "#", width: 40 },
                                { key: "cliente", label: "Nombre completo", width: 250 },
                                { key: "telefono", label: "Teléfono original", width: 150 },
                                { key: "telefonoFormateado", label: "Teléfono formateado", width: 180 },
                                { key: "descripcion", label: "Descripción", width: 280 },
                                { key: "-editar", label: "Editar", width: 100, component: (c) => (<SText underLine fontSize={12} color={STheme.color.link} onPress={() => this.abrirEditarPopup(c)}>Editar</SText>) },
                                {
                                    key: "-eliminar",
                                    label: "Eliminar",
                                    width: 100,
                                    component: (c) => (
                                        <SText
                                            underLine
                                            fontSize={12}
                                            color={"#D84315"}
                                            onPress={() =>
                                                SPopup.confirm({
                                                    title: "¿Seguro que deseas eliminar esta fila?",
                                                    onPress: () => {
                                                        this.eliminarFila(c.key);
                                                    }
                                                })
                                            }
                                        >
                                            Eliminar
                                        </SText>
                                    )
                                }







                            ]}
                            data={this.state.data}
                        />
                    ) : (
                        <SText color={STheme.color.lightGray}>📂 Aún no se ha importado ningún archivo</SText>
                    )}
                </SView>

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
                    onPress={() => this.setState({ data: [], mapeo: {}, excelData: [] })}
                >
                    <SText color='black' fontSize={18}>Limpiar</SText>
                </SView>
            </SPage>
        );
    }
}
