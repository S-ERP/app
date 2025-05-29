
import React, { Component } from 'react';
import { View, Text } from 'react-native';
import MDL from '../../../MDL';
import { DinamicTable } from 'servisofts-table';
import { SForm, SHr, SIcon, SInput, SNotification, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import PButtom from '../../../Components/PButtom';
import PopupBuscaRazon from './PopupBuscaRazon';


type PopupRazonType = {
    onRegister: (e: any) => void,
    onActualizar: (e: any) => void,
    onCancel?: () => void,
}

export default class PopupRazon extends Component<PopupRazonType & { defaultData?: any }> {
    static open(props: PopupRazonType) {
        SPopup.open({
            key: "ppuprellamada",
            content: <SView backgroundColor={STheme.color.background} style={{ borderRadius: 8, maxWidth: 320 }} padding={16} withoutFeedback col={"xs-11"}>
                <PopupRazon {...props} onRegister={(e) => {
                    SPopup.close("ppuprellamada")
                    if (props.onRegister) props.onRegister(e)
                }}
                    onCancel={() => {
                        SPopup.close("ppuprellamada")
                        if (props.onCancel) props.onCancel()
                    }}
                />
            </SView>
        })
    }

    time(text: string) {
        return <SView col={"xs-2.4"} style={{ padding: 4 }}>
            <SView padding={5} style={{
                backgroundColor: STheme.color.card,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
            }}>
                <SText fontSize={10} color={STheme.color.text} bold>{text}</SText>
            </SView>
        </SView>
    }

    getOptionsRazon() {
        return [
            { key: "", content: "--" },
            { key: "1", content: "13. Publicidad tiene información diferente sobre el producto por ejemplo, pastillas en vez de gel" },
            { key: "2", content: "25. El cliente pensó que había ganado un regalo gratis." },
            { key: "3", content: "17. Barrera de lenguaje." },
            { key: "4", content: "28. Cliente menor de 18 años" },
        ]
    }

    form: SForm | null = null;
    inputdocumento: SInput | undefined;
    popupBuscaRazon: PopupBuscaRazon | undefined;
    render() {

        const { defaultData } = this.props;


        return <SView center>
            <SText bold>{"Indique la razón de spam"}</SText>
            <SHr height={20} />

            <SForm row
                ref={(ref: any) => this.form = ref}
                style={{
                    justifyContent: "space-between",
                }}
                inputs={{
                    "fecha": {
                        col: "xs-12",
                        label: "Seleccione una razón *", type: "select", autoFocus: true, required: true, defaultValue: defaultData?.nombre,
                        options: this.getOptionsRazon(), height: 50,
                    },
                }}
                onSubmit={(e: any) => {

                    const data = { ...defaultData, ...e };
                    const prom = data?.key ? MDL.crm.proyecto.editar(data) : MDL.crm.proyecto.registrar(data);

                    SNotification.send({ key: "registro", title: "Guardando...", type: "loading" });

                    prom.then((res) => {
                        SNotification.send({ key: "registro", title: data?.key ? "Actualizado" : "Registrado", color: STheme.color.success, time: 5000 });
                        if (data?.key) {
                            this.props.onActualizar?.(res);
                        } else {
                            this.props.onRegister?.(res);
                        }
                        SPopup.close("ppuprellamada");
                    }).catch((err) => {
                        SNotification.send({ key: "registro", title: "Error", body: err, color: STheme.color.danger });
                    });

                    // MDL.crm.proyecto.registrar(e).then((e: any) => {
                    //     SNotification.send({
                    //         key: "registro",
                    //         title: "Registrado con exito",
                    //         color: STheme.color.success,
                    //         time: 5000,
                    //     })
                    //     if (this.props.onRegister) this.props.onRegister(e)
                    // }).catch((e: any) => {
                    //     SNotification.send({
                    //         key: "registro",
                    //         title: "Error al registrar",
                    //         body: e,
                    //         color: STheme.color.danger,
                    //         time: 5000,
                    //     })
                    // })

                }}
            />
            <SHr />
            <SView col={"xs-12"} row center>
                <SInput ref={ref => this.inputdocumento = ref ?? undefined} flex
                    onFocus={(e) => {
                        PopupBuscaRazon.open({
                            e: e,
                            defaultValue: "",
                            ref: (ref) => this.popupBuscaRazon = ref,
                            onClose: () => this.popupBuscaRazon = undefined,
                            onSelect: (e) => {
                                console.log(e);
                                // if (this.inpnit) this.inpnit.setValue(e.codigotipodocumentoidentidad)
                                // if (this.inputdocumento) this.inputdocumento.setValue(e.numerodocumento)
                                // if (this.inprazonsocial) this.inprazonsocial.setValue(e.nombrerazonsocial)
                                // this.props.factura.data.codigoTipoDocumentoIdentidad = e.codigotipodocumentoidentidad
                                // this.props.factura.data.numeroDocumento = e.numerodocumento
                                // this.props.factura.data.nombreRazonSocial = e.nombrerazonsocial
                                this.setState({ ...this.state })
                                PopupBuscaRazon.close();

                            }
                        })
                    }}
                    onBlur={() => {
                        new SThread(300, "CerrarPopupBuscarNit", true).start(() => {
                            PopupBuscaRazon.close();

                        })
                    }}
                    onChangeText={e => {
                        // this.props.factura.data.numeroDocumento = e
                        if (this.popupBuscaRazon) {
                            this.popupBuscaRazon.buscar(e)
                        }
                        // new SThread(1000, "Asda", true).start(() => {
                        //     if (this.props.factura.data.codigoTipoDocumentoIdentidad == "5") {
                        //         console.log("Verificando el nit")
                        //         MDL.factura.verificarNit(this.props.factura.data.numeroDocumento).then(e => {
                        //             console.log(e);
                        //         }).catch(e => {
                        //             console.log(e);
                        //         })
                        //     }

                        // })
                    }} />
            </SView>
            <SHr height={20} />

            <SView row col={"xs-12"}>
                {this.props.onCancel && <>
                    <PButtom flex type='danger' onPress={() => {
                        if (this.props.onCancel) this.props.onCancel()
                    }}>CANCELAR</PButtom>
                    <SView width={8} />
                </>}

                <PButtom flex type="secondary" onPress={() => this.form?.submit()}>{defaultData ? "ACTUALIZAR" : "ACEPTAR"}</PButtom>

                {/* <PButtom flex type='primary' onPress={() => {
                    if (this.form) this.form.submit();
                }}>CREAR</PButtom> */}
            </SView>
        </SView >
    }
}
