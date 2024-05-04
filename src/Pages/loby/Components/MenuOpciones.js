import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SHr, SIcon, SImage, SNavigation, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket';
import { ScrollView as ScrollViewGesture } from 'react-native-gesture-handler';
import Chat from './Chat';
import InvitarUsuario from '../../../Components/empresa/InvitarUsuario';

export default class MenuOpciones extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    renderMunuItem({ onPress, label, icon, color }) {
        return <SView width={(label.length * 8) + 45} card padding={8} onPress={onPress} center row>

            <SView width={18} height={18} center>
                <SIcon name={icon} width={18} height={18} fill={color ?? STheme.color.text} />
            </SView>
            {(label.length > 0) ? <SView width={5} /> : null}
            {/* <SView width={5} /> */}
            {/* <SView width={8} /> */}
            <SText >{label}</SText>
        </SView>
    }

    render() {
        const empresa = Model.empresa.Action.getSelect();
        // Model.usuarioPage.Action.getRoles();
        return  <ScrollView horizontal style={{
            width: "100%"
        }}>
            <>
                {this.renderMunuItem({ label: "", icon: "Menu", onPress: () => SNavigation.navigate("/menu") })}
                <SView width={8} />
                {/* {this.renderMunuItem({ label: "Init", icon: "Menu", onPress: () => SNavigation.navigate("/empresa/init") })}
                <SView width={8} /> */}
                {this.renderMunuItem({ label: "", icon: "Notify", onPress: () => SNavigation.navigate("/notification") })}
                <SView width={8} />

                <Chat label={"Chat"}  >
                    {this.renderMunuItem({ label: "", icon: "Comment2", })}
                </Chat>
                <SView width={8} />

                {this.renderMunuItem({ label: "", icon: "configurar", onPress: () => SNavigation.navigate("/ajustes") })}
                <SView width={8} />
                {/* <InvitarUsuario /> */}
                {this.renderMunuItem({ label: "", icon: "share", onPress: () => SNavigation.navigate("/empresa/invite") })}
                {/* {this.renderMunuItem({ label: "Productos", icon: "productos", onPress: () => SNavigation.navigate("/productos/tipo_producto/options") })} */}
                {/* <SView width={8} /> */}
                {/* <InvitarUsuario /> */}
                <SView width={8} />
                {this.renderMunuItem({ label: "Productos", icon: "productos", onPress: () => SNavigation.navigate("/productos/tipo_producto/options") })}
                <SView width={8} />
                <InvitarUsuario />
                {/* {this.renderMunuItem({ label: "Invitar", icon: "Usuarios", color: STheme.color.danger, onPress: () => SNavigation.navigate("/root") })} */}
                <SView width={8} />
                {this.renderMunuItem({ label: "Salir", icon: "out", onPress: () => SNavigation.navigate("/root") })}
                <SView width={8} />
            </>
        </ScrollView>
    }
}
