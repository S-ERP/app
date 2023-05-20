import React, { Component } from 'react';
import { connect } from 'react-redux';
import { SHr, SIcon, SLoad, SPage, SText, STheme, SView } from 'servisofts-component';
import Model from '../../Model';
class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


 
    render() {
        return (
            <SPage title={'test'}>
            </SPage>
        );
    }
}
const initStates = (state) => {
    return { state }
};
export default connect(initStates)(index);