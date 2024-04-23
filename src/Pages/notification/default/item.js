import React, { Component } from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SHr, SImage, SList, SLoad, SText, STheme, SView } from 'servisofts-component';
import Model from '../../../Model';
import SSocket from 'servisofts-socket'
class index extends DPA.item {
    constructor(props) {
        super(props, {
            Parent: Parent,
            // row:false
        });
    }
    $getData() {
        return super.$getData();
    }
    $renderContent() {
        return <SView col={"xs-12"}>

            <SText bold fontSize={16}>{this.data?.title}</SText>
            <SText color={STheme.color.gray}>{this.data?.body}</SText>
            <SText>{this.data?.deeplink}</SText>
            <SText>{this.data?.image}</SText>
            <SHr />
            <SText color={STheme.color.gray} col={"xs-12"} style={{
                textAlign: "right"
            }} fontSize={12}>{this.data?.tipo}</SText>
        </SView>
    }
}
export default connect(index);