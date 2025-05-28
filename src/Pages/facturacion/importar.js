import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SInput, SNotification, SPage, SStorage, SText, STheme, SThread, SView } from 'servisofts-component';
import MDL from '../../MDL';

export default class importar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        SStorage.getItem("xml_factura_temp", (a) => {
            if (a) {
                this.input.setValue(a);
            }
        });
    }

    handleOnPress() {
        let xml = this.input.getValue();
        if (!xml) {
            SNotification.send({
                title: "Error",
                body: "Debes pegar el contenido del XML",
                color: STheme.color.danger,
                time: 5000
            })
            return;
        }

        MDL.factura.importarXml({
            xml: xml,
            ambiente: MDL.factura.ambiente
        }).then((res) => {
            SNotification.send({
                title: "Exito",
                body: "Factura importada correctamente",
                color: STheme.color.success,
                time: 5000
            })
        }).catch((e) => {
            SNotification.send({
                title: "Error",
                body: "Error al importar la factura",
                color: STheme.color.danger,
                time: 5000
            })
        })
    }
    render() {
        return <SPage disableScroll title={"Importar XML"}>
            <SView col={"xs-12"} flex>
                <SInput ref={ref => this.input = ref} type='textArea' height={"100%"}
                    style={{
                        fontSize: 11
                    }}
                    placeholder={"Para importar la factura XML debes pegar el contenido del XML en el area de texto y precionar el boton subir"}
                    onChangeText={(text) => {
                        new SThread(500, "niput", true).start(() => {
                            SStorage.setItem("xml_factura_temp", text);
                        })
                    }}
                />
            </SView>
            <SView col="xs-12" height={50} center padding={8}>
                <SView col="xs-12" height center backgroundColor={STheme.color.primary} onPress={this.handleOnPress.bind(this)}>
                    <SText>{"SUBIR"}</SText>
                </SView>
            </SView>
        </SPage>
    }
}
