import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SImage, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import MDL from '../../../MDL';
import { Container } from '../../../Components';
import Whatsapp from '../../crm/Components/Whatsapp';
import SSocket from 'servisofts-socket';
import Model from '../../../Model';
import { StatusComponents } from '.';

export default class root extends Component {

    pk = SNavigation.getParam("pk");
    state = {
        idchat: "",
        data: null,
        device: null,
    }

    componentDidMount() {

        this.loadData();
        SSocket.addEventListener("onMessage", this.onMessageSocket)
        SSocket.sendPromise({
            component: "whatsapp",
            type: "addListener",
            key_usuario: Model.usuario.Action.getKey(),
            key_device: this.pk
        })
    }

    loadData() {
        MDL.whatsapp.device.getByKey(this.pk).then(e => {
            console.log("Whatsapp Device By Key", e);
            this.setState({
                device: e
            });
        })


    }
    componentWillUnmount() {
        SSocket.removeEventListener("onMessage", this.onMessageSocket);
        SSocket.sendPromise({
            component: "whatsapp",
            type: "removeListener",
            key_usuario: Model.usuario.Action.getKey(),
            key_device: this.pk
        });
    }

    onMessageSocket = (data) => {
        if (data.component != "whatsapp") return;
        if (data.type != "event") return;
        if (!!["message_create", "message"].includes(data.event)) return;
        this.loadData();

    }



    renderStatus() {
        if (!this.state?.device) return <SText>Loading...</SText>;
        let status = this.state?.device?.session?.status;
        if (!status) {
            status = "qr";
        }
        if (status == "initializing") {
            status = "qr";
        }

        const SC = StatusComponents[status];
        if (SC) {
            return <SC device={this.state.device} />
        }
        return <SText>{status}</SText>
    }



    render() {
        return <SPage title={"Whatsapp Chats "} disableScroll>
            {this.renderStatus()}
        </SPage>
    }
}
