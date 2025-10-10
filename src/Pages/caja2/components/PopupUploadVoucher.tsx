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
} from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Btn from '../../empresa/config/Components/Btn';
import MDL from '../../../MDL';

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
                        width: '100%',
                        maxHeight: '100%',
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

    state = {
        loading: false,
        uploadedVouchers: this.props.data_vouchers ?? [],
    };

    /** 🔹 Captura los archivos seleccionados y los fusiona con los existentes */
    handleFileChange = (e: any) => {
        const nuevos = Array.isArray(e) ? e.flat() : [];
        if (nuevos.length === 0) {
            return SNotification.send({
                title: 'Sin archivos',
                body: 'Debes seleccionar al menos una imagen.',
                color: STheme.color.warning,
                time: 2500,
            });
        }

        const nuevosArchivos = nuevos.map((item: any) => ({
            file: item.file,
            name: item.file.name,
            type: item.file.type,
            size: item.file.size,
            lastModified: item.file.lastModified,
            url: URL.createObjectURL(item.file), // vista previa local
        }));

        // 🔹 Fusiona: mantiene los existentes + nuevos
        this.setState({
            uploadedVouchers: [...this.state.uploadedVouchers, ...nuevosArchivos],
        });

        // 🔹 Guarda los archivos para subirlos luego
        this.files = [...this.files, ...nuevos.map((it: any) => it.file)];
    };

    /** 🔹 Elimina una imagen del listado (sin afectar servidor aún) */
    removeVoucher = (index: number) => {
        const updated = [...this.state.uploadedVouchers];
        const removed = updated.splice(index, 1);
        this.setState({ uploadedVouchers: updated });

        // También eliminamos el archivo local si existe
        if (removed[0]?.file) {
            this.files = this.files.filter(f => f.name !== removed[0].file?.name);
        }
    };

    /** 🔹 Subir archivos al servidor y registrar en BD */
    handleSubmit = async () => {
        if (!this.state.uploadedVouchers.length) {
            return SNotification.send({
                title: 'Error',
                body: 'Debes tener al menos una imagen.',
                color: STheme.color.danger,
            });
        }

        try {
            this.setState({ loading: true });

            // 1️⃣ Subimos solo los archivos nuevos
            const nuevosArchivos = this.state.uploadedVouchers.filter(v => v.file);
            for (let v of nuevosArchivos) {
                const uploadUrl = `${SSocket.api.root}upload/empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${v.name}`;
                await Upload.sendPromise({ file: v.file, compress: false }, uploadUrl);
            }

            // 2️⃣ Construimos la lista completa (existentes + nuevos)
            const vouchersParaGuardar = this.state.uploadedVouchers.map(v => ({
                name: v.name,
                type: v.type,
                size: v.size,
                lastModified: v.lastModified,
            }));

            const payload = {
                key_empresa: this.props.key_empresa,
                key: this.props.key_caja_detalle,
                vouchers: vouchersParaGuardar,
            };

            const resp = await MDL.caja.editar_detalle(payload);

            SNotification.send({
                title: 'Registro exitoso 🎉',
                body: 'Los vouchers se guardaron correctamente.',
                color: STheme.color.success,
                time: 2500,
            });

            if (this.props.onSuccess) this.props.onSuccess(resp);

            setTimeout(() => SPopup.close(), 500);
        } catch (error) {
            console.error('❌ Error al subir voucher:', error);
            SNotification.send({
                title: 'Error',
                body: 'No se pudo guardar el voucher. Intenta nuevamente.',
                color: STheme.color.danger,
                time: 3000,
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    /** 🔹 Renderiza las imágenes ya registradas o nuevas */
    renderUploadedVouchers() {
        const { uploadedVouchers = [] } = this.state;
        if (!uploadedVouchers.length) return null;

        return (
            <SView>
                <SText bold color={STheme.color.text}>📁 Vouchers registrados:</SText>
                <SHr h={10} />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                >
                    {uploadedVouchers.map((v, i) => {
                        const url =
                            v.url ??
                            `${SSocket.api.root}empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}/${v.name}`;

                        return (
                            <SView
                                key={i}
                                style={{
                                    width: 120,
                                    height: 120,
                                    marginRight: 10,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    borderWidth: 1,
                                    borderColor: STheme.color.card,
                                }}
                            >
                                <SImage src={url} style={{ width: '100%', height: '100%' }} />

                                {/* 🔹 Botón para quitar imagen */}
                                <SView
                                    style={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        backgroundColor: '#00000088',
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => this.removeVoucher(i)}
                                >
                                    <SText color="#fff" bold>
                                        X
                                    </SText>
                                </SView>
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
            <SView col={'xs-12'} padding={12}>
                <SText fontSize={18} bold center color={STheme.color.text}>
                    📤 Subir Voucher
                </SText>
                <SHr h={12} />

                <ScrollView style={{ width: '100%' }}>
                    {/* 🔹 Mostrar archivos ya registrados o nuevos */}
                    {this.renderUploadedVouchers()}

                    {/* 🔹 Formulario para subir nuevos archivos */}
                    <SForm
                        ref={ref => (this.form = ref)}
                        inputs={{
                            file: {
                                label: 'Nuevas imágenes *',
                                type: 'files',
                                isRequired: true,
                                multiple: true,
                                style: {
                                    height: 200,
                                    borderWidth: 1,
                                    borderColor: STheme.color.card,
                                    borderRadius: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                },
                                placeholder: 'Selecciona o arrastra las imágenes aquí 📎',
                                onChangeText: this.handleFileChange,
                            },
                        }}
                        onSubmit={this.handleSubmit}
                    />
                </ScrollView>

                <SHr h={20} />

                <SView row col={'xs-12'} center>
                    <Btn
                        type="danger"
                        label="CANCELAR"
                        onPress={() => SPopup.close()}
                    />
                    <SView width={10} />
                    <Btn
                        type="primary"
                        label={this.state.loading ? 'GUARDANDO...' : 'GUARDAR'}
                        disabled={this.state.loading}
                        onPress={() => this.form?.submit()}
                    />
                </SView>

                {this.state.loading && (
                    <SView
                        style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#00000066',
                            justifyContent: 'center',
                            alignItems: 'center',
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
