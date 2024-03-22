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
        SC.init({
            theme: STheme.color
        })
        return <Chat key_chat={this.pk} key_usuario={Model.usuario.Action.getKey()} />
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);