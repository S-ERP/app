import React from 'react';
import { SPage, SText, STheme, SDate } from "servisofts-component";
import * as SPDF from 'servisofts-rn-spdf'


const fontSize = 12;

const text = {
    fontSize: fontSize,
    font: "Roboto",
};


export default class index extends React.Component {

    state = {
        caja: null,
        movimientos: [],
        resumen: [],
        ready: false
    }



    detalle(movimientos) {
        return movimientos.map((mov, i) => {
            return (
                <SPDF.View key={i} style={{ width: "100%", flexDirection: "row", marginBottom: 8, height: 70, backgroundColor: "#c7099e" }}>

                </SPDF.View>
            );
        })

    }



    pagina() {
        return (
            <SPDF.View style={{ width: "100%", alignItems: "center", marginTop: 20 }}>
                <SPDF.Text style={text}> Página __page__ / 1 </SPDF.Text>
            </SPDF.View>
        );
    }


    imprimirPDF() {
        const chunks = Array.from({ length: 12 }, (_, i) => ({ nro: i + 1 }));
        console.log(chunks);

        SPDF.create(

            <SPDF.Page style={{ width: 612, height: 791, margin: 12, padding: 8 }}
                footer={this.pagina()}
            >
                {/* <SPDF.View style={{ width: "100%" }}> */}
                {this.detalle(chunks)}

                {/* </SPDF.View> */}
            </SPDF.Page>

        );
    }



    render() {

        return (
            <SPage title="Cierre de Caja PDF" center>
                <SText style={{ color: STheme.color.text }} onPress={() => this.imprimirPDF()} > Generar PDF Cierre de Caja </SText>
            </SPage>
        );
    }
}