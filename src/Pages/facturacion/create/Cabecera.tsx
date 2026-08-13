import React from "react";
import { SDate, SHr, SInput, SLoad, SNotification, SPage, SPopup, SText, STheme, SThread, SView } from "servisofts-component";
import Label from "./Label";
import { Factura } from "../../../MDL/factura/type";
import { Parametricas } from "../../../MDL/factura/typeParametricas";
import MDL from "../../../MDL";
import PopupBuscarNit from "./PopupBuscarNit";



type CabeceraProps = {
    factura: Factura,
    parametricas?: Parametricas
}
const customStyle: any = "factura";
export default class Cabecera extends React.Component<CabeceraProps> {

    inpnit: SInput | undefined;
    inputdocumento: SInput | undefined;
    inprazonsocial: SInput | undefined;
    popupBuscarNit: PopupBuscarNit | undefined;
    render() {
        const { fechaEmision, numeroDocumento, nombreRazonSocial, codigoCliente } = this.props.factura.data
        return <SView center row>
            <SView col={"xs-12 sm-5"} row center>
                <Label bold >{"Fecha"}</Label>
                <SView width={16} />
                <SInput flex
                    customStyle={customStyle}
                    defaultValue={new SDate(fechaEmision, "yyyy-MM-ddThh:mm:ss").toString("yyyy-MM-dd hh:mm:ss")}
                    onChangeText={e => {
                        this.props.factura.data.fechaEmision = e.trim()
                    }} />
                <SHr />
            </SView>
            <SView col={"sm-2"} />
            <SView col={"xs-12 sm-5"} row center>
                <SView width={50}>
                    {!this.props?.parametricas?.tipoDocumentoIdentidad ? <SLoad /> : <>
                        <SInput customStyle={customStyle} defaultValue={this.props.factura.data.codigoTipoDocumentoIdentidad}
                            ref={ref => this.inpnit = ref as SInput}
                            type="select"
                            options={(this.props.parametricas?.tipoDocumentoIdentidad ?? []).map(a => {
                                return {
                                    key: a.codigoClasificador,
                                    content: a.descripcion,
                                    renderResult: (v: string) => {
                                        return v.split("-")[0]
                                    }
                                }
                            })}
                            onChangeText={e => {
                                // console.log(e);
                                this.props.factura.data.codigoTipoDocumentoIdentidad = e.trim()
                                this.setState({ ...this.state })
                            }} />
                    </>}
                </SView>
                <SView width={8} />
                <SInput ref={ref => this.inputdocumento = ref ?? undefined} flex customStyle={customStyle} defaultValue={numeroDocumento}
                    onFocus={(e) => {
                        PopupBuscarNit.open({
                            e: e,
                            defaultValue: numeroDocumento,
                            ref: (ref) => this.popupBuscarNit = ref,
                            onClose: () => this.popupBuscarNit = undefined,
                            onSelect: (e) => {
                                console.log(e);
                                if (this.inpnit) this.inpnit.setValue(e.codigotipodocumentoidentidad)
                                if (this.inputdocumento) this.inputdocumento.setValue(e.numerodocumento)
                                if (this.inprazonsocial) this.inprazonsocial.setValue(e.nombrerazonsocial)
                                this.props.factura.data.codigoTipoDocumentoIdentidad = e.codigotipodocumentoidentidad
                                this.props.factura.data.numeroDocumento = e.numerodocumento
                                this.props.factura.data.nombreRazonSocial = e.nombrerazonsocial
                                this.setState({ ...this.state })
                                PopupBuscarNit.close();

                            }
                        })
                    }}
                    onBlur={() => {
                        new SThread(300, "CerrarPopupBuscarNit", true).start(() => {
                            PopupBuscarNit.close();

                        })
                    }}
                    onChangeText={e => {
                        this.props.factura.data.numeroDocumento = e.trim()
                        if (this.popupBuscarNit) {
                            this.popupBuscarNit.buscar(e.trim())
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

                {["1", "2"].includes(this.props.factura.data.codigoTipoDocumentoIdentidad + "") && <>
                    <SView width={8} />
                    <SView width={50}>
                        <SInput customStyle={customStyle}
                            defaultValue={""}
                            placeholder={"Comp."}
                            // type="select"
                            // options={}
                            onChangeText={e => {
                                this.props.factura.data.complemento = e.trim()

                            }} />
                    </SView>
                </>}

                <SHr />

                {/* <Label style={{ width: 90 }} >{"__CLINETE_NIT_"}</Label> */}
            </SView>

            <SView col={"xs-12 sm-5"} row center>
                <Label bold >{"Nombre/Razón Social"}</Label>
                <SView width={16} />
                <SInput ref={ref => this.inprazonsocial = ref ?? undefined} flex customStyle={customStyle} defaultValue={nombreRazonSocial} onChangeText={e => {
                    this.props.factura.data.nombreRazonSocial = e.trim()
                }} />
                <SHr />
                {/* <Label style={{ width: 90 }} >{"__CLINETE_NIT_"}</Label> */}
            </SView>
            <SView col={"sm-2"} />
            <SView col={"xs-12 sm-5"} row center>
                <Label bold >{"Cod. Cliente"}</Label>
                <SView width={8} />
                <SInput flex customStyle={customStyle} defaultValue={codigoCliente} onChangeText={e => {
                    this.props.factura.data.codigoCliente = e.trim()
                }} />
                <SHr />
                {/* <Label style={{ width: 90 }} >{"__CLINETE_NIT_"}</Label> */}
            </SView>
        </SView>
    }
}