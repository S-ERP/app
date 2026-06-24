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
        const key = `PopupUploadVoucher_`
        SPopup.open({
            key,
            content: (<SView style={{ width: "100%", maxHeight: "100%", maxWidth: 550, borderRadius: 12, borderColor: STheme.color.card, borderWidth: 1, backgroundColor: STheme.color.background, padding: 20, }} withoutFeedback >
                <PopupUploadVoucher key_empresa={key_empresa} key_caja_detalle={key_caja_detalle} data_vouchers={data_vouchers} />
            </SView>
            ),
        })
    }
    form: SForm | null = null
    files: File[] = []
    state = {
        loading: false,
        uploadedVouchers: this.props.data_vouchers ?? [],
        fileValue: [],
    }
    componentDidMount() {
        this.validateFileEmpty()
    }
    validateFileEmpty = () => {
        return this.state.fileValue.length === 0
    }
    isFileValid = (file: File) => {
        return file.type.startsWith("image/") || file.type === "application/pdf"
    }
    toJfif = (file: File): File => {
        if (!file.type.startsWith("image/")) return file
        const baseName = file.name.replace(/\.[^/.]+$/, "")
        return new File([file], `${baseName}.jfif`, { type: file.type, lastModified: file.lastModified })
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
        const nuevosArchivos = nuevos
            .filter((item: any) => this.isFileValid(item.file))
            .map((item: any) => {
                const file = this.toJfif(item.file)
                return {
                    file,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                    url: URL.createObjectURL(file),
                }
            })
        const fusionados: VoucherFile[] = [...this.state.uploadedVouchers]
        nuevosArchivos.forEach((nuevo: any) => {
            if (!fusionados.find((f) => f.name === nuevo.name && f.size === nuevo.size)) {
                fusionados.push(nuevo)
            }
        })
        this.setState({ uploadedVouchers: fusionados, fileValue: nuevos })
    }
    removeVoucher = (index: number) => {
        const updated = [...this.state.uploadedVouchers]
        const removed = updated.splice(index, 1)
        this.setState({ uploadedVouchers: updated })
        if (removed[0]?.file) {
            this.files = this.files.filter((f) => f.name !== removed[0].file?.name)
        }
        if (updated.filter((v) => v.file).length === 0) {
            this.setState({ fileValue: [] })
        }
        SNotification.send({
            title: "Comprobante eliminado",
            body: "El comprobante se eliminó correctamente.",
            color: STheme.color.info,
            time: 1500,
        })
    }
    handleSubmit = async () => {
        try {
            this.setState({ loading: true })
            const nuevosArchivos = this.state.uploadedVouchers.filter((v) => v.file)
            for (const v of nuevosArchivos) {
                const uploadUrl = `${SSocket.api.root}upload/empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${encodeURIComponent(v.name)}`
                console.log(`[Voucher] Subiendo: ${v.name} → ${uploadUrl}`)
                await Upload.sendPromise({ file: v.file!, compress: false }, uploadUrl)
                console.log(`[Voucher] ✓ ${v.name}`)
            }
            const vouchersFinales = this.state.uploadedVouchers.map((v) => ({
                name: v.name,
                type: v.type,
                size: v.size,
                lastModified: v.lastModified,
            }))
            const payload = {
                key_empresa: this.props.key_empresa,
                key: this.props.key_caja_detalle,
                vouchers: vouchersFinales,
            }
            const resp = await MDL.caja.editar_detalle(payload)
            SNotification.send({
                title: "Comprobantes guardados",
                body: "Los comprobantes de pago se guardaron correctamente.",
                color: STheme.color.success,
                time: 2500,
            })
            if (this.props.onSuccess) this.props.onSuccess(resp)
            SPopup.close("PopupUploadVoucher_")
        } catch (error) {
            console.error("Error al guardar comprobantes:", error)
            SNotification.send({
                title: "Error al guardar",
                body: "No se pudieron guardar los comprobantes. Por favor, intenta nuevamente.",
                color: STheme.color.danger,
                time: 3000,
            })
        } finally {
            this.setState({ loading: false })
        }
    }
    limpiarTodosLosVouchers = () => {
        this.files = []
        this.setState({ uploadedVouchers: [], fileValue: [] }, () => {
            SNotification.send({
                title: "Comprobantes eliminados",
                body: "Todos los comprobantes fueron eliminados correctamente.",
                color: STheme.color.info,
                time: 1500,
            })
            this.handleSubmit()
        })
    }
    renderUploadedVouchers() {
        const { uploadedVouchers } = this.state
        if (!uploadedVouchers.length) return null
        return (
            <SView>
                <SView style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, paddingHorizontal: 4, }} >
                    <SView>
                        <SText fontSize={14} bold color={STheme.color.text}> Comprobantes adjuntos </SText>
                        <SHr h={2} />
                        <SText fontSize={12} color={STheme.color.lightGray}> {uploadedVouchers.length} {uploadedVouchers.length === 1 ? "archivo" : "archivos"} </SText>
                    </SView>
                    <SView
                        style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#686868ff", borderRadius: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, }}
                        onPress={() => {
                            SPopup.confirm({
                                title: "Eliminar todos los comprobantes",
                                message: "¿Estás seguro de eliminar todos los comprobantes de pago? Esta acción no se puede deshacer.",
                                onPress: () => {
                                    this.limpiarTodosLosVouchers()
                                },
                            })
                        }}
                    >
                        <SText color="#fff" fontSize={13} bold> Eliminar todos </SText>
                    </SView>
                </SView>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -4, maxHeight: 120 }}
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                >
                    {uploadedVouchers.map((v, i) => {
                        const url =
                            v.url ??
                            `${SSocket.api.root}empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${v.name}?time=${new SDate().toString("yyyy-MM-ddThh:mm")}`
                        const esImagen = v.type?.startsWith("image/")
                        return (
                            <SView key={i} style={{ width: 80, height: 90, marginRight: 10, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.card, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, }} >
                                {esImagen ? (
                                    <SImage src={url} style={{ width: "100%", height: "100%" }} />
                                ) : (
                                    <SView flex center style={{ backgroundColor: STheme.color.card, padding: 6 }}> <SText fontSize={28}>📄</SText> <SHr h={4} /> <SText fontSize={9} center numberOfLines={2} color={STheme.color.text}> {v.name} </SText> </SView>
                                )}
                                <SView style={{ position: "absolute", top: 4, right: 4, backgroundColor: "#dc3545", width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, }} onPress={() => this.removeVoucher(i)} >
                                    <SText color="#fff" fontSize={12} bold> ✕ </SText>
                                </SView>
                                <SView style={{ position: "absolute", bottom: 4, right: 4, backgroundColor: "#28a745", width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, }} onPress={() => Linking.openURL(url)} >
                                    <SText color="#fff" fontSize={12}> ⬇ </SText>
                                </SView>
                            </SView>
                        )
                    })}
                </ScrollView>
                <SHr h={12} />
            </SView>
        )
    }
    renderFileEmptyMessage() {
        if (!this.validateFileEmpty()) return null
        return (
            <SView
                height={180}
                style={{
                    position: "absolute",
                    width: "100%",
                    borderRadius: 8,
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: "#4786b1",
                }}
                pointerEvents="auto"
                backgroundColor="rgba(71, 134, 177, 0.08)"
                onPress={() => {
                    const form = this.form
                    if (form && form.inputs?.file?.input) {
                        const inputElement = form.inputs.file.input
                        if (inputElement.click) inputElement.click()
                    } else {
                        const input = document.querySelector('input[type="file"]') as HTMLInputElement
                        if (input) input.click()
                    }
                }}
            >
                <SView col={"xs-12"} row center flex>
                    <SView center>
                        <SView
                            style={{
                                width: 56, height: 56, borderRadius: 28, backgroundColor: "#4786b1", alignItems: "center", justifyContent: "center", shadowColor: "#000",
                                // shadowOffset: { width: 0, height: 2 },
                                // shadowOpacity: 0.2,
                                shadowRadius: 4,
                            }}
                        >
                            <SIconApp name="confirmar" height={24} />
                        </SView>
                        <SHr h={16} />
                        <SText center fontSize={14} bold color={STheme.color.text}>
                            Arrastra tus archivos aquí
                        </SText>
                        <SHr h={6} />
                        <SText center fontSize={13} color={STheme.color.lightGray}>
                            o haz clic para seleccionar
                        </SText>
                        <SHr h={10} />
                        <SText fontSize={11} color={STheme.color.lightGray}>
                            PDF, JPG, PNG • Máximo 10MB
                        </SText>
                    </SView>
                </SView>
            </SView>
        )
    }
    render() {
        return (<SView col={"xs-12"} >
            <SView center>
                <SText fontSize={20} bold color={STheme.color.text}>Gestión de Comprobantes</SText>
                <SHr h={4} />
                <SText fontSize={13} center color={STheme.color.lightGray}>Adjunta los comprobantes de pago de esta transacción</SText>
            </SView>
            <SHr h={16} />
            {this.renderUploadedVouchers()}
            <SView>
                <SText fontSize={15} bold color={STheme.color.text}>Agregar nuevos comprobantes</SText>
                <SHr h={2} />
                <SText fontSize={12} color={STheme.color.lightGray}>Puedes seleccionar múltiples archivos a la vez </SText>
                <SHr h={16} />
            </SView>
            <SView>
                <SForm
                    ref={(ref) => (this.form = ref)}
                    inputs={{
                        file: {
                            label: "",
                            type: "files",
                            style: { height: 180, borderWidth: 2, borderColor: STheme.color.card, borderRadius: 8, borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: STheme.color.background, },
                            placeholder: "📎 Selecciona o arrastra tus comprobantes aquí",
                            onChangeText: this.handleFileChange,
                        },
                    }}
                    onSubmit={this.handleSubmit}
                />
                {this.renderFileEmptyMessage()}
                { }
            </SView>
            <SHr h={10} />
            <SView row col={"xs-12"} center style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: STheme.color.card }}>
                <Btn type="danger" label="CANCELAR" onPress={() => SPopup.close("PopupUploadVoucher_")} />
                <SView width={12} />
                <Btn type="primary" label={this.state.loading ? "GUARDANDO..." : "GUARDAR COMPROBANTES"} onPress={() => this.form?.submit()} />
            </SView>
        </SView>
        )
    }
}
