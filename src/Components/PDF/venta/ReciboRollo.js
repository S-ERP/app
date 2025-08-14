import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SMath, SView } from 'servisofts-component';
import * as SPDF from 'servisofts-rn-spdf'
import Model from '../../../Model';
import { Return } from 'three/examples/jsm/nodes/Nodes';
import MDL from '../../../MDL';


// const HEIGHT = 14;
// const BorderColor = "#CCCCCC"
const fontSize = 14;

const textStyle = {
    fontSize: fontSize,
    font: "Roboto",
    paddingBottom: 4,
}


// Utilities
const validarDato = (value, fallback = 'Sin dato') => (value && value.toString().trim() ? value : fallback);
const toNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));
const formatCurrency = (val) => `${toNumber(val).toFixed(2)} Bs`;
const formatDate = (dateStr, fallback = 'Sin fecha') =>
    dateStr && !isNaN(new Date(dateStr))
        ? new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : fallback;
const formatDateTime = (dateStr, fallback = 'Sin fecha') =>
    dateStr && !isNaN(new Date(dateStr))
        ? new Date(dateStr).toLocaleString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // opcional, si quieres formato 24h
        })
        : fallback;

// Ejemplo


export default class ReciboRollo extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

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


    HeaderRecibo() {

        const { data } = this.props;
        const empresa = MDL.empresa.select?.descripcion;
        const sucursal = Model.sucursal.Action.getByKey({ key: data.key_sucursal });
        //  const empresssa = MDL.sucursal.select.cliente

        return <SPDF.View style={{ width: "100%", alignItems: "center", }}>
            <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{validarDato(empresa, 'EMPRESA')}</SPDF.Text>
            <SPDF.Text style={{ ...textStyle, }}>Sucursal: {sucursal?.descripcion}</SPDF.Text>
            <SPDF.Text style={{ ...textStyle, }}>{validarDato(sucursal?.direccion, 'Av. Sur Nro. 0')}</SPDF.Text>
            <SPDF.Text style={{ ...textStyle, }}>{validarDato(sucursal?.telefono, 'Tel: (123) 00000000')}</SPDF.Text>
            <SPDF.Text style={{ ...textStyle, }}>REF: A-125678-9</SPDF.Text>
        </SPDF.View>
    };

    InfoVenta = () => {
        const { data } = this.props;

        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>{"RECIBO DE VENTA"}</SPDF.Text>

                <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                    <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>NRO: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "50%" }}>
                        <SPDF.Text style={{ ...textStyle, width: "100%" }}>{"99997"} </SPDF.Text>
                    </SPDF.View>
                </SPDF.View>

                <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                    <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>FECHA: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "50%" }}>
                        <SPDF.Text style={{ ...textStyle }}>   {formatDate(data.fecha_on)}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>

                <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                    <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                        <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>HORA: </SPDF.Text>
                    </SPDF.View>
                    <SPDF.View style={{ width: "50%" }}>
                        <SPDF.Text style={{ ...textStyle }}>   {data.fecha_on
                            ? new Date(data.fecha_on).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                            : 'Sin hora'}</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>




            </SPDF.View>


        );
    };


    cliente() {
        const { data } = this.props;
        const cliente = data.cliente || {};
        return <SPDF.View style={{ width: "100%", alignItems: "center", }}>
            <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>{"CLIENTE"}</SPDF.Text>

            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>NOMBRE/RAZÓN SOCIAL: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, width: "70%" }}>{cliente.razon_social || cliente.nombres} </SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>NIT/CI: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, width: "70%" }}> {cliente.nit || cliente.ci}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>COD. CLIENTE: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, width: "70%" }}>123456</SPDF.Text>
                </SPDF.View>
            </SPDF.View>





        </SPDF.View>
    }
    Proveedor() {
        const { data } = this.props;
        const proveedor = data.proveedor || {};
        return <SPDF.View style={{ width: "100%", alignItems: "center", }}>
            <SPDF.Text style={{ ...textStyle, fontWeight: "bold", }}>{"PROVEEDOR"}</SPDF.Text>

            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>RAZÓN SOCIAL: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, width: "70%" }}>{proveedor.razon_social || proveedor.nombres} </SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>NIT: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, width: "70%" }}> {proveedor.nit || proveedor.ci}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>


            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>COD. PROV: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, width: "70%" }}>123456</SPDF.Text>
                </SPDF.View>
            </SPDF.View>

            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>DIRECCION: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, width: "70%" }}>{proveedor.direccion}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>

            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>TELEFONO: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle }}>{proveedor.telefono}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>



        </SPDF.View>
    }


    Cajero() {
        // "key_usuario": "b2aa9d81-5f63-40ce-ae35-31fbb1417745",


        return <SPDF.View style={{ width: "100%", alignItems: "center", }}>
            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>CAJERO: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%" }}>María Gómez</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>CAJA: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle }}>01</SPDF.Text>
                </SPDF.View>
            </SPDF.View>

        </SPDF.View>
    }

    TipoPago() {
        const { data } = this.props;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: data.key });
        if (!detalles) return null;


        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }


        return <SPDF.View style={{ width: "100%", alignItems: "center", }}>
            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>FORMA DE PAGO: </SPDF.Text>
                </SPDF.View>



                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle, width: "100%" }}> {data.tipo_pago} </SPDF.Text>
                </SPDF.View>

            </SPDF.View>
            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>MONTO PAGADO: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle }}>{200}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", flexDirection: "row", }} >
                <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>CAMBIO: </SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "50%" }}>
                    <SPDF.Text style={{ ...textStyle }}>{200 - subtotal}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>

        </SPDF.View>
    }


    detalle() {

        const { data } = this.props;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: data.key }) || {};
        const items = Object.values(detalles).length
            ? Object.values(detalles)
            : [
                {
                    key: 'PINT-001',
                    descripcion: 'Bote de Pintura Acrílica, Blanco Mate, 5 Litros',
                    cantidad: 1,
                    precio_unitario: 25.0,
                },
            ]; // Fallback con bote de pintura
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }

        return <SPDF.View style={{ width: "100%" }}>

            <SPDF.View style={{ width: "100%", alignItems: "center" }}>
                <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>DETALLE</SPDF.Text>
                <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
            </SPDF.View>

            {items.map((item, i) => {
                const cantidad = toNumber(item.cantidad);
                const precio = toNumber(item.precio_unitario);
                return <SPDF.View style={{ width: "100%", marginBottom: 4 }}>
                    {/* <View key={item.key || i} style={{ width: '100%', marginBottom: 4 }}> */}
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{item.descripcion}</SPDF.Text>
                    <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                        <SPDF.View style={{ width: "50%" }}>
                            <SPDF.Text style={{ ...textStyle, }}>cant {cantidad} x {precio} BS</SPDF.Text>
                        </SPDF.View>
                        <SPDF.View style={{ width: "50%", alignItems: "end" }}>
                            <SPDF.Text style={{ ...textStyle, }}>{formatCurrency(cantidad * precio)}</SPDF.Text>
                        </SPDF.View>
                    </SPDF.View>
                    {/* </View> */}
                </SPDF.View>

            })}

        </SPDF.View>

    }

    subtotales() {

        const { data } = this.props;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({ key_compra_venta: data.key });
        if (!detalles) return null;

        console.log("te regalo Detalles:", detalles);

        const items = Object.values(detalles);
        let subtotal = 0;
        for (const item of items) {
            subtotal += toNumber(item.cantidad) * toNumber(item.precio_unitario);
        }

        total > 0 ? total : 0
        const descuento = toNumber(data.descuento);
        const montoGiftCard = toNumber(data.monto_gift_card);
        const total = subtotal - descuento - montoGiftCard;

        return <SPDF.View style={{ width: "100%", }}>
            <SPDF.View style={{ height: 4, }} />
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"SUBTOTAL Bs. "}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{subtotal}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ height: 4, }} />
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"DESCUENTO Bs. "}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{descuento ? descuento : 0}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ height: 4, }} />
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"TOTAL Bs. "}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{total}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ height: 4, }} />
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{"MONTO GIFT CARD Bs. "}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, }}>{montoGiftCard > 0 ? montoGiftCard : 0}  </SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ height: 4, }} />
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{"MONTO A PAGAR Bs. "}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{total > 0 ? total : 0}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ height: 4, }} />
            <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                <SPDF.View style={{ width: "60%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontSize: fontSize * 0.9, fontWeight: "bold" }}>{"IMPORTE BASE CRÉDITO FISCAL Bs. "}</SPDF.Text>
                </SPDF.View>
                <SPDF.View style={{ width: "40%", alignItems: "end" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>{total > 0 ? total : 0}</SPDF.Text>
                </SPDF.View>
            </SPDF.View>
            <SPDF.View style={{ width: "100%", height: 40 }}></SPDF.View>
            <SPDF.Text style={{ ...textStyle, paddingLeft: 8 }}>{"Son: "}{SMath.numberToLetter(total, { p: "", s: "" }).toLowerCase()}{"00/100 Bolivianos"}</SPDF.Text>

            {/* <SPDF.Text style={{ ...textStyle, paddingLeft: 8 }}>{"Son: Doscientos dos 00/100 Bolivianos."}</SPDF.Text> */}
        </SPDF.View>

    }
    FooterRecibO() {
        return <SPDF.View style={{ width: "100%", alignItems: "center", }}>
            <SPDF.View style={{ width: "100%", height: 8 }}></SPDF.View>
            <SPDF.Text style={{ ...textStyle, width: "85%", textAlign: "center", }}>{"¡Gracias por su compra!"}</SPDF.Text>
            <SPDF.View style={{ width: "100%", height: 6 }}></SPDF.View>
            <SPDF.Text style={{ ...textStyle, fontSize: fontSize * 0.8, width: "75%", textAlign: "center", }}>{"Guarde este recibo para devoluciones."}</SPDF.Text>
            <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>
            <SPDF.Text style={{ ...textStyle, fontSize: fontSize * 0.9, textAlign: "center", width: "70%", }}>{"Visítenos en www.pinturaselcolor.com"}</SPDF.Text>
            <SPDF.View style={{ width: "100%", height: 10 }}></SPDF.View>
        </SPDF.View>

    }

    handlePress = () => {
        SPDF.create(<SPDF.Page style={{ width: 464, margin: 24, padding: 0, borderWidth: 0 }} >
            <SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View>


            {/* {this.espacio()} */}

            {this.HeaderRecibo()}



            {this.espacio()}


            {this.InfoVenta()}

            {this.espacio()}
            {this.cliente()}
            {this.espacio()}

            {this.Proveedor()}
            {this.espacio()}


            {this.detalle()}



            {this.espacioPunto()}
            {this.subtotales()}
            {this.espacioPunto()}

            {this.TipoPago()}
            < SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View >

            {this.Cajero()}

            {this.espacio()}
            < SPDF.View style={{ width: "100%", height: 4 }}></SPDF.View >
            {this.FooterRecibO()}

        </SPDF.Page >)
    }

    render() {
        return <SView onPress={this.handlePress.bind(this)}>
            <Text>PDF ROLLO</Text>
        </SView>
    }
}
