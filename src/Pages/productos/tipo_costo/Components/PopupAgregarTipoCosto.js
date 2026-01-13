import React, { Component } from 'react';
import { SForm, SHr, SLoad, SPopup, SText, STheme, SView, } from 'servisofts-component';
import MDL from '../../../../MDL';
import Btn from '../../../empresa/config/Components/Btn';
// import MDL from '../MDL';
// import Btn from './empresa/config/Components/Btn';
const cuentaToText = (c: any) =>
    c ? `${c.codigo} - ${c.descripcion}` : "";
const findCuentaText = (arr: any[], text: string) =>
    arr.find(c => cuentaToText(c) === text) ?? null;
type Props = {
    editObject?: any;
    onCancel?: Function;
    onSuccess?: Function;
};
export default class PopupAgregarTipoCosto extends Component<Props> {
    static open(props: Props) {
        SPopup.open({
            key: "PopupAgregarTipoCosto",
            content: (
                <SView style={{ width: "100%", maxWidth: 500, borderRadius: 8, borderWidth: 1, borderColor: STheme.color.card, backgroundColor: STheme.color.background, }} withoutFeedback >
                    <PopupAgregarTipoCosto
                        {...props}
                        onCancel={() => {
                            SPopup.close("PopupAgregarTipoCosto");
                            props.onCancel?.();
                        }}
                        onSuccess={(e: any) => {
                            SPopup.close("PopupAgregarTipoCosto");
                            props.onSuccess?.(e);
                        }}
                    />
                </SView>
            ),
        });
    }
    state: any = {
        cuentas: null,
    };
    form: SForm | null = null;
    componentDidMount() {
        MDL.contabilidad
            .getCuentas()
            .then((cuentas: any) => {
                const arr = Object.values(cuentas);
                arr.forEach((cuenta: any) => {
                    cuenta.cantidad_hijas = arr.filter(
                        (c: any) =>
                            c.codigo.startsWith(cuenta.codigo) &&
                            c.codigo !== cuenta.codigo
                    ).length;
                });
                this.setState({
                    cuentas: arr.sort((a: any, b: any) =>
                        a.codigo > b.codigo ? 1 : -1
                    ),
                });
            })
            .catch(console.error);
    }
    render() {
        if (!this.state.cuentas) return <SLoad />;
        return (
            <SView col="xs-12" padding={16}>
                <SText fontSize={16} bold>
                    {this.props.editObject ? "Editar" : "Crear"} Tipo de Costo
                </SText>
                <SHr h={16} />
                <SForm
                    ref={(ref: any) => (this.form = ref)}
                    inputs={{
                        descripcion: {
                            col: "xs-12",
                            label: "Descripción",
                            placeholder: "Ingrese la descripción",
                            isRequired: true,
                            defaultValue: this.props.editObject?.descripcion,
                        },
                        key_cuenta_contable: {
                            col: "xs-12",
                            type: "select2",
                            label: "Cuenta Contable",
                            defaultValue: cuentaToText(
                                this.state.cuentas.find(
                                    (c: any) =>
                                        c.key ===
                                        this.props.editObject?.key_cuenta_contable
                                )
                            ),
                            options: this.state.cuentas
                                .filter((c: any) => c.cantidad_hijas <= 0)
                                .map(cuentaToText),
                        },
                    }}
                    onSubmit={(data: any) => {
                        const finalData = {
                            ...(this.props.editObject ?? {
                                key_empresa: MDL.empresa.select?.key,
                            }),
                            descripcion: data.descripcion,
                            key_cuenta_contable: findCuentaText(
                                this.state.cuentas,
                                data.key_cuenta_contable
                            )?.key,
                        };
                        MDL.inventario
                            .saveTipoCosto(finalData)
                            .then((resp: any) => {
                                this.props.onSuccess?.(resp);
                            })
                            .catch((err: any) => {
                                console.error(err);
                                SPopup.alert(
                                    "Error al guardar el Tipo de Costo"
                                );
                            });
                    }}
                />
                <SHr h={16} />
                <SView row col="xs-12" right>
                    {this.props.onCancel && (
                        <>
                            <Btn
                                type="danger"
                                label="CANCELAR"
                                onPress={() => this.props.onCancel?.()}
                            />
                            <SView width={8} />
                        </>
                    )}
                    <Btn
                        type="primary"
                        label="GUARDAR"
                        onPress={() => this.form?.submit()}
                    />
                </SView>
            </SView>
        );
    }
}