import React, { Component } from "react";
import { Linking, ScrollView } from "react-native";
import { SForm, SHr, SImage, SLoad, SNotification, SPopup, SText, STheme, SView, Upload, } from "servisofts-component";
import SSocket from "servisofts-socket";
import Btn from "../../empresa/config/Components/Btn";
import MDL from "../../../MDL";
import { SDate } from "servisofts-component";
import SIconApp from "../../../Assets/SIconApp";

type Props = {
    key_empresa: string;
    key_caja_detalle: string;
    data_vouchers?: any[];
    onSuccess?: (resp: any) => void;
};

type VoucherFile = {
    file?: File;
    name: string;
    type: string;
    size: number;
    lastModified: number;
    url?: string;
};

export default class PopupUploadVoucher extends Component<Props> {
    static open(key_empresa: string, key_caja_detalle: string, data_vouchers?: any[]) {
        const key = `PopupUploadVoucher_`;
        SPopup.open({
            key,
            content: (
                <SView style={{ width: "100%", maxHeight: "100%", maxWidth: 500, borderRadius: 10, borderColor: STheme.color.card, borderWidth: 1, backgroundColor: STheme.color.background, padding: 16, }} withoutFeedback >
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

    state = {
        loading: false,
        uploadedVouchers: this.props.data_vouchers ?? [],
        fileValue: [],
    };

    componentDidMount() {
        this.validateFileEmpty();
    }

    validateFileEmpty = () => {
        return this.state.fileValue.length === 0;
    };

    isFileValid = (file: File) => {
        const isImageOrPDF = file.type.startsWith("image/") || file.type === "application/pdf";
        const isSizeOk = file.size <= 10 * 1024 * 1024;
        return isImageOrPDF && isSizeOk;
    };

    handleFileChange = (e: any) => {
        const nuevos = Array.isArray(e) ? e.flat() : [];
        const nuevosArchivos = nuevos
            .filter(item => this.isFileValid(item.file))
            .map(item => ({
                file: item.file,
                name: item.file.name,
                type: item.file.type,
                size: item.file.size,
                lastModified: item.file.lastModified,
                url: URL.createObjectURL(item.file),
            }));

        const actualesServidor = this.state.uploadedVouchers.filter(v => !v.file);
        const fusionados: VoucherFile[] = [...actualesServidor];

        nuevosArchivos.forEach(nuevo => {
            if (!fusionados.find(f => f.name === nuevo.name && f.size === nuevo.size)) {
                fusionados.push(nuevo);
            }
        });

        const nombresActuales = nuevosArchivos.map(n => n.name);
        const filtrados = fusionados.filter(
            f => f.file ? nombresActuales.includes(f.name) : true
        );

        this.files = nuevosArchivos.map(n => n.file);
        this.setState({ uploadedVouchers: filtrados, fileValue: nuevos });

        //   if (this.form && this.form?.getValues("file")) {
        //         console.log("..................se murio")
        //         this.form?.inputs?.file.setValue([]); // Asumiendo que SForm tiene un método setValue
        //     }


        // this.form?.setValues({ "file": "" });

        // const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const inpsa = this.form?.getValues()?.file || {};
        // if (input) input.value = "";
        if (inpsa) {
            console.log("hay valores")
        } else {
            console.log("sin data")

        }

        // input.value = "";
    };

    removeVoucher = (index: number) => {
        const updated = [...this.state.uploadedVouchers];
        const removed = updated.splice(index, 1);
        this.setState({ uploadedVouchers: updated });

        if (removed[0]?.file) {
            this.files = this.files.filter(f => f.name !== removed[0].file?.name);
        }

        if (updated.filter(v => v.file).length === 0) {
            this.setState({ fileValue: [] });
        }

        SNotification.send({
            title: "Imagen eliminada",
            body: "Se quitó la imagen correctamente.",
            color: STheme.color.info,
            time: 1500,
        });
    };

    handleSubmit = async () => {

        // if (!this.state.uploadedVouchers.length) {
        //     return SNotification.send({
        //         title: "Sin imágenes",
        //         body: "Debes mantener al menos una imagen antes de guardar.",
        //         color: STheme.color.warning,
        //     });
        // }

        try {
            this.setState({ loading: true });

            const nuevosArchivos = this.state.uploadedVouchers.filter(v => v.file);
            for (let v of nuevosArchivos) {
                const uploadUrl = `${SSocket.api.root}upload/empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${v.name}`;
                await Upload.sendPromise({ file: v.file!, compress: false }, uploadUrl);
            }

            const vouchersFinales = this.state.uploadedVouchers.map(v => ({
                name: v.name,
                type: v.type,
                size: v.size,
                lastModified: v.lastModified,
            }));

            const payload = {
                key_empresa: this.props.key_empresa,
                key: this.props.key_caja_detalle,
                vouchers: vouchersFinales,
            };

            const resp = await MDL.caja.editar_detalle(payload);

            SNotification.send({
                title: "¡Cambios guardados!",
                body: "Los vouchers fueron actualizados correctamente.",
                color: STheme.color.success,
                time: 2500,
            });

            if (this.props.onSuccess) this.props.onSuccess(resp);
            SPopup.close("PopupUploadVoucher_");
        } catch (error) {
            console.error("❌ Error al guardar vouchers:", error);
            SNotification.send({
                title: "Error",
                body: "Ocurrió un problema al guardar los vouchers. Intenta nuevamente.",
                color: STheme.color.danger,
                time: 3000,
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    limpiarTodosLosVouchers = () => {
        this.files = []; // Limpiamos los archivos en memoria
        this.setState({ uploadedVouchers: [], fileValue: [] }, () => {
            SNotification.send({
                title: "Imágenes eliminadas",
                body: "Todas las imágenes fueron borradas correctamente.",
                color: STheme.color.info,
                time: 1500,
            });
        });
        this.handleSubmit
    };


    renderUploadedVouchers() {
        const { uploadedVouchers } = this.state;
        if (!uploadedVouchers.length) return null;

        return (
            <SView>

                <SView style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <SText bold>📁 Imágenes registradas</SText>
                    <SView
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            backgroundColor: "#e74c3c",
                            borderRadius: 5,
                        }}
                        onPress={() => {
                            SPopup.confirm({
                                title: "Confirmar acción",
                                message: "¿Deseas eliminar todas las imágenes?",
                                onPress: () => {
                                    this.limpiarTodosLosVouchers();
                                }
                            })
                        }}
                    >
                        <SText color="#fff" bold>Limpiar vouche</SText>
                    </SView>
                </SView>
                <SHr h={10} />


                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {uploadedVouchers.map((v, i) => {
                        const url = v.url ?? `${SSocket.api.root}empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${v.name}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`;
                        const esImagen = v.type?.startsWith("image/");

                        return (
                            <SView key={i} style={{ width: 120, height: 120, marginRight: 10, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: STheme.color.card, }}>
                                {esImagen ? (
                                    <SImage src={url} style={{ width: "100%", height: "100%" }} />
                                ) : (
                                    <SView flex center style={{ backgroundColor: STheme.color.card }}>
                                        <SText fontSize={30}>📄</SText>
                                        <SText fontSize={10} center numberOfLines={1}>{v.name}</SText>
                                    </SView>
                                )}

                                {/* Eliminar */}
                                <SView style={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    backgroundColor: "#00000088",
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    justifyContent: "center",
                                    alignItems: "center",

                                }} onPress={() => this.removeVoucher(i)}>
                                    <SText color="#fff" bold>✕</SText>
                                </SView>

                                {/* Descargar */}
                                <SView style={{
                                    position: "absolute",
                                    bottom: 4,
                                    right: 4,
                                    backgroundColor: "#00000088",
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    justifyContent: "center",
                                    alignItems: "center",

                                }} onPress={() => Linking.openURL(url)}>
                                    <SText color="#fff" bold>📥</SText>
                                </SView>
                            </SView>
                        );
                    })}
                </ScrollView>
                <SHr h={10} />
            </SView>
        );
    }

    iconButtonStyle(position: "top" | "bottom") {
        return {
            position: "absolute",
            [position]: 4,
            right: 4,
            backgroundColor: "#00000088",
            width: 28,
            height: 28,
            borderRadius: 14,
            justifyContent: "center",
            alignItems: "center",
        };
    }

    renderFileEmptyMessage() {
        if (!this.validateFileEmpty()) return null;

        return (
            <SView height={150} style={{ position: "absolute", bottom: 100, left: 40, width: "90%" }} pointerEvents="auto" backgroundColor="rgba(63, 255, 165, 0.15)"

                onPress={() => {
                    // Intenta acceder al input desde el ref del SForm
                    const form = this.form;
                    if (form && form.inputs?.file?.input) {
                        const inputElement = form.inputs.file.input;
                        if (inputElement.click) inputElement.click();
                    } else {
                        // Fallback: intentar buscar directamente
                        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (input) input.click();
                    }
                }}
            >
                <SView col={"xs-12"} row center>
                    <SView style={{ top: 25 }} center>
                        <SView style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#4786b1ff', alignItems: 'center', justifyContent: 'center' }}>
                            <SIconApp name="confirmar" height={20} />
                        </SView>
                        <SHr h={12} />
                        <SText center color={STheme.color.lightGray}>Arrastra tus archivos aquí o haz clic para seleccionar</SText>
                        <SHr h={4} />
                        <SText fontSize={12} color={STheme.color.lightGray}>PDF, JPG, PNG hasta 10MB</SText>
                    </SView>
                </SView>
            </SView>
        );
    }

    render() {
        return (
            <SView col={"xs-12"} padding={12}  >
                <SText fontSize={18} bold center>Subir vouchers</SText>
                <SHr h={12} />

                <ScrollView style={{ width: "100%" }}>
                    {this.renderUploadedVouchers()}
                    <SForm
                        ref={ref => (this.form = ref)}
                        inputs={{
                            file: {
                                label: "Agregar nuevas imágenes",
                                type: "files",
                                style: { height: 200, borderWidth: 2, borderColor: STheme.color.card, borderRadius: 8, borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: STheme.color.background, },
                                placeholder: "Selecciona o arrastra tus imágenes aquí 📎",
                                onChangeText: this.handleFileChange,

                                //   ref:this.fileInputRef

                            },
                        }}
                        onSubmit={this.handleSubmit}
                    />
                </ScrollView>

                {this.renderFileEmptyMessage()}

                <SHr h={20} />

                <SView row col={"xs-12"} center>
                    <Btn type="secondary" label="CANCELAR" onPress={() => SPopup.close("PopupUploadVoucher_")} />
                    <SView width={10} />
                    <Btn
                        type="primary"
                        label={this.state.loading ? "GUARDANDO..." : "SUBIR"}
                        onPress={() => this.form?.submit()}
                    />
                </SView>

                {this.state.loading && (
                    <SView style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "#00000066", justifyContent: "center", alignItems: "center", borderRadius: 10, }}>
                        <SLoad />
                        <SHr h={8} />
                        <SText color="#fff">Subiendo imágenes, por favor espera...</SText>
                    </SView>
                )}
            </SView>
        );
    }
}
