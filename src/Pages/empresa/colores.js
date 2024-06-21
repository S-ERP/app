import React, { Component } from 'react';
import { SButtom, SDate, SDatePicker, SHr, SIcon, SInput, SLoad, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';
class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }
    renderItem(key, color, i) {
        return <SView style={{
            position: "absolute",
            left: (30 * i),
            width: 50,
            height: 50,
            backgroundColor: color,
            borderWidth: 1,
            borderColor: "#fff",
            borderRadius: 100,
        }}>
        </SView>
    }
    renderTheme(colores, label) {
        const colorFormat = {
            barColor: colores?.barColor,
            background: colores?.background,
            text: colores?.text,
            primary: colores?.primary,
            card: colores?.card,
        }
        return <SView height={50} row onPress={() => {
            STheme.color = {
                ...STheme.color,
                ...colorFormat,
            }
            STheme.repaint();
        }} center>
            <SView width={180} row height={50}>
                {Object.keys(colorFormat).map((key, i) => this.renderItem(key, colores[key], i))}
            </SView>
            <SText width={80}>{label}</SText>
        </SView>
    }

    renderTest = () => {
        return <SView col={"xs-12"} center>
            <SView col={"xs-11 sm-10 md-8 lg-6 xl-4"} height={400} backgroundColor={STheme.color.background} style={{
                borderRadius: 8,
                padding: 8,
            }}>
                <SView col={"xs-12"} height={40} backgroundColor={STheme.color.barColor} row>
                    <SView width={20} height={20}>
                        <SIcon name='Arrow' fill={STheme.color.text} />
                    </SView>
                    <SView width={16} />
                    <SText fontSize={16}>{"Barra de navegacion"}</SText>
                </SView>
                <SText bold fontSize={18}>{"Prueba de color"}</SText>

                <SInput type='text' placeholder={"Prueba de color"} />

            </SView>
        </SView>
    }
    render() {
        let empresa = Model.empresa.Action.getSelect();
        console.log(empresa)
        return <SPage title={"Temas de la empresa"}>
            
            {(empresa.theme) ? this.renderTheme(empresa.theme, "Empresa") : null}
           
            {this.renderTheme({
                barColor: "#000000",
                background: "#000000",
                text: "#ffffff",
                primary: "#000000",
                card: "#ffffff44",
            }, "Dark")}
            {this.renderTheme({
                barColor: "#ffffff",
                background: "#ffffff",
                text: "#000000",
                primary: "#ffffff",
                card: "#00000044",
            }, "Light")}
            <SHr h={16} />
            {this.renderTest()}

        </SPage>
    }
}

export default Test