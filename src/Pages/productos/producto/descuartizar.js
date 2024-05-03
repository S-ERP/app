import React, { Component } from 'react';
import { SButtom, SForm, SHr, SImage, SInput, SLoad, SNavigation, SNotification, SPage, SText, STheme, SView } from 'servisofts-component';
import { Container } from '../../../Components';

const Componentecito = ({ label, onPress }) => {
    return <SView border="#f0f" style={{
        position: "absolute",
        top: 10,
        left: 10,
        width: 100,
        height: 100,
        borderRadius: 100,
        backgroundColor: "#f0f",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#ff0",
        // transform: [{ rotateY:"45deg" }]
    }} onPress={onPress}>
        <SText >{label}</SText>
    </SView>
}

export default class descuartizar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.pk = SNavigation.getParam("pk"); // es la key_modelo
    }

    handlePress = (detalle) => {
        alert(this.pk + "  " + detalle)
    }


    render() {
        return <SPage title={"Descuartizar"}>
            <Container>
                <SView col={"xs-12"} row border="#f0f">
                    <SView col={"xs-12 md-6"} border="#f0f">
                        <SText>Algo para que se vea</SText>
                    </SView>
                    <SView col={"md-6"} border="#f0f">
                        <SText >Mi nombre</SText>
                    </SView>
                </SView>
                {/* div */}
                <SHr />
                <SText onPress={() => {
                    SNotification.send({
                        title: "Procesar producto",
                        body: "Producto procesado con exito",
                        time: 5000,
                        color: STheme.color.danger,
                        image: "https://empresa.servisofts.com/http/empresa/c9caa964-88f3-43db-88df-684ecf5c0a1b"
                    })
                }}
                    fontSize={20}
                    bold
                    font='Roboto'>LLAMAR AL SERVER</SText>

                {/* p */}
                {/* <Componentecito label={"Mi nombre"} onPress={this.handlePress.bind(this, "Extra detalle")} /> */}
                <SInput type={"text"}  defaultValue={"Hola mundo"}/>
                {/* <SImage src={"https://empresa.servisofts.com/http/empresa/c9caa964-88f3-43db-88df-684ecf5c0a1b"} /> */}


            </Container>
        </SPage >
    }
}
