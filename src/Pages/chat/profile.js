import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import SC, { Chat, ChatProfile } from 'servisofts-rn-chat';
import Model from '../../Model';
import { Container } from '../../Components';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.pk = SNavigation.getParam("pk");
    }

    render() {
        return <SPage hidden>
            <ChatProfile
                key_chat={this.pk}
                key_usuario={Model.usuario.Action.getKey()}
            />
        </SPage>
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);