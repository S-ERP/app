import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { SHr, SImage, SList, SLoad, SNavigation, SPage, SText, STheme, SUtil, SView } from 'servisofts-component';
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
        }}
            style={{
               
                // borderRadius: 10,
                // margin: 5,
                padding: 5,
              
            }} 
        >
            <SView col={"xs-12"} height={(80 * obj.h)-10}  style={{
                borderRadius: 10,
                  borderWidth: 1,
                  borderColor: STheme.color.secondary + "80",
                  borderStyle: "dashed",
                  backgroundColor: STheme.color.card,
            }} center>
            <ITEM data={obj}  />

            </SView>
        </SView>
    }
    render() {

        return <SPage title={"Widgets"} >
            <SView col={"xs-12"} row>

                {/* {this.renderItem({ type: "ClockCircle", w: 1, h: 1 })} */}
                {this.renderItem({ type: "Clock", w: 2, h: 1 })}
                {/* {this.renderItem({ type: "Notas", w: 2, h: 2 })} */}
                {this.renderItem({ type: "salir", w: 2, h: 1 })}

                {this.renderItem({ type: "PerfilEmpresa", w: 2, h: 2 })}
                {this.renderItem({ type: "MyPerfil", w: 2, h: 2 })}
                {this.renderItem({ type: "MyBilletera", w: 2, h: 2 })}
                {this.renderItem({ type: "NotasList", w: 2, h: 3 })}
                {this.renderItem({ type: "MenuOpciones", w: 4, h: 1 })}
                {this.renderItem({ type: "UsuariosActivos", w: 1, h: 2 })}
                {this.renderItem({ type: "Actividades", w: 3, h: 3 })}


            </SView>
            <SHr height={30} />
        </SPage>
    }
}
