import React from 'react';
import { SPage, SText, STheme } from "servisofts-component";
import * as SPDF from 'servisofts-rn-spdf'

const fontSize = 12;

const textStyle = {
    fontSize: fontSize,
    font: "Roboto",
}


// const fontSize = 10;
const labelSize = 11;

const text = {
    fontSize: fontSize,
    font: "Roboto",
};

const label = {
    fontSize: labelSize,
    fontWeight: "bold",
    font: "Roboto",
};

const line = {
    width: "100%",
    height: 1.5,
    backgroundColor: "#DDDDDD",
    // marginTop: 8,
    // marginBottom: 8,
};


export default class index extends React.Component {

    espacio() {
        return <SPDF.View style={{ width: "100%", height: 15 }} />;
    }

    espaciopequeño() {
        return <SPDF.View style={{ width: "100%", height: 8 }} />;
    }

    HeaderCierre() {
        return (
            <SPDF.View style={{ width: "100%", flexDirection: "row", }}>

                <SPDF.View style={{ flex: 3, backgroundColor: "#e1ffbf" }}>

                    <SPDF.Image src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfiwNZOWWU_5snwjBWULhLyjSjuVLyJw1SQg&s`} style={{ width: 100, height: 50 }} />
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 16 }}> MI EMPRESA </SPDF.Text>
                    <SPDF.Text style={textStyle}>Sucursal: Central</SPDF.Text>
                    <SPDF.Text style={textStyle}>Dirección: Av. Sur Nro. 0</SPDF.Text>
                    <SPDF.Text style={textStyle}>Tel: 00000000</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ flex: 2, alignItems: "end", backgroundColor: "#fff9bf" }}>
                    <SPDF.Text style={{ ...textStyle, fontWeight: "bold", fontSize: 16 }}> CIERRE DE CAJA </SPDF.Text>
                    <SPDF.Text style={textStyle}>Fecha: 2026 Marzo 11   06:36</SPDF.Text>
                    <SPDF.Text style={textStyle}>Cajero: Juan Perez</SPDF.Text>
                    <SPDF.Text style={textStyle}>Caja: 1</SPDF.Text>
                </SPDF.View>

            </SPDF.View>
        );
    }

    ResumenCaja() {
        return (
            <SPDF.View style={{ width: "100%", height: 90, }}>

                <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>
                    RESUMEN
                </SPDF.Text>

                <SPDF.View style={{ height: 6 }} />

                <SPDF.View style={{ flexDirection: "row" }}>
                    <SPDF.Text style={{ width: "70%" }}>Apertura de Caja</SPDF.Text>
                    <SPDF.Text>100.00</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ flexDirection: "row" }}>
                    <SPDF.Text style={{ width: "70%" }}>Total Ventas</SPDF.Text>
                    <SPDF.Text>350.00</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ flexDirection: "row" }}>
                    <SPDF.Text style={{ width: "70%" }}>Total Egresos</SPDF.Text>
                    <SPDF.Text>50.00</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ flexDirection: "row" }}>
                    <SPDF.Text style={{ width: "70%", fontWeight: "bold" }}>
                        TOTAL EN CAJA
                    </SPDF.Text>

                    <SPDF.Text style={{ fontWeight: "bold" }}>
                        400.00
                    </SPDF.Text>
                </SPDF.View>

            </SPDF.View>
        );
    }

    TotalesPago() {
        return (
            <SPDF.View style={{ width: "100%" }}>

                <SPDF.Text style={{ ...textStyle, fontWeight: "bold" }}>
                    TOTALES POR TIPO DE PAGO
                </SPDF.Text>

                <SPDF.View style={{ height: 6 }} />

                <SPDF.View style={{ flexDirection: "row" }}>
                    <SPDF.Text style={{ width: "70%" }}>Efectivo</SPDF.Text>
                    <SPDF.Text>250.00</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ flexDirection: "row" }}>
                    <SPDF.Text style={{ width: "70%" }}>Transferencia</SPDF.Text>
                    <SPDF.Text>100.00</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ flexDirection: "row" }}>
                    <SPDF.Text style={{ width: "70%" }}>Tarjeta</SPDF.Text>
                    <SPDF.Text>50.00</SPDF.Text>
                </SPDF.View>

            </SPDF.View>
        );
    }
    detalle() {

        const movimientos = [

            {
                hora: "09:16",
                descripcion: "Traspaso a bancos",
                persona: "Fabiola Asbun Mostajo",
                tipo: "Transferencia",
                monto: -199,
            },
            {
                hora: "09:16",
                descripcion: "Venta de servicio",
                persona: "Fabiola Asbun Mostajo",
                tipo: "Transferencia",
                monto: 199,
            },
            {
                hora: "08:11",
                descripcion: "Traspaso a bancos",
                persona: "Ilse Fernanda Rek Rivera",
                tipo: "Transferencia",
                monto: -199,
            },
            {
                hora: "08:11",
                descripcion: "Venta de servicio",
                persona: "Ilse Fernanda Rek Rivera",
                tipo: "Transferencia",
                monto: 199,
            },
            {
                hora: "06:36",
                descripcion: "apertura",
                persona: "",
                tipo: "Efectivo",
                monto: 200,
            },

        ];

        return (
            <SPDF.View style={{ width: "100%", marginTop: 25 }}>

                <SPDF.Text style={{ ...label, textAlign: "center" }}>
                    Detalle
                </SPDF.Text>

                {this.espaciopequeño()}
                <SPDF.View style={line} />
                {this.espaciopequeño()}

                {movimientos.map((mov, i) => {

                    // const color = mov.monto < 0 ? "red" : "#333";

                    return (
                        <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                            <SPDF.View style={{ flex: 1, height: 50, borderWidth: 1, }}>
                                <SPDF.Text style={text}>{mov.hora}</SPDF.Text>
                                <SPDF.Text style={text}>Felicidad Aguilar Jalil</SPDF.Text>
                                <SPDF.Text style={label}>{mov.descripcion}</SPDF.Text>
                            </SPDF.View>
                            <SPDF.View style={{ flex: 1, height: 50, borderWidth: 1, alignItems: "end", }}>
                                <SPDF.Text style={label}>{mov.tipo}</SPDF.Text>
                                <SPDF.Text style={text}>{mov.monto}</SPDF.Text>
                            </SPDF.View>
                        </SPDF.View>
                    );
                })}
            </SPDF.View>
        );
    }



    Firmas() {
        return (
            <SPDF.View style={{ width: "100%", marginTop: 50, flexDirection: "row" }}>

                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: 150, borderTopWidth: 1 }} />
                    <SPDF.Text style={textStyle}>Cajero</SPDF.Text>
                </SPDF.View>

                <SPDF.View style={{ flex: 1, alignItems: "center" }}>
                    <SPDF.View style={{ width: 150, borderTopWidth: 1 }} />
                    <SPDF.Text style={textStyle}>Administrador</SPDF.Text>
                </SPDF.View>

            </SPDF.View>
        );
    }

    pagina() {
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
                <SPDF.Text style={{ ...textStyle }}>
                    Página 1 / 1
                </SPDF.Text>
            </SPDF.View>
        );
    }

    Resumen() {

        const data = [
            { label: "Apertura", value: 200 },
            { label: "Ventas Transferencia", value: 398 },
            { label: "Traspaso a banca", value: -398 },
            { label: "Total", value: 200 },
        ];

        return (
            <SPDF.View style={{ width: "100%", height: 200, backgroundColor: "#868686" }}>

                {data.map((row, i) => {
                    return (
                        <SPDF.View key={i} style={{ flexDirection: "row", marginBottom: 5, }} >
                            <SPDF.Text style={{ flex: 1 }}> {row.label} </SPDF.Text>
                            <SPDF.Text style={{ fontWeight: "bold", color: row.value < 0 ? "#da0202" : "#333" }}> {row.value} </SPDF.Text>

                        </SPDF.View>
                    );
                })}

                <SPDF.View style={line} />

                <SPDF.Text style={{ color: "#e20707" }}>
                    Monto enviado a bancos 0.00
                </SPDF.Text>

                <SPDF.Text style={{ color: "#e20707" }}>
                    Transferencia por apertura -200.00
                </SPDF.Text>

            </SPDF.View>
        );
    }

    Cajero() {
        return (
            <SPDF.View style={{ width: "100%", backgroundColor: "#8e98f1", }}>
                <SPDF.Text style={label}>Sucursal / Cajero</SPDF.Text>
                {this.espaciopequeño()}
                <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                    <SPDF.View style={{ width: 50, height: 40, }}>
                        <SPDF.Image src="https://cdn-icons-png.flaticon.com/512/149/149071.png" style={{ width: 40, height: 40 }} />
                    </SPDF.View>


                    <SPDF.View style={{ flex: 1, }}>
                        <SPDF.Text style={label}>Busch</SPDF.Text>
                        <SPDF.Text style={text}>Felicidad Aguilar Jalil</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }
    CajeroMMMMMM() {
        return (
            <SPDF.View style={{ width: "100%", backgroundColor: "#8e98f1", }}>
                <SPDF.Text style={label}>Sucursal / Cajero</SPDF.Text>
                {this.espaciopequeño()}
                <SPDF.View style={{ width: "100%", flexDirection: "row" }} >
                    <SPDF.View style={{ width: 50, height: 50, borderWidth: 1, }}>
                        <SPDF.Image src="https://cdn-icons-png.flaticon.com/512/149/149071.png" style={{ width: 40, height: 40 }} />
                    </SPDF.View>
                    <SPDF.View style={{ flex: 1, height: 100, borderWidth: 1, }}>
                        <SPDF.Text style={label}>Busch</SPDF.Text>
                        <SPDF.Text style={text}>Felicidad Aguilar Jalil</SPDF.Text>
                    </SPDF.View>
                </SPDF.View>
            </SPDF.View>
        );
    }

    imprimirPDF() {

        SPDF.create(

            <SPDF.Page style={{ width: 612, height: 791, padding: 20 }}>

                {this.HeaderCierre()}
                {this.espacio()}
                {this.Cajero()}
                {this.espacio()}
                {this.detalle()}

                <SPDF.View style={{ width: 160, height: 160, borderWidth: 1, }}>

                </SPDF.View>
                {/* {this.ResumenCaja()} */}
                {/* {this.espacio()}
                {this.TotalesPago()}
                {this.espacio()}
                {this.detalle()}
                {this.Resumen()}
                {this.espacio()}
                {this.Firmas()}
                {this.pagina()} */}

            </SPDF.Page>

        );

    }

    render() {
        return (
            <SPage title="Cierre de Caja PDF" center>

                <SText
                    style={{ color: STheme.color.text }}
                    onPress={() => this.imprimirPDF()}
                >
                    Generar PDF Cierre de Caja
                </SText>

            </SPage>
        );
    }
}