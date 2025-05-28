import React, { Component } from 'react';
import { SIcon, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import NavBar from '../../NavBar';

class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        var usuario = Model.usuario.Action.getUsuarioLog();
        if (!usuario) return null;
        return (
            <SView col={"xs-12"} height={60} row center>
                <SView center flex>
                    {/* <SView row center col={"xs-12"}>
                        <SText bold color={STheme.color.secondary} fontSize={14}>{`${usuario["Nombres"]}`}</SText>
                        <SView width={4} />
                        <SView width={20} height={20} style={{
                            borderRadius: 100,
                            backgroundColor: STheme.color.secondary + "88"
                        }}>

                        </SView>
                    </SView> */}
                    <SView row center col={"xs-9 sm-6 md-5 lg-5 xl-5 "} height={40}
                        style={{
                            borderWidth: 1,
                            borderColor: STheme.color.white,
                            borderRadius: 8,
                            overFlow: "hidden"
                        }}
                        onPress={() => {
                            SNavigation.navigate("/profile");
                        }}
                        >
                        <SView row center col={"xs-3"} height
                         style={{
                            // borderWidth: 1,
                            // borderColor: STheme.color.white,
                            // borderRadius: 8
                            backgroundColor: STheme.color.white,
                            overFlow: "hidden",
                            borderBottomLeftRadius:6,
                            borderTopLeftRadius:6
                        }}
                        >
                            <SIcon name={"Restaurante"} height={33} fill={STheme.color.primary}/>
                        </SView>
                        <SView row center col={"xs-9"}>
                            <SText bold color={STheme.color.secondary} fontSize={14}>{`${usuario["Nombres"]}`}</SText>
                            {/* <SView width={4} /> */}
                            {/* <SView width={20} height={20} style={{
                                borderRadius: 100,
                                backgroundColor: STheme.color.secondary + "88"
                            }}>

                            </SView> */}
                        </SView>
                    </SView>
                    {/* <SText color={STheme.color.secondary} fontSize={12}>{"¿ Cómo podemos ayudarte hoy ?"}</SText> */}
                </SView>
                <SView style={{
                    position: "absolute",
                    left: 8,
                    width: 40,
                    height: 40,
                    // top: 18
                }} center onPress={() => {
                    SNavigation.goBack();
                }}>
                    <SIcon name={"Arrow"} width={30} height={30} fill={STheme.color.white}/>
                </SView>
            </SView>
        );
    }
}

export default index;