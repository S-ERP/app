import React, { Component } from 'react';
import { SDate, SHr, SImage, SList, SLoad, SMath, SNavigation, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
import Model from '../../../../../../Model';
export default class Separador0 extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    data = {}

    render() {
        return  <SView col={"xs-12"} height={4} style={{borderBottomWidth:1, borderBottomColor:STheme.color.card, borderStyle:"dashed"}}/>
    }
}
