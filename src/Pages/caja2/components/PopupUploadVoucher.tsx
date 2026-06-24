import React, { Component } from "react";
import { Linking, ScrollView } from "react-native"
import { SForm, SHr, SImage, SLoad, SNotification, SPopup, SText, STheme, SView, Upload } from "servisofts-component"
import SSocket from "servisofts-socket"
import Btn from "../../empresa/config/Components/Btn"
import MDL from "../../../MDL"
import { SDate } from "servisofts-component"
import SIconApp from "../../../Assets/SIconApp"

type Props = {
    key_empresa: string
    key_caja_detalle: string
    data_vouchers?: any[]
    onSuccess?: (resp: any) => void
}

type VoucherFile = {
    file?: File
    name: string
    type: string
    size: number
    lastModified: number
    url?: string
}

export default class PopupUploadVoucher extends Component<Props> {

    static open(key_empresa: string, key_caja_detalle: string, data_vouchers?: any[]) {
        SPopup.open({
            key: "PopupUploadVoucher_",
            content: (
                <SView style={{
                    width: "100%", maxHeight: "100%", maxWidth: 550,
                    borderRadius: 12, borderColor: STheme.color.card, borderWidth: 1,
                    backgroundColor: STheme.color.background, padding: 20,
                }} withoutFeedback>
                    <PopupUploadVoucher
                        key_empresa={key_empresa}
                        key_caja_detalle={key_caja_detalle}
                        data_vouchers={data_vouchers}
                    />
                </SView>
            ),
        })
    }

    form: SForm | null = null

    state: { loading: boolean; uploadedVouchers: VoucherFile[]; fileValue: any[] } = {
        loading: false,
        uploadedVouchers: this.props.data_vouchers ?? [],
        fileValue: [],
    }

    isFileValid = (file: File) => {
        const isImageOrPDF = file.type.startsWith("image/") || file.type === "application/pdf"
        const isSizeOk = file.size <= 2 * 1024 * 1024
        return isImageOrPDF && isSizeOk
    }

    handleFileChange = (e: any) => {
        const nuevos = Array.isArray(e) ? e.flat() : []
        const rechazados = nuevos.filter((item: any) => !this.isFileValid(item.file))
        if (rechazados.length > 0) {
            SNotification.send({
                key: "voucher_rechazo",
                title: "Archivo no permitido",
                body: `Solo se permiten imágenes y PDF de hasta 2 MB. ${rechazados.length} archivo(s) rechazado(s).`,
                color: STheme.color.danger,
                time: 4000,
            })
        }
        const nuevosArchivos: VoucherFile[] = nuevos
            .filter((item: any) => this.isFileValid(item.file))
            .map((item: any) => ({
                file: item.file,
                name: item.file.name,
                type: item.file.type,
                size: item.file.size,
                lastModified: item.file.lastModified,
                url: URL.createObjectURL(item.file),
            }))
        const actualesServidor = this.state.uploadedVouchers.filter((v) => !v.file)
        const fusionados: VoucherFile[] = [...actualesServidor]
        nuevosArchivos.forEach((nuevo) => {
            if (!fusionados.find((f) => f.name === nuevo.name && f.size === nuevo.size)) {
                fusionados.push(nuevo)
            }
        })
        const nombresNuevos = nuevosArchivos.map((n) => n.name)
        const filtrados = fusionados.filter((f) => (f.file ? nombresNuevos.includes(f.name) : true))
        this.setState({ uploadedVouchers: filtrados, fileValue: nuevos })
    }

    removeVoucher = (index: number) => {
        const updated = [...this.state.uploadedVouchers]
        updated.splice(index, 1)
        this.setState({ uploadedVouchers: updated })
        if (updated.filter((v) => v.file).length === 0) {
            this.setState({ fileValue: [] })
        }
    }

    uploadConTimeout = (file: File, url: string, timeoutMs = 8000): Promise<any> => {
        const upload = Upload.sendPromise({ file, compress: false }, url)
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject({ in: "timeout", statusText: "Sin respuesta del servidor" }), timeoutMs)
        )
        return Promise.race([upload, timeout])
    }

    handleSubmit = async () => {
        if (this.state.loading) return
        this.setState({ loading: true })
        try {
            const nuevosArchivos = this.state.uploadedVouchers.filter((v) => v.file)
            console.log(`[Voucher] Subiendo ${nuevosArchivos.length} archivo(s)`)
            for (const v of nuevosArchivos) {
                const safeName = encodeURIComponent(v.name)
                const uploadUrl = `${SSocket.api.root}upload/empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${safeName}`
                console.log(`[Voucher] → ${uploadUrl}`)
                await this.uploadConTimeout(v.file!, uploadUrl)
                console.log(`[Voucher] ✓ ${v.name}`)
            }
            const vouchersFinales = this.state.uploadedVouchers.map((v) => ({
                name: v.name,
                type: v.type,
                size: v.size,
                lastModified: v.lastModified,
            }))
            const resp = await MDL.caja.editar_detalle({
                key: this.props.key_caja_detalle,
                key_empresa: this.props.key_empresa,
                vouchers: vouchersFinales,
            } as any)
            console.log(`[Voucher] ✓ Guardado`, resp)
            SNotification.send({
                key: "voucher_ok",
                title: "Comprobantes guardados",
                body: "Los comprobantes se guardaron correctamente.",
                color: STheme.color.success,
                time: 2500,
            })
            if (this.props.onSuccess) this.props.onSuccess(resp)
            SPopup.close("PopupUploadVoucher_")
        } catch (error: any) {
            const detalle = error?.in === "timeout"
                ? "El servidor no respondió. Verifica tu conexión."
                : error?.statusText || error?.error || JSON.stringify(error)
            console.error("[Voucher] ✗", error)
            SNotification.send({
                key: "voucher_error",
                title: "Error al guardar",
                body: detalle,
                color: STheme.color.danger,
                time: 5000,
            })
        } finally {
            this.setState({ loading: false })
        }
    }

    limpiarTodos = async () => {
        this.setState({ uploadedVouchers: [], fileValue: [] })
        try {
            await MDL.caja.editar_detalle({
                key: this.props.key_caja_detalle,
                key_empresa: this.props.key_empresa,
                vouchers: [],
            } as any)
            SNotification.send({
                key: "voucher_limpio",
                title: "Comprobantes eliminados",
                body: "Se eliminaron todos los comprobantes.",
                color: STheme.color.info,
                time: 2000,
            })
            SPopup.close("PopupUploadVoucher_")
        } catch (error: any) {
            console.error("[Voucher] Error al limpiar:", error)
        }
    }

    readUrl(name: string) {
        return `${SSocket.api.root}empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${encodeURIComponent(name)}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`
    }

    renderUploadedVouchers() {
        const { uploadedVouchers } = this.state
        if (!uploadedVouchers.length) return null
        return (
            <SView>
                <SView style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, paddingHorizontal: 4 }}>
                    <SView>
                        <SText fontSize={14} bold>Comprobantes adjuntos</SText>
                        <SText fontSize={12} color={STheme.color.lightGray}>
                            {uploadedVouchers.length} {uploadedVouchers.length === 1 ? "archivo" : "archivos"}
                        </SText>
                    </SView>
                    <SView
                        style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#686868", borderRadius: 4 }}
                        onPress={() => SPopup.confirm({
                            title: "Eliminar todos",
                            message: "¿Eliminar todos los comprobantes? Esta acción no se puede deshacer.",
                            onPress: this.limpiarTodos,
                        })}
                    >
                        <SText color="#fff" fontSize={13} bold>Eliminar todos</SText>
                    </SView>
                </SView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4, maxHeight: 120 }} contentContainerStyle={{ paddingHorizontal: 4 }}>
                    {uploadedVouchers.map((v, i) => {
                        const url = v.url ?? this.readUrl(v.name)
                        const esImagen = v.type?.startsWith("image/")
                        return (
                            <SView key={i} style={{ width: 80, height: 90, marginRight: 10, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.card }}>
                                {esImagen
                                    ? <SImage src={url} style={{ width: "100%", height: "100%" }} />
                                    : <SView flex center style={{ padding: 6 }}>
                                        <SText fontSize={26}>📄</SText>
                                        <SHr h={4} />
                                        <SText fontSize={9} center numberOfLines={2}>{v.name}</SText>
                                    </SView>
                                }
                                <SView style={{ position: "absolute", top: 4, right: 4, backgroundColor: "#dc3545", width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center" }} onPress={() => this.removeVoucher(i)}>
                                    <SText color="#fff" fontSize={11} bold>✕</SText>
                                </SView>
                                <SView style={{ position: "absolute", bottom: 4, right: 4, backgroundColor: "#28a745", width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center" }} onPress={() => Linking.openURL(url)}>
                                    <SText color="#fff" fontSize={11}>⬇</SText>
                                </SView>
                            </SView>
                        )
                    })}
                </ScrollView>
                <SHr h={12} />
            </SView>
        )
    }

    renderDropzone() {
        const isEmpty = this.state.fileValue.length === 0
        return (
            <SView style={{ position: "relative" }}>
                <SForm
                    ref={(ref) => (this.form = ref)}
                    inputs={{
                        file: {
                            label: "",
                            type: "files",
                            style: {
                                height: 160, borderWidth: 2, borderColor: STheme.color.card,
                                borderRadius: 8, borderStyle: "dashed", justifyContent: "center",
                                alignItems: "center", backgroundColor: STheme.color.background,
                            },
                            placeholder: "Selecciona o arrastra tus comprobantes aquí",
                            onChangeText: this.handleFileChange,
                        },
                    }}
                    onSubmit={this.handleSubmit}
                />
                {isEmpty && (
                    <SView
                        height={160}
                        style={{ position: "absolute", width: "100%", borderRadius: 8, borderWidth: 2, borderStyle: "dashed", borderColor: "#4786b1" }}
                        backgroundColor="rgba(71,134,177,0.08)"
                        onPress={() => {
                            const input = (globalThis as any)?.document?.querySelector?.('input[type="file"]')
                            if (input?.click) input.click()
                        }}
                    >
                        <SView col="xs-12" row center flex>
                            <SView center>
                                <SView style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#4786b1", alignItems: "center", justifyContent: "center" }}>
                                    <SIconApp name="confirmar" height={22} />
                                </SView>
                                <SHr h={12} />
                                <SText center fontSize={14} bold>Arrastra tus archivos aquí</SText>
                                <SHr h={4} />
                                <SText center fontSize={12} color={STheme.color.lightGray}>o haz clic para seleccionar</SText>
                                <SHr h={8} />
                                <SText fontSize={11} color={STheme.color.lightGray}>PDF, JPG, PNG • Máximo 2 MB</SText>
                            </SView>
                        </SView>
                    </SView>
                )}
            </SView>
        )
    }

    render() {
        const { loading } = this.state
        return (
            <SView col="xs-12">
                <SView center>
                    <SText fontSize={20} bold>Gestión de Comprobantes</SText>
                    <SHr h={4} />
                    <SText fontSize={13} center color={STheme.color.lightGray}>Adjunta los comprobantes de pago de esta transacción</SText>
                </SView>
                <SHr h={16} />
                {this.renderUploadedVouchers()}
                <SView>
                    <SText fontSize={15} bold>Agregar nuevos comprobantes</SText>
                    <SHr h={2} />
                    <SText fontSize={12} color={STheme.color.lightGray}>Puedes seleccionar múltiples archivos a la vez</SText>
                    <SHr h={12} />
                </SView>
                {this.renderDropzone()}
                <SHr h={10} />
                <SView row col="xs-12" center style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: STheme.color.card }}>
                    <Btn type="danger" label="CANCELAR" onPress={() => SPopup.close("PopupUploadVoucher_")} />
                    <SView width={12} />
                    <Btn
                        type="primary"
                        label={loading ? "GUARDANDO..." : "GUARDAR COMPROBANTES"}
                        onPress={() => { if (!loading) this.form?.submit() }}
                    />
                </SView>
            </SView>
        )
    }
}
