import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SView } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf'


// const HEIGHT = 14;
// const BorderColor = "#CCCCCC"
const fontSize = 14;

const textStyle = {
    fontSize: fontSize,
    font: "Roboto",
    paddingBottom: 4,
}



export default class factura extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    componentDidMount() {
        this.handlePress();
    }

    espacio() {
        return <SPDF.View style={{ width: "100%" }}>
            <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>

            <SPDF.Text style={{ width: "100%", fontSize: 14, fontWeight: "bold", }}>{"- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"}</SPDF.Text>
            <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>

        </SPDF.View>
    }
    espacioPunto() {
        return <SPDF.View style={{ width: "100%" }}>
            <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
            <SPDF.Text style={{ width: "100%", fontSize: fontSize * 1.2, }}>{"......................................................................................................."}</SPDF.Text>
            <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
        </SPDF.View>
    }

    handlePress = () => {
        SPDF.create(<SPDF.Page style={{ width: 464, margin: 24, padding: 0, borderWidth: 0 }} >
            <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>




            <SPDF.View style={{ width: "100%", alignItems: "center", }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>FACTURA</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>CON DERECHO A CRÉDITO FISCAL</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, }}>COMERCIAL TORRICO</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, }}>CASA MATRIZ</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, }}>No. Punto de Venta 0</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, }}>c/ Diego de Bazan s/n comercial minorista, artesanos</SPDF.Text>
                <SPDF.View style={{ width: "100%", height: 12 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, }}>Tel. +591 70838928</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, }}>Casa Matriz</SPDF.Text>
            </SPDF.View>
            {this.espacio()}
            <SPDF.View style={{ width: "100%", alignItems: "center", }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>{"NIT"}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, }}>{"818134019"}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>{"FACTURA N°"}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle }}>{"4807"}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>{"CÓD. AUTORIZACION"}</SPDF.Text>
                <SPDF.Text style={{ ...textStyle, width: "90%", textAlign: "center" }}>{"37FA9FD2B704F70988C35188E7BF8F7BBF52083D0166DB41372AB1F74"}</SPDF.Text>
            </SPDF.View>
            {this.espacio()}

            <SPDF.View style={{ width: "100%", alignItems: "center", }}>
                <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                    <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>NOMBRE/RAZÓN SOCIAL: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "50%" }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%" }}>HOTEL RODMOR INVERSIONES S.R.L.</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                    <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>NIT/CI/CEX: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "50%" }}>
                        <SPDF.Text style={{ ...textStyle }}>419332024</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                    <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>COD. CLIENTE: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "50%" }}>
                        <SPDF.Text style={{ ...textStyle }}>529408</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                    <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>FECHA DE EMISIÓN: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "50%" }}>
                        <SPDF.Text style={{ ...textStyle }}>02/05/2025 13:44 PM</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
            {this.espacio()}
            <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>DETALLE</SPDF.Text>
                <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
            </SPDF.View>

            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"621649-BROCHA 2"}</SPDF.Text>
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"1.000 X 12.00"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"12.00"}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>

            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"621649-BLANCO SINTETICO LITRO"}</SPDF.Text>
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"2.000 X 50.00"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"100.00"}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>

            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"621649-GRIS OSCURO SINTETICO"}</SPDF.Text>
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"1.000 X 50.00"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"50.00"}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>

            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"621649-RODILLO ATLAS"}</SPDF.Text>
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"2.000 X 18.00"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"36.00"}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>

            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"621649-LIJA 220"}</SPDF.Text>
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"1.000 X 4.00"}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"4.00"}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            {this.espacioPunto()}
            <SPDF.View style={{ width: "100%", }}>
                <SPDF.View style={{ height: 4, }} />
                <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                    <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, }}>{"SUBTOTAL Bs. "}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, }}>{"202.00"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4, }} />
                <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                    <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, }}>{"DESCUENTO Bs. "}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, }}>{"0.00"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4, }} />
                <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                    <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, }}>{"TOTAL Bs. "}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, }}>{"202.00"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4, }} />
                <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                    <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, }}>{"MONTO GIFT CARD Bs. "}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, }}>{"0.00"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4, }} />
                <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                    <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"MONTO A PAGAR Bs. "}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"202.00"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ height: 4, }} />
                <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                    <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontSize: fontSize * 0.9, fontWeight: "bold" }}>{"IMPORTE BASE CRÉDITO FISCAL Bs. "}</SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"202.00"}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
                <SPDF.View style={{ width: "100%", height: 40 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, paddingLeft: 8 }}>{"Son: Doscientos dos 00/100 Bolivianos."}</SPDF.Text>
            </SPDF.View>
            {this.espacio()}
            < SPDF.View style={{ width: "100%", height: 8 }}></SPDF.View >


            <SPDF.View style={{ width: "100%", alignItems: "center", }}>
                <SPDF.View style={{ width: "100%", height: 16 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, width: "85%", textAlign: "center", }}>{"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY."}</SPDF.Text>
                <SPDF.View style={{ width: "100%", height: 12 }}></SPDF.View>
                <SPDF.Text style={{ ...textStyle, fontSize: fontSize * 0.8, width: "75%", textAlign: "center", }}>{"Ley N° 453: Tienes derecho a un trato equitativo sin discriminación en la oferta de productos."}</SPDF.Text>
                <SPDF.View style={{ width: "100%", height: 8 }}></SPDF.View>
                {/* <SPDF.Text style={{ ...textStyle, width: "60%", textAlign: "center", }}> */}
                <SPDF.Text style={{ ...textStyle, fontSize: fontSize * 0.9, textAlign: "center", width: "70%", }}>{"'Este Documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturacion en linea."}</SPDF.Text>

                <SPDF.View style={{ width: "100%", height: 20 }}></SPDF.View>
                <SPDF.View style={{ width: 160, height: 160, borderWidth: 1, }}>

                </SPDF.View>
                <SPDF.View style={{ width: "100%", height: 20 }}></SPDF.View>
            </SPDF.View>





        </SPDF.Page >)
    }

    render() {
        return <SView onPress={this.handlePress.bind(this)}>
            <Text> Export PDF </Text>
        </SView>
    }
}
