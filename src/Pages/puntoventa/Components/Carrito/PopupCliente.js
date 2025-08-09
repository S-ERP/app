import React, { Component } from 'react';
import { SView, SText, STheme, SForm, SPopup, SInput, SMath, SNotification, SThread, SHr } from 'servisofts-component';
import SIconApp from '../../../../Assets/SIconApp';
import MDL from '../../../../MDL';
export default class PopupCliente extends Component {
    static instance = null; // guardamos la referencia aquí
    clienteDataCompleto = null;
    form: SForm | null = null;
    static open(props) {
        SPopup.open({
            key: "popup_config_horario",
            type: 1,
            content: (
                <SView col="xs-10 sm-9 " center backgroundColor={STheme.color.background} style={{
                    borderRadius: 8, maxWidth: 400,
                    shadowColor: "#18181b",
                    shadowOffset: { width: 5, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 60,
                }} padding={24} withoutFeedback>
                    <PopupCliente ref={(ref) => PopupCliente.instance = ref}  {...props} />
                </SView>
            )
        });
    }
    componentDidMount() {
        setTimeout(() => {
            this.hanldeEditTelefono();
        }, 100);
    }
    hanldeEditTelefono = () => {
        MDL.crm.cliente.buscar_nit(this.form?.getValues().nit).then(e => {
            this.clienteDataCompleto = e;
            this.form?.setValues({
                razon_social: e?.razon_social || "",
                correo: e?.correo || "",
                nombres: e?.nombres || "",
            })
            this.forceUpdate()
        }).catch(e => {
            this.form?.setValues({
                razon_social: "",
                correo: "",
                nombres: "",
            })
        })
    }
    render() {
        let formRef;
        const defaultData = this.data?.cliente ?? {};
        return (
            <SView col="xs-12" center>
                <SView height={8} />
                <SText fontSize={18} bold center>Datos del Cliente</SText>
                <SView height={8} />
                <SForm row ref={(ref: any) => this.form = ref}
                    style={{ justifyContent: "space-between" }}
                    inputs={{
                        nit: {
                            col: "xs-12",
                            label: "Nit",
                            type: 'number',
                            required: true,
                            autoFocus: true,
                            defaultValue: defaultData?.nit,
                            iconR: <SView width={30} height={30} center onPress={() => {
                                this.hanldeEditTelefono();
                            }}>
                                <SIconApp name='Search' fill={STheme.color.lightGray} />
                            </SView>,
                            onChangeText: (text: string) => {
                                new SThread(2000, "buscar_nit", true).start(() => {
                                    this.hanldeEditTelefono();
                                })
                            },
                            onSubmitEditing: () => {
                                this.hanldeEditTelefono();
                                this.form?.focus("razon_social")
                            }
                        },
                        razon_social: {
                            col: "xs-12",
                            disabled: true,
                            label: "razon social",
                            defaultValue: defaultData?.razon_social,
                            onSubmitEditing: () => this.form?.focus("correo"),
                        },
                        correo: {
                            col: "xs-12",
                            label: "Correo",
                            disabled: true,
                            defaultValue: defaultData?.correo,
                            onSubmitEditing: () => this.form?.focus("nombres"),
                        },
                        nombres: {
                            col: "xs-12",
                            disabled: true,
                            label: "Nombre completo",
                            defaultValue: defaultData?.nombres,
                        },
                    }} />
                <SHr />
                <SView row col={"xs-12"}>
                    <SView flex />
                    <SView center style={{ borderColor: STheme.color.card, borderWidth: 2, borderRadius: 4, width: 90, height: 32 }}
                        onPress={() => {
                            SPopup.close("popup_config_horario");
                        }}
                    >
                        <SText color={STheme.color.text}>Cancelar</SText>
                    </SView>
                    <SView width={8} />
                    <SView center style={{ backgroundColor: "#18181b", borderColor: STheme.color.gray, borderWidth: 2, borderRadius: 4, width: 90, height: 32 }}
                        onPress={() => {
                            this.props.onReloadCliente?.(this.clienteDataCompleto);
                            SPopup.close("popup_config_horario");
                        }}
                    >
                        <SText color={STheme.color.background}>Aceptar</SText>
                    </SView>
                </SView>
            </SView >
        );
    }
}
