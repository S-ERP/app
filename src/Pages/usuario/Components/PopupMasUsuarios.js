import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SForm, SHr, SImage, SInput, SList, SMath, SNavigation, SNotification, SPage, SPopup, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket'
import MDL from '../../../MDL';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    // getExtencion(name) {
    //     var arr = name.split(".");
    //     if (arr) {
    //         return arr[arr.length - 1]
    //     }
    //     return "";
    // }
    render() {
        // const { name, path } = this.props
        // var extencion = this.getExtencion(name)
        let data = this.props.data;
        console.log("dat", data);
        console.log("datakeyUsers", this.props.datakeyUsers);
        let datakeyUsers = this.props.datakeyUsers;
        return (
            <SView style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: 400,
                // height: 500,
                borderRadius: 8,
                borderColor: STheme.color.card,
                borderWidth: 1,
                backgroundColor: STheme.color.background
            }} withoutFeedback >
                <SView col={"xs-12"} center padding={16}>
                    <SText fontSize={16}>{"Coincidencia de datos"}</SText>
                    <SHr height={16} />
                    <SText fontSize={13} color={STheme.color.text} center>{"¡Atención! Encontramos usuarios similares al que intentas registrar. Si ves tu nombre en la lista, selecciónalo para continuar:"}</SText>
                </SView>
                <SView col={"xs-12"} center >
                    {data && Object.keys(data).map(key => (
                        <SView key={key} col={"xs-9"} padding={15} row card style={{
                            //borderBottomWidth: 1,
                            //borderBottomColor: STheme.color.card
                            marginBottom: 16
                        }} onPress={() => {
                            SSocket.sendPromise({
                                // version: "2.0",
                                service: "empresa",
                                component: "empresa_usuario",
                                type: "registro",
                                key_empresa: MDL.empresa.select?.key,
                                key_usuario: key,
                                data: {
                                    key_empresa: MDL.empresa.select?.key,
                                    key_usuario: key,
                                }
                            }).then((f: any) => {

                                if (this.props.onSuccess) this.props.onSuccess(f)
                                SPopup.close("PopupMasUsuarios");
                                SPopup.close("PopupCrearUsuario");
                                SNavigation.reset("/usuario/table")



                                console.log("response", f);
                            }).catch(f => {
                                console.log("response", f);
                                let aa = Object.values(datakeyUsers).find(a => a.key_usuario == key);
                                if (aa) {
                                    // console.log("Usuario encontrado:", aa);
                                    SNotification.send({
                                        title: "El usuario ya existe en la empresa, intente con otros datos",
                                        color: STheme.color.danger,
                                        time: 5000,
                                    })
                                }
                                console.error("response", f);
                            })

                        }}>
                            <SView width={50} height={50} style={{ padding: 4, borderRadius: 100, overflow: "hidden", borderWidth: 1 }}>
                                <SImage src={SSocket.api.root + "usuario/" + key} />
                            </SView>
                            <SView width={5} />
                            <SView flex>
                                <SText fontSize={14}>{data[key].Nombres} {data[key].Apellidos}</SText>
                                <SText fontSize={12} color={STheme.color.text + "90"}>{data[key].Correo}</SText>
                                <SText fontSize={12} color={STheme.color.text + "90"}>{data[key].CI}</SText>
                                <SText fontSize={12} color={STheme.color.text + "90"}>{data[key].Telefono}</SText>
                            </SView>
                        </SView>
                    ))}
                </SView>
                <SHr height={15} />
            </SView>
        );
    }
}
export default (index);