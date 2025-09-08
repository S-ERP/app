import React, { Component } from 'react';
import { SView, SPage, SText, SHr, SScrollView2, STheme } from 'servisofts-component';
import SIconApp from '../../Assets/SIconApp';
import PopupPagoCuota from './Components/PopupPagoCuota3';

// Datos
const data = {
    proveedor: {
        id: 1,
        nombre: "Distribuidora Central S.A.",
        ruc: "20123456789",
        telefono: "+51 987 654 321",
        direccion: "Av. Principal 123 - Lima",
        deudaTotal: 98500.00,
        limiteCredito: 150000.00,
        comprasPendientes: 6,
        ultimoPago: {
            fecha: "2024-03-01",
            monto: 5000.00,
            referencia: "Transferencia bancaria BCP #123456"
        }
    },
    compras: [
        {
            id: 101,
            descripcion: "Productos de limpieza y mantenimiento",
            fecha: "2024-01-14",
            total: 8500.00,
            estado: "Pendiente",
            cuotas: 5,
            metodoPago: "Transferencia",
            cuotasDetalle: [
                { numero: 1, monto: 2833.33, vencimiento: "2024-02-14", fechaPago: "2024-02-13", estado: "Pagado" },
                { numero: 2, monto: 2833.33, vencimiento: "2024-03-14", fechaPago: null, estado: "Pendiente" },
                { numero: 3, monto: 2833.34, vencimiento: "2024-04-14", fechaPago: null, estado: "Pendiente" },
                { numero: 4, monto: 2833.34, vencimiento: "2024-05-14", fechaPago: null, estado: "Pendiente" },
                { numero: 5, monto: 2833.34, vencimiento: "2024-06-14", fechaPago: null, estado: "Pendiente" }
            ]
        },
        {
            id: 102,
            descripcion: "Suministros de oficina",
            fecha: "2024-02-19",
            total: 7250.00,
            estado: "Pendiente",
            cuotas: 2,
            metodoPago: "Tarjeta de crédito",
            cuotasDetalle: [
                { numero: 1, monto: 3625.00, vencimiento: "2024-03-19", fechaPago: null, estado: "Pendiente" },
                { numero: 2, monto: 3625.00, vencimiento: "2024-04-19", fechaPago: null, estado: "Pendiente" }
            ]
        },
        {
            id: 103,
            descripcion: "Muebles de oficina",
            fecha: "2024-02-25",
            total: 12000.00,
            estado: "Pagado",
            cuotas: 4,
            metodoPago: "Cheque",
            cuotasDetalle: [
                { numero: 1, monto: 3000.00, vencimiento: "2024-03-25", fechaPago: "2024-03-25", estado: "Pagado" },
                { numero: 2, monto: 3000.00, vencimiento: "2024-04-25", fechaPago: "2024-04-26", estado: "Pagado" },
                { numero: 3, monto: 3000.00, vencimiento: "2024-05-25", fechaPago: "2024-05-24", estado: "Pagado" },
                { numero: 4, monto: 3000.00, vencimiento: "2024-06-25", fechaPago: "2024-06-25", estado: "Pagado" }
            ]
        },
        {
            id: 109,
            descripcion: "Productos de limpieza y mantenimiento",
            fecha: "2024-01-14",
            total: 8500.00,
            estado: "Pendiente",
            cuotas: 3,
            metodoPago: "Transferencia",
            cuotasDetalle: [
                { numero: 1, monto: 2833.33, vencimiento: "2024-02-14", fechaPago: null, estado: "Pendiente" },
                { numero: 2, monto: 2833.33, vencimiento: "2024-03-14", fechaPago: null, estado: "Pendiente" },
                { numero: 3, monto: 2833.34, vencimiento: "2024-04-14", fechaPago: null, estado: "Pendiente" }
            ]
        }
    ],
    moneda: "BOB",
    configuracion: {
        estados: {
            pendiente: { label: "Pendiente", color: "#F97316", bgColor: "#FFF7ED", textColor: "#9A3412", icon: "Clock" },
            pagado: { label: "Pagado", color: "#22C55E", bgColor: "#DCFCE7", textColor: "#166534", icon: "Check" },
            vencido: { label: "Vencido", color: "#EAB308", bgColor: "#FEF9C3", textColor: "#854D0E", icon: "Warning" }
        },
        metodosPago: ["Efectivo", "Transferencia", "Tarjeta de crédito", "Cheque"]
    }
};

// Colores
const COLOR_CARD = STheme.color.card;
const COLOR_TEXT = STheme.color.text;
const COLOR_ACCENT = STheme.color.lightGray + "66";
// const COLOR_BORDER = STheme.color.lightGray + "66";
// const COLOR_BORDER = STheme.color.lightGray +"50";
const COLOR_BORDER = STheme.color.lightGray + "30";

export default class Pagos3 extends Component {
    labelEstado = (estado) => {
        const estadoNormalizado = estado?.toLowerCase();
        const { color, bgColor, textColor, label } = data.configuracion.estados[estadoNormalizado] || data.configuracion.estados.pendiente;
        return (
            <SView
                width={80}
                row
                center
                accessibilityLabel={`Estado: ${label}`}
            >
                <SView
                    width={70}
                    center
                    style={{
                        backgroundColor: bgColor,
                        borderRadius: 4,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderWidth: 1,
                        borderColor: color,
                    }}
                >
                    <SText fontSize={12} bold color={textColor}>
                        {label}
                    </SText>
                </SView>
            </SView>
        );
    };

    header() {
        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 16 }}>
                <SHr h={24} />
                <SText fontSize={20} bold color={COLOR_TEXT}>Compras a crédito y pagos pendientes</SText>
                <SHr h={24} />
            </SView>
        );
    }

    resumen() {
        const { proveedor, compras, moneda } = data;
        const comprasPendientes = compras.filter(compra => compra.estado.toLowerCase() === "pendiente").length;
        const deudaTotalCalculada = compras
            .filter(compra => compra.estado.toLowerCase() === "pendiente")
            .reduce((sum, compra) => sum + compra.total, 0)
            .toFixed(2);

        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 16 }}>
                <SView
                    col={"xs-12"}
                    row
                    backgroundColor={COLOR_CARD}
                    style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: COLOR_BORDER,
                        padding: 16,
                    }}
                >
                    {/* Proveedor */}
                    <SView col={"xs-12 md-3"} row center height={80}>
                        <SView
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                backgroundColor: data.configuracion.estados.pagado.bgColor,
                                borderWidth: 1,
                                borderColor: data.configuracion.estados.pagado.color,
                            }}
                            center
                        >
                            <SIconApp name='empresa' width={28} height={28} fill={data.configuracion.estados.pagado.color} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText fontSize={14} color={COLOR_TEXT}>Proveedor</SText>
                            <SText fontSize={16} bold color={COLOR_TEXT}>{proveedor.nombre}</SText>
                        </SView>
                    </SView>

                    {/* Deuda Total */}
                    <SView col={"xs-12 md-3"} row center height={80}>
                        <SView
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                backgroundColor: data.configuracion.estados.pendiente.bgColor,
                                borderWidth: 1,
                                borderColor: data.configuracion.estados.pendiente.color,
                            }}
                            center
                        >
                            <SIconApp name='tpAf' width={28} height={28} fill={data.configuracion.estados.pendiente.color} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText fontSize={14} color={COLOR_TEXT}>Deuda Total</SText>
                            <SText fontSize={16} bold color={data.configuracion.estados.pendiente.color}>
                                {moneda} {deudaTotalCalculada}
                            </SText>
                        </SView>
                    </SView>

                    {/* Límite de Crédito */}
                    <SView col={"xs-12 md-3"} row center height={80}>
                        <SView
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                backgroundColor: data.configuracion.estados.vencido.bgColor,
                                borderWidth: 1,
                                borderColor: data.configuracion.estados.vencido.color,
                            }}
                            center
                        >
                            <SIconApp name='pagotarjeta' width={28} height={28} fill={data.configuracion.estados.vencido.color} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText fontSize={14} color={COLOR_TEXT}>Límite de Crédito</SText>
                            <SText fontSize={16} bold color={COLOR_TEXT}>
                                {moneda} {proveedor.limiteCredito.toFixed(2)}
                            </SText>
                        </SView>
                    </SView>

                    {/* Compras Pendientes */}
                    <SView col={"xs-12 md-3"} row center height={80}>
                        <SView
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 8,
                                backgroundColor: data.configuracion.estados.vencido.bgColor,
                                borderWidth: 1,
                                borderColor: data.configuracion.estados.vencido.color,
                            }}
                            center
                        >
                            <SIconApp name='Evento' width={28} height={28} fill={data.configuracion.estados.vencido.color} />
                        </SView>
                        <SView flex style={{ marginLeft: 12 }}>
                            <SText fontSize={14} color={COLOR_TEXT}>Compras Pendientes</SText>
                            <SText fontSize={16} bold color={COLOR_TEXT}>{comprasPendientes}</SText>
                        </SView>
                    </SView>
                </SView>
                <SHr h={24} />
            </SView>
        );
    }

    itemCard() {
        const { compras, moneda } = data;
        return (
            <SView col={"xs-12"} flex center>
                <SScrollView2 disableHorizontal>
                    <SView col={"xs-12"} style={{ padding: 16 }}>
                        <SView col={"xs-12"} row>
                            {compras.map((compra, index) => (
                                <SView
                                    key={index}
                                    col={"xs-12 md-4 lg-4"}
                                    margin={8}
                                    style={{ backgroundColor: COLOR_CARD, borderRadius: 8, borderWidth: 1, borderColor: COLOR_BORDER, padding: 16, }} >
                                    <SView col={"xs-12"} row     >
                                        <SView col={"xs-12"} row   >
                                            <SView flex height={44} >
                                                <SText fontSize={18} bold color={COLOR_TEXT} numberOfLines={1} >{`Compra #${compra.id}`}</SText>
                                                <SText fontSize={14} color={COLOR_TEXT} numberOfLines={1}>{compra.descripcion}</SText>
                                            </SView>
                                            {this.labelEstado(compra.estado)}
                                        </SView>
                                    </SView>

                                    <SHr h={16} />

                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText fontSize={14} color={COLOR_TEXT}>Fecha:</SText>
                                        <SText fontSize={14} color={COLOR_TEXT}>{compra.fecha}</SText>
                                    </SView>
                                    <SHr h={8} />
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText fontSize={14} color={COLOR_TEXT}>Total:</SText>
                                        <SText fontSize={16} bold color={COLOR_TEXT}>{moneda} {compra.total.toFixed(2)}</SText>
                                    </SView>
                                    <SHr h={8} />
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText fontSize={14} color={COLOR_TEXT}>Cuotas:</SText>
                                        <SText fontSize={14} color={COLOR_TEXT}>{`${compra.cuotas} cuotas`}</SText>
                                    </SView>
                                    <SHr h={16} />
                                    <SView col={"xs-12"} center>

                                        <SView col={"xs-12"} center style={{ backgroundColor: COLOR_ACCENT, borderRadius: 4, padding: 10, borderWidth: 1, borderColor: COLOR_ACCENT }}
                                            onPress={() => {
                                                PopupPagoCuota.open({
                                                    editObject: { ...compra, moneda },
                                                    key_empresa: this.props.key_empresa || "",
                                                    onSuccess: () => {
                                                        console.log("Payment successful");
                                                    },
                                                });
                                            }}
                                        >
                                            <SText fontSize={14} bold color={STheme.color.white}>Ver Cuotas</SText>
                                        </SView>
                                    </SView>
                                </SView>
                            ))}
                        </SView>
                    </SView>
                </SScrollView2>
            </SView>
        );
    }

    render() {
        return (
            <SPage title={'Compras de Distribuidora Central S.A.'} center>
                {this.header()}
                {this.resumen()}
                {this.itemCard()}
            </SPage>
        );
    }
}