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


    detalleAlvaross() {


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

    detalleAlvaro() {
        this.data = this.props.data;
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({
            key_compra_venta: this.props.data.key
        });

        if (!detalles) return <SLoad />;

        const itemsArray = Object.values(detalles);

        // Función segura para parsear número
        const toNumber = (val) => isNaN(Number(val)) ? 0 : Number(val);

        // Calcular subtotal
        const subtotal = itemsArray.reduce((acc, item) => {
            return acc + (toNumber(item.cantidad) * toNumber(item.precio_unitario));
        }, 0);

        return (
            <View style={{ width: "100%" }}>
                {itemsArray.map((item, i) => {
                    const cantidad = toNumber(item.cantidad);
                    const precio = toNumber(item.precio_unitario);
                    const total = (cantidad * precio).toFixed(2);

                    return (
                        <View key={item.key || i} style={{ width: "100%", marginBottom: 4 }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>
                                {item.descripcion || "Sin descripción"}
                            </SPDFText>

                            <View style={{ width: "100%", flexDirection: "row", marginTop: 2 }}>
                                <View style={{ width: "60%", alignItems: "flex-end" }}>
                                    <SPDFText style={textStyle}>
                                        {`cant ${cantidad} x ${precio} Bs`}
                                    </SPDFText>
                                </View>
                                <View style={{ width: "40%", alignItems: "flex-end" }}>
                                    <SPDFText style={textStyle}>{total} Bs</SPDFText>
                                </View>
                            </View>
                        </View>
                    );
                })}

                {/* Subtotal */}
                <View style={{ width: "100%", height: 10 }} />
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "60%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>SUBTOTAL Bs.</SPDFText>
                    </View>
                    <View style={{ width: "40%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>
                            {subtotal.toFixed(2)} Bs
                        </SPDFText>
                    </View>
                </View>
            </View>
        );
    }


    cliente() {
        const cliente = this.props.data.cliente;

        const validarDato = (value, fallback) => {
            return value && value.toString().trim() !== "" ? value : fallback;
        };

        if (!cliente) {
            return (
                <View style={{ width: "100%", alignItems: "center" }}>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold", marginBottom: 8 }}>
                        No se encontró información del cliente
                    </SPDFText>
                </View>
            );
        }

        return (
            <View style={{ width: "100%", alignItems: "center" }}>
                <SPDFText style={{ ...textStyle, fontWeight: "bold", marginBottom: 8 }}>CLIENTE</SPDFText>

                <View style={{ width: "100%", alignItems: "center" }}>
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Nombre completo:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(cliente?.nombres, "Sin Nombre")}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Teléfono:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(cliente?.telefono, "Sin Teléfono")}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>NIT:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(cliente?.nit, "Sin NIT")}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Razón Social:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(cliente?.razon_social, "Sin Razón Social")}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Correo:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(cliente?.correo, "Sin Correo")}</SPDFText>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    infoSubtotal() {
        const data = this.props.data || {};

        // Extraer detalles para calcular subtotal
        const detalles = Model.compra_venta_detalle.Action.getAllConProductos({
            key_compra_venta: data.key
        });

        const toNumber = (val) => isNaN(Number(val)) ? 0 : Number(val);

        // Calcular subtotal sumando cantidad * precio unitario
        const itemsArray = detalles ? Object.values(detalles) : [];
        const subtotal = itemsArray.reduce((acc, item) => acc + (toNumber(item.cantidad) * toNumber(item.precio_unitario)), 0);

        // Descuento, gift card, total y base crédito fiscal podrían venir en props.data o calcularse acá
        // Ajusta según tu lógica de negocio
        const descuento = toNumber(data.descuento) || 0;
        const montoGiftCard = toNumber(data.monto_gift_card) || 0;
        const total = subtotal - descuento - montoGiftCard;
        const montoPagar = total > 0 ? total : 0;
        const importeBaseCreditoFiscal = montoPagar; // O la lógica que aplique

        // Convertir número a texto (por ejemplo: 202.00 -> "Doscientos dos 00/100 Bolivianos.")
        // Aquí podrías implementar o importar una función que haga esa conversión
        // Por ahora dejo el valor literal
        const totalTexto = data.totalTexto || `Son: ${subtotal.toFixed(2)} Bs.`;

        return (
            <View style={{ width: "100%" }}>
                <View style={{ height: 4 }} />
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "60%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle }}>{"SUBTOTAL Bs. "}</SPDFText>
                    </View>
                    <View style={{ width: "40%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle }}>{subtotal.toFixed(2)}</SPDFText>
                    </View>
                </View>
                <View style={{ height: 4 }} />
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "60%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle }}>{"DESCUENTO Bs. "}</SPDFText>
                    </View>
                    <View style={{ width: "40%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle }}>{descuento.toFixed(2)}</SPDFText>
                    </View>
                </View>
                <View style={{ height: 4 }} />
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "60%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle }}>{"TOTAL Bs. "}</SPDFText>
                    </View>
                    <View style={{ width: "40%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle }}>{total.toFixed(2)}</SPDFText>
                    </View>
                </View>
                <View style={{ height: 4 }} />
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "60%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle }}>{"MONTO GIFT CARD Bs. "}</SPDFText>
                    </View>
                    <View style={{ width: "40%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle }}>{montoGiftCard.toFixed(2)}</SPDFText>
                    </View>
                </View>
                <View style={{ height: 4 }} />
                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "60%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>{"MONTO A PAGAR Bs. "}</SPDFText>
                    </View>
                    <View style={{ width: "40%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>{montoPagar.toFixed(2)}</SPDFText>
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
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>{importeBaseCreditoFiscal.toFixed(2)}</SPDFText>
                    </View>
                </View>

                <View style={{ width: "100%", height: 40 }} />
                <SPDFText style={{ ...textStyle, paddingLeft: 8 }}>
                    {totalTexto}
                </SPDFText>
            </View>
        );
    }



    sucursal() {
        const sucursal = Model.sucursal.Action.getByKey({ key: this.props.data.key_sucursal });
        console.log("ssssssssssssssssssssssss " + JSON.stringify(sucursal));
        const validarDato = (value, fallback) => {
            return value && value.toString().trim() !== "" ? value : fallback;
        };

        if (!sucursal) {
            return (
                <View style={{ width: "100%", alignItems: "center" }}>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold", marginBottom: 8 }}>
                        No se encontró información de la sucursal
                    </SPDFText>
                </View>
            );
        }

        return (
            <View style={{ width: "100%", alignItems: "center" }}>
                <SPDFText style={{ ...textStyle, fontWeight: "bold", marginBottom: 8 }}>SUCURSAL</SPDFText>

                <View style={{ width: "100%", alignItems: "center" }}>
                    {[
                        { label: "Descripción:", value: sucursal.descripcion, fallback: "Sin descripción" },
                        { label: "Dirección:", value: sucursal.direccion, fallback: "Sin dirección" },
                        { label: "Teléfono:", value: sucursal.telefono, fallback: "Sin teléfono" },
                        { label: "Correo:", value: sucursal.correo, fallback: "Sin correo" },
                    ].map(({ label, value, fallback }, index) => (
                        <View key={index} style={{ width: "100%", flexDirection: "row", marginBottom: 4 }}>
                            <View style={{ width: "50%", alignItems: "flex-end" }}>
                                <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>{label}</SPDFText>
                            </View>
                            <View style={{ width: "50%" }}>
                                <SPDFText style={textStyle}>{validarDato(value, fallback)}</SPDFText>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }



    proveedor() {

        //Model.sucursal.Action.getByKey({ key: this.props.data.key_sucursal })

        const proveedor = this.props.data.proveedor;

        const validarDato = (value, fallback) => {
            return value && value.toString().trim() !== "" ? value : fallback;
        };

        if (!proveedor) {
            return (
                <View style={{ width: "100%", alignItems: "center" }}>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold", marginBottom: 8 }}>
                        No se encontró información del proveedor
                    </SPDFText>
                </View>
            );
        }

        return (
            <View style={{ width: "100%", alignItems: "center" }}>
                <SPDFText style={{ ...textStyle, fontWeight: "bold", marginBottom: 8 }}>PROVEEDOR</SPDFText>

                <View style={{ width: "100%", alignItems: "center" }}>
                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>NIT:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(proveedor?.nit, "Sin NIT")}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Razón Social:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(proveedor?.razon_social, "Sin Razón Social")}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Sucursal:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(proveedor?.sucursal, "Sin Sucursal")}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Dirección:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(proveedor?.direccion, "Sin Dirección")}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Teléfono:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(proveedor?.telefono, "Sin Teléfono")}</SPDFText>
                        </View>
                    </View>

                    <View style={{ width: "100%", flexDirection: "row" }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>Correo:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{validarDato(proveedor?.correo, "Sin Correo")}</SPDFText>
                        </View>
                    </View>
                </View>
            </View>
        );
    }


    infoVenta() {
        const data = this.props.data || {};

        const safeText = (val) => val ? val.toString() : "Sin dato";

        // Extraer fecha y hora de fecha_on (suponiendo formato ISO o similar)
        let fecha = "Sin dato";
        let hora = "Sin dato";
        if (data.fecha_on) {
            const dt = new Date(data.fecha_on);
            if (!isNaN(dt)) {
                fecha = dt.toLocaleDateString(); // Ej: 12/08/2025
                hora = dt.toLocaleTimeString(); // Ej: 14:35:00
            }
        }

        return (
            <View style={{ width: "100%", alignItems: "center" }}>
                {/** Helper para cada fila de info */}
                {[
                    { label: "Descripción", value: data.descripcion },
                    { label: "Tipo", value: data.tipo },
                    { label: "Tipo Pago", value: data.tipo_pago },
                    { label: "Observación", value: data.observacion },
                    { label: "Fecha realizada la venta", value: fecha },
                    { label: "Hora realizada la venta", value: hora },
                    { label: "Key Usuario", value: data.key_usuario },
                ].map(({ label, value }) => (
                    <View key={label} style={{ width: "100%", flexDirection: "row", marginVertical: 2 }}>
                        <View style={{ width: "50%", alignItems: "flex-end" }}>
                            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>{label}:</SPDFText>
                        </View>
                        <View style={{ width: "50%" }}>
                            <SPDFText style={{ ...textStyle }}>{safeText(value)}</SPDFText>
                        </View>
                    </View>
                ))}
            </View>
        );
    }


    footer() {
        return <View style={{ width: "100%", alignItems: "center" }}>
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
    }

    cliente2() {
        const cliente = this.props.data.cliente || {};

        const validarDato = (value, fallback) => {
            return value && value.toString().trim() !== "" ? value : fallback;
        };

        if (!this.props.data.cliente) {
            return (
                <View style={{ width: "100%", alignItems: "center" }}>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold", marginBottom: 8 }}>
                        No se encontró información del cliente
                    </SPDFText>
                </View>
            );
        }

        return (
            <View style={{ width: "100%", alignItems: "center" }}>
                <View style={{ width: "100%", flexDirection: "row", marginBottom: 4 }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>
                            NOMBRE/RAZÓN SOCIAL:
                        </SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle, width: "100%" }}>
                            {validarDato(cliente.razon_social || cliente.nombres, "Sin Nombre")}
                        </SPDFText>
                    </View>
                </View>

                <View style={{ width: "100%", flexDirection: "row", marginBottom: 4 }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>
                            NIT/CI/CEX:
                        </SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle }}>
                            {validarDato(cliente.nit, "Sin NIT")}
                        </SPDFText>
                    </View>
                </View>

                <View style={{ width: "100%", flexDirection: "row", marginBottom: 4 }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>
                            COD. CLIENTE:
                        </SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle }}>
                            {validarDato(cliente.codigo_cliente, "Sin Código")}
                        </SPDFText>
                    </View>
                </View>

                <View style={{ width: "100%", flexDirection: "row" }}>
                    <View style={{ width: "50%", alignItems: "flex-end" }}>
                        <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>
                            FECHA DE EMISIÓN:
                        </SPDFText>
                    </View>
                    <View style={{ width: "50%" }}>
                        <SPDFText style={{ ...textStyle }}>
                            {validarDato(this.props.data.fecha_emision, "Sin Fecha")}
                        </SPDFText>
                    </View>
                </View>
            </View>
        );
    }

    headerRecibo() {

        return <View style={{ width: "100%", alignItems: "center" }}>
            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>FACTURA 5165</SPDFText>
            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>CON DERECHO A CRÉDITO FISCAL</SPDFText>
            <SPDFText style={{ ...textStyle }}>COMERCIAL TORRICO</SPDFText>
            <SPDFText style={{ ...textStyle }}>CASA MATRIZ</SPDFText>
            <SPDFText style={{ ...textStyle }}>No. Punto de Venta 0</SPDFText>
            <SPDFText style={{ ...textStyle }}>c/ Diego de Bazan s/n comercial minorista, artesanos</SPDFText>
            <View style={{ width: "100%", height: 12 }} />
            <SPDFText style={{ ...textStyle }}>Tel. +591 70838928</SPDFText>
            <SPDFText style={{ ...textStyle }}>Casa Matriz</SPDFText>
        </View>


    }

    bodyRecibo() {
        return <View style={{ width: "100%", alignItems: "center" }}>
            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>NIT</SPDFText>
            <SPDFText style={{ ...textStyle }}>818134019</SPDFText>
            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>FACTURA N°</SPDFText>
            <SPDFText style={{ ...textStyle }}>4807</SPDFText>
            <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>CÓD. AUTORIZACION</SPDFText>
            <SPDFText style={{ ...textStyle, width: "90%", textAlign: "center" }}>37FA9FD2B704F70988</SPDFText>
        </View>
    }

    handlePress = () => {
        create(
            <Page style={{ width: 464, margin: 24, padding: 0, borderWidth: 0 }}>
                <View style={{ width: "100%", height: 4 }} />


                {this.headerRecibo()}
                {this.espacio()}
                {this.bodyRecibo()}


                {this.sucursal()}
                {this.espacio()}

                {this.proveedor()}
                {this.espacio()}
                {this.cliente2()}
                {this.espacio()}


                {this.espacio()}

                <View style={{ width: "100%", alignItems: "center" }}>
                    <SPDFText style={{ ...textStyle, fontWeight: "bold" }}>DETALLE</SPDFText>
                    <View style={{ width: "100%", height: 4 }} />
                </View>

                {this.detalleAlvaro()}
                {this.espacioPunto()}

                {this.infoVenta()}
                {this.espacioPunto()}
                {this.infoSubtotal()}


                {this.espacio()}


                <View style={{ width: "100%", height: 8 }} />
                {this.footer()}


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
