import React, { Component } from 'react';
import { View, Text, FlatList, Platform } from 'react-native';
import { SDate, SHr, SImage, SNavigation, SPopup, SText, STheme, SThread, SView } from 'servisofts-component';
import Components from '../..';
import MDL from '../../../MDL';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';

type indexPropsType = {

}
export default class root extends Component<indexPropsType> {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    componentDidMount() {
        if (!MDL.usuario?.session?.key) return;
        SSocket.sendPromise({

            service: "empresa",
            component: "empresa_usuario",
            type: "getAll",
            // key_empresa: MDL.empresa.select.key,
            key_usuario: MDL.usuario.session.key
        }).then(em => {
            console.log("empresasss", em);
            this.setState({
                data: Object.values(em.data).sort((a, b) => {
                    console.log("ENTRO")
                    return new Date(b.fecha_ultima_visita) - new Date(a.fecha_ultima_visita);
                })
            });
            console.log("ENTROOOO")

        }).catch(em => {
            console.error(em);
        })
        // }


    }


    openPopup() {
        let miEmpresa = MDL.empresa.select;
        if (!miEmpresa) return null;
        SPopup.open({
            key: "popup-lista-empresa",
            style: {
                width: 270, height: 345,
                position: "absolute",
                backgroundColor: STheme.color.background,
                borderRadius: 4,
                left: 40,
                top: 37
            },
            content: <SView col={"xs-12"} height >
                <SView style={{ flex: 1, }} >
                    <FlatList
                        horizontal={false}
                        showsVerticalScrollIndicator={true}
                        data={this.state.data}
                        renderItem={({ item }) => <SView row center
                            onPress={() => {
                                Model.empresa.Action.setEmpresa(item.empresa)
                                SNavigation.reset("/loby", { dateLoad: new SDate().toString("yyyy-MM-dd hh:mm:ss") });
                                // let time = Platform.select({ web: 400, native: 800 });
                                SPopup.close("popup-lista-empresa")
                                new SThread(1000, "aaa").start(() => {
                                    // 
                                    // SNavigation.goBack();
                                    this.componentDidMount();
                                    // SNavigation.reset("/");
                                    // SNavigation.reset("/loby", { dateLoad: new SDate().toString("yyyy-MM-dd hh:mm:ss") });



                                })
                            }}
                            style={{
                                width: "100%",
                                borderBottomColor: STheme.color.card,
                                borderBottomWidth: 1,
                                paddingTop: 6,
                                paddingBottom: 6,
                                backgroundColor: (MDL.empresa.select.key == item.empresa.key) ? STheme.color.card : null
                            }}>
                            <SView width={28} height={28} style={{ padding: 4 }}>
                                <SView flex height card style={{ borderRadius: 100, overflow: "hidden" }}>
                                    <SImage src={SSocket.api.empresa + "empresa/" + item.empresa.key} />
                                </SView>
                            </SView>
                            <SView width={4} />
                            <SView flex>
                                <SText numberOfLines={1} >{item.empresa.razon_social}</SText>
                            </SView>

                        </SView>}
                    />
                </SView>
            </SView>
        })
    }

    render() {
        let miEmpresa = MDL.empresa.select;
        if (!miEmpresa) return null;
        console.log("DATA EMPRESAS", this.state.data);
        return (
            <SView col={"xs-12"} card onPress={() => {
                this.openPopup();
            }} row center>
                <SView width={30} height={30} style={{ padding: 4 }}>
                    <SView flex height card style={{ borderRadius: 100, overflow: "hidden" }}>
                        <SImage src={SSocket.api.empresa + "empresa/" + MDL.empresa.select.key} />
                    </SView>
                </SView>
                <SView width={3} />
                <SView flex justify >
                    <SText bold fontSize={12} numberOfLines={1}>{miEmpresa?.razon_social}</SText>
                </SView>
            </SView>
        );
    }
}
