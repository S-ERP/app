import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SNavigation, SText, STheme, SView } from 'servisofts-component';
import SC, { Chat } from 'servisofts-rn-chat';
import Model from '../../Model';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.pk = SNavigation.getParam("pk");
    }

    render() {
        return <Chat
            onPressHeader={a => {
                SNavigation.navigate("/chat/profile", { pk: this.pk })
            }}
            // background={require("../../Assets/img/chat.jpg")}
            background={require("../../Assets/img/chat2.jpg")}
            colors={{
                // emisor: "#f0f",
                // text:"#ff0"
            }}
            // background={SSocket.api.empresa + "empresa_background/" + Model.empresa.Action.getKey()+"?time="+new SDate().toString("yyyy-MM-ddThh:mm")}
            key_chat={this.pk}
            key_usuario={Model.usuario.Action.getKey()}
        />
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);