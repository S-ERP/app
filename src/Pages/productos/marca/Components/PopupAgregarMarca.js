import React, { Component } from 'react';
import { SForm, SHr, SLoad, SPopup, SText, STheme, SView, Upload } from 'servisofts-component';
import MDL from '../../../../MDL';
import Btn from '../../../empresa/config/Components/Btn';
import InputFoto from '../../../../Components/InputFoto';
import SSocket from 'servisofts-socket';
type Props = {
    editObject?: any;
    onCancel?: Function;
    onSuccess?: Function;
};
export default class PopupAgregarMarca extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupAgregarMarca",
            content: (
                <SView style={{ width: "100%", maxWidth: 500, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.background, }} withoutFeedback >
                    <PopupAgregarMarca
                        {...props}
                        onCancel={() => {
                            SPopup.close("PopupAgregarMarca");
                            props.onCancel?.();
                        }}
                        onSuccess={(e: any) => {
                            SPopup.close("PopupAgregarMarca");
                            props.onSuccess?.(e);
                        }}
                    />
                </SView>
            ),
        });
    }
    state: any = { modelosStock: null, tiposPago: null, };
    form: SForm | null = null;
    _ref: any = {};
    componentDidMount() {
        MDL.inventario.getAllModeloStock()
            .then((data: any) => {
                this.setState({ modelosStock: Object.values(data) });
            })
            .catch(console.error);

        MDL.caja.empresa_tipo_pago_getAll()
            .then((data: any) => {
                this.setState({ tiposPago: Object.values(data) });
            })
            .catch(console.error);
    }
    render() {
        if (!this.state.modelosStock) return <SLoad />;
        return (
            <SView col="xs-12" padding={16}>
                <SText fontSize={16} bold> {this.props.editObject ? "Editar" : "Crear"} Marca </SText>
                <SHr h={16} />
                <SForm row ref={(ref: any) => (this.form = ref)}
                    inputs={{
                        descripcion: {
                            col: "xs-12",
                            label: "Descripción",
                            placeholder: "Ingrese la descripción de la marca",
                            isRequired: true,
                            defaultValue: this.props.editObject?.descripcion,
                            icon: (
                                <InputFoto
                                    ref={(r) => (this._ref.image_perfil = r)}
                                    src={this.props.editObject ? SSocket.api.inventario + "marca/.128_" + this.props.editObject.key : null}
                                    style={{ width: 40, height: 40, borderColor: "red", borderWidth: 1 }}
                                />
                            ),
                        },
                        observacion: {
                            col: "xs-12",
                            label: "Observación",
                            placeholder: "Ingrese la observación de la marca",
                            isRequired: true,
                            defaultValue: this.props.editObject?.observacion,
                        },
                    }}
                    onSubmit={async (data: any) => {
                        const finalData = {
                            ...(this.props.editObject ?? {
                                key_empresa: MDL.empresa.select?.key,
                            }),
                            descripcion: data.descripcion,
                            observacion: data.observacion,
                        };
                        try {
                            const resp: any = await MDL.inventario.saveMarca(finalData);
                            if (this._ref.image_perfil) {
                                const value = this._ref.image_perfil.getValue();
                                if (Array.isArray(value) && value[0]) {
                                    await Upload.sendPromise(
                                        { file: value[0], compress: false },
                                        SSocket.api.inventario + "upload/marca/" + resp.key
                                    );
                                }
                            }
                            this.props.onSuccess?.(resp);
                        } catch (err) {
                            console.error(err);
                            SPopup.alert("Error al guardar la Marca");
                        }
                    }}
                />
                <SHr h={16} />
                <SView row col="xs-12" right>{ }{this.props.onCancel && (
                    <>
                        <Btn type={this.props?.editObject?.quitar ? "succes" : 'danger'} label="CANCELAR" onPress={() => this.props.onCancel?.()} />
                        <SView width={8} />
                    </>
                )}
                    <Btn type="primary" label="GUARDAR" onPress={() => this.form?.submit()} />
                </SView>
            </SView>
        );
    }
}
