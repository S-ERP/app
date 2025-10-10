import React, { Component } from 'react';
import { ScrollView } from 'react-native';
import {
    SForm,
    SHr,
    SNotification,
    SPopup,
    SText,
    STheme,
    SView,
    Upload,
} from 'servisofts-component';
import SSocket from 'servisofts-socket';
import InputFoto from '../../../Components/InputFoto';
import Btn from '../../empresa/config/Components/Btn';

export default class PopupUploadVoucher extends Component<{
    key_empresa: string;
    key_caja_detalle: string;

    popupKey?: string;
}> {
    static open(key_empresa: string, key_caja_detalle: string) {
        const popupKey = `PopupUploadVoucher_${Date.now()}`;
        SPopup.open({
            key: popupKey,
            content: (
                <SView
                    style={{
                        width: '100%',
                        maxWidth: 500,
                        borderRadius: 12,
                        borderColor: STheme.color.card,
                        borderWidth: 1,
                        backgroundColor: STheme.color.background,
                        padding: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                        elevation: 5,
                    }}
                    withoutFeedback
                >
                    <PopupUploadVoucher key_empresa={key_empresa} key_caja_detalle={key_caja_detalle} popupKey={popupKey} />
                </SView>
            ),
        });
    }

    inpimagen: any;
    ref_form: any;
    state = { loading: false };

    renderForm() {
        // const url = SSocket.api.root + `empresa/${this.props.key_empresa}/voucher.png`;
        const url = SSocket.api.root + `empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}.png`;

        return (
            <SView col={'xs-12'} center>
                {/* Imagen con preview */}
                <SView
                    col={'xs-12'}
                    style={{
                        borderRadius: 10,
                        overflow: 'hidden',
                        height: 220,
                        backgroundColor: STheme.color.card,
                        borderWidth: 1,
                        borderColor: STheme.color.lightGray,
                    }}
                    center
                >
                    <InputFoto
                        ref={(ref) => (this.inpimagen = ref)}
                        src={url}
                        style={{ width: '100%', height: '100%' }}
                    />
                </SView>

                <SHr h={20} />
                <SText
                    fontSize={13}
                    color={STheme.color.text}
                    center
                    style={{ opacity: 0.8 }}
                >
                    Selecciona una nueva imagen para reemplazar el voucher actual.
                </SText>
            </SView>
        );
    }

    handleUpload = async () => {
        try {
            if (!this.inpimagen) {
                SNotification.send({
                    title: 'Error',
                    body: 'No se encontró el campo de imagen.',
                    color: STheme.color.error,
                });
                return;
            }

            const value = this.inpimagen.getValue();
            if (!value || !Array.isArray(value) || value.length === 0) {
                SNotification.send({
                    title: 'Error',
                    body: 'Debes seleccionar una imagen antes de subir.',
                    color: STheme.color.error,
                });
                return;
            }

            // const uploadUrl =  SSocket.api.root + `upload/empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}.png`;
            console.log("miradasaaaa   " + this.props.key_empresa)
            console.log("miradasaaaa2   " + this.props.key_caja_detalle)

            const uploadUrl =
                SSocket.api.root + `upload/empresa/${this.props.key_empresa}/voucher/${this.props.key_caja_detalle}.png`;

            console.log("miradasaaaa3   " + uploadUrl)

            this.setState({ loading: true });

            await Upload.sendPromise(
                {
                    file: value[0],
                    compress: false,
                },
                uploadUrl
            );

            SNotification.send({
                title: 'Éxito',
                body: 'La imagen se subió correctamente.',
                color: STheme.color.success,
                time: 3000,
            });

            this.setState({ loading: false });
            if (this.props.popupKey) SPopup.close(this.props.popupKey);
        } catch (err) {
            console.error(err);
            this.setState({ loading: false });
            SNotification.send({
                title: 'Error',
                body: 'No se pudo subir la foto.',
                color: STheme.color.error,
                time: 4000,
            });
        }
    };

    render() {
        return (
            <SView col={'xs-12'} center>
                <SText
                    fontSize={18}
                    bold
                    color={STheme.color.text}
                    center
                >
                    Subir Foto de Voucher
                </SText>
                <SHr h={16} />
                <ScrollView style={{ width: '100%' }}>
                    {this.renderForm()}
                </ScrollView>
                <SHr h={20} />
                <SView row col={'xs-12'} center>
                    <Btn
                        type="danger"
                        label="CANCELAR"
                        onPress={() => {
                            if (this.props.popupKey) SPopup.close(this.props.popupKey);
                        }}
                    />
                    <SView width={10} />
                    <Btn
                        type="primary"
                        label="SUBIR"
                        onPress={this.handleUpload}
                        loading={this.state.loading}
                    />
                </SView>
            </SView>
        );
    }
}
