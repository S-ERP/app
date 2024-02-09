import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SNavigation, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        let gestion = Model.gestion.Action.getSelect();
        if (!gestion) {
            SNavigation.replace("/contabilidad/gestion");
        } else {
            SNavigation.replace("/contabilidad/gestion/profile", { pk: gestion.key });
        }
        return <SView />
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);