import React, { Component } from "react";
import { Linking } from "react-native";
import {
    SHr,
    SText,
    STheme,
    SView,
    Upload,
    SInput,
    SNotification,
    SPopup,
} from "servisofts-component";

import { SDate } from "servisofts-component";
import SIconApp from "../../../Assets/SIconApp";
import SSocket from "servisofts-socket";

type Props = {
    key_empresa: string;
    key_compra_venta: string;
    data_factura?: any;
    onSuccess?: (resp?: any) => void;
};

type State = {
    loading: boolean;
    factura: {
        file?: File;
        name: string;
        type: string;
        size?: number;
        lastModified?: number;
        url?: string;
    } | null;
};

export default class PopupUploadFactura extends Component<Props, State> {

    static open(params: {
        key_empresa: string;
        key_compra_venta: string;
        data_factura?: any;
        onSuccess?: (resp?: any) => void;
    }) {
        const key = `PopupUploadFactura_${params.key_compra_venta}`;

        SPopup.open({
            key,
            content: (
                <SView
                    style={{
                        width: "100%",
                        maxWidth: 420,
                        borderRadius: 12,
                        backgroundColor: STheme.color.background,
                        padding: 16,
                    }}
                    withoutFeedback
                >
                    <PopupUploadFactura
                        key_empresa={params.key_empresa}
                        key_compra_venta={params.key_compra_venta}
                        data_factura={params.data_factura}
                        onSuccess={params.onSuccess}
                    />
                </SView>
            ),
        });
    }

    state: State = {
        loading: false,
        factura: null,
    };

    componentWillUnmount() {
        if (this.state.factura?.url) {
            URL.revokeObjectURL(this.state.factura.url);
        }
    }

    isFileValid = (file: File) => {
        if (file.type !== "application/pdf") {
            SNotification.send({
                title: "Solo PDF",
                body: "Solo se permite PDF",
                color: STheme.color.danger,
                time: 3000,
            });
            return false;
        }

        if (file.size > 10 * 1024 * 1024) {
            SNotification.send({
                title: "Muy grande",
                body: "Máximo 10MB",
                color: STheme.color.danger,
                time: 3000,
            });
            return false;
        }

        return true;
    };

    handleFileChange = (files: any) => {
        const file = files?.[0]?.file;
        if (!file) return;
        if (!this.isFileValid(file)) return;

        if (this.state.factura?.url) {
            URL.revokeObjectURL(this.state.factura.url);
        }

        this.setState({
            factura: {
                file,
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                url: URL.createObjectURL(file),
            },
        });
    };

    removeFactura = () => {
        if (this.state.factura?.url) {
            URL.revokeObjectURL(this.state.factura.url);
        }
        this.setState({ factura: null });
    };

    handleSubmit = async () => {
        try {
            if (!this.state.factura?.file) {
                SNotification.send({
                    title: "Seleccione PDF",
                    body: "Debe subir un archivo",
                    color: STheme.color.warning,
                    time: 3000,
                });
                return;
            }

            this.setState({ loading: true });

            const fileName =
                `${this.props.key_compra_venta}_${Date.now()}_${this.state.factura.name}`;

            // 🔥 UPLOAD URL (TU FORMATO EXACTO)
            const uploadUrl = `${SSocket.api.root}/upload/empresa/${this.props.key_empresa}/factura/${this.props.key_compra_venta}/${encodeURIComponent(fileName)}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`;
            // const uploadUrl = `https://serp.servisofts.com/upload/${this.props.key_empresa}/factura/${this.props.key_compra_venta}/${encodeURIComponent(fileName)}`;
            // 🔥 DOWNLOAD URL
            const downloadUrl = `${SSocket.api.root}/empresa/${this.props.key_empresa}/factura/${this.props.key_compra_venta}/${encodeURIComponent(fileName)}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`;
            // const downloadUrl = `https://serp.servisofts.com/factura/${this.props.key_empresa}/${this.props.key_compra_venta}/${encodeURIComponent(fileName)}`;

            console.log("%cDOWNLOAD URL:", "color:#3498db;font-weight:bold;", downloadUrl);

            console.log("%cABRIR ARCHIVO:", "color:#9b59b6;font-weight:bold;", `window.open('${downloadUrl}')`);

            await Upload.sendPromise(
                {
                    file: this.state.factura.file,
                    compress: false,
                },
                uploadUrl
            );

            // const facturaFinal = {
            //     name: fileName,
            //     type: this.state.factura.type,
            //     size: this.state.factura.size,
            //     lastModified: this.state.factura.lastModified,
            // };

            const facturaFinal = {
                name: fileName,
                type: this.state.factura.type,
                size: this.state.factura.size,
                lastModified: this.state.factura.lastModified,

                // 🔥 AGREGAR ESTO
                link: downloadUrl,
            };

            this.props.onSuccess?.(facturaFinal);

            SNotification.send({
                title: "Subido",
                body: "Factura cargada correctamente",
                color: STheme.color.success,
                time: 2500,
            });

            SPopup.close(`PopupUploadFactura_${this.props.key_compra_venta}`);

        } catch (error) {
            console.error(error);

            SNotification.send({
                title: "Error",
                body: "No se pudo subir",
                color: STheme.color.danger,
                time: 3000,
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    renderPreview() {
        const { factura } = this.state;
        if (!factura) return null;

        const url = factura.url ?? `${SSocket.api.root}/empresa/${this.props.key_empresa}/factura/${this.props.key_compra_venta}/${factura.name}`;
        // const url = factura.url ?? `https://serp.servisofts.com/factura/${this.props.key_empresa}/${this.props.key_compra_venta}/${factura.name}`;

        return (
            <SView
                row
                style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: STheme.color.card,
                    alignItems: "center",
                }}
            >
                <SIconApp name="crmpdf" width={28} height={28} fill="#d32f2f" />

                <SView width={10} />

                <SView flex>
                    <SText bold>{factura.name}</SText>
                    <SText fontSize={11} color={STheme.color.lightGray}>
                        PDF listo
                    </SText>
                </SView>

                <SView
                    onPress={() => Linking.openURL(url)}
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 100,
                        backgroundColor: "#28a745",
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 6,
                    }}
                >
                    <SText color="#fff">⬇</SText>
                </SView>

                <SView
                    onPress={this.removeFactura}
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 100,
                        backgroundColor: "#dc3545",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <SText color="#fff">✕</SText>
                </SView>
            </SView>
        );
    }

    render() {
        return (
            <SView col={"xs-12"}>

                <SText fontSize={18} bold>
                    Subir Factura PDF
                </SText>

                <SHr h={12} />

                {this.renderPreview()}

                <SInput
                    type="file"
                    accept="application/pdf"
                    label="PDF"
                    onChangeText={this.handleFileChange}
                />

                <SHr h={16} />

                <SView row center>

                    <SView
                        onPress={() =>
                            SPopup.close(`PopupUploadFactura_${this.props.key_compra_venta}`)
                        }
                        style={{
                            padding: 10,
                            backgroundColor: STheme.color.card,
                            borderRadius: 6,
                        }}
                    >
                        <SText>Cancelar</SText>
                    </SView>

                    <SView width={10} />

                    <SView
                        onPress={this.handleSubmit}
                        style={{
                            padding: 10,
                            backgroundColor: STheme.color.success,
                            borderRadius: 6,
                        }}
                    >
                        <SText bold color="#fff">
                            {this.state.loading ? "SUBIENDO..." : "GUARDAR"}
                        </SText>
                    </SView>

                </SView>

            </SView>
        );
    }
}