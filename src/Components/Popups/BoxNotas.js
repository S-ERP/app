import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SImage, SPage, SText, STheme, SView, SNavigation, SPopup } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../Model';
export type BoxMenuPropsType = {
    datas: any,
    onPress?: (obj) => {},
}
class index extends Component<BoxMenuPropsType> {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handlePress() {
        if (!this.props.onPress) return null;

        this.props.onPress(this.props.datas)
    }

    popupEliminar() {
        var INSTACE = this;
        return <SView
            // style={{ width: "100%", maxWidth: 365, height: 380, borderRadius: 30, padding: 8 }}
            style={{ height: 235, borderRadius: 20, padding: 8 }}
            center
            withoutFeedback
            backgroundColor={STheme.color.background}
            col={"xs-11 sm-9 md-7 xl-5 xxl-4"}
        >
            <SHr />
            <SHr />
            <SView col={"xs-12"} center>
                <SHr height={20} />
                <SText color={STheme.color.text} bold style={{ fontSize: 20 }} center >Eliminar</SText>
                <SHr height={30} />
                <SText color={STheme.color.text} style={{ fontSize: 15 }} center >¿Estás seguro de eliminar la publicación?</SText>
            </SView>
            <SView flex />
            <SHr height={30} />
            <SView col={"xs-12  "} center >
                <SView col={"xs-11"} center row >
                    <SView card row width={130} height={44} center onPress={() => {
                        SPopup.close("confirmar")
                    }}
                        style={{ borderRadius: 8 }}
                    >
                        <SHr height={10} />
                        <SText bold center>CANCELAR</SText>
                        <SHr height={10} />
                    </SView>
                    <SView width={8} />
                    <SView row width={130} height={44} center onPress={() => {
                        console.log(this.props.datas)
                        // SNavigation.navigate("/perfil/editar", { key: usuario.key });
                        Model.publicacion.Action.editar({
                            data: {
                                ...this.props.datas,
                                estado: 0
                            },
                        }).then(e => {
                            SNavigation.reset("/");
                            console.log(e)
                        }).catch(e => {
                            console.error(e)
                        })
                        SPopup.close("confirmar")
                        SPopup.close("menuNotasUsuario")
                        // Model.publicacion.Action.CLEAR() //Limpiar caché
                        // SNavigation.reset("/");
                    }}
                        style={{ backgroundColor: STheme.color.secondary, borderRadius: 8 }}
                    >
                        <SHr height={10} />
                        <SText bold color={STheme.color.white}>CONFIRMAR</SText>
                        <SHr height={10} />
                    </SView>
                    {/* <Button onClick={handleClosePopup} color="primary">
                        Cancel
          </Button>
                    <Button onClick={() => eliminar()} color="primary">
                        Eliminar
          </Button> */}
                    <SHr height={15} />
                </SView>
            </SView>
            <SView flex />
            <SHr />
            <SHr />
        </SView>
    }

    renderBox() {
        var INSTACE = this;
        if (!this.props.datas) return null;
        console.log("this.props.datas")
        console.log(this.props.datas)
        return <SView col={"xs-11 sm-9 md-7 xl-5 xxl-4"} center row withoutFeedback backgroundColor={STheme.color.background}
            style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 1,
                borderBottomWidth: 2,
                borderColor: "#66666622",
                marginBottom: 50,

            }}
        >
            <SHr height={15} />

            <SView col={"xs-12  "} center row >
                <SView col={"xs-11"} row center>
                    <SView col={"xs-12"} height={48} center
                        style={{
                            borderBottomColor: STheme.color.gray,
                            borderBottomWidth: 1
                        }}

                    >
                        <SText fontSize={14} >Enviar mensaje a {this.props.datas?.usuario?.Nombres}</SText>
                    </SView>
                    <SView col={"xs-12"} height={48} center
                        style={{
                            borderBottomColor: STheme.color.gray,
                            borderBottomWidth: 1
                        }}
                        onPress={() => {
                            SPopup.confirm({
                                title: "¿Seguro que quieres eliminar al usuario " + this.props.datas?.usuario?.Nombres + "?",
                                message: this.props.datas?.usuario?.Nombres+" dejará de ver la nota, si alguien es miembro de la nota puede invitarlo nuevamente.",
                                onPress: () => {
                                    Model.nota.Action.quitarUsuario({
                                        key_nota: this.props.datas?.key,
                                        key_usuario_nota: this.props.datas?.key_usuario,
                                        key_usuario: Model.usuario.Action.getKey()
                                    }).then(e => {
                                        SPopup.close("menuNotasUsuario")
                                        SNavigation.goBack();
                                    })
                                }
                            })

                        }}
                    >
                        <SText fontSize={14} >Eliminar a {this.props.datas?.usuario?.Nombres}</SText>
                    </SView>

                    <SHr height={15} />

                    {/* <SView col={"xs-12"} style={{ borderBottomWidth: 1, borderColor: STheme.color.lightGray }}></SView> */}
                    {/* <SHr height={18} /> */}
                </SView>
            </SView>
            <SView flex />
        </SView>
    }

    render() {
        return (<SView col={"xs-12"} center>
            {/* <SText>{JSON.stringify(this.props.data)}</SText> */}
            {this.renderBox()}
            <SHr h={8} />
        </SView >
        );
    }
}
export default (index);