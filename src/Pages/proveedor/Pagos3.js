import React, { Component } from 'react';
import { SView, SPage, SText, SHr, SScrollView2, STheme } from 'servisofts-component';
import SIconApp from '../../Assets/SIconApp';
import PopupPagoCuota from './Components/PopupPagoCuota';


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
    moneda: "S/",
    configuracion: {
        estados: {
            pendiente: { label: "Pendiente", color: "#EF4444", bgColor: "bg-red-100", textColor: "text-red-800", icon: "⏳" },
            pagado: { label: "Pagado", color: "#10B981", bgColor: "bg-green-100", textColor: "text-green-800", icon: "✅" },
            vencido: { label: "Vencido", color: "#F59E0B", bgColor: "bg-yellow-100", textColor: "text-yellow-800", icon: "⚠️" }
        },
        metodosPago: ["Efectivo", "Transferencia", "Tarjeta de crédito", "Cheque"]
    }
};

const COLOR_VERDE_CLARO = "#d8edd8";
const COLOR_VERDE_OSCURO = "#4f8549ff";

const COLOR_NARANJA = "#FF9800";
const COLOR_NARANJA_CLARO = "#eaf4d8";

const COLOR_ROJO = "#F44336";
const COLOR_ROJO_CLARO = "#ece3dd";
const COLOR_ROJO_OSCURO = "#d93145";
const COLOR_GRIS = "#9E9E9E";

export default class Pagos3 extends Component {
    header() {
        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 12 }}>
                <SHr h={16} />
                <SText fontSize={16} color={STheme.color.text}>Compras a crédito y Pagos3 pendientes</SText>
                <SHr h={16} />
            </SView>
        );
    }

    resumen() {
        const { proveedor } = data;
        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 12 }}>
                <SView col={"xs-12"} row backgroundColor={STheme.color.card} style={{ borderRadius: 8, justifyContent: "space-between", borderWidth: 1, borderColor: STheme.color.card }}>
                    <SHr height={30} />

                    <SView col={"xs-12 md-3"} row center height={70} >

 
                        <SView style={{ marginLeft: 24, width: 40, height: 40, borderRadius: 8, backgroundColor: COLOR_VERDE_CLARO }} center>
                            <SIconApp name='empresa' width={24} height={24} fill={COLOR_VERDE_OSCURO} />
                        </SView>
                        <SView flex style={{ marginLeft: 8, }}>
                            <SText color={STheme.color.text} fontSize={12}>Proveedor</SText>
                            <SText bold color={STheme.color.text}>{proveedor.nombre}</SText>
                        </SView>
                    </SView>

                    <SView col={"xs-12 md-3"} row center height={70} >
                        <SView backgroundColor='blue' style={{ marginLeft: 24, width: 40, height: 40, borderRadius: 8, backgroundColor: COLOR_ROJO_CLARO }} center>
                            <SIconApp name='tpAf' width={24} height={24} fill={COLOR_ROJO_OSCURO} />
                        </SView>
                        <SView flex style={{ marginLeft: 8, }}>
                            <SText color={STheme.color.text} fontSize={12}>Deuda Total</SText>
                            <SText bold color={COLOR_ROJO}>S/ {proveedor.deudaTotal.toFixed(2)}</SText>
                        </SView>
                    </SView>
                    <SView col={"xs-12 md-3"} row center height={70} >
                        <SView style={{ marginLeft: 24, width: 40, height: 40, borderRadius: 8, backgroundColor: COLOR_NARANJA_CLARO }} center>
                            <SIconApp name='pagotarjeta' width={24} height={24} fill={COLOR_NARANJA} />
                        </SView>
                        <SView flex style={{ marginLeft: 8, }}>
                            <SText color={STheme.color.text} fontSize={12}>Límite de Crédito</SText>
                            <SText bold color={STheme.color.text}>S/ {proveedor.limiteCredito.toFixed(2)}</SText>
                        </SView>
                    </SView>
                    <SView col={"xs-12 md-3"} row center height={70} >
                        <SView style={{ marginLeft: 24, width: 40, height: 40, borderRadius: 8, backgroundColor: COLOR_NARANJA_CLARO }} center>
                            <SIconApp name='Evento' width={24} height={24} fill={COLOR_NARANJA} />
                        </SView>
                        <SView flex style={{ marginLeft: 8, }}>
                            <SText color={STheme.color.text} fontSize={12}>Compras Pendientes</SText>
                            <SText bold color={STheme.color.text}>{proveedor.comprasPendientes}</SText>
                        </SView>
                    </SView>
                    <SHr height={30} />

                </SView>
            </SView>
        );
    };

    itemCard() {
        const { compras } = data;
        return (
            <SView col={"xs-12"} flex center>
                <SScrollView2 disableHorizontal>
                    <SView col={"xs-12"} style={{ padding: 4 }}>
                        <SView col={"xs-12"} row padding={4}>
                            {compras.map((compra, index) => (
                                <SView
                                    key={index}
                                    col={"xs-12 md-4 lg-4"}
                                    margin={4}
                                    card
                                    style={{
                                        padding: 12,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: STheme.color.card,
                                        backgroundColor: STheme.color.card,
                                    }}
                                >
                                    <SView col={"xs-12"} row>
                                        <SView flex>
                                            <SText color={STheme.color.text} fontSize={16} bold>{`Compra #${compra.id}`}</SText>
                                            <SText color={STheme.color.text}>{compra.descripcion}</SText>
                                        </SView>
                                        <SView width={70} row center>
                                            <SView width={64} center style={{ backgroundColor: COLOR_ROJO, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
                                                <SText fontSize={10} bold color={STheme.color.text}>{compra.estado}</SText>
                                            </SView>
                                        </SView>
                                    </SView>
                                    <SHr h={24} />
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                                        <SText color={STheme.color.text}>Fecha:</SText>
                                        <SText color={STheme.color.text}>{compra.fecha}</SText>
                                    </SView>
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                                        <SText color={STheme.color.text}>Total:</SText>
                                        <SText bold color={STheme.color.text}>S/ {compra.total.toLocaleString()}</SText>
                                    </SView>
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText color={STheme.color.text}>Cuotas:</SText>
                                        <SText color={STheme.color.text}>{`${compra.cuotas} cuotas`}</SText>
                                    </SView>
                                    <SView col={"xs-12"} style={{ marginTop: 12 }}>
                                        <SView
                                            center
                                            border={STheme.color.card}
                                            backgroundColor={STheme.color.lightGray + "33"}
                                            style={{ borderRadius: 4, padding: 8 }}
                                            onPress={() => {
                                                PopupPagoCuota.open({
                                                    editObject: compra,
                                                    key_empresa: this.props.key_empresa || "",
                                                    onSuccess: () => {
                                                        console.log("Payment successful");
                                                    },
                                                });
                                            }}
                                        >
                                            <SText color={STheme.color.text}>Ver Cuotas</SText>
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