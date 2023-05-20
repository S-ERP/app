import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../Model';
export default class Estado extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}

    render() {
        this.data = this.props.data;
        var statei = Model.compra_venta.Action.getStateInfo(this.data.state);
        return <SView col={"xs-12"} center style={{
            backgroundColor: statei.color + "66",
        }}>
            <SHr />
            <SText bold fontSize={18}>{statei.label}</SText>
            <SHr />
        </SView>
    }
}
