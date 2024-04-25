import React, { Component } from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "."
import { SDate, SHr, SIcon, SImage, SList, SLoad, SText, STheme, SView } from 'servisofts-component';
import SSocket from 'servisofts-socket'
class index extends DPA.item {
    constructor(props) {
        super(props, {
            Parent: Parent,
            // row:false
        });
    }
    $getData() {
        var data = super.$getData();
        return data;
    }

    $renderContent() {
        return <SView col={"xs-12"}>
            <SText fontSize={12} bold>{this.data?.descripcion}</SText>
            <SView col={"xs-12"} row>
                <SText fontSize={12} flex color={STheme.color.lightGray}>{this.data?.observacion}</SText>
                <SText fontSize={12} color={STheme.color.lightGray}>{new SDate(this.data?.fecha_on, "yyyy-MM-ddThh:mm:ss").timeSince(new SDate())}</SText>
            </SView>
        </SView>
    }
}
export default connect(index);