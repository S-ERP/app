import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SDate, SHr, SIcon, SImage, SPage, SText, STheme, SView, SNavigation, SPopup } from 'servisofts-component';
import SSocket from 'servisofts-socket';
import Model from '../../../../Model';
import SharedFunctions from './SharedFunctions';
export type BoxMenuLatPropsType = {
    datas: any,
    onPress?: (obj) => {},
}
class index extends Component<BoxMenuLatPropsType> {
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
                        SPopup.close("menuLat")
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
                        onPress={() => {
                            console.log(this.props.datas)
                            SharedFunctions.compartir({
                                text: `${this.props.datas?.descripcion}`,
                                url: `${"https://TlleBo.servisofts.com/app/publicacion/post?pk=" + this.props.datas?.key}`,
                            });
                        }}
                    >
                        <SText fontSize={14} >Compartir</SText>
                    </SView>
                    <SView col={"xs-12"} height={48} center
                        style={{
                            borderBottomColor: STheme.color.gray,
                            borderBottomWidth: 1
                        }}
                        onPress={() => {
                            SNavigation.navigate("/publicacion/edit", { pk: this.props.datas.key });
                            SPopup.close("menuLat")
                        }}
                    >
                        <SText fontSize={14} >Editar</SText>
                    </SView>
                    <SView col={"xs-12"} height={48} center

                        onPress={() => {
                            console.log(this.props.datas)
                            SPopup.open({ key: "confirmar", content: this.popupEliminar() });
                            // SPopup.confirm({
                            //     title: "Eliminar", message: "¿Estás seguro de eliminar la publicación?", onPress: () => {
                            //         Model.publicacion.Action.editar({
                            //             // data: {
                            //             //     ...obj,
                            //             //     estado: 0
                            //             // },
                            //         })
                            //         // Parent.Actions.eliminar(obj, this.props)
                            //     }
                            // })
                        }}
                    >
                        <SText fontSize={14} >Eliminar</SText>
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