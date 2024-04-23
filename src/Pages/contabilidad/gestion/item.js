import React, { Component } from 'react';
import DPA, { connect } from 'servisofts-page';
import { Parent } from "./index"
import { SDate, SHr, SIcon, SImage, SList, SLoad, SText, STheme, SView } from 'servisofts-component';

class index extends DPA.item {
    sizeImage = 32
    constructor(props) {
        super(props, {
            Parent: Parent,
            padding: 0,
            // row:false
        });
    }
    $renderContent() {
        const { descripcion, fecha, estado, key_empresa, key } = this.data
        return <SView col={"xs-12"} style={{
            overflow: "hidden",
            padding: 8,
        }}>
            <SText bold fontSize={18} color={estado == 2 ? STheme.color.success : STheme.color.warning}>{new SDate(fecha).toString("yyyy-MM")}</SText>
            <SHr />
            <SText fontSize={12} color={STheme.color.lightGray}>{descripcion}</SText>
        </SView>
    }
}
export default connect(index);