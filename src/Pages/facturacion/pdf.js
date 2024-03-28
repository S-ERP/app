import React, { Component } from 'react';
import { SDate, SLoad, SPopup, SText, SView } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf'
import label from '../../Components/label';
const textStyle = {
    font: "Roboto",
    fontSize: 10,
}
export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        this.handlePress();
    }


    renderTotalesDetalle({ label, monto }) {
        return <SPDF.View style={{ width: "100%", flexDirection: "row", height: 18, }}>
            <SPDF.View style={{ flex: 2, height: "100%", alignItems: "center", borderWidth: 1, justifyContent: "center", alignItems: "center" }}>
                <SPDF.Text style={{ ...textStyle, fontSize: 8, alignItems: "center", }}>{label}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ flex: 1, height: "100%", borderWidth: 1, alignItems: "center", justifyContent: "center" }}>
                <SPDF.Text style={{ ...textStyle, fontSize: 9, }}>{monto}</SPDF.Text>
            </SPDF.View>
        </SPDF.View>
    }
    renderTotales() {
        return <SPDF.View style={{ width: "100%", height: "100%", }}>
            {this.renderTotalesDetalle({ label: "SUBTOTAL Bs", monto: "299.00 " })}
            {this.renderTotalesDetalle({ label: "DESCUENTO Bs", monto: "299.00 " })}
            {this.renderTotalesDetalle({ label: "TOTAL Bs", monto: "299.00 " })}
            {this.renderTotalesDetalle({ label: "MONTO GIFT CARD Bs", monto: "299.00 " })}
            {this.renderTotalesDetalle({ label: "MONTO A PAGAR Bs", monto: "299.00 " })}
            {this.renderTotalesDetalle({ label: "IMPORTE BASE CREDITO FISCAL Bs", monto: "299.00 " })}
        </SPDF.View>
    }

    handlePress() {

        SPDF.create(<SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8, }} >
            <SPDF.View style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                height: 120
            }}>
                <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"CALISTENIA BOLIVIA S.R.L"}</SPDF.Text>
                    <SPDF.View style={{ height: 4 }}></SPDF.View>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"CASA MATRIZ"}</SPDF.Text>
                    <SPDF.View style={{ height: 4 }}></SPDF.View>
                    <SPDF.Text style={{ ...textStyle, width: "100%", alignItems: "center" }}>{"SUC. 1-CALLE JOSE VASQUEZ NRO. S/N ZONA/BARRIO: EL TROMPILLO UV:0025 MZA:0043"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 2, }} />
                <SPDF.View style={{ flex: 3, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"NIT"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{"308210028"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"FACTURA N"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{"223"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>{"CÓD. AUTORIZACIÓN"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90, alignItems: "center", width: 90 }}>{"1516AD90C2ACFD15C0C1507F367F4494D91FF0C5689055751E2878E74"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 16, }}>{"FACTURA"}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, }}>{"(Con Derecho a Credito Fiscal)"}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 12 }} />
            <SPDF.View style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                height: 30,
            }}>
                <SPDF.View style={{ flex: 1, alignItems: "center", height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10, justifyContent: "center", fontWeight: "bold" }}>{"Fecha"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{"26/03/2024 09:33 PM"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>{"Nombre/Razon Social"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{"SERVISOFTS SRL"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, }} />
                <SPDF.View style={{ flex: 1, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>{"NIT/CI/CEX"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{"454561021"}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>{"Cod. Cliente"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{"0"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 16, }}></SPDF.View>
            <SPDF.View style={{
                width: "100%",
                height: 44,
                flexDirection: "row"
            }}>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 10, fontWeight: "bold", alignItems: "center", }}>{"CÓDIGO PRODUCTO / SERVICIO"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 10, fontWeight: "bold", alignItems: "center", }}>{"CANTIDAD"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 10, fontWeight: "bold", alignItems: "center", }}>{"UNIDAD DE MEDIDA"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 10, fontWeight: "bold", alignItems: "center", }}>{"DESCRIPCION"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 10, fontWeight: "bold", alignItems: "center", }}>{"PRECIO UNITARIO"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 10, fontWeight: "bold", alignItems: "center", }}>{"DESCUENTO"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 10, fontWeight: "bold", alignItems: "center", }}>{"SUBTOTAL"}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{
                width: "100%",
                height: 44,
                flexDirection: "row"
            }}>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, alignItems: "center", }}>{"99100"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, alignItems: "center", }}>{"1.00"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, alignItems: "center", }}>{"Unidad (Servicios)"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, alignItems: "center", }}>{"Inscripcion a Calistenia / PLAN MENSUAL"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, alignItems: "center", }}>{"299.00"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, alignItems: "center", }}>{"0.00"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, }}>{"299.00"}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>

            <SPDF.View style={{
                width: "100%",
                height: 120,
                flexDirection: "row"
            }}>
                <SPDF.View style={{ flex: 6, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, fontWeight: "bold" }}>{"Son: Doscientos noventa y nueva 00/100 Bolivianos"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, height: "100%", justifyContent: "center", alignItems: "center" }}>
                    {this.renderTotales()}
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 16, }}></SPDF.View>
            <SPDF.View style={{
                width: "100%",
                flexDirection: "row",
                height: 100,
            }}>
                <SPDF.View style={{ flex: 1, height: 50, alignItems: "center" }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY"}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{"Ley N° 453: Tienes derecho a un trato equitativo sin discriminación en la oferta de servicios."}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{"\"Este documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturación en línea\""}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: 16 }} />
                <SPDF.View style={{ width: 70, height: 70, borderWidth: 1, backgroundColor: "#000", }}>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 16, }}></SPDF.View>
        </SPDF.Page >)
    }

    render() {
        return (<SView onPress={this.handlePress.bind(this)}>
            <SLoad type='window' hidden={!this.state.loading} />
            {this.props.children ?? <SView padding={16} card >
                <SText>PDF Carta</SText>
            </SView>}
        </SView>
        );
    }
}
