import React, { Component } from 'react';
import { SDate, SLoad, SMath, SNavigation, SPopup, SText, STheme, SView } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf'
import label from '../../Components/label';
import SSocket from 'servisofts-socket';
const textStyle = {
    font: "Roboto",
    fontSize: 9,
}
export default class PDF extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        SSocket.sendPromise({
            service: "facturacion",
            component: "factura",
            type: "getByKey",
            key: SNavigation.getParam("key")
        }).then(e => {
            this.setState({ data: e.data })
            PDF.handlePress(e.data);
        }).catch(e => {
            console.error(e);
        })
    }


    static renderTotalesDetalle({ label, monto }) {
        return <SPDF.View style={{ width: "100%", flexDirection: "row", height: 16, }}>
            <SPDF.View style={{ flex: 2, height: "100%", alignItems: "center", borderWidth: 1, alignItems: "center", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.Text style={{ ...textStyle, fontSize: 7, alignItems: "center", }}>{label}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ flex: 1, height: "100%", borderWidth: 1, justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.Text style={{ ...textStyle, fontSize: 9, alignItems: "center", }}>{monto}</SPDF.Text>
            </SPDF.View>
        </SPDF.View>
    }
    static renderTotales(factura) {
        let subTotal = 0;
        factura.detalle.map(a => {
            subTotal += (a.cantidad * a.precioUnitario) - a.descuento;
        })
        console.log(factura)
        return <SPDF.View style={{ width: "100%", height: "100%", }}>
            {this.renderTotalesDetalle({ label: "SUBTOTAL Bs", monto: subTotal.toFixed(2) })}
            {this.renderTotalesDetalle({ label: "DESCUENTO Bs", monto: (factura.descuento ?? 0).toFixed(2) })}
            {this.renderTotalesDetalle({ label: "TOTAL Bs", monto: (subTotal - (factura.descuento ?? 0)).toFixed(2) })}
            {this.renderTotalesDetalle({ label: "MONTO GIFT CARD Bs", monto: (parseFloat(factura.montoGiftCard ?? 0)).toFixed(2) })}
            {this.renderTotalesDetalle({ label: "MONTO A PAGAR Bs", monto: (subTotal - (factura.descuento ?? 0) - parseFloat(factura.montoGiftCard ?? 0)).toFixed(2) })}
            {this.renderTotalesDetalle({ label: "IMPORTE BASE CREDITO FISCAL Bs", monto: (subTotal - (factura.descuento ?? 0) - parseFloat(factura.montoGiftCard ?? 0)).toFixed(2) })}
        </SPDF.View>
    }

    static renderDetalle(detalle) {
        const fontsize = 8;
        return <SPDF.View style={{
            width: "100%",
            height: 44,
            flexDirection: "row"
        }}>
            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: fontsize, alignItems: "center", }}>{detalle.codigoProductoSin}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.Text style={{ ...textStyle, fontSize: fontsize, alignItems: "center", }}>{parseFloat(detalle.cantidad).toFixed(2)}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: fontsize, alignItems: "center", }}>{detalle.unidadMedidaDesc}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 8 }}>
                <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: fontsize, alignItems: "center", }}>{detalle.descripcion}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.Text style={{ ...textStyle, fontSize: fontsize, }}>{(parseFloat(detalle.precioUnitario) ?? 0).toFixed(2)}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.Text style={{ ...textStyle, fontSize: fontsize, }}>{(parseFloat(detalle.descuento) ?? 0).toFixed(2)}</SPDF.Text>
            </SPDF.View>
            <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1 }} />
                <SPDF.Text style={{ ...textStyle, fontSize: fontsize, }}>{(((parseFloat(detalle.cantidad) ?? 0) * (parseFloat(detalle.precioUnitario) ?? 0)) - (parseFloat(detalle.descuento) ?? 0)).toFixed(2)}</SPDF.Text>
            </SPDF.View>
        </SPDF.View>
    }
    static handlePress(data) {
        if (!data) return null;
        const factura = data.data;
        let subTotal = 0;
        factura.detalle.map(a => {
            subTotal += (a.cantidad * a.precioUnitario) - a.descuento;
        })
        let monto = subTotal - parseFloat(factura.descuento ?? 0)
        SPDF.create(<SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8, }}
            footer={<SPDF.View style={{ width: "100%", height: 20, flexDirection: "row" }}>
                <SPDF.View style={{ flex: 1, height: 10 }} />
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold", width:40 }}>{"${current_page}/${cant_page}"}</SPDF.Text>
            </SPDF.View>}
        >
            <SPDF.View style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                height: 120
            }}>
                <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{factura.razonSocial}</SPDF.Text>
                    {/* <SPDF.View style={{ height: 4 }}></SPDF.View> */}
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{factura.sucursal}</SPDF.Text>
                    {/* <SPDF.View style={{ height: 4 }}></SPDF.View> */}
                    <SPDF.Text style={{ ...textStyle, alignItems: "center" }}>No. Punto de Venta {factura.codigoPuntoVenta}</SPDF.Text>
                    {/* <SPDF.View style={{ height: 4 }}></SPDF.View> */}
                    <SPDF.Text style={{ ...textStyle, alignItems: "center" }}>{factura.direccionSucursal}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, alignItems: "center" }}>{"Teléfono: " + factura.telefono}</SPDF.Text>
                    <SPDF.Text style={{ ...textStyle, alignItems: "center" }}>{factura.municipio}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 2, }} />
                <SPDF.View style={{ flex: 3, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"NIT"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{factura.nit}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"FACTURA N"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90 }}>{factura.numeroFactura}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>{"CÓD. AUTORIZACIÓN"}</SPDF.Text>
                        <SPDF.View style={{ flex: 1, }} />
                        <SPDF.Text style={{ ...textStyle, width: 90, alignItems: "center", width: 90 }}>{factura.cuf}</SPDF.Text>
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
                <SPDF.View style={{ flex: 3, alignItems: "center", height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, justifyContent: "center", fontWeight: "bold" }}>{"Fecha"}</SPDF.Text>
                        {/* <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{"26/03/2024 09:33 PM"}</SPDF.Text> */}
                        <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{new SDate(factura.fechaHora, "yyyy-MM-ddThh:mm:ss").toString("dd/MM/yyyy HH").toUpperCase()}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ height: 4 }}></SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <SPDF.Text style={{ ...textStyle, width: 110, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>{"Nombre/Razon Social"}</SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{factura.cliRazonSocial}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, height: "100%" }}>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>{"NIT/CI/CEX"}</SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{factura.cliNit}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ height: 4 }}></SPDF.View>
                    <SPDF.View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: 10, fontWeight: "bold", justifyContent: "center" }}>{"Cod. Cliente"}</SPDF.Text>
                        <SPDF.Text style={{ ...textStyle, justifyContent: "center" }}>{"0"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 16, }}></SPDF.View>
            <SPDF.View style={{
                width: "100%",
                height: 44,
                flexDirection: "row",
                backgroundColor: "#D0D0D0"
            }}>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"CÓDIGO PRODUCTO / SERVICIO"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"CANTIDAD"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"UNIDAD DE MEDIDA"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"DESCRIPCION"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"PRECIO UNITARIO"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"DESCUENTO"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 1, borderWidth: 1, height: "100%", justifyContent: "center", padding: 4 }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 8, fontWeight: "bold", alignItems: "center", }}>{"SUBTOTAL"}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            {factura.detalle.map(a => this.renderDetalle(a))}
            <SPDF.View style={{
                width: "100%",
                height: 120,
                flexDirection: "row"
            }}>
                <SPDF.View style={{ flex: 6, height: "100%", justifyContent: "center" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%", fontSize: 9, fontWeight: "bold" }}>{"Son: "}{SMath.numberToLetter(monto, { p: "", s: "" }).toLowerCase()}{"00/100 Bolivianos"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ flex: 3, height: "100%", justifyContent: "center", alignItems: "center" }}>
                    {this.renderTotales(factura)}
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
                    <SPDF.Text style={{ ...textStyle, fontSize: 8, }}>{factura.leyenda}</SPDF.Text>
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
        return (<SView onPress={PDF.handlePress.bind(this, this.state.data)}>
            <SLoad type='window' hidden={!this.state.loading} />
            {this.props.children ?? <SView padding={16} card >
                <SText>PDF Carta</SText>
            </SView>}
        </SView>
        );
    }
}
