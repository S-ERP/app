import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { SHr, SPage, SText, SView } from 'servisofts-component';
import { SHr, SPage, SText, SView, SScrollView2, STheme } from 'servisofts-component';
import SIconApp from '../../Assets/SIconApp';



const data = {
    proveedor: {
        nombre: "Distribuidora Central S.A.",
        deuda_total: 15750.00,
        limite_credito: 50000.00,
        compras_pendientes: 2
    },
    compras: [
        {
            id: 101,
            descripcion: "Productos de limpieza y mantenimiento",
            estado: "Pendiente",
            fecha: "2024-01-14",
            total: 8500.00,
            cuotas: 3
        },
        {
            id: 102,
            descripcion: "Suministros de oficina",
            estado: "Pendiente",
            fecha: "2024-02-19",
            total: 7250.00,
            cuotas: 2
        },
        {
            id: 103,
            descripcion: "Suministros de oficina",
            estado: "Pendiente",
            fecha: "2024-02-19",
            total: 7250.00,
            cuotas: 2
        },
        {
            id: 104,
            descripcion: "Suministros de oficina",
            estado: "Pendiente",
            fecha: "2024-02-19",
            total: 7250.00,
            cuotas: 2
        },
        {
            id: 105,
            descripcion: "Suministros de oficina",
            estado: "Pendiente",
            fecha: "2024-02-19",
            total: 7250.00,
            cuotas: 2
        },
        {
            id: 106,
            descripcion: "Suministros de oficina",
            estado: "Pendiente",
            fecha: "2024-02-19",
            total: 7250.00,
            cuotas: 2
        }
    ]
};

export default class Pagos extends Component {


    header() {
        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 12 }} >
                <SHr h={16} />
                <SText fontSize={16} color={STheme.color.lightGray}>{"Compras a crédito y pagos pendientes"}</SText>
                <SHr h={16} />
            </SView>
        );
    }

    resumen() {
        const { proveedor } = data;
        return (
            <SView col={"xs-12"} style={{ paddingHorizontal: 12 }}  >

                <SView col={"xs-12"} row backgroundColor={STheme.color.white} border={STheme.color.lightGray} center style={{ borderRadius: 8, padding: 12, }}   >
                    {/* <SView col={"xs-12"} row backgroundColor={STheme.color.card} border={STheme.color.lightGray} center style={{ borderRadius: 8, padding: 12, }}   > */}
                    <SView col={"xs-12 md-3"} row center height={100}>
                        <SView style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#16a34a" }} center>
                            <SIconApp name='empresa' width={24} height={24} fill={"#00491bff"} />
                        </SView>
                        <SView style={{ marginLeft: 8 }}>
                            <SText color={STheme.color.lightGray}  >Proveedor</SText>
                            <SText color={STheme.color.primary} bold>{proveedor.nombre}</SText>
                            {/* <SText color={STheme.color.primary} bold>{proveedor.nombre}</SText> */}
                        </SView>
                    </SView>

                    {/* Deuda Total */}
                    <SView col={"xs-12 md-3"} row center height={100}>
                        <SView style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#fee2e2" }} center>
                            <SIconApp name='tpAf' width={24} height={24} fill={"#dc2626"} stroke='#fee2e2' />
                        </SView>
                        <SView style={{ marginLeft: 8 }}>
                            <SText color={STheme.color.lightGray} fontSize={12}>Deuda Total</SText>
                            <SText bold color={"#dc2626"}>S/ {proveedor.deuda_total.toLocaleString()}</SText>
                        </SView>
                    </SView>

                    {/* Límite de crédito */}
                    <SView col={"xs-12 md-3"} row center>
                        <SView style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#fef9c3" }} center>
                            <SIconApp name='pagotarjeta' width={24} height={24} fill={"#eab308"} />
                        </SView>
                        <SView style={{ marginLeft: 8 }}>
                            <SText color={STheme.color.lightGray} fontSize={12}>Límite de Crédito</SText>
                            <SText bold color={"#eab308"}>S/ {proveedor.limite_credito.toLocaleString()}</SText>
                        </SView>
                    </SView>

                    {/* Compras pendientes */}
                    <SView col={"xs-12 md-3"} row center>
                        <SView style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#fef9c3" }} center>
                            <SIconApp name='Evento' width={24} height={24} fill={"#eab308"} />
                        </SView>
                        <SView style={{ marginLeft: 8 }}>
                            <SText color={STheme.color.lightGray} fontSize={12}>Compras Pendientes</SText>
                            <SText bold color={"#eab308"}>{proveedor.compras_pendientes}</SText>
                        </SView>
                    </SView>
                    {/* <SView col={"xs-12 md-3"} row center>
                        <SView style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#dcfce7" }} center>
                            <SIconApp name='Evento' width={24} height={24} fill={"#16a34a"} />
                        </SView>
                        <SView style={{ marginLeft: 8 }}>
                            <SText color={STheme.color.lightGray} fontSize={12}>Compras Pendientes</SText>
                            <SText bold color={"#16a34a"}>{proveedor.compras_pendientes}</SText>
                        </SView>
                    </SView> */}
                </SView>



                <SHr h={24} />

            </SView>
        );
    }

    itemCard() {
        const compras = data.compras;

        return (
            <SView col={"xs-12"} flex center>
                <SScrollView2 disableHorizontal>
                    <SView col={"xs-12"} style={{ padding: 4 }}>
                        <SView col={"xs-12"} row padding={4}>
                            {compras.map((compra, index) => (
                                <SView
                                    key={index}
                                    col={"xs-12 md-6 lg-6"}
                                    margin={4}
                                    card
                                    style={{
                                        padding: 12,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: "#e5e7eb",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 6,
                                        elevation: 2,
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    {/* Header de la compra */}
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 8 }}>
                                        <SView>
                                            <SText fontSize={16} bold>{`Compra #${compra.id}`}</SText>
                                            <SText color={"#666"}>{compra.descripcion}</SText>
                                        </SView>
                                        <SView style={{
                                            backgroundColor: "#fee2e2",
                                            borderRadius: 12,
                                            paddingHorizontal: 8,
                                            paddingVertical: 2,
                                        }}>
                                            <SText fontSize={12} bold color={"#991b1b"}>{compra.estado}</SText>
                                        </SView>
                                    </SView>

                                    {/* Detalles de la compra */}
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                                        <SText color={"#666"}>{"Fecha:"}</SText>
                                        <SText>{compra.fecha}</SText>
                                    </SView>
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between", marginBottom: 4 }}>
                                        <SText color={"#666"}>{"Total:"}</SText>
                                        <SText bold>S/ {compra.total.toLocaleString()}</SText>
                                    </SView>
                                    <SView col={"xs-12"} row style={{ justifyContent: "space-between" }}>
                                        <SText color={"#666"}>{"Cuotas:"}</SText>
                                        <SText>{`${compra.cuotas} cuotas`}</SText>
                                    </SView>

                                    {/* Botón */}
                                    <SView col={"xs-12"} style={{ marginTop: 12 }}>
                                        <SView center style={{
                                            backgroundColor: "#f3f4f6",
                                            borderRadius: 8,
                                            padding: 8,
                                        }}>
                                            <SText color={"#374151"}>{"Ver Cuotas"}</SText>
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

