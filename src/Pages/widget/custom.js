import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SForm, SImage, SList, SLoad, SNavigation, SPage, SText, STheme, SUtil, SView } from 'servisofts-component';
import Model from '../../Model';
import SSocket from 'servisofts-socket';
import { Container } from '../../Components';

// import Options from '../../Components/MultipageMenu/Options';
export default class custom extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.onSelect = SNavigation.getParam("onSelect");
        if (typeof this.onSelect != "function") {
            SNavigation.goBack()
        }
    }

    render() {

        return <SPage title={"Custom Page"} >
            <Container>
                <SForm
                    inputs={{
                        "descripcion": { type: "text", label: "Descripcion" },
                        "url": { type: "text", label: "URL" },
                        // "params": { type: "textArea" },
                    }}
                    onSubmitName={"Crear"}
                    onSubmit={(e) => {
                        this.onSelect({
                            w: 1,
                            h: 1,
                            type: "page",
                            descripcion: e.descripcion,
                            url: e.url,
                            data: {}
                        })
                    }}
                />
            </Container>
        </SPage>
    }
}
