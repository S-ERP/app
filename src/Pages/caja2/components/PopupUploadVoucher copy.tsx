import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import {
    SForm,
    SHr,
    SImage,
    SLoad,
    SNotification,
    SPopup,
    SText,
    STheme,
    SView,
    Upload,
    // Upload,
} from 'servisofts-component';
import SSocket from 'servisofts-socket';
import InputFoto from '../../../Components/InputFoto';
import Btn from '../../empresa/config/Components/Btn';
import MDL from '../../../MDL';


// import React, { Component } from "react";
// import { ScrollView, Image } from "react-native";
// import {
//     SForm,
//     SHr,
//     SNotification,
//     SPopup,
//     SText,
//     STheme,
//     SView,
//     SLoad,
// } from "servisofts-component";
// import SSocket from "servisofts-socket";
// import Btn from "../../empresa/config/Components/Btn";
// import MDL from "../../../MDL";
// import Upload from "servisofts-component/Upload";

type Props = {
    key_empresa: string;
    key_caja_detalle: string;
    data_vouchers?: any[]; // Lista de vouchers ya guardados
    onSuccess?: (resp: any) => void;
};

export default class PopupUploadVoucher extends Component<Props> {
    static open(key_empresa: string, key_caja_detalle: string, data_vouchers?: any[]) {
        const key = `PopupUploadVoucher_${Date.now()}`;
        SPopup.open({
            key,
            content: (
                <SView
                    style={{
                        width: "100%",
                        maxHeight: "100%",
                        maxWidth: 500,
                        borderRadius: 10,
                        borderColor: STheme.color.card,
                        borderWidth: 1,
                        backgroundColor: STheme.color.background,
                        padding: 16,
                    }}
                    withoutFeedback
                >
                    <PopupUploadVoucher
                        key_empresa={key_empresa}
                        key_caja_detalle={key_caja_detalle}
                        data_vouchers={data_vouchers}
                    />
                </SView>
            ),
        });
    }

    form: SForm | null = null;
    files: File[] = [];
    state = { loading: false };

    /** 🔹 Captura los archivos seleccionados */
    handleFileChange = (e: any) => {
        const archivos = Array.isArray(e) ? e.flat() : [];
        if (archivos.length === 0) {
            SNotification.send({
                title: "Sin archivos",
                body: "Debes seleccionar al menos una imagen.",
                color: STheme.color.warning,
                time: 2500,
            });
            return;
        }
        this.files = archivos.map((item: any) => item.file).filter(Boolean);
        console.table(
            this.files.map(f => ({
                nombre: f.name,
                tipo: f.type,
                tamañoKB: (f.size / 1024).toFixed(1),
            }))
        );
    };

    /** 🔹 Subir archivos al servidor y registrar en BD */
    handleSubmit = async () => {
        if (!this.files.length) {
            return SNotification.send({
                title: "Error",
                body: "Selecciona al menos una imagen.",
                color: STheme.color.danger,
            });
        }

        try {
            this.setState({ loading: true });

            // 1️⃣ Subir archivos físicamente al servidor
            const uploadedFiles: any[] = [];
            for (let f of this.files) {
                const uploadUrl = `${SSocket.api.root}upload/empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${f.name}`;
                console.log("📤 Subiendo:", uploadUrl);

                await Upload.sendPromise(
                    { file: f, compress: false },
                    uploadUrl
                );

                uploadedFiles.push({
                    name: f.name,
                    type: f.type,
                    size: f.size,
                    lastModified: f.lastModified,
                });
            }

            SNotification.send({
                title: "Éxito",
                body: "Archivos subidos al servidor correctamente ✅",
                color: STheme.color.success,
                time: 2000,
            });

            // 2️⃣ Registrar en base de datos (vincular los archivos)
            const payload = {
                key_empresa: this.props.key_empresa,
                key: this.props.key_caja_detalle,
                vouchers: uploadedFiles,
            };

            console.log("📦 Guardando en BD:", payload);

            const resp = await MDL.caja.editar_detalle(payload);

            SNotification.send({
                title: "Registro exitoso 🎉",
                body: "Los vouchers se guardaron correctamente.",
                color: STheme.color.success,
                time: 2500,
            });

            if (this.props.onSuccess) this.props.onSuccess(resp);

            setTimeout(() => SPopup.close(), 500);
        } catch (error) {
            console.error("❌ Error al subir voucher:", error);
            SNotification.send({
                title: "Error",
                body: "No se pudo guardar el voucher. Intenta nuevamente.",
                color: STheme.color.danger,
                time: 3000,
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    /** 🔹 Renderiza las imágenes ya registradas en el servidor */
    renderUploadedVouchers() {
        const { data_vouchers } = this.props;
        if (!data_vouchers || data_vouchers.length === 0) return null;

        return (
            <SView>
                <SText bold color={STheme.color.text}>📁 Vouchers registrados:</SText>
                <SHr h={10} />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                >
                    {data_vouchers.map((v, i) => {
                        const url = `${SSocket.api.root}empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${v.name}`;

                        console.log("picasooooooooooooo " + url)
                        // https://serp.servisofts.com/images/upload/empresa/f894ea35-5ad1-4b61-a2d0-9294965be169/voucher/e0da6d66-f588-4288-857f-6c85e1552e1b/capture.ico
                        return (
                            <SView
                                key={i}
                                style={{
                                    width: 120,
                                    height: 120,
                                    marginRight: 10,
                                    borderRadius: 8,
                                    overflow: "hidden",
                                    borderWidth: 1,
                                    borderColor: STheme.color.card,
                                }}
                            >
                                <SImage src={url} style={{ width: "100%", height: "100%", }} />

                            </SView>
                        );
                    })}
                </ScrollView>
                <SHr h={10} />
            </SView>
        );
    }

    render() {
        return (
            <SView col={"xs-12"} padding={12}>
                <SText fontSize={18} bold center color={STheme.color.text}>
                    📤 Subir Voucher
                </SText>
                <SHr h={12} />

                <ScrollView style={{ width: "100%" }}>
                    {/* 🔹 Mostrar archivos ya registrados */}
                    {this.renderUploadedVouchers()}

                    {/* 🔹 Formulario para subir nuevos archivos */}
                    <SForm
                        ref={ref => (this.form = ref)}
                        inputs={{
                            file: {
                                label: "Nuevas imágenes *",
                                type: "files",
                                isRequired: true,
                                multiple: true,
                                style: {
                                    height: 200,
                                    borderWidth: 1,
                                    borderColor: STheme.color.card,
                                    borderRadius: 8,
                                    justifyContent: "center",
                                    alignItems: "center",
                                },
                                placeholder: "Selecciona o arrastra las imágenes aquí 📎",
                                onChangeText: this.handleFileChange,
                            },
                        }}
                        onSubmit={this.handleSubmit}
                    />
                </ScrollView>

                <SHr h={20} />

                <SView row col={"xs-12"} center>
                    <Btn
                        type="danger"
                        label="CANCELAR"
                        onPress={() => SPopup.close()}
                    />
                    <SView width={10} />
                    <Btn
                        type="primary"
                        label={this.state.loading ? "GUARDANDO..." : "GUARDAR"}
                        disabled={this.state.loading}
                        onPress={() => this.form?.submit()}
                    />
                </SView>

                {this.state.loading && (
                    <SView
                        style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "#00000066",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 10,
                        }}
                    >
                        <SLoad />
                        <SHr h={8} />
                        <SText color="#fff">Subiendo voucher...</SText>
                    </SView>
                )}
            </SView>
        );
    }
}
