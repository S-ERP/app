import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SImage, SList, SLoad, SNavigation, SPage, SText, STheme, SUtil, SView } from 'servisofts-component';
import Model from '../../Model';
import SSocket from 'servisofts-socket';
import { Container } from '../../Components';

import Options from '../../Components/MultipageMenu/Options';
export default class Widget extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.onSelect = SNavigation.getParam("onSelect");
        if (typeof this.onSelect != "function") {
            SNavigation.goBack()
        }
    }
    renderItem(obj) {
        const ITEM = Options[obj.type]
        return <SView col={"xs-" + ((12 / 4) * obj.w)} center height={80 * obj.h} onPress={() => {
            if (this.onSelect) {
                this.onSelect(obj);
                return;
            }
        }}>
            <ITEM data={obj} />
        </SView>
    }
    render() {

        return <SPage title={"Widgets"} >
            <SView col={"xs-12"} row>
                {this.renderItem({ type: "ClockCircle", w: 1, h: 1 })}
                {this.renderItem({ type: "Clock", w: 2, h: 1 })}
                {this.renderItem({ type: "Notas", w: 2, h: 2 })}
                {this.renderItem({ type: "salir", w: 1, h: 1 })}
                {this.renderItem({ type: "NotasList", w: 4, h: 2 })}
                {this.renderItem({ type: "UsuariosActivos", w: 4, h: 2 })}
                {/* {this.renderItem({ type: "Actividades", w: 4, h: 2 })} */}
            </SView>
        </SPage>
    }
}
