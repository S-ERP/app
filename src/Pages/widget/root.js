import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SIcon, SImage, SList, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Widget from './widget';
import Pages from './pages';
import { Container } from '../../Components';


const CATEGORI = [
    { key: "pages", label: "Paginas", imageurl: "https://rolespermisos.servisofts.com/http//page/c4666514-202f-4d8d-8656-64c82065ba67" },
    { key: "widget", label: "Widgets", imageurl: "https://rolespermisos.servisofts.com/http//page/419dfc13-34db-4935-a13c-b05cfd9d599a" },
    { key: "custom", label: "Custom page", imageurl: "https://rolespermisos.servisofts.com/http//page/c4666514-202f-4d8d-8656-64c82065ba67" },
]

export default class root extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.onSelect = SNavigation.getParam("onSelect");
        if(typeof this.onSelect != "function"){
            SNavigation.goBack()
        }
        this.params = SNavigation.getAllParams()
    }
    render() {
        return <SPage title={"Añadir widget"} >
            <Container>
                <SHr />
                <SList data={CATEGORI}
                    space={16}
                    buscador
                    render={cat => {
                        return <SView col={"xs-12"} row center padding={4} card onPress={() => {
                            SNavigation.navigate("/widget/" + cat.key, this.params)
                        }}>
                            <SView width={40} height={40} style={{
                                borderRadius: 6, overflow: 'hidden',
                                backgroundColor: STheme.color.card
                            }}>
                                <SImage src={cat.imageurl} />
                            </SView>
                            <SView width={8} />
                            <SView flex style={{
                                justifyContent: "center"
                            }}>
                                <SText fontSize={18}>{cat.label}</SText>
                            </SView>
                            <SView width={8} />
                            <SView width={40} height={40} style={{
                            }} padding={8}>
                                <SIcon name='Back' fill={STheme.color.card} style={{
                                    transform: [{ rotate: "180deg" }]
                                }} />
                            </SView>
                        </SView>
                    }}
                />
            </Container>
            {/* <Pages /> */}
            {/* <Widget /> */}
        </SPage>
    }
}
