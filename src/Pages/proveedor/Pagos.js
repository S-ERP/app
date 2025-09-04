

import React, { Component } from 'react';
import { SView, SPage, SText, SHr, SScrollView2, STheme } from 'servisofts-component';
import SIconApp from '../../Assets/SIconApp';
import PopupPagoCuota from './Components/PopupPagoCuota';

const data = {
    "proveedor": {
        "id": 1,
        "nombre": "Distribuidora Central S.A.",
        "ruc": "20123456789",
        "telefono": "+51 987 654 321",
        "direccion": "Av. Principal 123 - Lima",
        "deudaTotal": 98500.00,
        "limiteCredito": 150000.00,
        "comprasPendientes": 6,
        "ultimoPago": {
            "fecha": "2024-03-01",
            "monto": 5000.00,
            "referencia": "Transferencia bancaria BCP #123456"
        }
    },
    "compras": [
        {
            "id": 101,
            "descripcion": "Productos de limpieza y mantenimiento",
            "fecha": "2024-01-14",
            "total": 8500.00,
            "estado": "Pendiente",
            "cuotas": 3,
            "metodoPago": "Transferencia",
            "cuotasDetalle": [
                {
                    "numero": 1,
                    "monto": 2833.33,
                    "vencimiento": "2024-02-14",
                    "fechaPago": "2024-02-13",
                    "estado": "Pagado"
                },
                {
                    "numero": 2,
                    "monto": 2833.33,
                    "vencimiento": "2024-03-14",
                    "fechaPago": null,
                    "estado": "Pendiente"
                },
                {
                    "numero": 3,
                    "monto": 2833.34,
                    "vencimiento": "2024-04-14",
                    "fechaPago": null,
                    "estado": "Pendiente"
                }
            ]
        },
        {
            "id": 102,
            "descripcion": "Suministros de oficina",
            "fecha": "2024-02-19",
            "total": 7250.00,
            "estado": "Pendiente",
            "cuotas": 2,
            "metodoPago": "Tarjeta de crédito",
            "cuotasDetalle": [
                {
                    "numero": 1,
                    "monto": 3625.00,
                    "vencimiento": "2024-03-19",
                    "fechaPago": null,
                    "estado": "Pendiente"
                },
                {
                    "numero": 2,
                    "monto": 3625.00,
                    "vencimiento": "2024-04-19",
                    "fechaPago": null,
                    "estado": "Pendiente"
                }
            ]
        },
        {
            "id": 103,
            "descripcion": "Muebles de oficina",
            "fecha": "2024-02-25",
            "total": 12000.00,
            "estado": "Pagado",
            "cuotas": 4,
            "metodoPago": "Cheque",
            "cuotasDetalle": [
                {
                    "numero": 1,
                    "monto": 3000.00,
                    "vencimiento": "2024-03-25",
                    "fechaPago": "2024-03-25",
                    "estado": "Pagado"
                },
                {
                    "numero": 2,
                    "monto": 3000.00,
                    "vencimiento": "2024-04-25",
                    "fechaPago": "2024-04-26",
                    "estado": "Pagado"
                },
                {
                    "numero": 3,
                    "monto": 3000.00,
                    "vencimiento": "2024-05-25",
                    "fechaPago": "2024-05-24",
                    "estado": "Pagado"
                },
                {
                    "numero": 4,
                    "monto": 3000.00,
                    "vencimiento": "2024-06-25",
                    "fechaPago": "2024-06-25",
                    "estado": "Pagado"
                }
            ]
        }
    ],
    "moneda": "S/",
    "configuracion": {
        "estados": {
            "pendiente": {
                "label": "Pendiente",
                "color": "#EF4444",
                "bgColor": "bg-red-100",
                "textColor": "text-red-800",
                "icon": "⏳"
            },
            "pagado": {
                "label": "Pagado",
                "color": "#10B981",
                "bgColor": "bg-green-100",
                "textColor": "text-green-800",
                "icon": "✅"
            },
            "vencido": {
                "label": "Vencido",
                "color": "#F59E0B",
                "bgColor": "bg-yellow-100",
                "textColor": "text-yellow-800",
                "icon": "⚠️"
            }
        },
        "metodosPago": ["Efectivo", "Transferencia", "Tarjeta de crédito", "Cheque"]
    }
};

export default class Pagos extends Component {
    header() {
        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 12 }}>
                <SHr h={16} />
                <SText fontSize={16} color={STheme.color.lightGray}>Compras a crédito y pagos pendientes</SText>
                <SHr h={16} />
            </SView>
        );
    }

    resumen() {
        const { proveedor } = data;
        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 12 }}>
                <SView col={"xs-12"} row backgroundColor={STheme.color.white} style={{ borderRadius: 8, padding: 12, borderWidth: 1, borderColor: STheme.color.lightGray }}>
                    <SView col={"xs-12 md-3"} row center height={100}>
                        <SView style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#16a34a" }} center>
                            <SIconApp name='empresa' width={24} height={24} fill={"#00491bff"} />
                        </SView>
                        <SView style={{ marginLeft: 8 }}>
                            <SText color={STheme.color.lightGray}>Proveedor</SText>
                            <SText color={STheme.color.primary} bold>{proveedor.nombre}</SText>
                        </SView>
                    </SView>

                    <SView col={"xs-12 md-3"} row center height={100}>
                        <SView style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#fee2e2" }} center>
                            <SIconApp name='tpAf' width={24} height={24} fill={"#dc2626"} stroke='#fee2e2' />
                        </SView>
                        <SView style={{ marginLeft: 8 }}>
                            <SText color={STheme.color.lightGray} fontSize={12}>Deuda Total</SText>
                            <SText bold color={"#dc2626"}>S/ {proveedor.deudaTotal.toLocaleString()}</SText>
                        </SView>
                    </SView>

                    <SView col={"xs-12 md-3"} row center>
                        <SView style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#fef9c3" }} center>
                            <SIconApp name='pagotarjeta' width={24} height={24} fill={"#eab308"} />
                        </SView>
                        <SView style={{ marginLeft: 8 }}>
                            <SText color={STheme.color.lightGray} fontSize={12}>Límite de Crédito</SText>
                            <SText bold color={"#eab308"}>S/ {proveedor.limiteCredito.toLocaleString()}</SText>
                        </SView>
                    </SView>

                    <SView col={"xs-12 md-3"} row center>
                        <SView style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#fef9c3" }} center>
                            <SIconApp name='Evento' width={24} height={24} fill={"#eab308"} />
                        </SView>
                        <SView style={{ marginLeft: 8 }}>
                            <SText color={STheme.color.lightGray} fontSize={12}>Compras Pendientes</SText>
                            <SText bold color={"#eab308"}>{proveedor.comprasPendientes}</SText>
                        </SView>
                    </SView>
                </SView>
                <SHr h={24} />
            </SView>
        );
    }

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
                                        borderColor: "#e5e7eb",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <SView col={"xs-12"} row>
                                        <SView flex>
                                            <SText color={STheme.color.primary} fontSize={16} bold>{`Compra #${compra.id}`}</SText>
                                            <SText color={STheme.color.primary}>{compra.descripcion}</SText>
                                        </SView>
                                        <SView width={70} row center>
                                            <SView width={64} center style={{ backgroundColor: "#dc2626", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
                                                <SText fontSize={10} bold color={"#fee2e2"}>{compra.estado}</SText>
                                            </SView>
                                        </SView>
                                    </SView>

                                    <SHr h={24} />

                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                                        <SText color={STheme.color.primary}>Fecha:</SText>
                                        <SText color={STheme.color.primary}>{compra.fecha}</SText>
                                    </SView>
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                                        <SText color={STheme.color.primary}>Total:</SText>
                                        <SText bold color={STheme.color.primary}>S/ {compra.total.toLocaleString()}</SText>
                                    </SView>
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText color={STheme.color.primary}>Cuotas:</SText>
                                        <SText color={STheme.color.primary}>{`${compra.cuotas} cuotas`}</SText>
                                    </SView>

                                    <SView col={"xs-12"} style={{ marginTop: 12 }}>
                                        <SView
                                            center
                                            border={STheme.color.card}
                                            backgroundColor={STheme.color.lightGray + "60"}
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
                                            <SText color={STheme.color.primary}>Ver Cuotas</SText>
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