import React, { Component } from "react";
import { ScrollView } from "react-native";
import {
    SForm,
    SHr,
    SNotification,
    SPopup,
    SText,
    STheme,
    SView,
    SLoad,
} from "servisofts-component";
import SSocket from "servisofts-socket";
import Btn from "../../empresa/config/Components/Btn";
import MDL from "../../../MDL";

type Props = {
    key_empresa: string;
    key_caja_detalle: string;
    data_vouchers: any;

    onSuccess?: (resp: any) => void;
};

export default class PopupUploadVoucher extends Component<Props> {
    static open(key_empresa: string, key_caja_detalle: string, data_vouchers: any) {
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
                    <PopupUploadVoucher key_empresa={key_empresa} key_caja_detalle={key_caja_detalle} data_vouchers={data_vouchers} />
                </SView>
            ),
        });
    }

    form: SForm | null = null;
    files: File[] = [];
    state = { loading: false };

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

    handleSubmit = async () => {
        if (!this.form) return;
        const values = this.form.getValues?.();

        if (!this.files || this.files.length === 0) {
            return SNotification.send({
                title: "Error",
                body: "Selecciona al menos una imagen del voucher.",
                color: STheme.color.danger,
            });
        }

        const payload = {
            key_empresa: this.props.key_empresa,
            key: this.props.key_caja_detalle,

            vouchers: this.files.map(f => ({
                name: f.name,
                type: f.type,
                size: f.size,
                lastModified: f.lastModified,
            })),
        };

        console.log("📦 Payload final a enviar:", payload);

        try {
            this.setState({ loading: true });

            const resp = await MDL.caja.editar_detalle(payload);

            SNotification.send({
                title: "Éxito",
                body: "El voucher se actualizó correctamente 🎉",
                color: STheme.color.success,
                time: 2500,
            });

            if (this.props.onSuccess) this.props.onSuccess(resp);

            // Cerramos el popup después de un breve retraso
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

    // traerdaaaaaaaa(){

    //     // MDL.caja.getDetalle

    //     return <SText> {} </SText>
    // }


    render() {
        return (
            <SView col={"xs-12"} padding={12}>
                <SText fontSize={18} bold center color={STheme.color.text}>
                    📤 Subir Voucher
                    {/* {JSON.stringify(this.props.data_vouchers)} */}
                </SText>
                <SHr h={12} />

                <ScrollView style={{ width: "100%" }}>
                    <SForm
                        ref={ref => (this.form = ref)}
                        inputs={{
                            file: {
                                label: "Imagen del Voucher *",
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
