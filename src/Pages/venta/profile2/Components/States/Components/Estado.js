import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../../../../../Model';
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
        return <SView col={"xs-12"} flex  style={{ alignItems: "flex-end"}}>
            <SView width={100} center 
            style={{ backgroundColor: statei.color + "66",borderBottomLeftRadius:10, borderBottomRightRadius:10, marginRight:5 }} 
            padding={5}>
                <SText bold fontSize={15} style={{textTransform:"uppercase"}}>{statei.label}</SText>
            </SView>
        </SView>
    }
}
