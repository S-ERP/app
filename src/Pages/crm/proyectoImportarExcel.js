import React, { Component } from 'react';
import { SPage, SView, SIcon, SText, STable, STheme, SLoad, SNavigation, SPopup, SInput, STable2, SHr, SNotification } from 'servisofts-component';
import FileChooser from '../../Components/SUpload/FileChooser';
import * as XLSX from "xlsx";
import SSocket from 'servisofts-socket';


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

        const tel = telefono.toString().replace(/\D/g, "");
        let descripcion = "";

        if (/[a-zA-Z]/.test(telefono)) descripcion = "El teléfono contiene letras";
        else if (/[^0-9\s+]/.test(telefono)) descripcion = "El teléfono contiene caracteres no válidos";
        else if (tel.length !== 8) descripcion = `Error en el teléfono, lleva ${tel.length} dígitos`;

        return {
            telefonoFormateado: `+591 ${tel}`,
            descripcion
        };
    };

    validarCliente = (cliente) => {
        const limpio = cliente.replace(/\s/g, "");
        return (!limpio || limpio.toLowerCase() === "sinnombre") ? "El campo nombre tiene error" : "";
    };

    handleExcelImport = () => {
        FileChooser({ accept: ".xlsx, .xls" }).then((files) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
                const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
                this.setState({ excelData: jsonData, columnasDetectadas: Object.keys(jsonData[0] || {}) }, this.openMappingPopup);
            };
            reader.readAsArrayBuffer(files[0]);
        });
    };

    enviarTablaServidor = () => {
        const { data = [] } = this.state;
        if (!data.length) return SPopup.alert("⚠️ No hay datos", "Importa un archivo Excel primero.");



        const errores = data.filter(d => d.descripcion);



        if (errores.length) {
            return SPopup.open({
                key: "error-envio",
                content: (
                    <SView col="xs-11" backgroundColor={STheme.color.black} padding={16} style={{ borderRadius: 8, maxWidth: 300 }}>
                        <SText bold fontSize={18}>❌ Errores en los datos</SText>
                        <SHr height={8} />
                        <SText fontSize={14}>Hay <SText bold>{errores.length}</SText> filas con errores. Corrige antes de enviar.</SText>
                        <SHr height={16} />
                        <SView center backgroundColor={STheme.color.danger} padding={10} borderRadius={4} onPress={() => SPopup.close("error-envio")}> <SText color="white" bold>Cerrar</SText> </SView>
                    </SView>
                )
            });
        }

        SPopup.confirm({
            title: "¿Estás seguro?",
            message: `Se enviarán ${data.length} registros.`,
            onPress: async () => {
                // console.log("Enviando datos...", data);
                const dataSinErrores = data.filter(d => !d.descripcion).map(d => ({
                    nombres: d.cliente,
                    telefono: d.telefonoFormateado,
                    key_campana: this.key_campana,
                    key_proyecto: this.key_proyecto
                }))

                await SSocket.sendPromise({
                    service: "crm",
                    component: "campana",
                    type: "importar_array",
                    data: dataSinErrores
                });



                console.log("Datos a enviar:", dataSinErrores);


                SPopup.alert("✅ Enviado", `${data.length} registros enviados correctamente.`);
            }
        });
    };

    openMappingPopup = () => {
        const campos = ["cliente", "telefono"];
        const { columnasDetectadas = [], mapeo = {} } = this.state;
        const tempMapeo = { ...mapeo };

        SPopup.open({
            key: "popup-mapeo",
            content: (
                <SView withoutFeedback col="xs-11" backgroundColor={STheme.color.black} padding={16} style={{ borderRadius: 8, maxWidth: 300 }}>
                    <SText bold fontSize={18}>📋 Mapear columnas</SText>
                    <SHr height={12} />
                    {campos.map((campo) => (
                        <SView key={campo} marginBottom={12}>
                            <SText fontSize={14}>{campo}</SText>
                            <SInput
                                type="select"
                                defaultValue={tempMapeo[campo] ?? "none"}
                                center
                                options={[{ key: "none", content: "-" }, ...columnasDetectadas.map(col => ({ key: col, content: col }))]}
                                onChangeText={(val) => tempMapeo[campo] = val}
                                style={{ textAlign: "center" }}
                            />
                        </SView>
                    ))}
                    <SHr height={20} />
                    <SView row center>
                        <SView flex />
                        <SView width={100} center padding={10} backgroundColor={"white"} borderRadius={4} onPress={() => SPopup.close("popup-mapeo")}>
                            <SText color={"black"}>Cancelar</SText>
                        </SView>
                        <SView width={20} />
                        <SView width={120} center padding={10} backgroundColor={"black"} border={"white"} borderRadius={4} onPress={() => {
                            this.setState({ mapeo: tempMapeo }, this.applyMapping);
                            SPopup.close("popup-mapeo");
                        }}>
                            <SText color={"white"}>Importar lista</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    };

    applyMapping = () => {
        const { excelData = [], mapeo = {} } = this.state;
        const data = excelData.map((row, i) => {
            const cliente = row[mapeo["cliente"]] ?? "";
            const telefono = row[mapeo["telefono"]] ?? "";
            const { telefonoFormateado, descripcion: descTel } = this.formatearTelefono(telefono);
            const descCliente = this.validarCliente(cliente);

            return {
                key: `row_${i}`,
                index: i + 1,
                cliente,
                telefono,
                telefonoFormateado,
                descripcion: [descCliente, descTel].filter(Boolean).join(" · ")
            };
        });

        this.setState({ data: data.sort((a, b) => (a.descripcion ? 1 : -1)) });
    };

    eliminarFila = (key) => {
        this.setState({ data: this.state.data.filter(d => d.key !== key) });
    };

    abrirEditarPopup = (item) => {
        const nuevo = { ...item };
        SPopup.open({
            key: "editar-popup",
            content: (
                <SView withoutFeedback col="xs-11" backgroundColor={STheme.color.background} padding={16} style={{ borderRadius: 8, maxWidth: 320 }} >
                    <SView row><SIcon name='crmeditar' width={20} fill='white' /><SText bold fontSize={16}> Editar contacto</SText></SView>
                    <SHr height={6} />
                    <SText fontSize={12} color={STheme.color.lightGray}>Modifica la información del contacto</SText>

                    {/* <SView row><SIcon name='crmeditar' width={14} fill='white' /><SText bold fontSize={16}> sssssssssssssssssssss</SText></SView> */}
                    <SHr height={8} />

                    <SInput label="Nombre completo" defaultValue={item?.cliente} onChangeText={v => nuevo.cliente = v} />
                    <SHr height={8} />
                    <SInput label="Teléfono" type='telefono' defaultValue={`${item?.telefono}`} onChangeText={v => nuevo.telefono = v} />
                    <SHr height={18} />
                    <SView row center>
                        <SView flex />
                        <SView width={100} center padding={10} backgroundColor={"white"} borderRadius={4} onPress={() => SPopup.close("editar-popup")}><SText color={"black"}>Cancelar</SText></SView>
                        <SView width={20} />
                        <SView width={140} center padding={10} backgroundColor={"black"} border={"white"} borderRadius={4} onPress={() => {
                            const { telefonoFormateado, descripcion: descTel } = this.formatearTelefono(nuevo.telefono);
                            const descCliente = this.validarCliente(nuevo.cliente);
                            nuevo.telefonoFormateado = telefonoFormateado;
                            nuevo.descripcion = [descCliente, descTel].filter(Boolean).join(" · ");
                            const data = this.state.data.map(d => d.key === nuevo.key ? nuevo : d);
                            this.setState({ data });
                            // SNotification.send({
                            //     title: "✅ Carga completado",
                            //     body: `Se enviaron ${data.length} mensajes correctamente.`,
                            //     color: STheme.color.primary
                            // });
                            SPopup.close("editar-popup");
                        }}><SText color={"white"}>Guardar Cambios</SText></SView>
                    </SView>
                </SView>
            )
        });
    };

    render() {
        const { data } = this.state;

        return (
            <SPage title="Importar contactos desde Excel" disableScroll>
                <SHr height={20} />
                <SView col="xs-12 md-9" row style={{ gap: 8 }}>
                    <SView width={140} height={32} center backgroundColor={STheme.color.card} borderRadius={4}>
                        <SText fontSize={14} color={STheme.color.white} onPress={this.handleExcelImport}>{"+  Importar Excel"}</SText>
                    </SView>
                    <SView width={140} height={32} center row backgroundColor={STheme.color.card} borderRadius={4} onPress={() => {
                        if (!data.length) return SPopup.alert("⚠️ No hay datos en la tabla");
                        this.setState({ data: [], mapeo: {}, excelData: [] });
                    }}>
                        <SIcon name='crmeliminar' width={16} fill='white' />
                        <SText fontSize={14}> Limpiar Tabla</SText>
                    </SView>
                    <SView flex />
                    <SView width={140} height={32} center row backgroundColor={STheme.color.card} borderRadius={4} onPress={this.enviarTablaServidor}>
                        <SIcon name='MessageSend' width={14} fill='white' />
                        <SText fontSize={14} color={STheme.color.white}> Enviar al servidor</SText>
                    </SView>
                </SView>

                {(!this.state.data.length > 0) ?
                    <SView center style={{ position: "absolute", top: 180, left: "25%", }} >
                        <SText color={STheme.color.lightGray} fontSize={16}>📂 Aún no se ha importado ningún archivo</SText>
                    </SView>
                    : null}


                <STable2
                    header={[
                        { key: "index", label: "#", width: 40 },
                        { key: "cliente", label: "Nombre completo", width: 250 },
                        { key: "telefono", label: "Teléfono original", width: 150 },
                        { key: "telefonoFormateado", label: "Teléfono formateado", width: 180 },
                        { key: "descripcion", label: "Descripción", width: 280 },
                        {
                            key: "-editar", label: "Editar", width: 100,
                            component: (c) => <SView onPress={() => this.abrirEditarPopup(c)}><SIcon name='crmeditar' width={18} fill="#e7e7e7" /></SView>
                        },
                        {
                            key: "-eliminar", label: "Eliminar", width: 100,
                            component: (c) => (
                                <SView onPress={() => SPopup.confirm({ title: "¿Seguro que deseas eliminar esta fila?", onPress: () => this.eliminarFila(c.key) })}>
                                    <SIcon name='crmeliminar' width={18} fill="#ef0707" />
                                </SView>
                            )
                        }
                    ]}
                    data={data}
                />
            </SPage>
        );
    }
}
