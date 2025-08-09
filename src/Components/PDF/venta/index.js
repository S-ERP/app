import React, { Component } from 'react';
import { Text } from 'react-native';
import { SLoad, SView } from 'servisofts-component';
import { Page, View, Text as SPDFText, create } from 'servisofts-rn-spdf';
import Model from '../../../Model';

const fontSize = 14;

const textStyle = {
    fontSize: fontSize,
    font: "Roboto",
    paddingBottom: 4,
};

class index extends Component {
    espacio() {
        return (
            <View style={{ width: "100%" }}>
                <View style={{ width: "100%", height: 4 }} />
                <SPDFText style={{ width: "100%", fontSize: 14, fontWeight: "bold" }}>
                    {"- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"}
                </SPDFText>
                <View style={{ width: "100%", height: 4 }} />
            </View>
        );
    }

    espacioPunto() {
        return (
            <View style={{ width: "100%" }}>
                <View style={{ width: "100%", height: 4 }} />
                <SPDFText style={{ width: "100%", fontSize: fontSize * 1.2 }}>
                    {"......................................................................................................."}
                </SPDFText>
                <View style={{ width: "100%", height: 4 }} />
            </View>
        );
    }


    detalleAlvaro() {


        this.data = this.props.data;
        this.compra_venta_detalle = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: this.props.data.key })
        console.log("pollito " + JSON.stringify(this.props.data))
        if (!this.compra_venta_detalle) return <SLoad />


        const detalleItems = [
            { descripcion: "621649-BROCHA 2", cantidad: "1.000", precio_unitario: "12.00", total: "12.00" },
            { descripcion: "621649-BLANCO SINTETICO LITRO", cantidad: "2.000", precio_unitario: "50.00", total: "100.00" },
            { descripcion: "621649-GRIS OSCURO SINTETICO", cantidad: "1.000", precio_unitario: "50.00", total: "50.00" },
            { descripcion: "621649-RODILLO ATLAS", cantidad: "2.000", precio_unitario: "18.00", total: "36.00" },
            { descripcion: "621649-LIJA 220", cantidad: "1.000", precio_unitario: "4.00", total: "4.00" },
        ];

        return Object.values(this.compra_venta_detalle).map((item, i) => (
            // return detalleItems.map((item, i) => (
            <View style={{ width: "100%" }}>
                <View style={{ height: 4 }} />
                <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>{item.descripcion}</SPDFText>
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ height: 4 }} />
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "60%", alignItems: "flex-end" }}>
                            <SPDFText style={textStyle}>{"cant " + `${item.cantidad} X ${item.precio_unitario}Bs`}</SPDFText>
                        </View>
                        <View style={{ width: "40%", alignItems: "flex-end" }}>
                            <SPDFText style={textStyle}>{(item.cantidad * item.precio_unitario) + "Bs"}</SPDFText>
                        </View>
                    </View>
                </View>
                <View style={{ height: 4 }} />
            </View>
        ));
    }

    cliente() {
        const cliente = this.props.data.cliente;
        return <View style={{ width: "100%", alignItems: "center" }}>
            <SPDFText style={{ ...textStyle, fontWeight: "bold", marginBottom: 8 }}>CLIENTE </SPDFText>

            <View style={{ width: "100%", alignItems: "center" }}>

                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Nombre completo:</SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle }}>{cliente.nombres}</SPDFText>
                    </View>
                </View>

                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Fecha Nacimiento:</SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle }}>{cliente.fecha_nacimiento}</SPDFText>
                    </View>
                </View>
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Teléfono:</SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle }}>{cliente.telefono}</SPDFText>
                    </View>
                </View>
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>NIT:</SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle }}>{cliente.nit}</SPDFText>
                    </View>
                </View>
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Razón Social:</SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle }}>{cliente.razon_social}</SPDFText>
                    </View>
                </View>
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Correo:</SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle }}>{cliente.correo}</SPDFText>
                    </View>
                </View>
            </View>
        </View>
    }

    proveedor() {
        const proveedor = this.props.data.proveedor;
        return (

            <View style={{ width: "100%", alignItems: "center" }}>
                <SPDFText style={{ ...textStyle, fontWeight: "bold", marginBottom: 8 }}>PROVEEDOR </SPDFText>

                <View style={{ width: "100%", alignItems: "center" }}>


                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>NIT:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{proveedor.nit}</SPDFText>
                        </View>
                    </View>


                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Razón Social:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{proveedor.razon_social}</SPDFText>
                        </View>
                    </View>
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Sucursal:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{proveedor.razon_social}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Dirección:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{proveedor.direccion}</SPDFText>
                        </View>
                    </View>



                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Teléfono:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{proveedor.telefono || "-"}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Correo:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{proveedor.correo || "-"}</SPDFText>
                        </View>
                    </View>

                </View>
            </View>
        );
    }


    handlePress = () => {
        create(
            <Page style={{ width: 464, margin: 24, padding: 0, borderWidth: 0 }}>
                <View style={{ width: "100%", height: 4 }} />

                <View style={{ width: "100%", alignItems: "center" }}>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>FACTURA{this.props.data.key} </SPDFText>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>CON DERECHO A CRÉDITO FISCAL</SPDFText>
                    <SPDFText style={{ ...textStyle }}>COMERCIAL TORRICO</SPDFText>
                    <SPDFText style={{ ...textStyle }}>CASA MATRIZ</SPDFText>
                    <SPDFText style={{ ...textStyle }}>No. Punto de Venta 0</SPDFText>
                    <SPDFText style={{ ...textStyle }}>c/ Diego de Bazan s/n comercial minorista, artesanos</SPDFText>
                    <View style={{ width: "100%", height: 12 }} />
                    <SPDFText style={{ ...textStyle }}>Tel. +591 70838928</SPDFText>
                    <SPDFText style={{ ...textStyle }}>Casa Matriz</SPDFText>
                </View>

                {this.espacio()}

                <View style={{ width: "100%", alignItems: "center" }}>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>NIT</SPDFText>
                    <SPDFText style={{ ...textStyle }}>818134019</SPDFText>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>FACTURA N°</SPDFText>
                    <SPDFText style={{ ...textStyle }}>4807</SPDFText>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>CÓD. AUTORIZACION</SPDFText>
                    <SPDFText style={{ ...textStyle, width: "90%", textAlign: "center" }}>
                        37FA9FD2B704F70988C35188E7BF8F7BBF52083D0166DB41372AB1F74
                    </SPDFText>
                </View>

                {this.espacio()}
                {this.cliente()}
                {this.espacio()}
                {this.proveedor()}
                {this.espacio()}


                <View style={{ width: "100%", alignItems: "center" }}>
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>NOMBRE/RAZÓN SOCIAL:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle, width: "100%" }}>HOTEL RODMOR INVERSIONES S.R.L.</SPDFText>
                        </View>
                    </View>
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>NIT/CI/CEX:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>419332024</SPDFText>
                        </View>
                    </View>
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>COD. CLIENTE:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>529408</SPDFText>
                        </View>
                    </View>
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>FECHA DE EMISIÓN:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>02/05/2025 13:44 PM</SPDFText>
                        </View>
                    </View>
                </View>

                {this.espacio()}

                <View style={{ width: "100%", alignItems: "center" }}>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>DETALLE</SPDFText>
                    <View style={{ width: "100%", height: 4 }} />
                </View>

                {this.detalleAlvaro()}
                {this.espacioPunto()}

                <View style={{ width: "100%" }}>
                    <View style={{ height: 4 }} />
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "60%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle }}>{"SUBTOTAL Bs. "}</SPDFText>
                        </View>
                        <View style={{ width: "40%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle }}>{"202.00"}</SPDFText>
                        </View>
                    </View>
                    <View style={{ height: 4 }} />
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "60%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle }}>{"DESCUENTO Bs. "}</SPDFText>
                        </View>
                        <View style={{ width: "40%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle }}>{"0.00"}</SPDFText>
                        </View>
                    </View>
                    <View style={{ height: 4 }} />
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "60%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle }}>{"TOTAL Bs. "}</SPDFText>
                        </View>
                        <View style={{ width: "40%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle }}>{"202.00"}</SPDFText>
                        </View>
                    </View>
                    <View style={{ height: 4 }} />
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "60%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle }}>{"MONTO GIFT CARD Bs. "}</SPDFText>
                        </View>
                        <View style={{ width: "40%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle }}>{"0.00"}</SPDFText>
                        </View>
                    </View>
                    <View style={{ height: 4 }} />
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "60%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>{"MONTO A PAGAR Bs. "}</SPDFText>
                        </View>
                        <View style={{ width: "40%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>{"202.00"}</SPDFText>
                        </View>
                    </View>
                    <View style={{ height: 4 }} />
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "60%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontSize: fontSize * 0.9, fontWeight: "bold" }}>
                                {"IMPORTE BASE CRÉDITO FISCAL Bs. "}
                            </SPDFText>
                        </View>
                        <View style={{ width: "40%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>{"202.00"}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", height: 40 }} />
                    <SPDFText style={{ ...textStyle, paddingLeft: 8 }}>
                        {"Son: Doscientos dos 00/100 Bolivianos."}
                    </SPDFText>
                </View>

                {this.espacio()}

                <View style={{ width: "100%", height: 8 }} />

                <View style={{ width: "100%", alignItems: "center" }}>
                    <View style={{ width: "100%", height: 16 }} />
                    <SPDFText style={{ ...textStyle, width: "85%", textAlign: "center" }}>
                        {"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY."}
                    </SPDFText>
                    <View style={{ width: "100%", height: 12 }} />
                    <SPDFText style={{ ...textStyle, fontSize: fontSize * 0.8, width: "75%", textAlign: "center" }}>
                        {"Ley N° 453: Tienes derecho a un trato equitativo sin discriminación en la oferta de productos."}
                    </SPDFText>
                    <View style={{ width: "100%", height: 8 }} />
                    <SPDFText
                        style={{ ...textStyle, fontSize: fontSize * 0.9, textAlign: "center", width: "70%" }}
                    >
                        {"'Este Documento es la Representación Gráfica de un Documento Fiscal Digital emitido en una modalidad de facturacion en linea."}
                    </SPDFText>

                    <View style={{ width: "100%", height: 20 }} />
                    <View style={{ width: 160, height: 160, borderWidth: 1 }} />
                    <View style={{ width: "100%", height: 20 }} />
                </View>
            </Page>
        );
    };


    // "tipo": "venta",
    // "conyuge": null,
    // "estado": 1,
    // "descripcion": "Venta Rápida",
    // "key_usuario": "1e4b2e09-94f1-4f9e-9d58-80d4d2f9ab3b",
    // "key_empresa": "e13239ed-6790-4294-9149-ba1c829554cc",
    // "fecha_on": "2025-08-08T18:08:22.29",
    // "key": "47cef592-645f-4bb0-9042-b382ef59b109",
    // "state": "cotizacion",
    render() {
        return (
            <SView onPress={this.handlePress.bind(this)}>
                <Text>Export PDF</Text>
            </SView>
        );
    }
}

export default index;
