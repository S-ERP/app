import React, { Component } from 'react';
import { SView, SText, STheme, SNavigation, SMath, SInput, SButtom, SPopup, SNotification, SForm, SHr, SThread } from 'servisofts-component';
import MDL from '../../MDL';
import FotoCliente from './Components/Foto/FotoCliente';
import SIconApp from '../../Assets/SIconApp';
// import FotoCliente from '../Foto/FotoCliente';
// import Model from '../../../../Model';
// import MDL from '../../../../MDL';
// import SIconApp from '../../../../Assets/SIconApp';
// import PButtom from '../../../../Components/PButtom';
// import PButtom3 from '../../../../Components/PButtom3';
// // import ResumenTotales from './ResumenTotales';
// import ConfirmarPago from './ConfirmarPago';
// import ResumenTotales from './Components/Carrito/ResumenTotales';
export default class Galaxia extends Component {
    constructor(props) {
        super(props);
        this.data = props.data;
        this.carrito = props.carrito;
        this.carritonuevo = props.carritonuevo;
        this.showPaymentModal = false;
        this._recibido = "";
        this._devolvido = "";
        this.descuentoManual = "";
    }

    componentDidMount() {


        setTimeout(() => {
            this.hanldeEditTelefono();
        }, 100);
    }



    hanldeEditTelefono = () => {
        MDL.crm.cliente.buscar_nit(this.form?.getValues().nit).then(e => {
            this.clienteDataCompleto = e;

            // this.props.onReload(e);

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
            console.log(e)
        })
    }
    form: SForm | null = null;
    seleccionarCliente() {
        let formRef;
        const defaultData = this.data?.cliente ?? {};
        SPopup.open({
            key: "PopupClienteManual",
            type: 1,
            content: (
                <SView
                    col="xs-11"
                    withoutFeedback
                    padding={24}
                    backgroundColor={STheme.color.background}
                    style={{
                        maxWidth: 320,
                        borderRadius: 12,
                        shadowColor: "#18181b",
                        shadowOffset: { width: 5, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 60,
                    }}
                >
                    <SText fontSize={18} bold center>Datos del Cliente</SText>
                    { }
                    <SForm row ref={(ref: any) => this.form = ref}
                        style={{ justifyContent: "space-between" }}
                        inputs={{
                            nit: {
                                col: "xs-12",
                                label: "Nit",
                                type: 'number',
                                backgroundColor: "red",
                                background: "blue",
                                borderColor: "red",
                                required: true,
                                autoFocus: true,
                                defaultValue: defaultData?.nit,
                                iconR: <SView width={30} height={30} center onPress={() => {
                                    this.hanldeEditTelefono();
                                }}>
                                    <SIconApp name='Search' fill={STheme.color.lightGray} />
                                </SView>,
                                onChangeText: (text: string) => {
                                    // this.form.setValues({ "razon_social": text });
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
                                label: "razon socialsssssss",
                                // defaultValue: this.form?.getValues().nit,
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
                        <SView center style={{ borderColor: STheme.color.card, borderWidth: 2, borderRadius: 4, width: 90, height: 32 }} >
                            <SText color={STheme.color.text}>Cancelar</SText>
                        </SView>
                        <SView width={8} />
                        <SView center style={{ backgroundColor: "#18181b", borderColor: STheme.color.gray, borderWidth: 2, borderRadius: 4, width: 90, height: 32 }}
                            onPress={() => {
                                const data = this.clienteDataCompleto;
                                if (!data) return;

                                if (!this.data) this.data = {}; // 🛡️ Protección contra undefined

                                this.data.cliente = data;

                                this.props.onReload2?.(this.data.cliente);

                                this.clienteDataCompleto = null;

                                this.forceUpdate();
                                SPopup.close("PopupClienteManual");
                            }}
                        >
                            <SText color={STheme.color.background}>Aceptar</SText>
                        </SView>
                    </SView>
                </SView>
            )
        });
    }


    renderTecladoNumerico = () => {
        const cliente = this.data?.cliente ?? {};

        console.log("espectro " + cliente);

        const { key, nombres, apellidos, telefono, nombre_completo } = cliente;
        const style_text = {
            color: STheme.color.text,
            fontSize: 12,
            fontWeight: "bold",
        };
        const teclas = [
            ["1", "2", "3", "Cant"],
            ["4", "5", "6", "% desc."],
            ["7", "8", "9", "Precio"],
            ["+/-", "0", ".", "<"]
        ];
        return (
            <>
                <SView col={"xs-0 sm-12"} row color={STheme.color.danger}>
                    <SView col={"xs-4"}>


                        <SView center backgroundColor={STheme.color.darkGray} border={STheme.color.card} style={{ height: 44, borderRadius: 2, margin: 2 }}>
                            <SView col={"xs-12 md-12"} row center onPress={() => this.seleccionarCliente()}>
                                <SView col={"xs-5 md-5"}    >
                                    <SView center backgroundColor={STheme.color.background} style={{
                                        minWidth: 10, width: 30, minHeight: 10, height: 30, borderRadius: 18, margin: 4,
                                        marginRight: (key ? 6 : 14), overflow: "hidden",
                                    }}>
                                        <FotoCliente data={cliente} />
                                    </SView>
                                </SView>
                                <SView flex  >
                                    <SText style={{ ...style_text, fontSize: 12 }}>{nombres || "Cliente"}</SText>
                                    {key ? <SText style={{ ...style_text, fontSize: 12, color: "#26e9aeff" }}>Cliente</SText> : null}
                                </SView>
                            </SView>
                        </SView>
                    </SView>
                </SView>


            </>
        );
    };
    render() {
        return <>
            { }
            {this.renderTecladoNumerico()}
            { }
        </>
    }
}
